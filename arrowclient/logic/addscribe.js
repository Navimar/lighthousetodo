import { data, selectedDate } from "/logic/reactive.js"
import { isNameTaken, getObjectByName } from "/logic/util"
import { makevisible } from "/logic/makevisible.js"

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
        const fromNameObjects =
          task.fromNames?.map((name) => {
            const obj = getObjectByName(name)
            if (!obj) {
              console.error(`Error in task '${task.name}': Could not find object by name '${name}' for 'fromNames'.`)
            }
            return obj
          }) || []

        const toNameObjects =
          task.toNames?.map((name) => {
            const obj = getObjectByName(name)
            if (!obj) {
              console.error(`Error in task '${task.name}': Could not find object by name '${name}' for 'toNames'.`)
            }
            return obj
          }) || []

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
    existingTask.type = "window"
    existingTask.name = name
    existingTask.note = ""
    existingTask.time = dayjs().format("HH:mm")
    existingTask.date = selectedDate.date
    existingTask.fromNames = fromNames
    existingTask.toNames = toNames
    existingTask.timestamp = dayjs().valueOf()

    const index = data.tasks.indexOf(existingTask)
    if (index > -1) {
      data.tasks.splice(index, 1)
    }

    // Добавление существующей задачи в начало массива
    data.tasks.unshift(existingTask)
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
    timestamp: dayjs().valueOf(),
  }
  data.tasks.unshift(newTask)

  console.log("newtask", data.tasks[0])
  return newTask
}
