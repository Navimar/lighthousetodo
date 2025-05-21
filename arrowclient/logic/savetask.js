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

export default () => {
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
    let assignedTo = [reData.user.id]

    // Grab the current task object
    const reTask = reData.visibleTasks.find((t) => t.id === reData.selectedScribe)

    // Вместо парсинга из текстовых полей, используем готовые ID-массивы задачи:
    let fromEditIds = reTask.fromIds || []
    let toEditIds = reTask.toIds || []
    let moreImportantEditIds = reTask.moreImportantIds || []
    let lessImportantEditIds = reTask.lessImportantIds || []
    // ===================================================================

    // добавляем дату и время из инпутов
    const timeInput = document.getElementById("timeInput").value
    const dateInput = document.getElementById("dateInput").value

    // добываем данные из радио-кнопок срочности, важности, сложности
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
      // 1. Удаляем связи для тех задач, где они больше не нужны
      if (theTask.fromIds?.includes(reData.selectedScribe) && !fromEditIds.includes(theTask.id)) {
        theTask.fromIds = theTask.fromIds?.filter((id) => id !== reData.selectedScribe) || []
        changedTasks.add(theTask)
      }
      if (theTask.toIds?.includes(reData.selectedScribe) && !toEditIds.includes(theTask.id)) {
        theTask.toIds = theTask.toIds?.filter((id) => id !== reData.selectedScribe) || []
        changedTasks.add(theTask)
      }

      // 2. Добавляем связи, если они были установлены
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
    }

    // Добавляем в changedTasks саму редактируемую задачу
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

    // обрабатываем чекбокс паузы
    let pauseCheckbox = document.getElementById("pauseCheckbox")
    if (pauseCheckbox && pauseCheckbox.checked) {
      audio.playSound("afterward")
      thisTask.pause = dayjs().valueOf()
      thisTask.pauseTimes = (thisTask.pauseTimes || 0) + 1
    } else {
      thisTask.pause = false
      thisTask.pauseTimes = 0
    }

    // обрабатываем чекбокс "общая" (public)
    let publicCheckbox = document.getElementById("publicCheckbox")
    if (publicCheckbox && publicCheckbox.checked) thisTask.public = true
    else thisTask.public = false

    // обрабатываем чекбокс готовности (ready)
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

    // проверяем blocked для изменённой задачи
    thisTask.blocked = thisTask.fromIds.some((fromId) => !getObjectById(fromId)?.ready)
    // проверяем blocked для зависимых задач
    thisTask.toIds.forEach((id) => {
      let dependentTask = getObjectById(id)
      if (dependentTask) {
        dependentTask.blocked = dependentTask.fromIds.some((fromId) => !getObjectById(fromId)?.ready)
      }
    })

    data.tasks.forEach((task) => {
      if (task.time === reData.currentTime.clock && task.date === reData.currentTime.date) {
        if (task.ready === true) {
          task.ready = false
          changedTasks.add(task)
        }
      }
      if (task.pause) {
        // Если разница между текущим временем и task.pause больше 10 минут
        if (dayjs().diff(dayjs(task.pause), "minute") > (5 + task.pauseTimes * 5) * task.pauseTimes) {
          task.pause = false
          changedTasks.add(task)
        }
      }
    })

    // Преобразуем Set в массив, иначе далее не сможем нормально пройтись по списку
    changedTasks = Array.from(changedTasks)

    // -----------------------------------------------------------
    // 1) Сохраняем текущие weight, чтобы понять, где они изменились
    // -----------------------------------------------------------
    const oldWeights = new Map()
    for (let t of data.tasks) {
      oldWeights.set(t.id, t.weight)
    }

    // -----------------------------------------------------------
    // 2) Вызываем calculateTaskWeights для пересчёта
    // -----------------------------------------------------------
    calculateTaskWeightsAndDescendants()

    // -----------------------------------------------------------
    // 3) Сравниваем старые и новые weight; если изменился —
    //    добавляем в changedTasks
    // -----------------------------------------------------------
    for (let t of data.tasks) {
      if (t.weight !== oldWeights.get(t.id)) {
        changedTasks.push(t) // Добавляем как дополнение к списку
      }
    }

    // changedTasks.forEach((task) => {
    //   task.readyPercentage = calculateReadyPercentage(task)
    // })

    // устанавливаем временную метку для каждой изменённой задачи
    changedTasks.forEach((task) => (task.timestamp = dayjs().valueOf()))

    // Сохраняем и отправляем обновлённые задачи
    safeSetLocalStorageItem("tasks", data.tasks)
    sendTasksData(changedTasks)

    // очищаем строку поиска
    clearSearch()

    // Если задача не готова и не на паузе — звук сохранения
    if (!thisTask.ready && !thisTask.pause) audio.playSound("save")

    return true
  } finally {
    // гарантируем завершение таймера независимо от того, как завершилась функция
    performance.end("savetask")
  }
}

const calculateTaskWeightsAndDescendants = () => {
  // Сбрасываем старые вычисления
  for (const task of data.tasks) {
    task.weight = undefined
    task.cycle = false
    task.descendantCount = 0
  }

  // Функция для рекурсивного присвоения веса
  const assignWeight = (taskId, weight, visited = new Set()) => {
    const task = getObjectById(taskId)
    // Если уже заходили в эту задачу в рамках одной ветки – значит цикл
    if (visited.has(taskId)) {
      task.cycle = true
      return
    }

    // Помечаем, что мы сейчас находимся в этой задаче
    visited.add(taskId)

    // Проверяем, ещё ли задача в будущем
    const isFuture = dayjs(`${task.date}T${task.time}`, "YYYY-MM-DDTHH:mm").isAfter(dayjs())

    // Устанавливаем/повышаем weight, если текущий weight ещё не определён,
    // или новый выше предыдущего
    if (task.weight === undefined || weight > task.weight) {
      task.weight = weight

      // Для lessImportantIds и toIds рекурсивно назначаем вес
      for (const id of task.lessImportantIds || []) {
        assignWeight(
          id,
          // Если задача в будущем / на паузе / готова / заблокирована – не наращиваем вес
          isFuture || task.pause || task.ready || task.blocked ? weight : weight + 1,
          new Set(visited), // передаём копию visited
        )
      }
      for (const id of task.toIds || []) {
        assignWeight(id, isFuture || task.pause || task.ready || task.blocked ? weight : weight + 1, new Set(visited))
      }
    }
  }

  // Сначала расставляем веса от "корневых" задач, у которых нет родителей
  for (const task of data.tasks) {
    const hasNoParents = !task.moreImportantIds || task.moreImportantIds.length === 0
    // && (!task.fromIds || task.fromIds.length === 0)

    if (hasNoParents) {
      assignWeight(task.id, 0)
    }
  }

  // ---------------------------------------------------------
  // Теперь считаем количество уникальных потомков для каждой задачи
  // ---------------------------------------------------------

  // Рекурсивно собираем множество всех потомков (по lessImportantIds и toIds)
  const getDescendants = (taskId, visited = new Set()) => {
    if (visited.has(taskId)) {
      return new Set()
    }
    visited.add(taskId)

    const task = getObjectById(taskId)
    // Если у задачи пометка cycle, пропускаем обход, чтобы не было бесконечного цикла
    if (task.cycle) {
      return new Set()
    }

    let descendants = new Set()
    const childrenIds = [...(task.lessImportantIds || []), ...(task.toIds || [])]

    for (const childId of childrenIds) {
      const childSet = getDescendants(childId, visited)
      // Добавляем самих потомков (childId тоже считаем «потомком»)
      childSet.add(childId)
      for (const d of childSet) {
        descendants.add(d)
      }
    }
    return descendants
  }

  // Для каждой задачи вычисляем множество потомков и берём его размер
  for (const task of data.tasks) {
    const descendants = getDescendants(task.id, new Set())
    task.descendantCount = descendants.size
  }
}

// function calculateReadyPercentage(task) {
//   // Вспомогательная функция — проверяет, все ли зависимости есть в Map и в статусе true
//   function areAllDepsReady(depStatuses, fromTasks) {
//     for (const dep of fromTasks) {
//       const st = depStatuses.get(dep.id)
//       if (!st) {
//         return false // либо нет записи в Map, либо там false
//       }
//     }
//     return true
//   }

//   // 1. Проверяем, есть ли зависимости
//   if (!task.fromIds || task.fromIds.length === 0) {
//     return 100
//   }

//   // 2. Получаем реальные объекты зависимостей
//   const fromTasks = task.fromIds.map((id) => getObjectById(id)).filter(Boolean)

//   if (fromTasks.length === 0) {
//     return 100
//   }

//   // 3. Берём timestamp начала (creationTimestamp)
//   const creationTimestamp = task.readyLogs?.[0]?.timestamp
//   if (!creationTimestamp || isNaN(creationTimestamp)) {
//     return 100
//   }

//   // 4. Текущее время
//   const endTime = dayjs().valueOf()
//   if (!endTime || isNaN(endTime)) {
//     throw new Error("Некорректное время завершения")
//   }

//   // Если вдруг время "сейчас" раньше, чем время создания - вернём 100%
//   if (endTime <= creationTimestamp) {
//     return 100
//   }

//   // 5. Собираем "события" для всех зависимостей
//   //    Каждое событие: { timestamp, depId, status }
//   //    status: true (готов) / false (не готов)
//   const events = []

//   for (const dep of fromTasks) {
//     const depId = dep.id || Math.random() // что-нибудь в качестве id

//     // Берём только логи, которые >= creationTimestamp
//     const relevantLogs = Array.isArray(dep.readyLogs)
//       ? dep.readyLogs
//           .filter((log) => log && !isNaN(log.timestamp) && log.timestamp >= creationTimestamp)
//           .map((log) => ({
//             timestamp: log.timestamp,
//             depId,
//             status: !!log.status, // приводим к boolean
//           }))
//       : []

//     // Если после фильтра ничего не осталось, зависимость считается not ready весь период
//     if (relevantLogs.length === 0) {
//       // Тогда мы не добавляем никаких событий, просто будем иметь в виду,
//       // что данная зависимость будет всегда not ready (если так оставить).
//       // Но в нашем общем алгоритме нам нужно "уведомить" о том,
//       // что на момент creationTimestamp зависимость "не готова".
//       // Иначе мы не узнаем, что хотя бы одна зависимость постоянно не готова.
//       events.push({
//         timestamp: creationTimestamp,
//         depId,
//         status: false,
//       })
//       // И без финального события о "ready" зависимость дальше так и останется not ready
//       continue
//     }

//     // Если есть события, нужно добавить "стартовое" событие,
//     // которое говорит о статусе на момент creationTimestamp.
//     // Либо можно взять первый лог, если он начинается строго с creationTimestamp.
//     // Допустим, берём статус первого лога, но на момент creationTimestamp - "не готов".
//     // Честнее будет явно сказать: пока не поступил первый "true" - мы false
//     // Но это зависит от логики в ваших данных (иногда берут последний известный статус).
//     // Для простоты предполагаем, что мы "не знаем" и ставим false, пока не пришёл лог.
//     // Если в первый же лог придёт timestamp === creationTimestamp, тогда ниже мы увидим status.

//     // Сортируем логи по возрастанию времени
//     relevantLogs.sort((a, b) => a.timestamp - b.timestamp)

//     // Добавим "start event" = false, если первый лог не совпадает ровно с creationTimestamp
//     if (relevantLogs[0].timestamp > creationTimestamp) {
//       events.push({
//         timestamp: creationTimestamp,
//         depId,
//         status: false,
//       })
//     }

//     // Теперь добавим сами логи
//     events.push(...relevantLogs)
//   }

//   // 6. Сортируем все события вместе по времени
//   events.sort((a, b) => a.timestamp - b.timestamp)

//   // 7. Отслеживаем статус всех зависимостей после каждого события
//   //    Нам нужно знать количество "ready" зависимостей
//   const depStatuses = new Map() // depId -> boolean (текущий статус)
//   let currentlyAllReady = false
//   let lastTimestampAllReadyBegan = null

//   let totalReadyTime = 0

//   for (let i = 0; i < events.length; i++) {
//     const e = events[i]
//     const { timestamp, depId, status } = e

//     // Обновляем статус зависимости
//     depStatuses.set(depId, status)

//     // Проверяем, все ли готовы
//     const allReadyNow = areAllDepsReady(depStatuses, fromTasks)

//     // Если мы переходим из "не все готовы" в "все готовы" — отмечаем начало готового интервала
//     if (!currentlyAllReady && allReadyNow) {
//       currentlyAllReady = true
//       lastTimestampAllReadyBegan = timestamp
//     }
//     // Если мы переходим из "все готовы" в "не все готовы" — закрываем готовый интервал
//     else if (currentlyAllReady && !allReadyNow) {
//       currentlyAllReady = false
//       // Добавляем интервал [lastTimestampAllReadyBegan, e.timestamp)
//       totalReadyTime += timestamp - lastTimestampAllReadyBegan
//       lastTimestampAllReadyBegan = null
//     }
//   }

//   // 8. После прохода событий, если все всё ещё готовы, закрываем интервал на endTime
//   if (currentlyAllReady && lastTimestampAllReadyBegan != null) {
//     totalReadyTime += endTime - lastTimestampAllReadyBegan
//   }

//   // 9. Считаем итоговый процент
//   const totalDuration = endTime - creationTimestamp
//   const readyPercent = (totalReadyTime / totalDuration) * 100

//   // 10. Возвращаем результат
//   return readyPercent >= 0 ? readyPercent : 0
// }
