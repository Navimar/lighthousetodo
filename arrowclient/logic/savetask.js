import reData from "~/logic/reactive.js"
import { isNameTaken, safeSetLocalStorageItem } from "~/logic/util.js"
import { clearSearch } from "~/logic/manipulate"
import data from "~/logic/data.js"
import { sendTasksData } from "~/logic/send.js"
import { getObjectByName, getObjectById } from "~/logic/util"
import { getCollaboratorByName } from "~/logic/collaborator.js"

import dayjs from "dayjs"

export default (m) => {
  let changedTasks = []
  //понять откуда вызвано сохрание
  console.log("saveTask", m)
  //если нет выделенных то выйти
  if (!reData.selectedScribe) return false

  //найти див редактирования
  const eDiv = document.getElementById("edit")

  if (!eDiv) return false

  let thisTask = getObjectById(reData.selectedScribe)
  // найти имя и заметку
  const lines = eDiv.innerText.trim().split("\n")
  let name = lines[0].trim()
  const note = lines.slice(1).join("\n")

  // добываем массив строк из фром и ту
  // добываем массив ID из фром и ту
  let fromEditIds = []
  let toEditIds = []
  let assignedTo = [reData.user.id]

  fromEdit.innerText
    .trim()
    .split("\n")
    .filter((e) => e.trim() !== "" && e.trim() !== name)
    .forEach((e) => {
      e = e.trim()
      let collaborator = getCollaboratorByName(e)
      // console.log("collaborator", e, collaborator)
      if (collaborator) assignedTo.push(collaborator.id)
      else fromEditIds.push(getObjectByName(e).id)
    })

  toEdit.innerText
    .trim()
    .split("\n")
    .filter((e) => e.trim() !== "" && e.trim() !== name)
    .forEach((name) => {
      let id = getObjectByName(name).id
      if (!fromEditIds.includes(id)) {
        toEditIds.push(id)
      }
    })
  // добаываем дату и время из инпутов
  const timeInput = document.getElementById("timeInput").value
  const dateInput = document.getElementById("dateInput").value

  // добываем данные из радио
  let typeRadios = document.getElementsByName("timePeriod")
  let priorityRadioType = false
  for (let i = 0; i < typeRadios.length; i++) {
    if (typeRadios[i].checked) {
      priorityRadioType = typeRadios[i].value // Выводим значение выбранного элемента
      break // Выходим из цикла, так как радио-кнопка найдена
    }
  }
  let durationRadios = document.getElementsByName("consequenceDuration")
  let priorityRadioConsequence = false
  for (let i = 0; i < durationRadios.length; i++) {
    if (durationRadios[i].checked) {
      priorityRadioConsequence = durationRadios[i].value // Выводим значение выбранного элемента
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
    if (theTask.fromIds?.includes(reData.selectedScribe) && !fromEditIds.includes(theTask.id)) {
      theTask.fromIds = theTask.fromIds?.filter((id) => id !== reData.selectedScribe) || []
      changedTasks.push(theTask)
    }

    if (theTask.toIds?.includes(reData.selectedScribe) && !toEditIds.includes(theTask.id)) {
      theTask.toIds = theTask.toIds?.filter((id) => id !== reData.selectedScribe) || []
      changedTasks.push(theTask)
    }

    // 2. Добавляем связи, если они установлены пользователем.
    if (fromEditIds.includes(theTask.id) && !theTask.toIds?.includes(reData.selectedScribe)) {
      if (!theTask.toIds) theTask.toIds = []
      theTask.toIds.push(reData.selectedScribe)
      changedTasks.push(theTask)
    }

    if (toEditIds.includes(theTask.id) && !theTask.fromIds?.includes(reData.selectedScribe)) {
      if (!theTask.fromIds) theTask.fromIds = []
      theTask.fromIds.push(reData.selectedScribe)
      changedTasks.push(theTask)
    }
  }

  changedTasks.push(thisTask)

  //сохраняем новые значение
  thisTask.name = name
  thisTask.note = note

  if (priorityRadioType) thisTask.type = priorityRadioType
  if (priorityRadioConsequence) thisTask.consequence = priorityRadioConsequence

  thisTask.fromIds = fromEditIds
  thisTask.toIds = toEditIds

  thisTask.assignedTo = [...new Set(thisTask.assignedTo.concat(assignedTo))]

  thisTask.time = timeInput
  thisTask.date = dateInput

  // устанавливаем паузу
  let pauseCheckbox = document.getElementById("pauseCheckbox")
  if (pauseCheckbox && pauseCheckbox.checked) {
    thisTask.pause = dayjs().valueOf()
    thisTask.pauseTimes = (thisTask.pauseTimes || 0) + 1
  } else {
    thisTask.pause = false
    thisTask.pauseTimes = 0
  }

  // если выделено общая, то присоватить public
  let publicCheckbox = document.getElementById("publicCheckbox")
  if (publicCheckbox && publicCheckbox.checked) thisTask.public = true
  else thisTask.public = false

  // если готова, то ready
  let readyCheckbox = document.getElementById("readyCheckbox")
  if (readyCheckbox && readyCheckbox.checked) thisTask.ready = true
  else thisTask.ready = false

  // console.log("thisTask", thisTask)

  //удаляем дубликаты
  changedTasks = [...new Set(changedTasks)]

  //ставим временную метку
  changedTasks.forEach((task) => (task.timestamp = dayjs().valueOf()))

  // Отправляем массив
  safeSetLocalStorageItem("tasks", data.tasks)
  sendTasksData(changedTasks)

  // Опустошаем строку поиска
  clearSearch()

  return true
}
