import { data, selectedDate } from "/logic/reactive.js"
import { isNameTaken } from "/logic/util"
import { makevisible } from "/logic/exe.js"

import { v4 as uuidv4 } from "uuid"
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

  if (isNameTaken(name)) {
    return false
  }

  data.tasks.unshift({
    id: uuidv4(),
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

  console.log("newtask", data.tasks[0])

  data.calendarSet[data.selected.date] = data.calendarSet[data.selected.date]
    ? data.calendarSet[data.selected.date] + 1
    : 1

  makevisible()
  return name
}
