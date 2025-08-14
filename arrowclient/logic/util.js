import addscribe from "~/logic/addscribe"
import data from "~/logic/data.js"
import dayjs from "dayjs"

const nameCache = {}

export const getDayjsDateFromTask = (task) => {
  if (!task) return dayjs()
  return dayjs(`${task.date}T${task.time}`, "YYYY-MM-DDTHH:mm")
}

export const getObjectById = (id) => {
  // Ищем задачу в data.tasks.nodes (graph nodes)
  const foundTask = data.tasks.nodes.get(id)
  if (!foundTask) throw `getObjectById не нашел ${id} `
  return foundTask
}

export const getObjectByName = (name) => {
  const lowerName = name.toLowerCase()
  const foundTask = Array.from(data.tasks.nodes.values()).find((node) => node?.name.toLowerCase() === lowerName)
  if (foundTask) {
    return foundTask
  } else {
    return addscribe(name) // оригинальное имя
  }
}

export const isNameTaken = (name) => {
  if (nameCache[name]?.name === name) {
    return true
  }

  return Array.from(data.tasks.nodes.values()).some((node) => node.name === name)
}

let mouseX
let mouseY

const clickPos = (e) => {
  mouseX = e.clientX
  mouseY = e.clientY
}

export function findGetParameter(name, url) {
  if (!url) {
    url = window.location.href
  }
  name = name.replace(/[\[\]]/g, "\\$&")
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url)
  if (!results) return null
  if (!results[2]) return ""
  return decodeURIComponent(results[2].replace(/\+/g, " "))
}
export { clickPos, mouseX, mouseY }

export let copyToClipboard = (text) => {
  // Создаем временный элемент textarea
  const textarea = document.createElement("textarea")
  textarea.value = text
  document.body.appendChild(textarea)

  // Выделяем текст в элементе
  textarea.select()
  document.execCommand("copy")

  // Удаляем временный элемент
  document.body.removeChild(textarea)

  // Опционально: показать сообщение об успешном копировании
  alert("Ссылка скопирована в буфер обмена. Отправьте ее соисполнителю и получите такую же ссылку от него")
}

export function isPWA() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true
}
