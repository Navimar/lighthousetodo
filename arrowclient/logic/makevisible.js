import reData from "~/logic/reactive.js"
import { getObjectById } from "~/logic/util.js"
import { PRIORITY, CONSEQUENCE_DURATION_PRIORITY } from "~/logic/const"
import data from "~/logic/data.js"

import dayjs from "dayjs"
import isSameOrAfter from "dayjs/plugin/isSameOrAfter"

dayjs.extend(isSameOrAfter)

export const makevisible = () => {
  const areAllFromIdsReady = (task) => {
    if (!task?.fromIds || task.fromIds.length === 0) return true
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

const getMaxPriorityTypeAndConsequence = (task, depth = 0, visited = new Set()) => {
  if (depth >= 7 || visited.has(task.id)) return { type: task.type, consequence: task.consequence }

  visited.add(task.id)

  let maxPriorityType = task.type
  let maxPriorityConsequence = task.consequence
  let points = CONSEQUENCE_DURATION_PRIORITY[task.consequence] + PRIORITY[task.type]
  task.toIds?.forEach((id) => {
    const childTask = getObjectById(id)
    if (!childTask || childTask.ready) return // Пропускаем задачи с ready === true или если они не найдены

    const childPriority = getMaxPriorityTypeAndConsequence(childTask, depth + 1, visited)

    if (
      PRIORITY[childPriority.type] < PRIORITY[maxPriorityType] ||
      (childPriority.type === maxPriorityType &&
        CONSEQUENCE_DURATION_PRIORITY[childPriority.consequence] <
          CONSEQUENCE_DURATION_PRIORITY[maxPriorityConsequence])
    ) {
      maxPriorityType = childPriority.type
      maxPriorityConsequence = childPriority.consequence
      points = PRIORITY[childPriority.type] + CONSEQUENCE_DURATION_PRIORITY[childPriority.consequence]
    }
  })

  return { type: maxPriorityType, consequence: maxPriorityConsequence, points }
}

const getMaxTimestampFromIds = (task) => {
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

    const aPriority = getMaxPriorityTypeAndConsequence(a)
    const bPriority = getMaxPriorityTypeAndConsequence(b)

    // Приоритет ко времени
    // if (aPriority.type == "onTime" && bPriority.type != "onTime") return -1
    // if (aPriority.type == "onTime" && bPriority.type != "onTime") return 1

    // // Если обе ко времени, сравниваем datetime
    // if (aPriority.type == "onTime" && bPriority.type == "onTime") {
    //   if (!datetimeA.isSame(datetimeB)) return datetimeA.isAfter(datetimeB) ? 1 : -1
    // }

    let now = dayjs()

    let aIsFuture = datetimeA.isAfter(now)
    let bIsFuture = datetimeB.isAfter(now)

    // Если одна задача в будущем, а другая в прошлом, возвращаем будущую первой
    if (aIsFuture && aPriority.type == "onTime" && !bIsFuture) return -1
    if (!aIsFuture && bIsFuture && bPriority.type == "onTime") return 1

    // Если обе задачи в будущем, сравниваем их по времени
    if (aIsFuture && aPriority.type == "onTime" && bIsFuture && bPriority.type == "onTime")
      return datetimeA.isAfter(datetimeB) ? 1 : -1

    if (aPriority.points > bPriority.points) return 1
    if (aPriority.points < bPriority.points) return -1

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
