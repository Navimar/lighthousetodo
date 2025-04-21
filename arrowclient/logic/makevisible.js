import reData from "~/logic/reactive.js"
import data from "~/logic/data.js"
import performance from "~/logic/performance.js"
import sort from "~/logic/sort.js"
import dayjs from "dayjs"
import isSameOrAfter from "dayjs/plugin/isSameOrAfter"

dayjs.extend(isSameOrAfter)

export const makevisible = () => {
  performance.start("makevisible")
  try {
    performance.start("mainLoop")

    let visibleTasks = []
    const selectedDateObj = dayjs(reData.selectedDate)

    for (let task of data.tasks) {
      if (task.id === reData.selectedScribe) {
        visibleTasks.push(task)
        continue
      }

      const isCurrentOrFutureTask =
        reData.selectedDate === reData.currentTime.date
          ? dayjs(task.date).isBefore(selectedDateObj.add(1, "day")) || task.date == reData.selectedDate || !task.date
          : dayjs(task.date).isSame(selectedDateObj) || !task.date
      if (
        !task.ready &&
        isCurrentOrFutureTask
        // && task.blocked !== true
      ) {
        visibleTasks.push(task)
      }
    }

    performance.end("mainLoop")

    // Sort tasks
    sort(visibleTasks)

    // Determine the page for the selected task
    const pageSize = 40
    const selectedTaskIndex = visibleTasks.findIndex((task) => task.id === reData.selectedScribe)
    if (selectedTaskIndex !== -1) {
      reData.currentPage = Math.floor(selectedTaskIndex / pageSize) + 1
    }

    // Implement pagination
    reData.currentPage = Number.isInteger(reData.currentPage) && reData.currentPage > 0 ? reData.currentPage : 1
    const totalTasks = visibleTasks.length
    const startIndex = (reData.currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedTasks = visibleTasks.slice(startIndex, endIndex)

    // Update visible tasks with the paginated list
    reData.visibleTasks = paginatedTasks

    // Update total pages in reData
    reData.totalPages = Math.ceil(totalTasks / pageSize)
  } finally {
    performance.end("makevisible")
  }
}
