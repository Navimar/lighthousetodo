import reData from "~/logic/reactive.js"
import { makevisible } from "~/logic/makevisible.js"
import saveTask from "~/logic/savetask.js"

import dayjs from "dayjs"

export function selectTaskById(identifier) {
  saveTask()
  clearSearch()
  reData.selectedScribe = identifier
  makevisible()
}

export function selectCollaborator(collaborator) {
  reData.selectedScribe = false
  reData.selectedCollaborator = collaborator
}

export function dateInputPauseButtonHTMLCSS(task) {
  let pc = document.getElementById("pauseCheckbox")
  if (pc) pc.checked = false
  updateDateClass()
  updatePauseReadyButton(task)
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

export function hideSaveButtonShowPause() {
  const saveButton = document.getElementById("savebutton")
  const pauseCheckbox = document.getElementById("pauseCheckbox")
  const pauseCheckboxLabel = document.getElementById("pauseCheckboxLabel")

  if (saveButton && pauseCheckbox && pauseCheckboxLabel) {
    saveButton.style.display = "none"
    pauseCheckbox.style.display = "block"
    pauseCheckboxLabel.style.display = "block"
  }
}

export function updatePauseReadyButton(task) {
  const readyCheckbox = document.getElementById("readyCheckbox")
  const currentDate = dayjs()
  const dateInputValue = document.getElementById("dateInput")?.value
  const timeInputValue = document.getElementById("timeInput")?.value
  let inputDateTime
  if (dateInputValue && timeInputValue) inputDateTime = dayjs(`${dateInputValue}T${timeInputValue}`)

  const isTaskReady = readyCheckbox?.checked
  const isTaskFuture = inputDateTime?.isAfter(currentDate)

  if (isTaskReady || isTaskFuture || task.blocked || task.depth > 0) {
    showSaveButtonHidePause()
  } else {
    hideSaveButtonShowPause()
  }
}

export function updateKairosButton(event, task) {
  if (event.target.checked) {
    document.querySelectorAll('input[type="radio"][name="urgency"]').forEach((radio) => {
      radio.checked = false
    })

    // Снятие выбора с радиокнопок группы importance
    document.querySelectorAll('input[type="radio"][name="importance"]').forEach((radio) => {
      radio.checked = false
    })
    // Снятие выбора с радиокнопок группы enthusiasm
    document.querySelectorAll('input[type="radio"][name="difficulty"]').forEach((radio) => {
      radio.checked = false
    })
    // Ваш код для обработки выделения
  } else {
    // Восстанавливаем состояние радиокнопок группы timePeriod
    if (task.urgency) {
      const radio = document.querySelector(`input[type="radio"][name="urgency"][value="${task.urgency}"]`)
      if (radio) radio.checked = true
    }

    // Восстанавливаем состояние радиокнопок группы importance
    if (task.importance) {
      const radio = document.querySelector(`input[type="radio"][name="importance"][value="${task.importance}"]`)
      if (radio) radio.checked = true
    }

    // Восстанавливаем состояние радиокнопок группы difficulty
    if (task.difficulty) {
      const radio = document.querySelector(`input[type="radio"][name="difficulty"][value="${task.difficulty}"]`)
      if (radio) radio.checked = true
    }
  }
}

export let clearSearch = () => {
  const inputElement = document.getElementById("searchinput")
  inputElement.value = ""
  reData.searchString = ""
}
