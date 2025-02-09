import serviceAccount from "../firebase.config.js"
import admin from "firebase-admin"
import { addUser, getUser } from "./user.js"
import { pruneTaskIds, prepareTasks } from "./process.js"
import version from "./version.js"
import {
  syncTasksNeo4j,
  removeCollaboratorNeo4j,
  addCollaboratorNeo4j,
  loadDataFromNeo4j,
  removeOldTasksFromNeo4j,
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
    socket.emit("version", { version })
    socket.on("disconnect", function () {
      console.log("disconnect")
    })

    socket.on("save", async (msg) => {
      socket.emit("save-confirm", msg.data.requestId)
      // console.log("msg", msg)
      // Если токена нет, сразу отправляем ошибку
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
        if (msg.data.tasks) {
          // Преобразование поля readyLogs каждого таска в строку
          msg.data.tasks = msg.data.tasks.map((task) => {
            if (task.readyLogs) {
              task.readyLogs = JSON.stringify(task.readyLogs)
            }
            return task
          })

          // Синхронизация задач с базой данных
          await syncTasksNeo4j(msg.user.name, userId, msg.data.tasks)
        } else if (msg.data.collaborator?.id && msg.data.collaborator?.id != userId) {
          await addCollaboratorNeo4j(
            userId,
            msg.data.collaborator.id,
            msg.data.collaborator.name || msg.data.collaborator.id,
          )
        } else if (msg.data.collaboratorIdToRemove) {
          await removeCollaboratorNeo4j(userId, msg.data.collaboratorIdToRemove)
        } else {
          // Если не найдено ни одного из ожидаемых полей
          throw new Error("No valid data fields found in message")
        }

        // Отправка подтверждения и обновление других сокетов...
      } catch (error) {
        console.error("Error during request handling:", error)
        socket.emit("err", "Ошибка при обработке запроса: " + error.message)
      }

      // Обновление других сокетов, если это необходимо
      const sockets = getUser(userId)?.sockets || []
      sockets.forEach((s) => {
        if (s !== socket) {
          // console.log("Отправлено другому сокету")
          s.emit("update", { tasks: msg.data.tasks })
        }
      })
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

      const data = await loadDataFromNeo4j(userId)
      if (!data) {
        console.log(msg, userId, "не получилось загрузить данные из базы")
        return
      }

      // console.log(userId, data.collaborationRequests)
      // console.log("user", getUser(userId))
      socket.emit("update", {
        tasks: pruneTaskIds(prepareTasks(data.tasks)),
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
          await removeOldTasksFromNeo4j(userId, data)
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
