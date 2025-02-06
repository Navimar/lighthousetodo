import reData from "~/logic/reactive.js"
import dayjs from "dayjs"
import performance from "~/logic/performance.js"
import { getObjectById } from "~/logic/util.js"

const calculateReadyPercentage = (task) => {
  if (!task.fromIds || task.fromIds.length === 0) {
    return 100
  }

  const fromTasks = task.fromIds.map((id) => getObjectById(id)).filter((t) => t)

  if (fromTasks.length === 0) {
    return 100
  }

  const creationTimestamp = task.readyLogs?.[0]?.timestamp
  if (!creationTimestamp || isNaN(creationTimestamp)) {
    return 100
  }

  const endTime = dayjs().valueOf()
  if (!endTime || isNaN(endTime)) {
    throw new Error("Некорректное время завершения")
  }

  let notReadyTime = 0

  for (const currentTask of fromTasks) {
    let lastNotReadyTimestamp = null
    for (const log of currentTask.readyLogs || []) {
      if (!log || isNaN(log.timestamp)) {
        continue
      }

      if (!log.status) {
        if (lastNotReadyTimestamp === null) {
          lastNotReadyTimestamp = log.timestamp
        }
      } else if (lastNotReadyTimestamp !== null) {
        notReadyTime += log.timestamp - lastNotReadyTimestamp
        lastNotReadyTimestamp = null
      }
    }
    if (lastNotReadyTimestamp !== null) {
      notReadyTime += endTime - lastNotReadyTimestamp
    }
  }

  const totalDuration = endTime - creationTimestamp
  if (totalDuration <= 0) {
    return 100
  }

  const readyTime = totalDuration - notReadyTime
  const readyPercent = (readyTime / totalDuration) * 100

  return readyPercent >= 0 ? readyPercent : 0
}

const sortByReadiness = (a, b) => {
  if (!a.ready && b.ready) return -1
  if (a.ready && !b.ready) return 1
  return 0
}

const sortByPause = (a, b) => {
  if (!a.pause && b.pause) return -1
  if (a.pause && !b.pause) return 1
  return 0
}

const sortByFuture = (a, b, now) => {
  const datetimeA = dayjs(`${a.date}T${a.time}`, "YYYY-MM-DDTHH:mm")
  const datetimeB = dayjs(`${b.date}T${b.time}`, "YYYY-MM-DDTHH:mm")
  return datetimeA.isAfter(now) - datetimeB.isAfter(now)
}

const sortByReadyPercentage = (a, b) => {
  return calculateReadyPercentage(a) - calculateReadyPercentage(b)
}

const sortByMoreImportantIdsLength = (a, b) => {
  const getValidCount = (obj) => {
    return (obj.moreImportantIds || []).filter((id) => {
      return !getObjectById(id).ready
    }).length
  }

  return getValidCount(a) - getValidCount(b)
}

const sortByLessImportantIdsLength = (a, b) => {
  const getValidCount = (obj) => {
    return (obj.lessImportantIds || []).filter((id) => {
      return !getObjectById(id).ready
    }).length
  }

  return getValidCount(b) - getValidCount(a)
}

export default (arrToSort = reData.visibleTasks) => {
  performance.start("Full Sorting Process")

  arrToSort.sort((a, b) => {
    let result = 0
    result = sortByReadiness(a, b)
    if (result !== 0) return result

    result = sortByPause(a, b)
    if (result !== 0) return result

    const now = dayjs()
    result = sortByFuture(a, b, now)
    if (result !== 0) return result

    result = sortByMoreImportantIdsLength(a, b)
    if (result !== 0) return result

    result = sortByLessImportantIdsLength(a, b)
    if (result !== 0) return result

    result = sortByReadyPercentage(a, b)
    if (result !== 0) return result

    return b.timestamp - a.timestamp
  })

  performance.end("Full Sorting Process")
}
