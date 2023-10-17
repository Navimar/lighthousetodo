import { auth } from "/components/authentication.js"
import { status, user } from "/logic/reactive.js"
import syncTasks from "../../united/synctasks"
import data from "~/logic/data.js"
import { makevisible } from "~/logic/makevisible"

import { io } from "socket.io-client"

const socket = io()

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
    data.tasks = syncTasks(data.tasks, msg?.tasks)
    makevisible()
  })

  socket.on("err", (val) => {
    console.log("ошибка на сервере", val)
  })
}

export const loadData = async () => {
  // console.log("loaddata", user)
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
    tasks: changedTasks,
  }

  if (auth.currentUser)
    try {
      const token = await getToken("sd")
      sentdata.user.token = token
      socket.emit("save", sentdata)
    } catch (error) {
      console.error("Error sending data with token:", error)
    }
}
