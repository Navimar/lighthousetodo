import { html } from "@arrow-js/core"
import css from "~/css.js"
import reData from "~/logic/reactive.js"
import saveTask from "~/logic/savetask.js"
import data from "~/logic/data.js"
import { updateButtons } from "~/logic/manipulate.js"
import { makevisible } from "~/logic/makevisible.js"
import { getObjectById, copyToClipboard } from "~/logic/util.js"

let checkedPause = (task) => {
  if (task.pause) return "checked"
  else return ""
}
let checkedPublic = (task) => {
  if (task.public) return "checked"
  else return ""
}
let saveButton = () => {
  saveTask("sv")
  riseTask(reData.selectedScribe)
  reData.selectedScribe = false
  makevisible()
  reData.selectedScribe = reData.visibleTasks[0].id
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
const publicTask = (event, task) => {
  if (!event.target.checked) {
    return
  }
  const link = `${window.location.origin}/${task.id}` // Создаем ссылку с использованием window.location.origin
  copyToClipboard(link) // Копируем ссылку в буфер обмена
}
{
  /* <input
        class="appearance-none peer sr-only"
        type="checkbox"
        id="publicCheckbox"
        ${checkedPublic(task)}
        @change="${(e) => publicTask(e, task)}" />
      <label class="${css.button} whitespace-nowrap" for="publicCheckbox">Общая</label> */
}
export default (task) =>
  html`<div class="grid grid-cols-4 gap-3">
    <button class="${css.button}" @click="${() => (reData.selectedScribe = false)}">Закрыть</button>
    <button class="${css.button}"></button>

    <div>
      <input class="appearance-none peer sr-only" type="checkbox" id="readyCheckbox" @change="${updateButtons}" />
      <label class="${css.button} whitespace-nowrap" for="readyCheckbox">Готово</label>
    </div>
    <button style="display:none" id="savebutton" class="${css.button}" @click="${saveButton}">Сохранить</button>
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
    <label id="pauseCheckboxLabel" class="${css.button} whitespace-nowrap" for="pauseCheckbox">Потом</label>
  </div>`
