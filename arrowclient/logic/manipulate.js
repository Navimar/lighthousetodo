import { searchstring, selected } from "~/logic/reactive.js"
import { makevisible } from "~/logic/makevisible.js"
import saveTask from "~/logic/savetask.js"
import { getObjectByName, getObjectById } from "~/logic/util"

import dayjs from "dayjs"

export function selectTaskByName(identifier) {
  saveTask("selectTaskByName")
  clearSearch()
  selected.id = getObjectByName(identifier).id
  makevisible()
}

export function selectTaskById(identifier) {
  saveTask("selectTaskById")
  clearSearch()
  selected.id = identifier
  makevisible()
}

export function dateInputPauseButtonHTMLCSS() {
  let pc = document.getElementById("pauseCheckbox")
  if (pc) pc.checked = false
  updateDateClass()
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

export let clearSearch = () => {
  const inputElement = document.getElementById("searchinput")
  inputElement.value = ""
  searchstring.text = ""
}
