import admin from "firebase-admin"
import { addUser, getUser } from "./user.js"
import syncTasks from "../united/synctasks.js"
import { database, path, load } from "./database.js"
import removeOldTasksFromFirebase from "./forget.js"
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

    socket.on("disconnect", function () {
      console.log("disconnect")
    })

    socket.on("save", async (msg) => {
      console.log("save")

      // Если токена нет, сразу отправляем ошибку
      if (!msg?.user?.token) {
        console.log(msg, "Токен не найден при загрузке")
        socket.emit("err", "Токен не найден при загрузке")
        return
      }

      try {
        const userId = await verifyToken(msg.user.token)

        // Если нет userId, отправляем ошибку
        if (!userId) {
          console.log("Invalid token or not authenticated", msg)
          socket.emit("err", "Invalid token or not authenticated")
          return
        }

        addUser(userId, socket)

        const userRef = database.ref("data/" + path(userId))
        const snapshot = await userRef.once("value")
        const serverData = snapshot.val()

        // Используем syncTasks для синхронизации задач или задаем задачи напрямую
        const updatedTasks = serverData ? syncTasks(serverData.tasks, msg.tasks) : msg.tasks

        // Записываем обновленные данные в базу
        await userRef.set({
          tasks: updatedTasks,
          // calendarSet: msg.calendarSet, (если нужно раскомментировать)
        })

        // Обновляем все сокеты, кроме текущего
        const sockets = getUser(userId)
        sockets.forEach((s) => {
          if (s !== socket) {
            s.emit("update", msg)
          }
        })

        socket.emit("save-confirm", msg.requestId)
      } catch (error) {
        console.error("Error in 'save' handler:", error)
        socket.emit("err", "Произошла ошибка при сохранении данных.")
      }
    })

    const ONE_DAY_MILLISECONDS = 24 * 60 * 60 * 1000 // миллисекунд в день

    const shouldCleanup = (lastCleanupTimestamp) => {
      const timeSinceLastCleanup = Date.now() - (lastCleanupTimestamp || 0)
      return timeSinceLastCleanup > ONE_DAY_MILLISECONDS
    }

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

      addUser(userId, socket)
      console.log(msg, "load")

      const data = await load(userId)
      if (!data) {
        console.log(msg, userId, "не получилось загрузить данные из базы")
        return
      }

      socket.emit("update", { tasks: data.tasks })

      if (shouldCleanup(data.lastCleanup)) {
        await removeOldTasksFromFirebase(userId, data)
        const userRef = database.ref("data/" + path(userId))
        await userRef.update({ lastCleanup: Date.now() })
      }
    })
  })
}
