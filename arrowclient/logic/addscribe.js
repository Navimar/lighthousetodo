import reData from "~/logic/reactive.js"
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
    date: reData.selectedDate,
    urgency: "kairos",
    importance: "kairos",
    difficulty: "kairos",
    fromIds: fromIds,
    toIds: toIds,
    timestamp: dayjs().valueOf(),
    assignedBy: reData.user.id,
    assignedTo: [reData.user.id],
    readyLogs: [{ status: false, timestamp: dayjs().valueOf() }], // добавляем поле readyLogs для хранения логов статуса готовности
  }

  data.tasks.push(newTask)
  return newTask
}
