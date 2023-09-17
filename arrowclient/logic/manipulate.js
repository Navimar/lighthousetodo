import { searchstring, currentTime, data } from "/logic/reactive.js"
import { makevisible } from "/logic/exe.js"
import saveTask from "/logic/savetask.js"

import sort from "/logic/sort.js"

export function selectTask(identifier) {
  clearSearch()
  let taskToSelect = null

  // Если идентификатор - это строка, ищем задачу по имени
  if (typeof identifier === "string") {
    taskToSelect = data.tasks.find((task) => task.name === identifier)
  } else {
    taskToSelect = identifier
  }

  // Если задача найдена и она отличается от текущей выбранной
  if (taskToSelect && data.selected !== taskToSelect) {
    saveTask("cot")
    data.selected = taskToSelect
  }
  makevisible()
  sort()
}

export let clearSearch = () => {
  const inputElement = document.getElementById("searchinput")
  inputElement.value = ""
  searchstring.text = ""
}
