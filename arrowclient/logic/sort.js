import { data } from "/logic/reactive.js"
import dayjs from "dayjs"
import { getObjectByName } from "/logic/util"
import { PRIORITY } from "/logic/const"

const getMaxPriorityType = (task, depth = 0, visited = new Set()) => {
  if (depth >= 7 || visited.has(task.name)) return task.type

  visited.add(task.name)

  let maxPriorityType = task.type

  task.toNames?.forEach((name) => {
    const childTask = getObjectByName(name)
    if (!childTask) return
    if (childTask.ready) return // Пропускаем задачи с ready === true

    const childType = getMaxPriorityType(childTask, depth + 1, visited)

    if (PRIORITY[childType] < PRIORITY[maxPriorityType]) {
      maxPriorityType = childType
    }
  })

  return maxPriorityType
}
const getMaxTimestampFromNames = (task) => {
  let maxTimestamp = 0

  task.fromNames?.forEach((name) => {
    const task = getObjectByName(name)

    if (task?.timestamp > maxTimestamp) {
      maxTimestamp = task.timestamp
    }
  })

  return maxTimestamp
}

export default () => {
  data.visibletasks.sort((a, b) => {
    let datetimeA = dayjs(`${a.date}T${a.time}`, "YYYY-MM-DDTHH:mm")
    let datetimeB = dayjs(`${b.date}T${b.time}`, "YYYY-MM-DDTHH:mm")

    const aPriorityType = getMaxPriorityType(a)
    const bPriorityType = getMaxPriorityType(b)

    // Приоритет паузы над всеми
    if (!a.pause && b.pause) return 1
    if (a.pause && !b.pause) return -1

    // Приоритет встречам и рамкам перед окнами
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

      // Приоритет сроку над окном
      if (aPriorityType == "deadline" && bPriorityType == "window") return -1
      if (bPriorityType == "deadline" && aPriorityType == "window") return 1

      // Сортировка по таймстампу предков о_О
      const maxTimestampA = getMaxTimestampFromNames(a)
      const maxTimestampB = getMaxTimestampFromNames(b)

      return maxTimestampA > maxTimestampB ? -1 : 1
    }
    return 0
  })

  if (
    data.visibletasks[0] &&
    (dayjs(data.visibletasks[0].time, "HH:mm").isAfter(dayjs()) || data.visibletasks[0].pause)
  ) {
    // Find the index of the first task that's due or overdue based on the current time
    let index = data.visibletasks.findIndex(
      (task) => dayjs(task.time + " " + task.date, "HH:mm YYYY-MM-DD").isSameOrBefore(dayjs()) && !task.pause,
    )

    if (index != -1) {
      // Move the due or overdue task to the start of the list
      let [task] = data.visibletasks.splice(index, 1)
      data.visibletasks.unshift(task)
    }
  }
}
