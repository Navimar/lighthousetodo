import { html } from "~/arrow-js/index.js"
import reData from "~/logic/reactive.js"
import saveTask from "~/logic/savetask.js"
import { updatePauseReadyButton } from "~/logic/manipulate.js"
import { makevisible } from "~/logic/makevisible.js"
import performance from "~/logic/performance.js"
import audio from "~/logic/audio.js"

let checkedPause = (task) => {
  if (task.pause) return "checked"
  else return ""
}

let saveButton = () => {
  performance.start("saveButton")
  try {
    saveTask("sv")
    reData.selectedScribe = false
    reData.currentPage = 1
    makevisible()
    reData.selectedScribe = reData.visibleTasks[0]?.id
  } finally {
    performance.end("saveButton")
  }
}

function handleReadyCheckboxChange(event) {
  const isChecked = event.target.checked

  // Воспроизводим соответствующий звук
  if (isChecked) {
    audio.playSound("ready") // Звук для состояния "включено"
  } else {
    audio.playSound("unready") // Звук для состояния "выключено"
  }

  // Вызываем основную функцию
  updatePauseReadyButton(event)
}

export default (task) =>
  html`<div class="grid grid-cols-3 gap-3">
    <button class="button-gray" @click="${() => (reData.selectedScribe = false)}">Закрыть</button>

    <div>
      <input
        class="appearance-none peer sr-only"
        type="checkbox"
        id="readyCheckbox"
        @change="${handleReadyCheckboxChange}" />
      <label class="button-gray whitespace-nowrap" for="readyCheckbox">Готово</label>
    </div>
    <button
      style="display:none"
      id="savebutton"
      class="button-gray"
      @click="${() => {
        saveButton()
      }}"
      >Сохранить</button
    >
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
    <label id="pauseCheckboxLabel" class="button-gray whitespace-nowrap" for="pauseCheckbox">Потом</label>
  </div>`
//  <div>
//     <input
//       class="sr-only peer"
//       type="checkbox"
//       id="postponeCheckbox"
//       @change="${(e) => {
//     saveButton()
//   }}"
//       ${task.postpone ? "checked" : ""} />
//     <label class="button-gray whitespace-nowrap" for="postponeCheckbox">Отложить</label>
//   </div>
