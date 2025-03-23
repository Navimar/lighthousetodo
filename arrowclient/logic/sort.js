import reData from "~/logic/reactive.js"
import dayjs from "dayjs"
import performance from "~/logic/performance.js"
import { getObjectById } from "~/logic/util.js"
import data from "~/logic/data.js"

function calculateReadyPercentage(task) {
  // 1. Проверяем, есть ли зависимости
  if (!task.fromIds || task.fromIds.length === 0) {
    return 100
  }

  // 2. Получаем реальные объекты зависимостей
  const fromTasks = task.fromIds.map((id) => getObjectById(id)).filter(Boolean)

  if (fromTasks.length === 0) {
    return 100
  }

  // 3. Берём timestamp начала (creationTimestamp)
  const creationTimestamp = task.readyLogs?.[0]?.timestamp
  if (!creationTimestamp || isNaN(creationTimestamp)) {
    return 100
  }

  // 4. Текущее время
  const endTime = dayjs().valueOf()
  if (!endTime || isNaN(endTime)) {
    throw new Error("Некорректное время завершения")
  }

  // Если вдруг время "сейчас" раньше, чем время создания - вернём 100%
  if (endTime <= creationTimestamp) {
    return 100
  }

  // 5. Собираем "события" для всех зависимостей
  //    Каждое событие: { timestamp, depId, status }
  //    status: true (готов) / false (не готов)
  const events = []

  for (const dep of fromTasks) {
    const depId = dep.id || Math.random() // что-нибудь в качестве id

    // Берём только логи, которые >= creationTimestamp
    const relevantLogs = Array.isArray(dep.readyLogs)
      ? dep.readyLogs
          .filter((log) => log && !isNaN(log.timestamp) && log.timestamp >= creationTimestamp)
          .map((log) => ({
            timestamp: log.timestamp,
            depId,
            status: !!log.status, // приводим к boolean
          }))
      : []

    // Если после фильтра ничего не осталось, зависимость считается not ready весь период
    if (relevantLogs.length === 0) {
      // Тогда мы не добавляем никаких событий, просто будем иметь в виду,
      // что данная зависимость будет всегда not ready (если так оставить).
      // Но в нашем общем алгоритме нам нужно "уведомить" о том,
      // что на момент creationTimestamp зависимость "не готова".
      // Иначе мы не узнаем, что хотя бы одна зависимость постоянно не готова.
      events.push({
        timestamp: creationTimestamp,
        depId,
        status: false,
      })
      // И без финального события о "ready" зависимость дальше так и останется not ready
      continue
    }

    // Если есть события, нужно добавить "стартовое" событие,
    // которое говорит о статусе на момент creationTimestamp.
    // Либо можно взять первый лог, если он начинается строго с creationTimestamp.
    // Допустим, берём статус первого лога, но на момент creationTimestamp - "не готов".
    // Честнее будет явно сказать: пока не поступил первый "true" - мы false
    // Но это зависит от логики в ваших данных (иногда берут последний известный статус).
    // Для простоты предполагаем, что мы "не знаем" и ставим false, пока не пришёл лог.
    // Если в первый же лог придёт timestamp === creationTimestamp, тогда ниже мы увидим status.

    // Сортируем логи по возрастанию времени
    relevantLogs.sort((a, b) => a.timestamp - b.timestamp)

    // Добавим "start event" = false, если первый лог не совпадает ровно с creationTimestamp
    if (relevantLogs[0].timestamp > creationTimestamp) {
      events.push({
        timestamp: creationTimestamp,
        depId,
        status: false,
      })
    }

    // Теперь добавим сами логи
    events.push(...relevantLogs)
  }

  // 6. Сортируем все события вместе по времени
  events.sort((a, b) => a.timestamp - b.timestamp)

  // 7. Отслеживаем статус всех зависимостей после каждого события
  //    Нам нужно знать количество "ready" зависимостей
  const depStatuses = new Map() // depId -> boolean (текущий статус)
  let currentlyAllReady = false
  let lastTimestampAllReadyBegan = null

  let totalReadyTime = 0

  for (let i = 0; i < events.length; i++) {
    const e = events[i]
    const { timestamp, depId, status } = e

    // Обновляем статус зависимости
    depStatuses.set(depId, status)

    // Проверяем, все ли готовы
    const allReadyNow = areAllDepsReady(depStatuses, fromTasks)

    // Если мы переходим из "не все готовы" в "все готовы" — отмечаем начало готового интервала
    if (!currentlyAllReady && allReadyNow) {
      currentlyAllReady = true
      lastTimestampAllReadyBegan = timestamp
    }
    // Если мы переходим из "все готовы" в "не все готовы" — закрываем готовый интервал
    else if (currentlyAllReady && !allReadyNow) {
      currentlyAllReady = false
      // Добавляем интервал [lastTimestampAllReadyBegan, e.timestamp)
      totalReadyTime += timestamp - lastTimestampAllReadyBegan
      lastTimestampAllReadyBegan = null
    }
  }

  // 8. После прохода событий, если все всё ещё готовы, закрываем интервал на endTime
  if (currentlyAllReady && lastTimestampAllReadyBegan != null) {
    totalReadyTime += endTime - lastTimestampAllReadyBegan
  }

  // 9. Считаем итоговый процент
  const totalDuration = endTime - creationTimestamp
  const readyPercent = (totalReadyTime / totalDuration) * 100

  // 10. Возвращаем результат
  return readyPercent >= 0 ? readyPercent : 0
}

// Вспомогательная функция — проверяет, все ли зависимости есть в Map и в статусе true
function areAllDepsReady(depStatuses, fromTasks) {
  for (const dep of fromTasks) {
    const st = depStatuses.get(dep.id)
    if (!st) {
      return false // либо нет записи в Map, либо там false
    }
  }
  return true
}

const calculateTaskWeights = () => {
  const tasks = data.tasks
  const weights = new Map()

  const assignWeight = (taskId, weight, visited = new Set()) => {
    const task = getObjectById(taskId)
    task.cycle = false
    if (visited.has(taskId)) {
      task.cycle = true
      return
    }

    visited.add(taskId)

    const isFuture = dayjs(`${task.date}T${task.time}`, "YYYY-MM-DDTHH:mm").isAfter(dayjs())

    const currentWeight = weights.get(taskId)
    if (currentWeight === undefined || weight > currentWeight) {
      weights.set(taskId, weight)

      for (const id of task.lessImportantIds || []) {
        assignWeight(id, isFuture || task.pause || task.ready || task.blocked ? weight : weight + 1, new Set(visited))
      }
      for (const id of task.toIds || []) {
        assignWeight(id, isFuture || task.pause || task.ready || task.blocked ? weight : weight + 1, new Set(visited))
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

    result = sortByReadyPercentage(a, b)
    if (result !== 0) return result

    result = sortByLessImportantIdsLength(a, b)
    if (result !== 0) return result

    result = sortByMoreImportantIdsLength(a, b)
    if (result !== 0) return result

    return b.timestamp - a.timestamp
  })

  performance.end("Full Sorting Process")
}
