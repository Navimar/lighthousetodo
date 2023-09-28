import { auth } from "/components/authentication.js"
import { status, data, user } from "/logic/reactive.js"
import sort from "/logic/sort.js"
import syncTasks from "../../united/syncTasks"
import { getObjectById } from "/logic/util"

import { io } from "socket.io-client"
import { makevisible } from "/logic/exe"

const socket = io()

let version = 0

async function getToken() {
  if (auth.currentUser)
    try {
      return await auth.currentUser.getIdToken(true)
    } catch (error) {
      console.error("Error getting token:", error)
      throw error
    }
}

export function inputSocket() {
  socket.on("connect", function () {
    status.online = true
    loadData()
  })
  socket.on("disconnect", function () {
    console.log("DISCONNECT!!!")
    status.online = false
  })
  socket.on("update", function (msg) {
    // Если их нет, инициализируйте как пустые массивы или соответствующие значения.
    if (msg) {
      // Синхронизация задач
      data.tasks = syncTasks(data.tasks, msg.tasks)

      makevisible()
      sort()
      // console.log(socket.id, "update", msg)
    } else {
      console.log("No incoming data")
    }
  })

  socket.on("err", (val) => {
    console.log("ошибка на сервере", val)
  })
}

export const loadData = async () => {
  console.log("loaddata", user)
  if (auth.currentUser)
    try {
      const token = await getToken("ld") // Получение нового токена
      user.token = token // Добавляем токен к данным пользователя
      socket.emit("load", user)
    } catch (error) {
      console.error("Error loading data with token:", error)
    }
}

export const sendData = async (changedTasks) => {
  let sentdata = {
    user: user,
    tasks: changedTasks.map((id) => getObjectById(id)), // Отправляем только задачи, которые были изменены
    // calendarSet: data.calendarSet,
  }

  if (auth.currentUser)
    try {
      const token = await getToken("sd")
      sentdata.user.token = token
      console.log("sendData", sentdata)
      socket.emit("save", sentdata)
    } catch (error) {
      console.error("Error sending data with token:", error)
    }
}
