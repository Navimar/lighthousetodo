import { html } from "@arrow-js/core"
import css from "~/css.js"
import reData from "~/logic/reactive.js"
import saveTask from "~/logic/savetask.js"
import data from "~/logic/data.js"
import { updatePauseReadyButton, updateKairosButton } from "~/logic/manipulate.js"
import { makevisible } from "~/logic/makevisible.js"
import { getObjectById, copyToClipboard } from "~/logic/util.js"
import audio from "~/logic/audio.js"
import { showSaveButtonHidePause } from "~/logic/manipulate.js"

let checkedPause = (task) => {
  if (task.pause) return "checked"
  else return ""
}

let checkedKairos = (task) => {
  if (task.urgency == "kairos" || task.importance == "kairos" || task.difficulty == "kairos") return "checked"
  else return ""
}

let saveButton = () => {
  // console.log("audio", audio)
  audio.playSound(audio.readySave)
  saveTask("sv")
  riseTask(reData.selectedScribe)
  reData.selectedScribe = false
  makevisible()
  reData.selectedScribe = reData.visibleTasks[0]?.id
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
    <div>
      <input
        class="appearance-none peer sr-only"
        type="checkbox"
        id="kairosCheckbox"
        @change="${(event) => {
          updateKairosButton(event, task)
          showSaveButtonHidePause()
        }}"
        ${checkedKairos(task)} />
      <label class="${css.button} whitespace-nowrap" for="kairosCheckbox">Кайрос</label>
    </div>

    <div>
      <input
        class="appearance-none peer sr-only"
        type="checkbox"
        id="readyCheckbox"
        @change="${updatePauseReadyButton}" />
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
