import { data, selectedDate } from "/logic/reactive.js"
import { isNameTaken } from "/logic/util"
import { makevisible } from "/logic/exe.js"

import dayjs from "dayjs"

export default (name, fromNames = [], toNames = []) => {
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
