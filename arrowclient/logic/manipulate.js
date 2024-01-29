import reData from "~/logic/reactive.js"
import { makevisible } from "~/logic/makevisible.js"
import saveTask from "~/logic/savetask.js"
import { getObjectByName, getObjectById } from "~/logic/util"

import dayjs from "dayjs"

export function selectTaskByName(identifier) {
  saveTask("selectTaskByName")
  clearSearch()
  reData.selectedScribe = getObjectByName(identifier).id
  makevisible()
}

export function selectTaskById(identifier) {
  saveTask("selectTaskById")
  clearSearch()
  reData.selectedScribe = identifier
  makevisible()
}

export function selectCollaborator(collaborator) {
  reData.selectedScribe = false
  reData.selectedCollaborator = collaborator
}

export function dateInputPauseButtonHTMLCSS() {
  let pc = document.getElementById("pauseCheckbox")
  if (pc) pc.checked = false
  updateDateClass()
  updateButtons()
}

export function updateDateClass() {
  const dateInput = document.getElementById("dateInput")
  const currentDate = dayjs()
  if (dateInput) {
    const inputDate = dayjs(dateInput.value, "YYYY-MM-DD")

    if (inputDate.isBefore(currentDate, "day")) {
      dateInput.classList.remove(
        "border-compliment",
        "dark:border-compliment-dark",
        "dark:border-black",
        "border-white",
      )
      dateInput.classList.add("border-accent", "dark:border-accent-dark")
    } else if (inputDate.isSame(currentDate, "day")) {
      dateInput.classList.remove(
        "border-accent",
        "dark:border-accent-dark",
        "border-compliment",
        "dark:border-compliment-dark",
      )
      dateInput.classList.add("dark:border-black", "border-white")
    } else {
      dateInput.classList.remove(
        "text-white",
        "border-accent",
        "dark:border-accent-dark",
        "dark:border-black",
        "border-white",
      )
      dateInput.classList.add("border-compliment", "dark:border-compliment-dark")
    }
  }
}

export function showSaveButtonHidePause() {
  const saveButton = document.getElementById("savebutton")
  const pauseCheckbox = document.getElementById("pauseCheckbox")
  const pauseCheckboxLabel = document.getElementById("pauseCheckboxLabel")
  if (saveButton && pauseCheckbox && pauseCheckboxLabel) {
    saveButton.style.display = "block"
    pauseCheckbox.style.display = "none"
    pauseCheckboxLabel.style.display = "none"
  }
}

function hideSaveButtonShowPause() {
  const saveButton = document.getElementById("savebutton")
  const pauseCheckbox = document.getElementById("pauseCheckbox")
  const pauseCheckboxLabel = document.getElementById("pauseCheckboxLabel")

  if (saveButton && pauseCheckbox && pauseCheckboxLabel) {
    saveButton.style.display = "none"
    pauseCheckbox.style.display = "block"
    pauseCheckboxLabel.style.display = "block"
  }
}

export function updateButtons() {
  const readyCheckbox = document.getElementById("readyCheckbox")
  const currentDate = dayjs()
  const dateInputValue = document.getElementById("dateInput")?.value
  const timeInputValue = document.getElementById("timeInput")?.value
  let inputDateTime
  if (dateInputValue && timeInputValue) inputDateTime = dayjs(`${dateInputValue}T${timeInputValue}`)

  const isTaskReady = readyCheckbox?.checked
  const isTaskFuture = inputDateTime?.isAfter(currentDate)

  if (isTaskReady || isTaskFuture) {
    showSaveButtonHidePause()
  } else {
    hideSaveButtonShowPause()
  }
}

export let clearSearch = () => {
  const inputElement = document.getElementById("searchinput")
  inputElement.value = ""
  reData.searchString = ""
}
