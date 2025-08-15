const SERVER_SYNC = import.meta.env.VITE_SERVER_SYNC !== "false"

import { auth } from "/components/authentication.js"
import reData from "~/logic/reactive.js"
import { syncTask, syncRelation } from "/logic/synctasks.js"
import data from "~/logic/data.js"
import { makevisible } from "~/logic/makevisible"
import { safeSetLocalStorageItem } from "~/logic/sync.js"
import { socket } from "~/logic/socket.js"
import VERSION from "~/../shared/version.js"
import Graph from "~/../shared/graph.js"

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
  if (!SERVER_SYNC) return
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

  socket.on("updatetask", function (msg) {
    console.log("updatetask")
    syncTask(msg?.task)
    // safeSetLocalStorageItem("tasks", data.tasks)
    if (reData.route[0] == "tasks") makevisible()
  })

  socket.on("updatecollaborators", function (msg) {
    reData.collaborators = msg?.collaborators || []
    reData.collaborationRequests = msg?.collaborationRequests || []
  })

  socket.on("updaterelation", function (msg) {
    syncRelation(msg?.relation)
    // safeSetLocalStorageItem("tasks", data.tasks)
    if (reData.route[0] == "tasks") makevisible()
  })

  socket.on("update", function (msg) {
    console.log("socket update", msg)
    // Сервер присылает полный/частичный граф в поле `graph`
    if (!msg?.graph) return
    try {
      // Мерджим граф, где локальный граф хранится в data.tasks
      data.tasks = Graph.merge(data.tasks, msg.graph)
      if (reData.route[0] == "tasks") makevisible()
    } catch (e) {
      console.error("Error merging graph:", e)
    }
  })

  socket.on("err", (val) => {
    console.log("ошибка на сервере", val)
  })
}

export const loadData = async () => {
  if (!SERVER_SYNC) return
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
  if (!SERVER_SYNC) return
  // Удаляем подтвержденный пакет из массива
  // console.log("save-confirm", responseId)
  data.pendingRequests = data.pendingRequests.filter((packet) => packet.requestId !== responseId)
  // safeSetLocalStorageItem("pendingRequests", data.pendingRequests)
})

export const sendCollaboratorRequest = async (collaborator) => {
  if (!SERVER_SYNC) return
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
  if (!SERVER_SYNC) return
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

export const sendRelation = async (change) => {
  if (!SERVER_SYNC) return
  const packet = {
    relation: change,
    requestId: uuidv4(),
  }
  console.log("sendRelation", packet)
  data.pendingRequests.push(packet)
  safeSetLocalStorageItem("pendingRequests", data.pendingRequests)
  sendPendingRequests()
}

export const sendTask = async (changedTask) => {
  if (!SERVER_SYNC) return
  if (changedTask) {
    const packet = {
      task: changedTask,
      requestId: uuidv4(),
    }
    console.log("sendTask", packet)
    data.pendingRequests.push(packet)
    safeSetLocalStorageItem("pendingRequests", data.pendingRequests)
  }
  sendPendingRequests()
}

const sendPendingRequests = async () => {
  if (!SERVER_SYNC) return
  if (data.pendingRequests) {
    for (let pendingPacket of data.pendingRequests) {
      await sendPacket(pendingPacket)
    }
  }
}

const sendPacket = async (packet) => {
  if (!SERVER_SYNC) return
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
