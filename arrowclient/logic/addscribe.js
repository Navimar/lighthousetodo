import reData from "~/logic/reactive.js"
import { isNameTaken } from "~/logic/util"
import data from "~/logic/data.js"

import { v4 as uuidv4 } from "uuid"
import dayjs from "dayjs"

export default (name, role = "common") => {
  if (isNameTaken(name)) {
    return false
  }
  let newTask = {
    id: uuidv4(),
    name,
    note: "",
    time: dayjs().format("HH:mm"),
    date: reData.selectedDate,
    urgency: "onDay",
    importance: "important",
    difficulty: "hour",
    intention: false,
    intentionPriority: (reData.intentions[0]?.intentionPriority || 2000000) / 2,
    fromIds: [],
    toIds: [],
    moreImportantIds: [],
    lessImportantIds: [],
    timestamp: dayjs().valueOf(),
    assignedBy: reData.user.id,
    assignedTo: [reData.user.id],
    readyLogs: [{ status: false, timestamp: dayjs().valueOf() }], // добавляем поле readyLogs для хранения логов статуса готовности
  }

  if (role === "intention") {
    newTask.intention = true
  }

  data.tasks.push(newTask)
  return newTask
}
