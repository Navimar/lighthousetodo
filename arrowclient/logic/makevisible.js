import { currentTime, selectedDate, reData, selected } from "~/logic/reactive.js"
import { getObjectById } from "~/logic/util.js"
import { PRIORITY } from "~/logic/const"
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

  reData.visibletasks = []

  for (let task of data.tasks) {
    // Если задача является выбранной, добавляем её в видимые задачи
    if (task.id === selected.id) {
      reData.visibletasks.push(task)
      continue // переходим к следующей итерации цикла
    }

    const isCurrentOrFutureTask =
      selectedDate.date === currentTime.date
        ? dayjs(task.date).isBefore(dayjs(selectedDate.date).add(1, "day")) || task.date == selectedDate || !task.date
        : dayjs(task.date).isSame(dayjs(selectedDate.date)) || !task.date

    if (!task.ready && isCurrentOrFutureTask && (areAllFromIdsReady(task) || task.type === "meeting")) {
      reData.visibletasks.push(task)
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

const getMaxPriorityType = (task, depth = 0, visited = new Set()) => {
  if (depth >= 7 || visited.has(task.id)) return task.type

  visited.add(task.id)

  let maxPriorityType = task.type

  task.toIds?.forEach((id) => {
    const childTask = getObjectById(id)
    if (!childTask) return
    if (childTask.ready) return // Пропускаем задачи с ready === true

    const childType = getMaxPriorityType(childTask, depth + 1, visited)

    if (PRIORITY[childType] < PRIORITY[maxPriorityType]) {
      maxPriorityType = childType
    }
  })

  return maxPriorityType
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

export const sort = (arrToSort = reData.visibletasks) => {
  arrToSort.sort((a, b) => {
    // Дисприоритет готовности
    if (!a.ready && b.ready) return -1
    if (a.ready && !b.ready) return 1

    // Дисприоритет паузы
    if (!a.pause && b.pause) return -1
    if (a.pause && !b.pause) return 1

    let datetimeA = dayjs(`${a.date}T${a.time}`, "YYYY-MM-DDTHH:mm")
    let datetimeB = dayjs(`${b.date}T${b.time}`, "YYYY-MM-DDTHH:mm")

    const aPriorityType = getMaxPriorityType(a)
    const bPriorityType = getMaxPriorityType(b)

    // Приоритет встречам и рамкам перед окнами и срокам
    if (
      (aPriorityType == "meeting" || aPriorityType == "frame") &&
      (bPriorityType == "window" || bPriorityType == "deadline")
    )
      return -1
    if (
      (aPriorityType == "window" || aPriorityType == "deadline") &&
      (bPriorityType == "meeting" || bPriorityType == "frame")
    )
      return 1

    // Если обе встречи или рамки, сравниваем datetime
    if (
      (aPriorityType == "meeting" || aPriorityType == "frame") &&
      (bPriorityType == "meeting" || bPriorityType == "frame")
    ) {
      if (!datetimeA.isSame(datetimeB)) return datetimeA.isAfter(datetimeB) ? 1 : -1
    }

    // Приоритет сроку над окном
    if (aPriorityType == "deadline" && bPriorityType == "window") return -1
    if (bPriorityType == "deadline" && aPriorityType == "window") return 1

    // Если обе задачи окна
    if (
      (aPriorityType == "window" || aPriorityType == "deadline") &&
      (bPriorityType == "window" || bPriorityType == "deadline")
    ) {
      let now = dayjs()

      let aIsFuture = datetimeA.isAfter(now)
      let bIsFuture = datetimeB.isAfter(now)

      // Если одна задача в будущем, а другая в прошлом, возвращаем будущую первой
      if (aIsFuture && !bIsFuture) return 1
      if (!aIsFuture && bIsFuture) return -1

      // Если обе задачи в будущем, сравниваем их по времени
      if (aIsFuture && bIsFuture) return datetimeA.isAfter(datetimeB) ? 1 : -1

      // // Сортировка по таймстампу предков о_О
      const maxTimestampA = getMaxTimestampFromIds(a)
      const maxTimestampB = getMaxTimestampFromIds(b)

      if (maxTimestampA > maxTimestampB) {
        return -1
      } else if (maxTimestampA < maxTimestampB) {
        return 1
      }
    }
    return 0
  })

  if (
    reData.visibletasks[0] &&
    (dayjs(reData.visibletasks[0].time, "HH:mm").isAfter(dayjs()) || reData.visibletasks[0].pause)
  ) {
    // Find the index of the first task that's due or overdue based on the current time
    let index = reData.visibletasks.findIndex(
      (task) => dayjs(task.time + " " + task.date, "HH:mm YYYY-MM-DD").isSameOrBefore(dayjs()) && !task.pause,
    )

    if (index != -1) {
      // Move the due or overdue task to the start of the list
      let [task] = reData.visibletasks.splice(index, 1)
      reData.visibletasks.unshift(task)
    }
  }
}
