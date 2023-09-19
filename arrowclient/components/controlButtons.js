import { html } from "@arrow-js/core"
import css from "../css.js"
import { data } from "/logic/reactive.js"
import saveTask from "/logic/saveTask.js"
import { riseTask } from "/logic/manipulate.js"

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
  data.selected = false
  window.scrollTo(0, 0)
}

let sinkTask = (task) => {
  const index = data.tasks.indexOf(task)

  if (index !== -1) {
    data.tasks.splice(index, 1) // Удаляем объект из массива
    data.tasks.push(task) // Добавляем объект обратно в конец массива
  }
  saveTask("sink")
  data.selected = false
  // Promise.resolve().then(() => {
  //   console.log('sink', filteredTasks)
  //   data.selected = filteredTasks[0]
  //   console.log('sink', filteredTasks)
  // });
}

export default (task) =>
  html` <div class="grid grid-cols-4 gap-3">
    <button class="${css.button}" @click="${() => riseTask(task)}"> Поднять </button>
    ${() => {
      if (task.type == "frame" || task.type == "meeting" || task.type == "deadline")
        return html`<label class="${css.button}" for="pauseCheckbox">
          <input
            class=" w-3.5 h-3.5 shadow-none dark:accent-darkold rounded-lg appearance-none dark:checked:bg-darkold mx-2 border-2 border-old dark:border-darkold checked:bg-old accent-old"
            type="checkbox"
            id="pauseCheckbox"
            ${checkedPause(task)} />
          Ожидание
        </label>`
      else return html` <button class="${css.button}" @click="${() => sinkTask(task)}"> Притопить </button>`
    }}
    <label class="${css.button}" for="readyCheckbox">
      <input
        class=" w-3.5 h-3.5 shadow-none dark:accent-darkold rounded-lg appearance-none dark:checked:bg-darkold mx-2 border-2 border-old dark:border-darkold checked:bg-old accent-old"
        type="checkbox"
        id="readyCheckbox"
        ${checkedReady(task)} />
      Готово
    </label>
    <button class="${css.button}" @click="${saveButton}">Сохранить</button>
  </div>`
