import reData from "~/logic/reactive.js"
import { getObjectById } from "~/logic/util.js"
import { PRIORITY, IMPORTANCE_PRIORITY, ENTHUSIASM_PRIORITY } from "~/logic/const"
import data from "~/logic/data.js"

import dayjs from "dayjs"
import isSameOrAfter from "dayjs/plugin/isSameOrAfter"

dayjs.extend(isSameOrAfter)

export const makevisible = () => {
  const areAllFromIdsReady = (task) => {
    if (!task?.fromIds?.length) return true
    for (let id of task.fromIds) {
      const theTask = getObjectById(id)

      if (!theTask) console.log("in makevisible не найден таск по ID", id, task.name)
      if (!theTask?.ready) return false
    }

    return true
  }

  const highestPriorityPerDate = {}
  const today = dayjs() // текущая дата

  reData.visibleTasks = []

  for (let task of data.tasks) {
    // Если задача является выбранной, добавляем её в видимые задачи
    if (task.id === reData.selectedScribe) {
      reData.visibleTasks.push(task)
      continue // переходим к следующей итерации цикла
    }

    const isCurrentOrFutureTask =
      reData.selectedDate === reData.currentTime.date
        ? dayjs(task.date).isBefore(dayjs(reData.selectedDate).add(1, "day")) ||
          task.date == reData.selectedDate ||
          !task.date
        : dayjs(task.date).isSame(dayjs(reData.selectedDate)) || !task.date

    if (!task.ready && isCurrentOrFutureTask && areAllFromIdsReady(task)) {
      reData.visibleTasks.push(task)
    }

    // Обновляем highestPriorityPerDate только для текущих и будущих дат
    if (task.date && !task.ready && dayjs(task.date).isSameOrAfter(today)) {
      if (!highestPriorityPerDate[task.date] || PRIORITY[task.type] < PRIORITY[highestPriorityPerDate[task.date]]) {
        highestPriorityPerDate[task.date] = task.type
      }
    }
  }

  Object.assign(reData.calendarSet, highestPriorityPerDate)
  sort()
}

const getMaxPriority = (task, depth = 0, visited = new Set(), nodeCount = { count: 0 }) => {
  // Базовый случай рекурсии или если задача уже посещена
  if (depth >= 7 || visited.has(task.id)) {
    return {
      type: task.type,
      consequence: task.consequence,
      enthusiasm: task.enthusiasm,
      points: PRIORITY[task.type] + IMPORTANCE_PRIORITY[task.consequence] + ENTHUSIASM_PRIORITY[task.enthusiasm],
      nodeCount: nodeCount.count,
    }
  }

  visited.add(task.id)
  nodeCount.count++

  // Начальное значение очков, включая новый параметр enthusiasm
  let maxPoints = PRIORITY[task.type] + IMPORTANCE_PRIORITY[task.consequence] + ENTHUSIASM_PRIORITY[task.enthusiasm]
  let maxPriorityType = task.type
  let maxPriorityConsequence = task.consequence
  let maxPriorityEnthusiasm = task.enthusiasm

  task.toIds?.forEach((id) => {
    const childTask = getObjectById(id)
    if (!childTask || childTask.ready) return

    const childPriority = getMaxPriority(childTask, depth + 1, visited, nodeCount)

    // Обновляем maxPoints с учетом enthusiasm
    if (childPriority.points > maxPoints) {
      maxPoints = childPriority.points
      maxPriorityType = childPriority.type
      maxPriorityConsequence = childPriority.consequence
      maxPriorityEnthusiasm = childPriority.enthusiasm
    }
  })

  return {
    type: maxPriorityType,
    consequence: maxPriorityConsequence,
    enthusiasm: maxPriorityEnthusiasm,
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

    let now = dayjs()

    let aIsFuture = datetimeA.isAfter(now)
    let bIsFuture = datetimeB.isAfter(now)

    // Приоритет будущих задач ко времени над другими
    if (aPriority.type == "onTime" && aIsFuture && bPriority.type != "onTime") return -1
    if (bPriority.type == "onTime" && bIsFuture && aPriority.type != "onTime") return 1

    // Если обе ко времени и обе в будущем, сравниваем datetime
    if (aPriority.type == "onTime" && bPriority.type == "onTime" && aIsFuture && bIsFuture) {
      if (!datetimeA.isSame(datetimeB)) return datetimeA.isAfter(datetimeB) ? 1 : -1
    }

    // Если одна задача в будущем, а другая в прошлом, возвращаем прошлую первой
    if (aIsFuture && !bIsFuture) return 1
    if (!aIsFuture && bIsFuture) return -1

    // Сортируем по приоритету
    if (aPriority.points > bPriority.points) return -1
    if (aPriority.points < bPriority.points) return 1

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
