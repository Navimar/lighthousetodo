import reData from "~/logic/reactive.js"
import { getObjectById } from "~/logic/util.js"
import { PRIORITY, IMPORTANCE_PRIORITY, DIFFICULTY_PRIORITY } from "~/logic/const"
import data from "~/logic/data.js"
import performance from "~/logic/performance.js"

import dayjs from "dayjs"
import isSameOrAfter from "dayjs/plugin/isSameOrAfter"

dayjs.extend(isSameOrAfter)

const updateVisibleTasks = (newVisibleTasks) => {
  // Создаем Set для хранения идентификаторов задач
  const oldTaskIds = new Set(reData.visibleTasks.map((task) => task.id))
  const newTaskIds = new Set(newVisibleTasks.map((task) => task.id))

  // Задачи, которые нужно добавить (есть в новом, но нет в старом)
  const tasksToAdd = newVisibleTasks.filter((task) => !oldTaskIds.has(task.id))

  // Задачи, которые нужно удалить (есть в старом, но нет в новом)
  const tasksToRemove = reData.visibleTasks.filter((task) => !newTaskIds.has(task.id))

  // Удаляем задачи, которых больше нет в новом массиве
  for (let task of tasksToRemove) {
    const index = reData.visibleTasks.findIndex((t) => t.id === task.id)
    if (index > -1) {
      reData.visibleTasks.splice(index, 1)
    }
  }

  // Добавляем задачи, которых не было в старом массиве
  for (let task of tasksToAdd) {
    reData.visibleTasks.push(task)
  }

  // Обновляем задачи, которые уже находятся в массиве
  for (let task of reData.visibleTasks) {
    const newTask = newVisibleTasks.find((t) => t.id === task.id)
    if (newTask) {
      Object.assign(task, newTask)
    }
  }
}

export const makevisible = () => {
  performance.start("makevisible")
  try {
    performance.start("initializeCache")
    const taskCache = {}
    const getCachedTaskById = (id) => {
      if (!taskCache[id]) {
        taskCache[id] = getObjectById(id)
      }
      return taskCache[id]
    }
    performance.end("initializeCache")

    const areAllFromIdsReady = (task) => {
      if (!task?.fromIds?.length) return true
      for (let id of task.fromIds) {
        const theTask = getCachedTaskById(id)
        if (!theTask) console.log("in makevisible не найден таск по ID", id, task.name)
        if (!theTask?.ready) return false
      }
      return true
    }

    const highestPriorityPerDate = {}

    performance.start("mainLoop")

    // Собираем задачи в новый массив
    const visibleTasks = []
    const selectedDateObj = dayjs(reData.selectedDate) // Кэшируем объект даты для оптимизации
    const today = dayjs() // Текущая дата

    for (let task of data.tasks) {
      if (task.id === reData.selectedScribe) {
        visibleTasks.push(task)
        continue
      }

      // Проверка на текущую или будущую задачу
      const isCurrentOrFutureTask =
        reData.selectedDate === reData.currentTime.date
          ? dayjs(task.date).isBefore(selectedDateObj.add(1, "day")) || task.date == reData.selectedDate || !task.date
          : dayjs(task.date).isSame(selectedDateObj) || !task.date

      // Добавление задачи в видимые задачи, если все условия соблюдены
      if (!task.ready && isCurrentOrFutureTask && (areAllFromIdsReady(task) || task.intention)) {
        visibleTasks.push(task)
      }

      // Обновление `highestPriorityPerDate` для текущих и будущих задач
      if (task.date && !task.ready && dayjs(task.date).isSameOrAfter(today)) {
        if (
          !highestPriorityPerDate[task.date] ||
          PRIORITY[task.urgency] < PRIORITY[highestPriorityPerDate[task.date]]
        ) {
          highestPriorityPerDate[task.date] = task.urgency
        }
      }
    }

    // Присваивание массива видимых задач
    updateVisibleTasks(visibleTasks)

    performance.end("mainLoop")

    performance.start("updateCalendarSet")
    Object.assign(reData.calendarSet, highestPriorityPerDate)
    performance.end("updateCalendarSet")

    performance.start("sortFunction")
    sort()
    performance.end("sortFunction")
  } finally {
    performance.end("makevisible")
  }
}

// const getMaxPriority = (task, depth = 0, visited = new Set(), nodeCount = { count: 0 }) => {
//   // Базовый случай рекурсии или если задача уже посещена
//   if (depth >= 7 || visited.has(task.id)) {
//     return {
//       urgency: task.urgency,
//       importance: task.importance,
//       enthusiasm: task.enthusiasm,
//       points: PRIORITY[task.urgency] + IMPORTANCE_PRIORITY[task.importance] + ENTHUSIASM_PRIORITY[task.enthusiasm],
//       nodeCount: nodeCount.count,
//     }
//   }

//   visited.add(task.id)
//   nodeCount.count++

//   // Начальное значение очков, включая новый параметр enthusiasm
//   let maxPoints = PRIORITY[task.urgency] + IMPORTANCE_PRIORITY[task.importance] + ENTHUSIASM_PRIORITY[task.enthusiasm]
//   let maxPriorityType = task.urgency
//   let maxPriorityConsequence = task.importance
//   let maxPriorityEnthusiasm = task.enthusiasm

//   task.toIds?.forEach((id) => {
//     const childTask = getObjectById(id)
//     if (!childTask || childTask.ready) return

//     const childPriority = getMaxPriority(childTask, depth + 1, visited, nodeCount)

//     // Обновляем maxPoints с учетом enthusiasm
//     if (childPriority.points > maxPoints) {
//       maxPoints = childPriority.points
//       maxPriorityType = childPriority.urgency
//       maxPriorityConsequence = childPriority.importance
//       maxPriorityEnthusiasm = childPriority.enthusiasm
//     }
//   })

//   return {
//     urgency: maxPriorityType,
//     importance: maxPriorityConsequence,
//     enthusiasm: maxPriorityEnthusiasm,
//     points: maxPoints,
//     nodeCount: nodeCount.count,
//   }
// }

const getMaxPriority = (task, depth = 0, visited = new Set(), nodeCount = { count: 0 }) => {
  // Базовый случай рекурсии или если задача уже посещена
  if (depth >= 7 || visited.has(task.id)) {
    return {
      urgency: task.urgency,
      importance: task.importance,
      points: PRIORITY[task.urgency] + IMPORTANCE_PRIORITY[task.importance],
      nodeCount: nodeCount.count,
    }
  }

  visited.add(task.id)
  nodeCount.count++

  // Начальное значение очков
  let maxPoints = PRIORITY[task.urgency] + IMPORTANCE_PRIORITY[task.importance]
  let maxPriorityType = task.urgency
  let maxPriorityConsequence = task.importance

  task.toIds?.forEach((id) => {
    const childTask = getObjectById(id)
    if (!childTask || childTask.ready) return

    const childPriority = getMaxPriority(childTask, depth + 1, visited, nodeCount)

    // Обновляем maxPoints
    if (childPriority.points > maxPoints) {
      maxPoints = childPriority.points
      maxPriorityType = childPriority.urgency
      maxPriorityConsequence = childPriority.importance
    }
  })

  return {
    urgency: maxPriorityType,
    importance: maxPriorityConsequence,
    points: maxPoints,
    nodeCount: nodeCount.count,
  }
}

const getMaxTimestampFromIds = (task) => {
  if (!task.fromIds?.length) return task.timestamp

  let maxTimestamp = 0

  task.fromIds?.forEach((id) => {
    const relatedTask = getObjectById(id)

    if (relatedTask?.timestamp > maxTimestamp) {
      maxTimestamp = relatedTask.timestamp
    }
  })

  return maxTimestamp
}

export const sort = (arrToSort = reData.visibleTasks) => {
  arrToSort.sort((a, b) => {
    // Дисприоритет готовности
    if (!a.ready && b.ready) return -1
    if (a.ready && !b.ready) return 1

    // Дисприоритет паузы
    if (!a.pause && b.pause) return -1
    if (a.pause && !b.pause) return 1

    let datetimeA = dayjs(`${a.date}T${a.time}`, "YYYY-MM-DDTHH:mm")
    let datetimeB = dayjs(`${b.date}T${b.time}`, "YYYY-MM-DDTHH:mm")

    const aPriority = getMaxPriority(a)
    const bPriority = getMaxPriority(b)

    const aTotalPriority =
      aPriority.points && DIFFICULTY_PRIORITY[a.difficulty] ? aPriority.points + DIFFICULTY_PRIORITY[a.difficulty] : 0
    const bTotalPriority =
      bPriority.points && DIFFICULTY_PRIORITY[b.difficulty] ? bPriority.points + DIFFICULTY_PRIORITY[b.difficulty] : 0

    let now = dayjs()

    let aIsFuture = datetimeA.isAfter(now)
    let bIsFuture = datetimeB.isAfter(now)

    // Приоритет будущих задач ко времени над другими
    if (aPriority.urgency == "onTime" && aIsFuture && bPriority.urgency != "onTime") return -1
    if (bPriority.urgency == "onTime" && bIsFuture && aPriority.urgency != "onTime") return 1

    // Если обе ко времени и обе в будущем, сравниваем datetime
    if (aPriority.urgency == "onTime" && bPriority.urgency == "onTime" && aIsFuture && bIsFuture) {
      if (!datetimeA.isSame(datetimeB)) return datetimeA.isAfter(datetimeB) ? 1 : -1
    }

    // Если одна задача в будущем, а другая в прошлом, возвращаем прошлую первой
    if (aIsFuture && !bIsFuture) return 1
    if (!aIsFuture && bIsFuture) return -1

    // Приоритет intention
    if (a.intention && !b.intention) return -1
    if (!a.intention && b.intention) return 1

    if (aTotalPriority > bTotalPriority) return -1
    if (aTotalPriority < bTotalPriority) return 1

    // Сортируем по количеству потомков
    if (aPriority.nodeCount > bPriority.nodeCount) return 1
    if (aPriority.nodeCount < bPriority.nodeCount) return -1

    // // Сортировка по таймстампу предков о_О
    const maxTimestampA = getMaxTimestampFromIds(a)
    const maxTimestampB = getMaxTimestampFromIds(b)

    if (maxTimestampA > maxTimestampB) {
      return -1
    } else if (maxTimestampA < maxTimestampB) {
      return 1
    }

    return 0
  })

  if (
    reData.visibleTasks[0] &&
    (dayjs(reData.visibleTasks[0].time, "HH:mm").isAfter(dayjs()) || reData.visibleTasks[0].pause)
  ) {
    // Find the index of the first task that's due or overdue based on the current time
    let index = reData.visibleTasks.findIndex(
      (task) => dayjs(task.time + " " + task.date, "HH:mm YYYY-MM-DD").isSameOrBefore(dayjs()) && !task.pause,
    )

    if (index != -1) {
      // Move the due or overdue task to the start of the list
      let [task] = reData.visibleTasks.splice(index, 1)
      reData.visibleTasks.unshift(task)
    }
  }
}
