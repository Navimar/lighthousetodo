import serviceAccount from "../firebase.config.js"
import admin from "firebase-admin"
import { addUser, getUser } from "./user.js"
import { syncTasksWithNeo4j, loadDataFromNeo4j, removeOldTasksFromNeo4j, updateCleanupTimeNeo4j } from "./database.js"
import removeOldTasksFromFirebase from "./forget.js"

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

    socket.on("disconnect", function () {
      console.log("disconnect")
    })

    socket.on("save", async (msg) => {
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

      addUser(userId, socket)

      try {
        // Синхронизация задач с базой данных Neo4j
        console.log(userId, msg.tasks)
        await syncTasksWithNeo4j(userId, msg.tasks)

        // Отправка подтверждения обратно через сокет
        socket.emit("save-confirm", msg.requestId)
        console.log("save-confirm")
      } catch (error) {
        // Обработка ошибок синхронизации задач
        console.error("Error during task synchronization:", error)
        socket.emit("err", "Ошибка при синхронизации задач.")
        return
      }

      // Обновление других сокетов, если это необходимо
      const sockets = getUser(userId)
      sockets.forEach((s) => {
        if (s !== socket) {
          s.emit("update", msg)
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

      addUser(userId, socket)
      console.log(msg, "load")

      const data = await loadDataFromNeo4j(userId)
      if (!data) {
        console.log(msg, userId, "не получилось загрузить данные из базы")
        return
      }

      socket.emit("update", { tasks: data })

      // Обновление данных о последней очистке и удаление старых задач, если это необходимо
      const timeSinceLastCleanup = Date.now() - (data.lastCleanup || 0)
      const DIFFERENCE_MILLISECONDS = 24 * 60 * 60 * 1000
      // 24 * 60 * 60 * 1000

      if (timeSinceLastCleanup > DIFFERENCE_MILLISECONDS) {
        try {
          await removeOldTasksFromNeo4j(userId, data)
          await updateCleanupTimeNeo4j(userId)
        } catch (error) {
          console.error("Ошибка при очистке старых задач или обновлении времени последней очистки:", error)
          // Обработка ошибок или дальнейшие действия
        }
      }
    })
  })
}
