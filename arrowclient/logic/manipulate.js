import { searchstring, selected } from "/logic/reactive.js"
import { makevisible } from "/logic/makevisible.js"
import saveTask from "/logic/savetask.js"
import { getObjectByName, getObjectById } from "/logic/util"

export function selectTaskByName(identifier) {
  saveTask("cot")
  selected.id = getObjectByName(identifier).id
  makevisible()
}

export function selectTaskById(identifier) {
  saveTask("cot")
  selected.id = identifier
  makevisible()
}

export let clearSearch = () => {
  const inputElement = document.getElementById("searchinput")
  inputElement.value = ""
  searchstring.text = ""
}
