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
      dateInput.classList.remove("bg-compliment-lighter", "dark:bg-compliment-darker", "dark:bg-black", "bg-white")
      dateInput.classList.add("bg-accent-lighter", "dark:bg-accent-darker")
    } else if (inputDate.isSame(currentDate, "day")) {
      dateInput.classList.remove(
        "bg-accent-lighter",
        "dark:bg-accent-darker",
        "bg-compliment-lighter",
        "dark:bg-compliment-darker",
      )
      dateInput.classList.add("dark:bg-black", "bg-white")
    } else {
      dateInput.classList.remove("bg-accent-lighter", "dark:bg-accent-darker", "dark:bg-black", "bg-white")
      dateInput.classList.add("bg-compliment-lighter", "dark:bg-compliment-darker")
    }
  }
}

export let clearSearch = () => {
  const inputElement = document.getElementById("searchinput")
  inputElement.value = ""
  searchstring.text = ""
}
