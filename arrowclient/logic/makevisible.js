import { currentTime, selectedDate, data } from "/logic/reactive.js"
import { getObjectByName } from "/logic/util.js"
import { PRIORITY } from "/logic/const"
import dayjs from "dayjs"
import isSameOrAfter from "dayjs/plugin/isSameOrAfter"

dayjs.extend(isSameOrAfter)

// let deleteScribe = (name) => {
//   data.calendarSet[data.selected.date]--
//   if (data.calendarSet[data.selected.date] < 0) data.calendarSet[data.selected.date] = 0

//   let taskIndex = data.tasks.indexOf(data.selected)
//   if (taskIndex > -1) {
//     data.tasks.splice(taskIndex, 1)
//   }
//   data.deleted.push(data.selected)
//   console.log("data.deleted:", data.deleted)

//   data.tasks.forEach((task) => {
//     // Перемещаем из `toNames` в `toNamesReady`
//     if (task.toNames?.includes(name)) {
//       task.toNames = task.toNames.filter((taskName) => taskName !== name)
//       task.toNamesReady = task.toNamesReady || []
//       if (!task.toNamesReady.includes(name)) {
//         task.toNamesReady.push(name)
//       }
//     }

//     // Перемещаем из `fromNames` в `fromNamesReady`
//     if (task.fromNames?.includes(name)) {
//       console.log("before", task.fromNames)
//       task.fromNames = task.fromNames?.filter((taskName) => taskName !== name)
//       task.fromNamesReady = task.fromNamesReady || []
//       if (!task.fromNamesReady.includes(name)) {
//         task.fromNamesReady.push(name)
//       }
//     }
//   })
//   makevisible()
//   sort()
//   return true
// }

// export const makevisible = () => {
//   const areAllFromNamesReady = (names) => {
//     if (!names || names.length === 0) return true

//     for (let name of names) {
//       const obj = getObjectByName(name)

//       if (!obj?.ready) return false
//     }

//     return true
//   }

//   data.visibletasks = data.tasks.filter((task) => {
//     if (task === data.selected) {
//       return true
//     }

//     const isCurrentOrFutureTask =
//       selectedDate.date === currentTime.date
//         ? dayjs(task.date).isBefore(dayjs(selectedDate.date).add(1, "day")) || task.date == selectedDate || !task.date
//         : dayjs(task.date).isSame(dayjs(selectedDate.date)) || !task.date

//     return isCurrentOrFutureTask && (areAllFromNamesReady(task.fromNames) || task.type === "meeting") && !task.ready
//   })
//   console.log("data.visibletasks in make visibel", data.visibletasks[0])
// }

export const makevisible = () => {
  const areAllFromNamesReady = (task) => {
    if (!task?.fromNames || task.fromNames.length === 0) return true

    for (let name of task.fromNames) {
      const theTask = getObjectByName(name)

      if (!theTask) console.log("in makevisible не найден таск", name, task.name)
      if (!theTask?.ready) return false
    }

    return true
  }

  const highestPriorityPerDate = {}
  const today = dayjs() // текущая дата

  data.visibletasks = []

  for (let task of data.tasks) {
    // Если задача является выбранной, добавляем её в видимые задачи
    if (task === data.selected) {
      data.visibletasks.push(task)
      continue // переходим к следующей итерации цикла
    }

    const isCurrentOrFutureTask =
      selectedDate.date === currentTime.date
        ? dayjs(task.date).isBefore(dayjs(selectedDate.date).add(1, "day")) || task.date == selectedDate || !task.date
        : dayjs(task.date).isSame(dayjs(selectedDate.date)) || !task.date

    if (!task.ready && isCurrentOrFutureTask && (areAllFromNamesReady(task) || task.type === "meeting")) {
      data.visibletasks.push(task)
    }

    // Обновляем highestPriorityPerDate только для текущих и будущих дат
    if (task.date && !task.ready && dayjs(task.date).isSameOrAfter(today)) {
      if (!highestPriorityPerDate[task.date] || PRIORITY[task.type] < PRIORITY[highestPriorityPerDate[task.date]]) {
        highestPriorityPerDate[task.date] = task.type
      }
    }
  }

  Object.assign(data.calendarSet, highestPriorityPerDate)
}
