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

let checkedReady = (task) => {
  return ""
  if (task.ready) return "checked"
  else return ""
}

let saveButton = () => {
  saveTask("sv")
  riseTask(selected.id)
  selected.id = false
  makevisible()
  // reData.visibletasks = []
  selected.id = reData.visibletasks[0].id
  // window.scrollTo(0, 0)
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
  html` <div class="grid grid-cols-4 gap-3">
    <button class="${css.button}" @click="${() => (selected.id = false)}"> Закрыть </button>
    ${() => {
      if (task.type == "frame" || task.type == "meeting" || task.type == "deadline")
        return html`<label class="${css.button} whitespace-nowrap" for="pauseCheckbox">
          <input
            class=" w-3.5 h-3.5 shadow-none dark:accent-accent-dark rounded-lg appearance-none dark:checked:bg-accent-dark mx-2 border-2 border-accent dark:border-accent-dark checked:bg-accent accent-accent"
            type="checkbox"
            id="pauseCheckbox"
            ${checkedPause(task)} />
          Ожидание
        </label>`
      else return html` <button class="${css.button}" @click="${() => sinkTask(task)}">Потом</button>`
    }}
    <label class="${css.button} whitespace-nowrap" for="readyCheckbox">
      <input
        class="w-3.5 h-3.5 shadow-none rounded-lg appearance-none dark:checked:bg-accent-dark mx-2 border-2 border-accent dark:border-accent-dark checked:bg-accent accent-accent"
        type="checkbox"
        id="readyCheckbox" />
      Готово
    </label>
    <button id="savebutton" class="${css.button}" @click="${saveButton}">Сохранить</button>
  </div>`
