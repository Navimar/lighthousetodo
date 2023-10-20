import { html } from "@arrow-js/core"
import css from "~/css.js"
import { reData, selected } from "~/logic/reactive.js"
import saveTask from "~/logic/savetask.js"
import data from "~/logic/data.js"
import { makevisible } from "~/logic/makevisible.js"
import { getObjectById } from "../logic/util"

let checkedPause = (task) => {
  if (task.pause) return "checked"
  else return ""
}

let saveButton = () => {
  saveTask("sv")
  riseTask(selected.id)
  selected.id = false
  makevisible()
  selected.id = reData.visibletasks[0].id
}
let riseTask = (taskId, visited = new Set(), depth = 0) => {
  let task = getObjectById(taskId)
  if (depth > 7 || visited.has(task.id)) {
    return // Если мы достигли максимальной глубины или уже посетили эту задачу, прерываем рекурсию
  }

  visited.add(task.id) // Отмечаем задачу как посещенную

  // const clonedTask = JSON.parse(JSON.stringify(task)) // Создаем глубокую копию объекта

  const index = data.tasks.findIndex((t) => t.id === task.id)
  if (index !== -1) {
    data.tasks.splice(index, 1) // Удалить объект из текущего местоположения
    data.tasks.unshift(task) // Добавить копию объекта в начало массива
  }

  if (task.fromIds && task.fromIds.length) {
    task.fromIds.forEach((id) => {
      const ancestorTask = getObjectById(id) // Получаем задачу по её ID
      if (ancestorTask) {
        riseTask(ancestorTask.id, visited, depth + 1) // рекурсивно поднимаем каждую предковую задачу
      }
    })
  }
}
let sinkTask = (task) => {
  const index = data.tasks.findIndex((t) => t.id === task.id)
  if (index !== -1) {
    // Создаем глубокую копию объекта
    const clonedTask = JSON.parse(JSON.stringify(task))

    // Добавляем копию в конец массива
    data.tasks.push(clonedTask)

    // Удаляем оригинальный объект из его первоначальной позиции
    data.tasks.splice(index, 1)
  }

  saveTask("sink")
  selected.id = false
  makevisible()
  selected.id = reData.visibletasks[0].id
}

export default (task) =>
  html`<div class="grid grid-cols-4 gap-3">
    <button class="${css.button}" @click="${() => (selected.id = false)}">Закрыть</button>
    <div>
      <input
        class="sr-only peer"
        type="checkbox"
        id="pauseCheckbox"
        ${checkedPause(task)}
        @change="${(e) => {
          if (e.target.checked) {
            saveButton()
          }
        }}" />
      <label class="${css.radio} whitespace-nowrap" for="pauseCheckbox">Потом</label>
    </div>
    <div>
      <input class="appearance-none peer sr-only" type="checkbox" id="readyCheckbox" />
      <label class="${css.radio} whitespace-nowrap" for="readyCheckbox">Готово</label>
    </div>
    <button id="savebutton" class="${css.button}" @click="${saveButton}">Сохранить</button>
  </div>`
