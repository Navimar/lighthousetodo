import crypto from "crypto"
import admin from "firebase-admin"
import config from "../config.js"
import { addUser, getUser } from "./user.js"
import serviceAccount from "../firebase.config.js"
import syncTasks from "../united/synctasks.js"
import { v4 as uuidv4 } from "uuid"

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://adastratodo-default-rtdb.europe-west1.firebasedatabase.app/",
})

const database = admin.database()

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

    socket.on("save", async function (msg) {
      try {
        if (msg?.user?.token) {
          const userId = await verifyToken(msg.user.token)
          if (userId) {
            addUser(userId, socket)

            let dir = path(userId)
            const userRef = database.ref("data/" + dir)

            const snapshot = await userRef.once("value")
            const serverData = snapshot.val()

            let updatedTasks
            if (serverData) {
              // Используем syncTasks для синхронизации задач
              updatedTasks = syncTasks(serverData.tasks, msg.tasks)
            } else {
              updatedTasks = msg.tasks
            }

            // Записываем обновленные данные в базу
            await userRef.set({
              tasks: updatedTasks,
              // calendarSet: msg.calendarSet,
            })

            let sockets = getUser(userId)
            sockets.forEach((s) => {
              if (s !== socket) {
                s.emit("update", msg)
              }
            })
          } else {
            console.log("Invalid token or not authenticated", msg)
            socket.emit("err", "Invalid token or not authenticated")
          }
        } else {
          console.log(msg, "Токен не найден при загрузке")
          socket.emit("err", "Токен не найден при загрузке")
        }
      } catch (error) {
        console.error("Error in 'save' handler:", error)
        socket.emit("err", "Произошла ошибка при сохранении данных.")
      }
    })

    socket.on("load", async function (msg) {
      if (msg.token) {
        const userId = await verifyToken(msg.token)
        if (userId) {
          addUser(userId, socket)
          console.log(msg, "load")
          let data = await load(userId)

          if (data) {
            // вот тут всем таск из data.tasks у которых нет id нужно присвоить id = uuidv4();
            data.tasks = data.tasks.map((task) => {
              if (!task.id) {
                task.id = uuidv4()
              }
              return task
            })
            socket.emit("update", data)
          } else console.log(msg, userId, "не получилось загрузить данные из базы")
        } else {
          console.log(msg, "login error on load")
          socket.emit("err", "Скорее всего вышла новая версия и вам нужно перезайти в приложение!")
        }
      } else {
        console.log(msg, "Не найден токен при сохранении")
        socket.emit("err", "Не найден токен при сохранении")
      }
    })
  })
}

let path = (key) => {
  key = key + config.salt
  return crypto.createHash("sha256").update(key).digest("hex")
}

let load = async (userId) => {
  let dir = path(userId)
  const userRef = database.ref("data/" + dir)
  let data = await userRef.once("value")
  return data.val()
}
