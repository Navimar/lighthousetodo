import reData from "~/logic/reactive.js"
import { isNameTaken } from "~/logic/util.js"

import { clearSearch } from "~/logic/manipulate"
import data from "~/logic/data.js"
import { sendTask } from "~/logic/send.js"
import { getObjectByName, getObjectById } from "~/logic/util"
import { getCollaboratorByName } from "~/logic/collaborator.js"
import performance from "~/logic/performance.js"
import audio from "~/logic/audio.js"

import dayjs from "dayjs"

export default () => {
  performance.start("savetask")
  try {
    if (!reData.selectedScribe) return false

    const eDiv = document.getElementById("edit")
    if (!eDiv) return false

    let thisTask = getObjectById(reData.selectedScribe)
    const lines = eDiv.innerText.trim().split("\n")
    let name = lines[0].trim()
    const note = lines.slice(1).join("\n")

    let assignedTo = [reData.user.id]

    // const reTask = reData.visibleTasks.find((t) => t.id === reData.selectedScribe)

    const timeInput = document.getElementById("timeInput").value
    const dateInput = document.getElementById("dateInput").value

    let urgencyRadios = document.getElementsByName("urgency")
    let priorityRadioType = "kairos"
    for (let i = 0; i < urgencyRadios.length; i++) {
      if (urgencyRadios[i].checked) {
        priorityRadioType = urgencyRadios[i].value
        break
      }
    }
    let importanceRadios = document.getElementsByName("importance")
    let importancePriorityRadio = "kairos"
    for (let i = 0; i < importanceRadios.length; i++) {
      if (importanceRadios[i].checked) {
        importancePriorityRadio = importanceRadios[i].value
        break
      }
    }

    let somethingChanged = false

    if (name === "") {
      name = thisTask.name
    }
    if (name != thisTask.name)
      while (isNameTaken(name) && name.length < 1000) {
        name += "!"
      }

    if (name !== thisTask.name) {
      thisTask.name = name
      somethingChanged = true
    }

    if (note !== thisTask.note) {
      thisTask.note = note
      somethingChanged = true
    }

    const newAssignedTo = [...new Set(thisTask.assignedTo.concat(assignedTo))]
    if (JSON.stringify(newAssignedTo) !== JSON.stringify(thisTask.assignedTo)) {
      thisTask.assignedTo = newAssignedTo
      somethingChanged = true
    }

    if (timeInput !== thisTask.time) {
      thisTask.time = timeInput
      somethingChanged = true
    }

    if (dateInput !== thisTask.date) {
      thisTask.date = dateInput
      somethingChanged = true
    }

    let pauseCheckbox = document.getElementById("pauseCheckbox")
    if (pauseCheckbox && pauseCheckbox.checked) {
      audio.playSound("afterward")
      const now = dayjs().valueOf()
      if (thisTask.pause !== now) {
        thisTask.pause = now
        somethingChanged = true
      }
      const newPauseTimes = (thisTask.pauseTimes || 0) + 1
      if (thisTask.pauseTimes !== newPauseTimes) {
        thisTask.pauseTimes = newPauseTimes
        somethingChanged = true
      }
    } else {
      if (thisTask.pause !== false) {
        thisTask.pause = false
        somethingChanged = true
      }
      if (thisTask.pauseTimes !== 0) {
        thisTask.pauseTimes = 0
        somethingChanged = true
      }
    }

    let publicCheckbox = document.getElementById("publicCheckbox")
    if (publicCheckbox && publicCheckbox.checked) {
      if (thisTask.public !== true) {
        thisTask.public = true
        somethingChanged = true
      }
    } else {
      if (thisTask.public !== false) {
        thisTask.public = false
        somethingChanged = true
      }
    }

    let readyCheckbox = document.getElementById("readyCheckbox")
    if (readyCheckbox && readyCheckbox.checked) {
      audio.playSound("readySave")
      if (thisTask.ready !== true) {
        thisTask.ready = true
        somethingChanged = true
      }
    } else {
      if (thisTask.ready !== false) {
        thisTask.ready = false
        somethingChanged = true
      }
    }

    if (somethingChanged) {
      thisTask.timestamp = dayjs().valueOf()
      // safeSetLocalStorageItem("tasks", data.tasks)
      sendTask(thisTask)
    }

    clearSearch()

    if (!thisTask.ready && !thisTask.pause) audio.playSound("save")

    return true
  } finally {
    performance.end("savetask")
  }
}
