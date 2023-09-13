import { currentTime, selectedDate, data } from "/logic/reactive.js"
import { isNameTaken } from "/logic/util.js"
import sort from "/logic/sort.js"

import dayjs from "dayjs"

export let addScribe = (name, fromNames = [], toNames = []) => {
  // Дополнение fromNames именем из data.tasks, если toNamesReady равен name
  data.tasks.forEach((task) => {
    if (task.toNamesReady?.includes(name)) {
      fromNames.push(task.name)
    }
    if (task.fromNamesReady?.includes(name)) {
      toNames.push(task.name)
    }
  })

  // Удаление дубликатов (если они возникли)
  fromNames = [...new Set(fromNames)]
  toNames = [...new Set(toNames)]

  if (isNameTaken(name)) return false

  data.tasks.unshift({
    name,
    note: "",
    time: dayjs().format("HH:mm"),
    date: selectedDate.date,
    type: "window",
    fromNames: fromNames,
    toNames: toNames,
    fromNamesReady: [],
    toNamesReady: [],
  })

  data.calendarSet[data.selected.date] = data.calendarSet[data.selected.date]
    ? data.calendarSet[data.selected.date] + 1
    : 1

  makevisible()
  return name
}

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
  data.visibletasks = data.tasks.filter((task) => {
    if (task === data.selected) {
      return true
    }

    const isCurrentOrFutureTask =
      selectedDate.date === currentTime.date
        ? dayjs(task.date).isBefore(dayjs(selectedDate.date).add(1, "day")) || task.date == selectedDate || !task.date
        : dayjs(task.date).isSame(dayjs(selectedDate.date)) || !task.date
    return isCurrentOrFutureTask && (!task.fromNames?.length || task.type === "meeting")
  })

  // Сортировка visibletasks на основе свойства hidden
  data.visibletasks.sort((a, b) => b.hidden - a.hidden)

  // Обновление свойства hidden для всех задач
  const visibleTaskSet = new Set(data.visibletasks)
  data.tasks.forEach((task) => (task.hidden = !visibleTaskSet.has(task)))

  console.log("makevisible  data.visibletasks", data.visibletasks)
}
