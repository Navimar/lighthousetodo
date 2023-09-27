import { data } from "/logic/reactive.js"

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
}

export const getObjectByName = (name) => {
  if (nameCache[name]?.name === name) {
    return nameCache[name]
  }

  const foundTask = data.tasks.find((task) => task.name === name)

  if (foundTask) {
    nameCache[name] = foundTask
    return foundTask
  }

  console.log(`объект ${name} не найден`)
  return null
}

export const isNameTaken = getObjectByName

let mouseX
let mouseY

const clickPos = (e) => {
  mouseX = e.clientX
  mouseY = e.clientY
}

function getCurrentLine() {
  let sel = document.getSelection()
  let nd = sel.anchorNode
  let text = nd.textContent.slice(0, sel.focusOffset)

  return text.split("\n").pop().trim()
}

export function getLocalStorageItem(key) {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : undefined
  } catch (e) {
    console.warn(`Ошибка при чтении ключа "${key}" из localStorage:`, e)
    return undefined
  }
}

export function safeJSONParse(value, defaultValue) {
  try {
    return JSON.parse(value)
  } catch (e) {
    return defaultValue !== undefined ? defaultValue : undefined
  }
}
export function safeSetLocalStorageItem(key, value) {
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
export { getCurrentLine, clickPos, mouseX, mouseY }
