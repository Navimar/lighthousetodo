import { data } from "/logic/reactive.js"
import dayjs from "dayjs"
import { getObjectByName } from "../logic/util"

const PRIORITY = {
  meeting: 1,
  frame: 2,
  deadline: 3,
  window: 4,
}

const getMaxPriorityType = (task, depth = 0, visited = new Set()) => {
  if (depth >= 7 || visited.has(task.name)) return task.type

  visited.add(task.name)

  let maxPriorityType = task.type

  task.toNames?.forEach((name) => {
    const childTask = getObjectByName(name)
    if (childTask.ready) return // Пропускаем задачи с ready === true

    const childType = getMaxPriorityType(childTask, depth + 1, visited)

    if (PRIORITY[childType] < PRIORITY[maxPriorityType]) {
      maxPriorityType = childType
    }
  })

  return maxPriorityType
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

    // Приоритет сроку над окном
    if (aPriorityType == "deadline" && bPriorityType == "window") return -1
    if (bPriorityType == "deadline" && aPriorityType == "window") return 1

    // Если обе встречи или рамки, сравниваем datetime
    if (
      (aPriorityType == "meeting" || aPriorityType == "frame") &&
      (bPriorityType == "meeting" || bPriorityType == "frame")
    ) {
      if (!datetimeA.isSame(datetimeB)) return datetimeA.isAfter(datetimeB) ? 1 : -1
    }

    // Если обе задачи окна
    if (aPriorityType == "window" && bPriorityType == "window") {
      let now = dayjs()

      let aIsFuture = datetimeA.isAfter(now)
      let bIsFuture = datetimeB.isAfter(now)

      // Если одна задача в будущем, а другая в прошлом, возвращаем будущую первой
      if (aIsFuture && !bIsFuture) return 1
      if (!aIsFuture && bIsFuture) return -1

      // Если обе задачи в будущем, сравниваем их по времени
      if (aIsFuture && bIsFuture) return datetimeA.isAfter(datetimeB) ? 1 : -1
    }

    return 0
  })
}
