import { auth } from "/components/authentication.js"
import { selected } from "~/logic/reactive.js"
import { status, user } from "/logic/reactive.js"
import syncTasks from "../../united/synctasks"
import data from "~/logic/data.js"
import { makevisible } from "~/logic/makevisible"
import { safeSetLocalStorageItem } from "~/logic/util.js"

import { v4 as uuidv4 } from "uuid"
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
    safeSetLocalStorageItem("tasks", data.tasks)
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

const addPendingRequest = (changedTasks) => {
  const packet = {
    tasks: changedTasks,
    requestId: uuidv4(),
  }
  data.pendingRequests.push(packet)
  safeSetLocalStorageItem("pendingRequests", data.pendingRequests)
}

socket.on("save-confirm", (responseId) => {
  // Удаляем подтвержденный пакет из массива
  console.log("save-confirm", responseId)
  data.pendingRequests = data.pendingRequests.filter((packet) => packet.requestId !== responseId)
  safeSetLocalStorageItem("pendingRequests", data.pendingRequests)
})

export const sendData = async (changedTasks) => {
  if (changedTasks) addPendingRequest(changedTasks)
  if (auth.currentUser) {
    try {
      const token = await getToken("sd")
      if (data.pendingRequests) {
        for (let pendingPacket of data.pendingRequests) {
          console.log("send")
          const sentData = {
            user: {
              ...user,
              token: token,
            },
            tasks: pendingPacket.tasks,
            requestId: pendingPacket.requestId,
          }
          socket.emit("save", sentData)
        }
      }
    } catch (error) {
      console.error("Error sending data with token:", error)
    }
  }
}
