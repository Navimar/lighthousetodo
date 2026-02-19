import serviceAccount from "../firebase.config.js"
import admin from "firebase-admin"
import { addUser, getUser } from "./user.js"

import version from "../shared/version.js"
import {
  syncTasks,
  removeCollaborator,
  addCollaborator,
  loadData,
  removeOldTasks,
  syncRelation,
} from "./database.js"

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://adastratodo-default-rtdb.europe-west1.firebasedatabase.app/",
})

async function verifyToken(idToken) {
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken)
    return decodedToken.uid
  } catch (error) {
    console.error("Error verifying token:", error)
    throw error
  }
}

export let inputSocket = (io) => {
  io.on("connection", function (socket) {
    console.log("connection", socket.id)
    console.log("version", version)
    socket.emit("version", { version })
    socket.on("disconnect", function () {
      console.log("disconnect")
    })

    socket.on("save", async (msg) => {
      socket.emit("save-confirm", msg.data.requestId)
      if (!msg?.user?.token) {
        console.log(msg, "Токен не найден при загрузке")
        socket.emit("err", "Токен не найден при загрузке")
        return
      }

      let userId
      try {
        userId = await verifyToken(msg.user.token)
      } catch (error) {
        console.error("Error verifying token:", error)
        socket.emit("err", "Invalid token or not authenticated")
        return
      }

      if (!userId) {
        console.log("Invalid token or not authenticated", msg)
        socket.emit("err", "Invalid token or not authenticated")
        return
      }

      addUser(msg.user.name, userId, socket)

      try {
        if (msg.data.task) {
          await syncTasks(msg.user.name, userId, msg.data.task)
          const sockets = getUser(userId)?.sockets || []
          sockets.forEach((s) => {
            if (s !== socket) {
              s.emit("updatetask", { task: msg.data.task })
            }
          })
        }

        if (msg.data.relation) {
          await syncRelation(userId, msg.data.relation)
          const sockets = getUser(userId)?.sockets || []
          sockets.forEach((s) => {
            if (s !== socket) {
              s.emit("updaterelation", { relation: msg.data.relation })
            }
          })
        } else if (msg.data.collaborator?.id && msg.data.collaborator?.id != userId) {
          await addCollaborator(
            userId,
            msg.data.collaborator.id,
            msg.data.collaborator.name || msg.data.collaborator.id,
          )
          // after collaborator add, refresh lists and notify other sockets
          try {
            const updated = await loadData(userId)
            const sockets = getUser(userId)?.sockets || []
            sockets.forEach((s) => {
              if (s !== socket) {
                s.emit("updatecollaborators", {
                  collaborators: updated.collaborators,
                  collaborationRequests: updated.collaborationRequests,
                })
              }
            })
          } catch (e) {
            console.warn("Could not refresh collaborators after add:", e)
          }
        } else if (msg.data.collaboratorIdToRemove) {
          await removeCollaborator(userId, msg.data.collaboratorIdToRemove)
          // after collaborator remove, refresh lists and notify other sockets
          try {
            const updated = await loadData(userId)
            const sockets = getUser(userId)?.sockets || []
            sockets.forEach((s) => {
              if (s !== socket) {
                s.emit("updatecollaborators", {
                  collaborators: updated.collaborators,
                  collaborationRequests: updated.collaborationRequests,
                })
              }
            })
          } catch (e) {
            console.warn("Could not refresh collaborators after remove:", e)
          }
        } else if (
          !msg.data.task &&
          !msg.data.relation &&
          !msg.data.collaborator?.id &&
          !msg.data.collaboratorIdToRemove
        ) {
          // Если не найдено ни одного из ожидаемых полей
          throw new Error("No valid data fields found in message")
        }
      } catch (error) {
        console.error("Error during request handling:", error)
        socket.emit("err", "Ошибка при обработке запроса: " + error.message)
      }

      // Обновление других сокетов, если это необходимо
    })

    socket.on("load", async (msg) => {
      if (!msg.token) {
        console.log(msg, "Не найден токен при сохранении")
        socket.emit("err", "Не найден токен при сохранении")
        return
      }

      const userId = await verifyToken(msg.token)
      if (!userId) {
        console.log(msg, "login error on load")
        socket.emit("err", "Скорее всего вышла новая версия и вам нужно перезайти в приложение!")
        return
      }

      addUser(msg.name, userId, socket)

      const data = await loadData(userId)
      if (!data) {
        console.log(msg, userId, "не получилось загрузить данные из базы")
        return
      }

      // console.log(userId, data.collaborationRequests)
      // console.log("user", getUser(userId))
      console.log("emit update", data)
      socket.emit("update", {
        graph: data,
        collaborators: data.collaborators,
        collaborationRequests: data.collaborationRequests,
      })

      // Обновление данных о последней очистке и удаление старых задач, если это необходимо
      const user = getUser(userId)
      const timeSinceLastCleanup = Date.now() - (user.lastCleanup || 0)
      const DIFFERENCE_MILLISECONDS = 60 * 60 * 1000 * 24 * 7

      // console.log("timeSinceLastCleanup", timeSinceLastCleanup, DIFFERENCE_MILLISECONDS)
      if (timeSinceLastCleanup > DIFFERENCE_MILLISECONDS) {
        try {
          // console.log("Cleanup")
          await removeOldTasks(userId, data)
          // await updateCleanupTimeNeo4j(userId)
          user.lastCleanup = Date.now()
        } catch (error) {
          console.error("Ошибка при очистке старых задач или обновлении времени последней очистки:", error)
          // Обработка ошибок или дальнейшие действия
        }
      }
    })
  })
}
