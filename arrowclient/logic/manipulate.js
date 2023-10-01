import { searchstring, currentTime, data } from "/logic/reactive.js"
import { makevisible } from "/logic/makevisible.js"
import saveTask from "/logic/savetask.js"
import { getObjectByName } from "/logic/util"

import sort from "/logic/sort.js"

export function selectTask(identifier) {
  console.log("select", identifier)
  clearSearch()
  let taskToSelect = null

  // Если идентификатор - это строка, ищем задачу по имени
  if (typeof identifier === "string") {
    taskToSelect = getObjectByName(identifier)
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

export let riseTask = (task, visited = new Set(), depth = 0) => {
  if (depth > 7 || visited.has(task.name)) {
    return // Если мы достигли максимальной глубины или уже посетили эту задачу, прерываем рекурсию
  }

  visited.add(task.name) // Отмечаем задачу как посещенную

  const index = data.tasks.indexOf(task)
  if (index !== -1) {
    data.tasks.splice(index, 1) // Удалить объект из текущего местоположения
    data.tasks.unshift(task)
  }

  if (task.fromNames && task.fromNames.length) {
    task.fromNames.forEach((name) => {
      const ancestorTask = getObjectByName(name) // предполагаем, что функция getObjectByName вернет задачу по её имени
      if (ancestorTask) {
        riseTask(ancestorTask, visited, depth + 1) // рекурсивно поднимаем каждую предковую задачу
      }
    })
  }

  // saveTask("rise")
  sort()
  // window.scrollTo(0, 0)
}
