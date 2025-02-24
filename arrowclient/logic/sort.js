import reData from "~/logic/reactive.js"
import dayjs from "dayjs"
import performance from "~/logic/performance.js"
import { getObjectById } from "~/logic/util.js"
import data from "~/logic/data.js"

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

const calculateTaskWeights = () => {
  const tasks = data.tasks
  const weights = new Map()

  const assignWeight = (taskId, weight, visited = new Set()) => {
    if (visited.has(taskId)) return

    visited.add(taskId)
    const task = getObjectById(taskId)

    const isFuture = dayjs(`${task.date}T${task.time}`, "YYYY-MM-DDTHH:mm").isAfter(dayjs())
    const isPaused = task.pause
    const isReady = task.ready

    const currentWeight = weights.get(taskId)
    if (currentWeight === undefined || weight > currentWeight) {
      weights.set(taskId, weight)

      for (const id of task.lessImportantIds || []) {
        assignWeight(id, isFuture || isPaused || isReady ? weight : weight + 1, new Set(visited))
      }
      for (const id of task.toIds || []) {
        assignWeight(id, isFuture || isPaused || isReady ? weight : weight + 1, new Set(visited))
      }
    }
  }

  for (const task of tasks) {
    if (
      (!task.moreImportantIds || task.moreImportantIds.length === 0) &&
      (!task.fromIds || task.fromIds.length === 0)
    ) {
      assignWeight(task.id, 0)
    }
  }

  return weights
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

const sortByWeight = (a, b, weights) => {
  return weights.get(a.id) - weights.get(b.id)
}

const sortByMoreImportantIdsLength = (a, b) => {
  const getCount = (obj) => (obj.moreImportantIds || []).length
  return getCount(a) - getCount(b)
}

const sortByLessImportantIdsLength = (a, b) => {
  const getCount = (obj) => (obj.lessImportantIds || []).length
  return getCount(b) - getCount(a)
}

export default (arrToSort = reData.visibleTasks) => {
  performance.start("Full Sorting Process")

  const weights = calculateTaskWeights()

  const now = dayjs()

  arrToSort.sort((a, b) => {
    let result = 0

    result = sortByReadiness(a, b)
    if (result !== 0) return result

    result = sortByPause(a, b)
    if (result !== 0) return result

    result = sortByFuture(a, b, now)
    if (result !== 0) return result

    result = sortByWeight(a, b, weights)
    if (result !== 0) return result

    // result = sortByMoreImportantIdsLength(a, b)
    // if (result !== 0) return result

    result = sortByLessImportantIdsLength(a, b)
    if (result !== 0) return result

    result = sortByReadyPercentage(a, b)
    if (result !== 0) return result

    return b.timestamp - a.timestamp
  })

  performance.end("Full Sorting Process")
}
