import reData from "~/logic/reactive.js"
import dayjs from "dayjs"
import performance from "~/logic/performance.js"

const sortByReadiness = (a, b) => {
  if (!a.ready && b.ready) return -1
  if (a.ready && !b.ready) return 1
  return 0
}

const sortByBlock = (a, b) => {
  if (!a.blocked && b.blocked) return -1
  if (a.blocked && !b.blocked) return 1
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
  return a.readyPercentage - b.readyPercentage
}

const sortByWeight = (a, b) => {
  return a.weight - b.weight
}

const sortByDescendantsCount = (a, b) => {
  return b.descendantCount - a.descendantCount
}

export default (arrToSort = reData.visibleTasks) => {
  performance.start("Full Sorting Process")

  const now = dayjs()

  arrToSort.sort((a, b) => {
    let result = 0

    result = sortByReadiness(a, b)
    if (result !== 0) return result

    result = sortByBlock(a, b)
    if (result !== 0) return result

    result = sortByPause(a, b)
    if (result !== 0) return result

    result = sortByFuture(a, b, now)
    if (result !== 0) return result

    result = sortByWeight(a, b)
    if (result !== 0) return result

    result = sortByReadyPercentage(a, b)
    if (result !== 0) return result

    result = sortByDescendantsCount(a, b)
    if (result !== 0) return result

    return b.timestamp - a.timestamp
  })

  performance.end("Full Sorting Process")
}
