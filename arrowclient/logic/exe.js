import { currentTime, selectedDate, data } from "/logic/reactive.js"
import { getObjectByName } from "/logic/util.js"
import sort from "/logic/sort.js"

import dayjs from "dayjs"

let deleteScribe = (name) => {
  data.calendarSet[data.selected.date]--
  if (data.calendarSet[data.selected.date] < 0) data.calendarSet[data.selected.date] = 0

  let taskIndex = data.tasks.indexOf(data.selected)
  if (taskIndex > -1) {
    data.tasks.splice(taskIndex, 1)
  }
  data.deleted.push(data.selected)
  console.log("data.deleted:", data.deleted)

  data.tasks.forEach((task) => {
    // Перемещаем из `toNames` в `toNamesReady`
    if (task.toNames?.includes(name)) {
      task.toNames = task.toNames.filter((taskName) => taskName !== name)
      task.toNamesReady = task.toNamesReady || []
      if (!task.toNamesReady.includes(name)) {
        task.toNamesReady.push(name)
      }
    }

    // Перемещаем из `fromNames` в `fromNamesReady`
    if (task.fromNames?.includes(name)) {
      console.log("before", task.fromNames)
      task.fromNames = task.fromNames?.filter((taskName) => taskName !== name)
      task.fromNamesReady = task.fromNamesReady || []
      if (!task.fromNamesReady.includes(name)) {
        task.fromNamesReady.push(name)
      }
    }
  })
  makevisible()
  sort()
  return true
}

export const makevisible = () => {
  console.log("makevisible", data)

  const areAllFromNamesReady = (names) => {
    if (!names || names.length === 0) return true

    for (let name of names) {
      const obj = getObjectByName(name)

      // if (!obj) throw new Error(`In areAllFromNamesReady object not found for name: ${name}`)
      if (!obj) {
        console.log("???", name)
        return false
      }
      if (!obj.ready) return false
    }

    return true
  }

  data.visibletasks = data.tasks.filter((task) => {
    if (task === data.selected) {
      return true
    }

    const isCurrentOrFutureTask =
      selectedDate.date === currentTime.date
        ? dayjs(task.date).isBefore(dayjs(selectedDate.date).add(1, "day")) || task.date == selectedDate || !task.date
        : dayjs(task.date).isSame(dayjs(selectedDate.date)) || !task.date

    return isCurrentOrFutureTask && (areAllFromNamesReady(task.fromNames) || task.type === "meeting") && !task.ready
  })

  // Сортировка visibletasks на основе свойства hidden
  data.visibletasks.sort((a, b) => b.hidden - a.hidden)

  // Обновление свойства hidden для всех задач
  const visibleTaskSet = new Set(data.visibletasks)
  data.tasks.forEach((task) => (task.hidden = !visibleTaskSet.has(task)))

  console.log("makevisible  data.visibletasks", data.visibletasks)
}
