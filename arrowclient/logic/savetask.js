import reData from "~/logic/reactive.js"
import { isNameTaken, safeSetLocalStorageItem } from "~/logic/util.js"
import { clearSearch } from "~/logic/manipulate"
import data from "~/logic/data.js"
import { sendTasksData } from "~/logic/send.js"
import { getObjectByName, getObjectById } from "~/logic/util"
import { getCollaboratorByName } from "~/logic/collaborator.js"
import performance from "~/logic/performance.js"
import audio from "~/logic/audio.js"

import dayjs from "dayjs"

export default (m) => {
  performance.start("savetask")
  try {
    let changedTasks = new Set()
    // понять откуда вызвано сохранение
    // console.log("saveTask", m)
    // если нет выделенных, то выйти
    if (!reData.selectedScribe) return false

    // найти див редактирования
    const eDiv = document.getElementById("edit")
    if (!eDiv) return false

    let thisTask = getObjectById(reData.selectedScribe)
    // найти имя и заметку
    const lines = eDiv.innerText.trim().split("\n")
    let name = lines[0].trim()
    const note = lines.slice(1).join("\n")

    // добываем массив строк из полей from и to
    // и получаем соответствующие ID
    let fromEditIds = []
    let toEditIds = []
    let assignedTo = [reData.user.id]

    // устанавливаем намерение
    let intentionCheckbox = document.getElementById("intentionCheckbox")
    if (intentionCheckbox && intentionCheckbox.checked) {
      thisTask.intention = true
      if (!thisTask.intentionPriority)
        thisTask.intentionPriority = (reData.intentions[0]?.intentionPriority || 2000000) / 2
    } else {
      thisTask.intention = false
    }

    let fromRole = thisTask.intention ? "common" : "kairos"

    fromEdit.innerText
      .trim()
      .split("\n")
      .filter((e) => e.trim() !== "" && e.trim() !== name)
      .forEach((e) => {
        e = e.trim()
        let collaborator = getCollaboratorByName(e)
        // Если найден сотрудник, добавляем его ID в assignedTo
        if (collaborator) assignedTo.push(collaborator.id)
        else {
          fromEditIds.push(getObjectByName(e, fromRole).id)
        }
      })

    let toRole = "intention"
    toEdit.innerText
      .trim()
      .split("\n")
      .filter((e) => e.trim() !== "" && e.trim() !== name)
      .forEach((line) => {
        let id = getObjectByName(line, toRole).id
        if (!fromEditIds.includes(id)) {
          toEditIds.push(id)
        }
      })

    // === Новый блок для обработки moreImportant и lessImportant ===
    let moreImportantEditIds = []
    let lessImportantEditIds = []
    const moreImportantEdit = document.getElementById("moreImportantEdit")
    const lessImportantEdit = document.getElementById("lessImportantEdit")

    if (moreImportantEdit) {
      moreImportantEdit.innerText
        .trim()
        .split("\n")
        .filter((e) => e.trim() !== "" && e.trim() !== name)
        .forEach((e) => {
          e = e.trim()
          // Используем роль "moreImportant" – при необходимости измените её
          moreImportantEditIds.push(getObjectByName(e, "common").id)
        })
    }
    if (lessImportantEdit) {
      lessImportantEdit.innerText
        .trim()
        .split("\n")
        .filter((e) => e.trim() !== "" && e.trim() !== name)
        .forEach((e) => {
          e = e.trim()
          // Используем роль "lessImportant" – при необходимости измените её
          lessImportantEditIds.push(getObjectByName(e, "common").id)
        })
    }
    // ===================================================================

    // добавляем дату и время из инпутов
    const timeInput = document.getElementById("timeInput").value
    const dateInput = document.getElementById("dateInput").value

    // добываем данные из радио-кнопок
    let urgencyRadios = document.getElementsByName("urgency")
    let priorityRadioType = "kairos"
    for (let i = 0; i < urgencyRadios.length; i++) {
      if (urgencyRadios[i].checked) {
        priorityRadioType = urgencyRadios[i].value // выбранное значение
        break
      }
    }
    let importanceRadios = document.getElementsByName("importance")
    let importancePriorityRadio = "kairos"
    for (let i = 0; i < importanceRadios.length; i++) {
      if (importanceRadios[i].checked) {
        importancePriorityRadio = importanceRadios[i].value
        break
      }
    }

    let difficultyRadios = document.getElementsByName("difficulty")
    let difficultyPriorityRadio = "kairos"
    for (let i = 0; i < difficultyRadios.length; i++) {
      if (difficultyRadios[i].checked) {
        difficultyPriorityRadio = difficultyRadios[i].value
        break
      }
    }
    if (
      !(importancePriorityRadio == "kairos" && difficultyPriorityRadio == "kairos" && priorityRadioType == "kairos")
    ) {
      if (priorityRadioType == "kairos") priorityRadioType = "longTerm"
      if (importancePriorityRadio == "kairos") importancePriorityRadio = "trivial"
      if (difficultyPriorityRadio == "kairos") difficultyPriorityRadio = "quick"
    }

    // проверяем, что имя не пустое и не занято
    if (name === "") {
      name = thisTask.name
    }
    if (name != thisTask.name)
      while (isNameTaken(name) && name.length < 1000) {
        name += "!"
      }

    // Обновляем связи между задачами
    for (let theTask of data.tasks) {
      // 1. Удаляем связи для тех задач, где они больше не нужны.
      if (theTask.fromIds?.includes(reData.selectedScribe) && !fromEditIds.includes(theTask.id)) {
        theTask.fromIds = theTask.fromIds?.filter((id) => id !== reData.selectedScribe) || []
        changedTasks.add(theTask)
      }

      if (theTask.toIds?.includes(reData.selectedScribe) && !toEditIds.includes(theTask.id)) {
        theTask.toIds = theTask.toIds?.filter((id) => id !== reData.selectedScribe) || []
        changedTasks.add(theTask)
      }

      // 2. Добавляем связи, если они установлены пользователем.
      if (fromEditIds.includes(theTask.id) && !theTask.toIds?.includes(reData.selectedScribe)) {
        if (!theTask.toIds) theTask.toIds = []
        theTask.toIds.push(reData.selectedScribe)
        changedTasks.add(theTask)
      }

      if (toEditIds.includes(theTask.id) && !theTask.fromIds?.includes(reData.selectedScribe)) {
        if (!theTask.fromIds) theTask.fromIds = []
        theTask.fromIds.push(reData.selectedScribe)
        changedTasks.add(theTask)
      }

      // === Новый блок для moreImportant и lessImportant связей ===
      if (theTask.moreImportantIds?.includes(reData.selectedScribe) && !moreImportantEditIds.includes(theTask.id)) {
        theTask.moreImportantIds = theTask.moreImportantIds?.filter((id) => id !== reData.selectedScribe) || []
        changedTasks.add(theTask)
      }

      if (theTask.lessImportantIds?.includes(reData.selectedScribe) && !lessImportantEditIds.includes(theTask.id)) {
        theTask.lessImportantIds = theTask.lessImportantIds?.filter((id) => id !== reData.selectedScribe) || []
        changedTasks.add(theTask)
      }

      if (moreImportantEditIds.includes(theTask.id) && !theTask.lessImportantIds?.includes(reData.selectedScribe)) {
        if (!theTask.lessImportantIds) theTask.lessImportantIds = []
        theTask.lessImportantIds.push(reData.selectedScribe)
        changedTasks.add(theTask)
      }

      if (lessImportantEditIds.includes(theTask.id) && !theTask.moreImportantIds?.includes(reData.selectedScribe)) {
        if (!theTask.moreImportantIds) theTask.moreImportantIds = []
        theTask.moreImportantIds.push(reData.selectedScribe)
        changedTasks.add(theTask)
      }
      // ============================================================
    }

    changedTasks.add(thisTask)

    // сохраняем новые значения в задаче
    thisTask.name = name
    thisTask.note = note

    if (priorityRadioType) thisTask.urgency = priorityRadioType
    if (importancePriorityRadio) thisTask.importance = importancePriorityRadio
    if (difficultyPriorityRadio) thisTask.difficulty = difficultyPriorityRadio

    thisTask.fromIds = fromEditIds
    thisTask.toIds = toEditIds
    // Сохраняем новые связи для более/менее важных задач
    thisTask.moreImportantIds = moreImportantEditIds
    thisTask.lessImportantIds = lessImportantEditIds

    thisTask.assignedTo = [...new Set(thisTask.assignedTo.concat(assignedTo))]

    thisTask.time = timeInput
    thisTask.date = dateInput

    // устанавливаем паузу
    let pauseCheckbox = document.getElementById("pauseCheckbox")
    if (pauseCheckbox && pauseCheckbox.checked) {
      audio.playSound("afterward")
      thisTask.pause = dayjs().valueOf()
      thisTask.pauseTimes = (thisTask.pauseTimes || 0) + 1
    } else {
      thisTask.pause = false
      thisTask.pauseTimes = 0
    }

    let postponeCheckbox = document.getElementById("postponeCheckbox")
    if (postponeCheckbox && postponeCheckbox.checked) {
      thisTask.postpone = true
      thisTask.pause = dayjs().valueOf()
      thisTask.pauseTimes = (thisTask.pauseTimes || 2) + 1
    } else {
      thisTask.postpone = false
    }

    // если выделено общая, то присваивать public
    let publicCheckbox = document.getElementById("publicCheckbox")
    if (publicCheckbox && publicCheckbox.checked) thisTask.public = true
    else thisTask.public = false

    // если готова, то ready
    let readyCheckbox = document.getElementById("readyCheckbox")
    if (readyCheckbox && readyCheckbox.checked) {
      audio.playSound("readySave")
      if (!thisTask.ready) {
        thisTask.readyLogs = Array.isArray(thisTask.readyLogs) ? thisTask.readyLogs : []
        thisTask.readyLogs.push({
          status: true,
          timestamp: dayjs().valueOf(),
        })
        if (thisTask.readyLogs?.length > 100) {
          thisTask.readyLogs.shift() // удаляем самую старую запись, если превышено 100 записей
        }
      }
      thisTask.ready = true
    } else {
      if (thisTask.ready) {
        thisTask.readyLogs = Array.isArray(thisTask.readyLogs) ? thisTask.readyLogs : []
        thisTask.readyLogs.push({
          status: false,
          timestamp: dayjs().valueOf(),
        })
        if (thisTask.readyLogs?.length > 100) {
          thisTask.readyLogs.shift() // удаляем самую старую запись, если превышено 100 записей
        }
      }
      thisTask.ready = false
    }

    // удаляем дубликаты
    changedTasks = Array.from(changedTasks)

    // ставим временную метку
    changedTasks.forEach((task) => (task.timestamp = dayjs().valueOf()))

    // отправляем массив
    safeSetLocalStorageItem("tasks", data.tasks)
    sendTasksData(changedTasks)

    // опустошаем строку поиска
    clearSearch()

    if (!thisTask.ready && !thisTask.pause) audio.playSound("save")

    return true
  } finally {
    // гарантируем завершение таймера независимо от того, как завершилась функция
    performance.end("savetask")
  }
}
