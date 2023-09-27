import { data, selectedDate } from "/logic/reactive.js"
import { isNameTaken, getObjectByName } from "/logic/util"
import { makevisible } from "/logic/exe.js"

import { v4 as uuidv4 } from "uuid"
import dayjs from "dayjs"

export default (name, fromNames = [], toNames = []) => {
  if (isNameTaken(name)) {
    return false
  }
  const findReadyTask = () => {
    return data.tasks.find((task) => {
      if (task.ready) {
        // Проверка, что сама задача "ready"
        const fromNameObjects = task.fromNames?.map((name) => getObjectByName(name)) || []
        const toNameObjects = task.toNames?.map((name) => getObjectByName(name)) || []

        // Проверка, что все задачи в fromNames и toNames также "ready"
        return fromNameObjects.every((obj) => obj?.ready) && toNameObjects.every((obj) => obj?.ready)
      }
      return false
    })
  }
  const existingTask = findReadyTask()
  console.log("existingTask addscribe", existingTask)

  if (existingTask) {
    // Обновление полей существующей задачи
    existingTask.ready = false
    existingTask.name = name
    existingTask.note = ""
    existingTask.time = dayjs().format("HH:mm")
    existingTask.date = selectedDate.date
    existingTask.fromNames = fromNames
    existingTask.toNames = toNames
    existingTask.fromNamesReady = [] // Очистите или обновите, если необходимо
    existingTask.toNamesReady = [] // Очистите или обновите, если необходимо

    const index = data.tasks.indexOf(existingTask)
    if (index > -1) {
      data.tasks.splice(index, 1)
    }

    // Добавление существующей задачи в начало массива
    data.tasks.unshift(existingTask)

    makevisible()
    return existingTask
  }

  let newTask = {
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
  }
  data.tasks.unshift(newTask)

  console.log("newtask", data.tasks[0])

  data.calendarSet[data.selected.date] = data.calendarSet[data.selected.date]
    ? data.calendarSet[data.selected.date] + 1
    : 1

  makevisible()
  return newTask
}
