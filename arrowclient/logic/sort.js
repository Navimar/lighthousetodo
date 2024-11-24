import reData from "~/logic/reactive.js"
import dayjs from "dayjs"
import performance from "~/logic/performance.js"
import { getObjectById } from "~/logic/util.js"
import { PRIORITY, IMPORTANCE_PRIORITY, DIFFICULTY_PRIORITY } from "~/logic/const"

const calculateReadyPercentage = (task) => {
  if (!task.fromIds || task.fromIds.length === 0) {
    return 100 // Нет зависимых задач, значит все готовы
  }

  // Находим все объекты задач по fromIds
  const fromTasks = task.fromIds.map((id) => getObjectById(id)).filter((t) => t)

  if (fromTasks.length === 0) {
    return 0 // Если задачи не найдены
  }

  // Получаем временную метку первой записи readyLogs самой задачи
  if (!task.readyLogs) return 0 // Если нет логов у задачи
  const startTime = task.readyLogs[0]?.timestamp
  if (!startTime) {
    return 0 // Если нет логов у задачи
  }

  let totalReadyTime = 0
  let lastTimestamp = startTime

  // Итерация по временным меткам, чтобы найти участки времени, где все задачи были готовы
  for (let i = 0; i < fromTasks.length; i++) {
    const currentTask = fromTasks[i]
    let isAllReady = false

    // Проверяем логи текущей задачи и анализируем готовность всех fromTasks
    for (let j = 0; j < currentTask.readyLogs.length; j++) {
      const log = currentTask.readyLogs[j]

      if (log.status) {
        if (isAllReady === false) {
          lastTimestamp = log.timestamp
        }
        isAllReady = true
      } else {
        if (isAllReady) {
          totalReadyTime += log.timestamp - lastTimestamp
        }
        isAllReady = false
      }
    }
  }

  const endTime = dayjs().valueOf()
  totalReadyTime += endTime - lastTimestamp

  const duration = endTime - startTime
  return duration > 0 ? (totalReadyTime / duration) * 100 : 0
}

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

  // Если задача намерение, возвращаем нулевой приоритет и передаем приоритет дальше
  if (task.intention) {
    return task.toIds?.reduce(
      (maxPriority, id) => {
        const childTask = getObjectById(id)
        if (!childTask || childTask.ready) return maxPriority

        const childPriority = getMaxPriority(childTask, depth + 1, visited, nodeCount)
        return childPriority.points > maxPriority.points ? childPriority : maxPriority
      },
      { urgency: 0, importance: 0, points: 0, nodeCount: nodeCount.count },
    )
  }

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

export default (arrToSort = reData.visibleTasks) => {
  performance.start("Full Sorting Process")
  const now = dayjs()

  arrToSort.sort((a, b) => {
    // Дисприоритет готовности
    if (!a.ready && b.ready) {
      return -1
    }
    if (a.ready && !b.ready) {
      return 1
    }

    // Дисприоритет паузы
    if (!a.pause && b.pause) {
      return -1
    }
    if (a.pause && !b.pause) {
      return 1
    }

    performance.start("Sorting - DateTime Parsing")
    let datetimeA = dayjs(`${a.date}T${a.time}`, "YYYY-MM-DDTHH:mm")
    let datetimeB = dayjs(`${b.date}T${b.time}`, "YYYY-MM-DDTHH:mm")
    performance.end("Sorting - DateTime Parsing")

    performance.start("Sorting - Future Task Check")

    let aIsFuture = datetimeA.isAfter(now)
    let bIsFuture = datetimeB.isAfter(now)

    // Приоритет будущих задач ко времени над другими
    if (a.urgency == "onTime" && aIsFuture && b.urgency != "onTime") {
      performance.end("Sorting - Future Task Check")
      return -1
    }
    if (b.urgency == "onTime" && bIsFuture && a.urgency != "onTime") {
      performance.end("Sorting - Future Task Check")
      return 1
    }

    // Если обе ко времени и обе в будущем, сравниваем datetime
    if (a.urgency == "onTime" && b.urgency == "onTime" && aIsFuture && bIsFuture) {
      if (!datetimeA.isSame(datetimeB)) {
        performance.end("Sorting - Future Task Check")
        return datetimeA.isAfter(datetimeB) ? 1 : -1
      }
    }

    // Если одна задача в будущем, а другая в прошлом, возвращаем прошлую первой
    if (aIsFuture && !bIsFuture) {
      performance.end("Sorting - Future Task Check")
      return 1
    }
    if (!aIsFuture && bIsFuture) {
      performance.end("Sorting - Future Task Check")
      return -1
    }
    performance.end("Sorting - Future Task Check")

    performance.start("Sorting - Intention Check")
    // Приоритет intention
    if (a.intention && !b.intention) {
      performance.end("Sorting - Intention Check")
      return -1
    }
    if (!a.intention && b.intention) {
      performance.end("Sorting - Intention Check")
      return 1
    }
    performance.end("Sorting - Intention Check")

    performance.start("Sorting - Ready Percentage Comparison")
    // Сравнение по проценту готовности всех fromIds
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

    performance.start("Sorting - Priority Calculation")
    const aPriority = getMaxPriority(a)
    const bPriority = getMaxPriority(b)

    const aTotalPriority =
      aPriority.points && DIFFICULTY_PRIORITY[a.difficulty] ? aPriority.points + DIFFICULTY_PRIORITY[a.difficulty] : 0
    const bTotalPriority =
      bPriority.points && DIFFICULTY_PRIORITY[b.difficulty] ? bPriority.points + DIFFICULTY_PRIORITY[b.difficulty] : 0
    performance.end("Sorting - Priority Calculation")

    performance.start("Sorting - Total Priority Comparison")
    if (aTotalPriority > bTotalPriority) {
      performance.end("Sorting - Total Priority Comparison")
      return -1
    }
    if (aTotalPriority < bTotalPriority) {
      performance.end("Sorting - Total Priority Comparison")
      return 1
    }
    performance.end("Sorting - Total Priority Comparison")

    performance.start("Sorting - Node Count and Timestamp Check")

    // Сортируем по количеству потомков
    if (aPriority.nodeCount > bPriority.nodeCount) {
      performance.end("Sorting - Node Count and Timestamp Check")
      return 1
    }
    if (aPriority.nodeCount < bPriority.nodeCount) {
      performance.end("Sorting - Node Count and Timestamp Check")
      return -1
    }

    // Сортировка по таймстампу предков о_О
    const maxTimestampA = getMaxTimestampFromIds(a)
    const maxTimestampB = getMaxTimestampFromIds(b)

    if (maxTimestampA > maxTimestampB) {
      performance.end("Sorting - Node Count and Timestamp Check")
      return -1
    } else if (maxTimestampA < maxTimestampB) {
      performance.end("Sorting - Node Count and Timestamp Check")
      return 1
    }

    performance.end("Sorting - Node Count and Timestamp Check")

    return 0
  })
  performance.end("Full Sorting Process")

  performance.start("Post-Sorting Adjustment")
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
  performance.end("Post-Sorting Adjustment")
}
