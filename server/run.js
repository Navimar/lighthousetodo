import crypto from "crypto"
import admin from "firebase-admin"
import config from "../config.js"
import { addUser, getUser } from "./user.js"
import serviceAccount from "../firebase.config.js"

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
        if (msg.user.token) {
          const userId = await verifyToken(msg.user.token)
          if (userId) {
            // console.log('save user', msg.user);
            addUser(userId, socket)

            let dir = path(userId)
            const userRef = database.ref("data/" + dir)

            // Получаем текущую версию на сервере
            const snapshot = await userRef.once("value")
            const serverData = snapshot.val()

            // Сравниваем версии
            console.log("ver", msg.version, serverData.version)
            if (serverData && msg.version < serverData.version) {
              // Если версия клиента устарела, отправляем ему актуальные данные
              socket.emit("update", serverData)
            } else {
              let sockets = getUser(userId)
              sockets.forEach((s) => {
                if (s != socket) {
                  console.log(s.id, socket.id)
                  s.emit("update", msg)
                } else {
                  console.log("mysocket", socket.id)
                }
              })
              await userRef.set({
                tasks: msg.tasks,
                calendarSet: msg.calendarSet,
                version: msg.version,
              })
            }
          } else {
            console.log("Invalid token or not authenticated", msg)
            socket.emit("err", "Invalid token or not authenticated")
          }
        } else {
          console.log(msg, "Не найден токен при загрузке")
          socket.emit("err", "Не найден токен при загрузке")
        }
      } catch (error) {
        console.error("Error in 'save' handler:", error)
        socket.emit("err", "Произошла ошибка при сохранении данных.")
      }
    })

    // socket.on('save', async function (msg) {
    //     if (msg.user.token) {
    //         const userId = await verifyToken(msg.user.token);
    //         if (userId) {
    //             console.log('save user', msg.user)
    //             addUser(userId, socket);

    //             let sockets = getUser(userId)
    //             sockets.forEach(s => {
    //                 if (s != socket) {
    //                     console.log(s.id, socket.id);
    //                     s.emit('update', msg);
    //                 } else {
    //                     console.log('mysocket', socket.id)
    //                 }
    //             });

    //             let dir = path(userId);
    //             const userRef = database.ref('data/' + dir);
    //             userRef.set({ tasks: msg.tasks, version: msg.version });

    //         } else {
    //             console.log("Invalid token or not authenticated", msg);
    //             socket.emit('err', 'Invalid token or not authenticated')
    //         }
    //     } else {
    //         console.log(msg, 'Не найден токен при загрузке');
    //         socket.emit('err', 'Не найден токен при загрузке');
    //     }
    // });

    socket.on("load", async function (msg) {
      if (msg.token) {
        const userId = await verifyToken(msg.token)
        if (userId) {
          console.log(msg, "load")
          let data = await load(userId)
          socket.emit("update", data)
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
