import addscribe from "~/logic/addscribe"
import data from "~/logic/data.js"

import dayjs from "dayjs"

const nameCache = {}
const idCache = {}

export const getDayjsDateFromTask = (task) => {
  if (!task) return dayjs()
  return dayjs(`${task.date}T${task.time}`, "YYYY-MM-DDTHH:mm")
}

export const getObjectById = (id) => {
  // Проверяем, есть ли задача с таким id в кэше
  if (idCache[id]?.id === id) {
    return idCache[id]
  }

  // Ищем задачу в массиве data.tasks
  const foundTask = data.tasks.find((task) => task.id === id)

  // Если задача найдена, добавляем её в кэш и возвращаем
  if (foundTask) {
    idCache[id] = foundTask
    return foundTask
  }
  throw `getObjectById не нашел ${id} `
}

export const getObjectByName = (name) => {
  const lowerName = name.toLowerCase()

  if (nameCache[lowerName]?.name.toLowerCase() === lowerName) {
    return nameCache[lowerName]
  }

  const foundTask = data.tasks.find((task) => task.name.toLowerCase() === lowerName)
  if (foundTask) {
    nameCache[lowerName] = foundTask
    return foundTask
  } else {
    return addscribe(name) // оригинальное имя
  }
}

export const isNameTaken = (name) => {
  if (nameCache[name]?.name === name) {
    return true
  }

  return !!data.tasks.find((task) => task.name === name)
}

let mouseX
let mouseY

const clickPos = (e) => {
  mouseX = e.clientX
  mouseY = e.clientY
}

export function getLocalStorageItem(key) {
  // return undefined

  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : undefined
  } catch (e) {
    console.warn(`Ошибка при чтении ключа "${key}" из localStorage:`, e)
    return undefined
  }
}

export function safeSetLocalStorageItem(key, value) {
  // return false

  try {
    const serializedValue = JSON.stringify(value)
    localStorage.setItem(key, serializedValue)
    return true // успешное сохранение
  } catch (e) {
    console.warn(`Ошибка при записи ключа "${key}" в localStorage:`, e)
    return false // сохранение не удалось
  }
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
