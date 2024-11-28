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
    return 100 // Если задачи не найдены
  }

  // Получаем дату создания задачи из первой записи readyLogs
  const creationTimestamp = task.readyLogs?.[0]?.timestamp
  if (!creationTimestamp) return 100

  const endTime = dayjs().valueOf()

  // Инициализируем начальные значения
  let notReadyTime = 0

  // Итерация по зависимым задачам
  for (const currentTask of fromTasks) {
    let lastNotReadyTimestamp = null

    // Проверяем логи текущей задачи и суммируем периоды, когда задача была не готова
    for (const log of currentTask.readyLogs || []) {
      if (!log.status) {
        // Задача стала "не готова"
        if (lastNotReadyTimestamp === null) {
          lastNotReadyTimestamp = log.timestamp
        }
      } else if (lastNotReadyTimestamp !== null) {
        // Задача снова "готова", фиксируем время
        notReadyTime += log.timestamp - lastNotReadyTimestamp
        lastNotReadyTimestamp = null
      }
    }

    // Если задача так и не стала готовой после последнего "не готова"
    if (lastNotReadyTimestamp !== null) {
      notReadyTime += endTime - lastNotReadyTimestamp
    }
  }

  const totalDuration = endTime - creationTimestamp
  const readyTime = totalDuration - notReadyTime

  return totalDuration > 0 ? (readyTime / totalDuration) * 100 : 0
}
const getMaxPriority = (task, depth = 0, visited = new Set(), nodeCount = { count: 0 }, intentionSet = new Set()) => {
  // Базовый случай рекурсии или если задача уже посещена
  if (depth >= 7 || visited.has(task.id)) {
    return {
      urgency: task.urgency,
      importance: task.importance,
      points: PRIORITY[task.urgency] + IMPORTANCE_PRIORITY[task.importance],
      nodeCount: nodeCount.count,
      intentionSet: intentionSet,
    }
  }

  visited.add(task.id)
  nodeCount.count++

  // Если задача намерение, добавляем её в сет и передаем приоритет дальше
  if (task.intention) {
    intentionSet.add(task.id)
    return task.toIds?.reduce(
      (maxPriority, id) => {
        const childTask = getObjectById(id)
        if (!childTask || childTask.ready) return maxPriority

        const childPriority = getMaxPriority(childTask, depth + 1, visited, nodeCount, intentionSet)
        return childPriority.points > maxPriority.points ? childPriority : maxPriority
      },
      { urgency: 0, importance: 0, points: 0, nodeCount: nodeCount.count, intentionSet: intentionSet },
    )
  }

  // Начальное значение очков
  let maxPoints = PRIORITY[task.urgency] + IMPORTANCE_PRIORITY[task.importance]
  let maxPriorityType = task.urgency
  let maxPriorityConsequence = task.importance

  task.toIds?.forEach((id) => {
    const childTask = getObjectById(id)
    if (!childTask || childTask.ready) return

    const childPriority = getMaxPriority(childTask, depth + 1, visited, nodeCount, intentionSet)

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
    intentionSet: intentionSet,
  }
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
    if (
      a.urgency == "onTime" &&
      aIsFuture &&
      (a.importance == "critical" || a.importance == "important") &&
      a.difficulty != "quick" &&
      !(
        b.urgency == "onTime" &&
        bIsFuture &&
        (b.importance == "critical" || b.importance == "important") &&
        b.difficulty != "quick"
      )
    ) {
      performance.end("Sorting - Future Task Check")
      return -1
    }
    if (
      b.urgency == "onTime" &&
      bIsFuture &&
      (b.importance == "critical" || b.importance == "important") &&
      b.difficulty != "quick" &&
      !(
        a.urgency == "onTime" &&
        aIsFuture &&
        (a.importance == "critical" || a.importance == "important") &&
        a.difficulty != "quick"
      )
    ) {
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

    performance.start("Sorting - getMaxPriority")

    const aPriority = getMaxPriority(a)
    const bPriority = getMaxPriority(b)

    performance.end("Sorting - getMaxPriority")

    const aIntentionSet = aPriority.intentionSet
    const bIntentionSet = bPriority.intentionSet

    // Дисприоритет задач с postpone == true в intentionSet
    performance.start("Sorting - Postpone Intention Check")
    const aHasPostponeIntention =
      aIntentionSet.size > 0 && Array.from(aIntentionSet).every((id) => getObjectById(id).postpone == true)
    const bHasPostponeIntention =
      bIntentionSet.size > 0 && Array.from(bIntentionSet).every((id) => getObjectById(id).postpone == true)

    if (aHasPostponeIntention && !bHasPostponeIntention) {
      performance.end("Sorting - Postpone Intention Check")
      return 1
    }
    if (!aHasPostponeIntention && bHasPostponeIntention) {
      performance.end("Sorting - Postpone Intention Check")
      return -1
    }
    performance.end("Sorting - Postpone Intention Check")
    performance.start("Sorting - Priority")

    const aTotalPriority =
      aPriority.points && DIFFICULTY_PRIORITY[a.difficulty] ? aPriority.points + DIFFICULTY_PRIORITY[a.difficulty] : 0
    const bTotalPriority =
      bPriority.points && DIFFICULTY_PRIORITY[b.difficulty] ? bPriority.points + DIFFICULTY_PRIORITY[b.difficulty] : 0

    if (aTotalPriority > bTotalPriority) {
      performance.end("Sorting - Priority")
      return -1
    }
    if (aTotalPriority < bTotalPriority) {
      performance.end("Sorting - Priority")
      return 1
    }
    performance.end("Sorting - Priority")

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

    performance.end("Sorting - Node Count and Timestamp Check")

    return b.timestamp - a.timestamp
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
