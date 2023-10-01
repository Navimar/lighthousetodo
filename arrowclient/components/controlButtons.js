import { html } from "@arrow-js/core"
import css from "~/css.js"
import { data } from "~/logic/reactive.js"
import saveTask from "~/logic/savetask.js"
import { riseTask } from "~/logic/manipulate.js"
import { makevisible } from "~/logic/makevisible.js"
import sort from "~/logic/sort.js"

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

  makevisible()

  sort()
  // data.visibletasks = []
  data.selected = data.visibletasks[0]
  // window.scrollTo(0, 0)
}

let sinkTask = (task) => {
  const index = data.tasks.indexOf(task)

  if (index !== -1) {
    data.tasks.splice(index, 1) // Удаляем объект из массива
    data.tasks.push(task) // Добавляем объект обратно в конец массива
  }
  saveTask("sink")
  data.selected = false
  makevisible()
  sort()
  data.selected = data.visibletasks[0]
}

export default (task) =>
  html` <div class="grid grid-cols-4 gap-3">
    <button
      class="${css.button}"
      @click="${
        () => (data.selected = false)
        // () => riseTask(task))
      }">
      Закрыть
    </button>
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
