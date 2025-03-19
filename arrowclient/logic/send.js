import { auth } from "/components/authentication.js"
import reData from "~/logic/reactive.js"
import syncTasks from "/logic/synctasks.js"
import data from "~/logic/data.js"
import { makevisible } from "~/logic/makevisible"
import { safeSetLocalStorageItem } from "~/logic/util.js"
import { socket } from "~/logic/socket.js"
import { VERSION } from "~/logic/const"

import { v4 as uuidv4 } from "uuid"

let lastTokenFetchTime = 0
const TOKEN_FETCH_INTERVAL = 60000 // 1 минута

async function getToken() {
  const currentTime = Date.now()
  if (auth.currentUser && currentTime - lastTokenFetchTime > TOKEN_FETCH_INTERVAL) {
    try {
      lastTokenFetchTime = currentTime
      return await auth.currentUser.getIdToken(true)
    } catch (error) {
      console.error("Error getting token:", error)
      throw error
    }
  } else if (auth.currentUser) {
    try {
      return await auth.currentUser.getIdToken(false)
    } catch (error) {
      console.error("Error getting cached token:", error)
      throw error
    }
  }
}

export function inputSocket() {
  socket.on("connect", function () {
    loadData()
    // reData.clientIsOnline = true
  })
  socket.on("version", function (msg) {
    reData.version = msg.version
    if (msg && msg.version != VERSION) {
      const safeVersion = encodeURIComponent(msg.version) // Надежное экранирование версии
      window.location.href = `${window.location.pathname}?version=${safeVersion}`
    }
  })
  socket.on("disconnect", function () {
    console.log("DISCONNECT!!!")
    // reData.clientIsOnline = false
  })
  socket.on("update", function (msg) {
    syncTasks(msg?.tasks)
    //заменить на синхронизацию полноценную
    reData.collaborators = msg?.collaborators || []
    reData.collaborationRequests = msg?.collaborationRequests || []
    // console.log("msg", msg)
    safeSetLocalStorageItem("tasks", data.tasks)
    if (reData.route[0] == "tasks") makevisible()
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
  // console.log("save-confirm", responseId)
  data.pendingRequests = data.pendingRequests.filter((packet) => packet.requestId !== responseId)
  safeSetLocalStorageItem("pendingRequests", data.pendingRequests)
})

export const sendCollaboratorRequest = async (collaborator) => {
  if (collaborator) {
    const packet = {
      collaborator,
      requestId: uuidv4(),
    }
    data.pendingRequests.push(packet)
    safeSetLocalStorageItem("pendingRequests", data.pendingRequests)
  }
  sendPendingRequests()
}
export const sendCollaboratorRemovalRequest = async (collaboratorIdToRemove) => {
  if (collaboratorIdToRemove) {
    const packet = {
      collaboratorIdToRemove, // Changed field name
      requestId: uuidv4(),
    }
    data.pendingRequests.push(packet)
    safeSetLocalStorageItem("pendingRequests", data.pendingRequests)
  }
  sendPendingRequests()
}

export const sendTasksData = async (changedTasks) => {
  if (changedTasks) {
    const packet = {
      tasks: changedTasks,
      requestId: uuidv4(),
    }
    data.pendingRequests.push(packet)
    safeSetLocalStorageItem("pendingRequests", data.pendingRequests)
  }
  sendPendingRequests()
}

const sendPendingRequests = async () => {
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
