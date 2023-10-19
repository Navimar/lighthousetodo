import { selectedDate } from "~/logic/reactive.js"
import { isNameTaken } from "~/logic/util"
import data from "~/logic/data.js"

import { v4 as uuidv4 } from "uuid"
import dayjs from "dayjs"

export default (name, fromIds = [], toIds = []) => {
  if (isNameTaken(name)) {
    return false
  }

  let newTask = {
    id: uuidv4(),
    name,
    note: "",
    time: dayjs().format("HH:mm"),
    date: selectedDate.date,
    type: "window",
    fromIds: fromIds,
    toIds: toIds,
    timestamp: dayjs().valueOf(),
  }

  data.tasks.push(newTask)
  return newTask
}
