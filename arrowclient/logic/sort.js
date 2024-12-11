import reData from "~/logic/reactive.js"
import dayjs from "dayjs"
import performance from "~/logic/performance.js"
import { getObjectById } from "~/logic/util.js"
import { PRIORITY, IMPORTANCE_PRIORITY, DIFFICULTY_PRIORITY } from "~/logic/const"

const calculateReadyPercentage = (task) => {
  if (!task.fromIds || task.fromIds.length === 0) {
    return 100 // Нет зависимых задач, значит все готовы
  }

  const fromTasks = task.fromIds.map((id) => getObjectById(id)).filter((t) => t)

  if (fromTasks.length === 0) {
    return 100 // Если задачи не найдены
  }

  const creationTimestamp = task.readyLogs?.[0]?.timestamp
  if (!creationTimestamp) return 100

  const endTime = dayjs().valueOf()
  let notReadyTime = 0

  for (const currentTask of fromTasks) {
    let lastNotReadyTimestamp = null
    for (const log of currentTask.readyLogs || []) {
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
  const readyTime = totalDuration - notReadyTime

  return totalDuration > 0 ? (readyTime / totalDuration) * 100 : 0
}
const getMinIntentionPriority = (task, depth = 0, maxDepth = 7, visited = new Set()) => {
  // Проверяем на превышение глубины или повторное посещение.
  if (depth > maxDepth || visited.has(task.id)) {
    return 100 // Фиксированное значение при превышении глубины.
  }

  visited.add(task.id)

  // Определяем приоритет текущей задачи с учётом значения по умолчанию.
  let currentPriority = 100
  if (task.intention && typeof task.intentionPriority === "number") {
    currentPriority = task.intentionPriority
  }

  // Рекурсивно вычисляем минимальный приоритет среди дочерних задач.
  task.toIds?.forEach((id) => {
    const childTask = getObjectById(id)
    if (!childTask) return

    const childPriority = getMinIntentionPriority(childTask, depth + 1, maxDepth, visited)
    if (typeof childPriority === "number" && !isNaN(childPriority)) {
      currentPriority = Math.min(currentPriority, childPriority)
    }
  })

  return currentPriority
}

// const getMaxPriority = (task, depth = 0, visited = new Set(), nodeCount = { count: 0 }, intentionSet = new Set()) => {
//   if (depth >= 7 || visited.has(task.id)) {
//     return {
//       urgency: task.urgency,
//       importance: task.importance,
//       points: PRIORITY[task.urgency] + IMPORTANCE_PRIORITY[task.importance],
//       nodeCount: nodeCount.count,
//       intentionSet: intentionSet,
//     }
//   }

//   visited.add(task.id)
//   nodeCount.count++

//   if (task.intention) {
//     intentionSet.add(task.id)
//     return task.toIds?.reduce(
//       (maxPriority, id) => {
//         const childTask = getObjectById(id)
//         if (!childTask || childTask.ready) return maxPriority

//         const childPriority = getMaxPriority(childTask, depth + 1, visited, nodeCount, intentionSet)
//         return childPriority.points > maxPriority.points ? childPriority : maxPriority
//       },
//       { urgency: 0, importance: 0, points: 0, nodeCount: nodeCount.count, intentionSet: intentionSet },
//     )
//   }

//   let maxPoints = PRIORITY[task.urgency] + IMPORTANCE_PRIORITY[task.importance]
//   let maxPriorityType = task.urgency
//   let maxPriorityConsequence = task.importance

//   task.toIds?.forEach((id) => {
//     const childTask = getObjectById(id)
//     if (!childTask || childTask.ready) return

//     const childPriority = getMaxPriority(childTask, depth + 1, visited, nodeCount, intentionSet)

//     if (childPriority.points > maxPoints) {
//       maxPoints = childPriority.points
//       maxPriorityType = childPriority.urgency
//       maxPriorityConsequence = childPriority.importance
//     }
//   })

//   return {
//     urgency: maxPriorityType,
//     importance: maxPriorityConsequence,
//     points: maxPoints,
//     nodeCount: nodeCount.count,
//     intentionSet: intentionSet,
//   }
// }

const sortByReadiness = (a, b) => {
  performance.start("Sorting - Readiness Check")
  if (!a.ready && b.ready) {
    performance.end("Sorting - Readiness Check")
    return -1
  }
  if (a.ready && !b.ready) {
    performance.end("Sorting - Readiness Check")
    return 1
  }
  performance.end("Sorting - Readiness Check")
  return 0
}

const sortByPause = (a, b) => {
  performance.start("Sorting - Pause Check")
  if (!a.pause && b.pause) {
    performance.end("Sorting - Pause Check")
    return -1
  }
  if (a.pause && !b.pause) {
    performance.end("Sorting - Pause Check")
    return 1
  }
  performance.end("Sorting - Pause Check")
  return 0
}

const sortByTimeTask = (a, b, now) => {
  performance.start("Sorting - Future Task Check")

  // Check the condition for task a
  const isTaskACritical =
    a.urgency === "onTime" && (a.importance === "critical" || a.importance === "important") && a.difficulty !== "quick"

  // Check the condition for task b
  const isTaskBCritical =
    b.urgency === "onTime" && (b.importance === "critical" || b.importance === "important") && b.difficulty !== "quick"

  // If task a meets the condition and task b does not, prioritize task a
  if (isTaskACritical && !isTaskBCritical) {
    performance.end("Sorting - Future Task Check")
    return -1
  }

  // If task b meets the condition and task a does not, prioritize task b
  if (!isTaskACritical && isTaskBCritical) {
    performance.end("Sorting - Future Task Check")
    return 1
  }

  // If both tasks meet the condition, sort by datetime
  if (isTaskACritical && isTaskBCritical) {
    const datetimeA = dayjs(`${a.date}T${a.time}`, "YYYY-MM-DDTHH:mm")
    const datetimeB = dayjs(`${b.date}T${b.time}`, "YYYY-MM-DDTHH:mm")

    // Compare the dates and times
    if (datetimeA.isBefore(datetimeB)) {
      performance.end("Sorting - Future Task Check")
      return -1
    } else if (datetimeA.isAfter(datetimeB)) {
      performance.end("Sorting - Future Task Check")
      return 1
    }
  }

  performance.end("Sorting - Future Task Check")
  return 0
}

const sortByFuture = (a, b, now) => {
  const datetimeA = dayjs(`${a.date}T${a.time}`, "YYYY-MM-DDTHH:mm")
  const datetimeB = dayjs(`${b.date}T${b.time}`, "YYYY-MM-DDTHH:mm")
  const aIsFuture = datetimeA.isAfter(now)
  const bIsFuture = datetimeB.isAfter(now)
  if (aIsFuture && !bIsFuture) {
    return 1
  }
  if (!aIsFuture && bIsFuture) {
    return -1
  }
  return 0
}

const sortByIntention = (a, b) => {
  performance.start("Sorting - Intention Check")
  if (a.intention && !b.intention) {
    performance.end("Sorting - Intention Check")
    return -1
  }
  if (!a.intention && b.intention) {
    performance.end("Sorting - Intention Check")
    return 1
  }
  performance.end("Sorting - Intention Check")
  return 0
}

const sortByPriority = (a, b, aPriority, bPriority) => {
  performance.start("Sorting - Priority Check")

  const aTotalPriority =
    aPriority.points && DIFFICULTY_PRIORITY[a.difficulty] ? aPriority.points + DIFFICULTY_PRIORITY[a.difficulty] : 0
  const bTotalPriority =
    bPriority.points && DIFFICULTY_PRIORITY[b.difficulty] ? bPriority.points + DIFFICULTY_PRIORITY[b.difficulty] : 0

  if (aTotalPriority > bTotalPriority) {
    performance.end("Sorting - Priority Check")
    return -1
  }
  if (aTotalPriority < bTotalPriority) {
    performance.end("Sorting - Priority Check")
    return 1
  }
  performance.end("Sorting - Priority Check")
  return 0
}

const sortByReadyPercentage = (a, b) => {
  performance.start("Sorting - Ready Percentage Comparison")
  const aReadyPercentage = calculateReadyPercentage(a)
  const bReadyPercentage = calculateReadyPercentage(b)

  if (aReadyPercentage < bReadyPercentage) {
    performance.end("Sorting - Ready Percentage Comparison")
    return -1
  }
  if (aReadyPercentage > bReadyPercentage) {
    performance.end("Sorting - Ready Percentage Comparison")
    return 1
  }
  performance.end("Sorting - Ready Percentage Comparison")
  return 0
}

const sortByNodeCount = (a, b, aPriority, bPriority) => {
  performance.start("Sorting - Node Count and Timestamp Check")

  if (aPriority.nodeCount > bPriority.nodeCount) {
    performance.end("Sorting - Node Count and Timestamp Check")
    return 1
  }
  if (aPriority.nodeCount < bPriority.nodeCount) {
    performance.end("Sorting - Node Count and Timestamp Check")
    return -1
  }

  performance.end("Sorting - Node Count and Timestamp Check")
  return 0
}

const sortByOnTime = (a, b) => {
  console.log(a.urgency, b.urgency)
  if (a.urgency == "onTime" && b.urgency != "onTime") return -1
  if (a.urgency != "onTime" && b.urgency == "onTime") return 1

  if (a.urgency === "onTime" && b.urgency === "onTime") {
    const datetimeA = dayjs(`${a.date}T${a.time}`, "YYYY-MM-DDTHH:mm")
    const datetimeB = dayjs(`${b.date}T${b.time}`, "YYYY-MM-DDTHH:mm")
    performance.end("Sorting - OnTime Check")
    return datetimeA.isAfter(datetimeB) ? 1 : -1
  }

  return 0
}
const postSortingAdjustment = (arrToAdjust) => {
  performance.start("Post-Sorting Adjustment")
  if (arrToAdjust[0] && (dayjs(arrToAdjust[0].time, "HH:mm").isAfter(dayjs()) || arrToAdjust[0].pause)) {
    let index = arrToAdjust.findIndex(
      (task) => dayjs(task.time + " " + task.date, "HH:mm YYYY-MM-DD").isSameOrBefore(dayjs()) && !task.pause,
    )

    if (index != -1) {
      let [task] = arrToAdjust.splice(index, 1)
      arrToAdjust.unshift(task)
    }
  }
  performance.end("Post-Sorting Adjustment")
}

export default (arrToSort = reData.visibleTasks) => {
  performance.start("Full Sorting Process")

  arrToSort.sort((a, b) => {
    let result = 0
    result = sortByReadiness(a, b)
    if (result != 0) return result

    result = sortByPause(a, b)
    if (result != 0) return result

    // result = sortByTimeTask(a, b, now)
    // if (result != 0) return result

    if (!a.intention || !b.intention) {
      const now = dayjs()
      result = sortByFuture(a, b, now)
      if (result != 0) return result
    }

    // result = sortByIntention(a, b)
    // if (result != 0) return result

    // const aPriority = getMaxPriority(a)
    // const bPriority = getMaxPriority(b)

    if (getMinIntentionPriority(a) > getMinIntentionPriority(b)) result = 1
    if (getMinIntentionPriority(a) < getMinIntentionPriority(b)) result = -1
    console.log("getMinIntentionPriority", getMinIntentionPriority(a), getMinIntentionPriority(b), result)
    if (result != 0) return result

    // result = sortByPriority(a, b, aPriority, bPriority)
    // if (result != 0) return result

    result = sortByReadyPercentage(a, b)
    if (result != 0) return result

    // result = sortByNodeCount(a, b, aPriority, bPriority)
    // if (result != 0) return result

    return b.timestamp - a.timestamp
  })
  // postSortingAdjustment(arrToSort)
  performance.end("Full Sorting Process")
}
