import { selected } from "/logic/reactive.js"
import { isNameTaken, safeSetLocalStorageItem } from "/logic/util.js"
import { clearSearch } from "/logic/manipulate"
import data from "~/logic/data.js"
import dayjs from "dayjs"
import { sendData } from "/logic/socket"
import { getObjectByName, getObjectById } from "/logic/util"

export default (m) => {
  let changedTasks = []
  //понять откуда вызвано сохрание
  console.log("saveTask", m)
  //если нет выделенных то выйти
  if (!selected.id) return false

  //найти див редактирования
  const eDiv = document.getElementById("edit")

  if (eDiv) {
    let thisTask = getObjectById(selected.id)
    // найти имя и заметку
    const lines = eDiv.innerText.trim().split("\n")
    let name = lines[0]
    const note = lines.slice(1).join("\n")

    // добываем массив строк из фром и ту
    // добываем массив ID из фром и ту
    const fromEditIds = fromEdit.innerText
      .trim()
      .split("\n")
      .filter((name) => name.trim() !== "") // Фильтрация пустых строк
      .map((name) => getObjectByName(name).id) // Используем функцию getObjectByName

    const toEditIds = toEdit.innerText
      .trim()
      .split("\n")
      .filter((name) => name.trim() !== "") // Фильтрация пустых строк
      .map((name) => getObjectByName(name).id)

    // добаываем дату и время из инпутов
    const timeInput = document.getElementById("timeInput").value
    const dateInput = document.getElementById("dateInput").value

    // добываем данные из радио
    let radios = document.getElementsByName("typeradio")
    let choosenradio = false
    for (let i = 0; i < radios.length; i++) {
      if (radios[i].checked) {
        choosenradio = radios[i].value // Выводим значение выбранного элемента
        break // Выходим из цикла, так как радио-кнопка найдена
      }
    }

    //провереяем что имя не пусто и не занято
    if (name === "") {
      name = thisTask.name
    }
    if (name != thisTask.name)
      while (isNameTaken(name) && name.length < 1000) {
        name += "!"
      }

    for (let theTask of data.tasks) {
      // 1. Удаляем связи для тех задач, где они больше не нужны.
      if (theTask.fromIds?.includes(selected.id) && !fromEditIds.includes(theTask.id)) {
        theTask.fromIds = theTask.fromIds?.filter((id) => id !== selected.id) || []
        changedTasks.push(theTask)
      }

      if (theTask.toIds?.includes(selected.id) && !toEditIds.includes(theTask.id)) {
        theTask.toIds = theTask.toIds?.filter((id) => id !== selected.id) || []
        changedTasks.push(theTask)
      }

      // 2. Добавляем связи, если они установлены пользователем.
      if (fromEditIds.includes(theTask.id) && !theTask.toIds?.includes(selected.id)) {
        if (!theTask.toIds) theTask.toIds = []
        theTask.toIds.push(selected.id)
        changedTasks.push(theTask)
      }

      if (toEditIds.includes(theTask.id) && !theTask.fromIds?.includes(selected.id)) {
        if (!theTask.fromIds) theTask.fromIds = []
        theTask.fromIds.push(selected.id)
        changedTasks.push(theTask)
      }
    }

    changedTasks.push(thisTask)

    //ставим временную метку
    thisTask.timestamp = dayjs().valueOf()

    //сохраняем новые значение
    thisTask.name = name
    thisTask.note = note

    if (choosenradio) thisTask.type = choosenradio

    thisTask.fromIds = fromEditIds
    thisTask.toIds = toEditIds

    thisTask.time = timeInput
    thisTask.date = dateInput

    // устанавливаем паузу
    let pauseCheckbox = document.getElementById("pauseCheckbox")
    if (pauseCheckbox && pauseCheckbox.checked) thisTask.pause = dayjs().valueOf()
    else thisTask.pause = false

    // если выделено готово, то отметить готово
    let readyCheckbox = document.getElementById("readyCheckbox")
    if (readyCheckbox && readyCheckbox.checked) thisTask.ready = true
    else thisTask.ready = false

    changedTasks = [...new Set(changedTasks)]

    // Отправляем массив
    safeSetLocalStorageItem("tasks", data.tasks)
    sendData(changedTasks)

    // Опустошаем строку поиска
    clearSearch()

    return true
  }
}
