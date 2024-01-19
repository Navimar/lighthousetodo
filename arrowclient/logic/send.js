import { auth } from "/components/authentication.js"
import reData from "~/logic/reactive.js"
import syncTasks from "/logic/synctasks.js"
import data from "~/logic/data.js"
import { makevisible } from "~/logic/makevisible"
import { safeSetLocalStorageItem } from "~/logic/util.js"
import { socket } from "~/logic/socket.js"

import { v4 as uuidv4 } from "uuid"

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
    loadData()
    // reData.clientIsOnline = true
  })
  socket.on("disconnect", function () {
    console.log("DISCONNECT!!!")
    // reData.clientIsOnline = false
  })
  socket.on("update", function (msg) {
    data.tasks = syncTasks(data.tasks, msg?.tasks)
    reData.collaborators = msg?.collaborators || []
    reData.collaborationsRequests = msg?.collaborationsRequests || []
    // console.log("msg", msg)
    safeSetLocalStorageItem("tasks", data.tasks)
    makevisible()
  })

  socket.on("err", (val) => {
    console.log("ошибка на сервере", val)
  })
}

export const loadData = async () => {
  // console.log("loaddata", reData.user)
  if (auth.currentUser)
    try {
      const token = await getToken("ld") // Получение нового токена
      reData.user.token = token // Добавляем токен к данным пользователя
      socket.emit("load", reData.user)
    } catch (error) {
      console.error("Error loading data with token:", error)
    }
}

socket.on("save-confirm", (responseId) => {
  // Удаляем подтвержденный пакет из массива
  console.log("save-confirm", responseId)
  data.pendingRequests = data.pendingRequests.filter((packet) => packet.requestId !== responseId)
  safeSetLocalStorageItem("pendingRequests", data.pendingRequests)
})

const addTaskRequest = (changedTasks) => {
  const packet = {
    tasks: changedTasks,
    requestId: uuidv4(),
  }
  data.pendingRequests.push(packet)
  safeSetLocalStorageItem("pendingRequests", data.pendingRequests)
}

const addCollaboratorRequest = (collaboratorId) => {
  const packet = {
    collaboratorId,
    requestId: uuidv4(),
  }
  data.pendingRequests.push(packet)
  safeSetLocalStorageItem("pendingRequests", data.pendingRequests)
}

export const sendCollaboratorRequest = async (collaborator) => {
  // console.log("sendCollaboratorPermisson")
  if (collaborator) addCollaboratorRequest(collaborator)
  if (data.pendingRequests) {
    for (let pendingPacket of data.pendingRequests) {
      await sendPacket(pendingPacket)
    }
  }
}

export const sendTasksData = async (changedTasks) => {
  console.log("sendTasksData")
  if (changedTasks) addTaskRequest(changedTasks)
  if (data.pendingRequests) {
    for (let pendingPacket of data.pendingRequests) {
      await sendPacket(pendingPacket)
    }
  }
}

const sendPacket = async (packet) => {
  if (auth.currentUser)
    try {
      const token = await getToken("sd")
      const sentData = {
        user: {
          ...reData.user,
          token: token,
        },
        data: packet,
      }
      // console.log("sentData", sentData)
      socket.emit("save", sentData)
    } catch (error) {
      console.error("Error sending data:", error)
    }
}
