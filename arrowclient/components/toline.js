import { html } from "@arrow-js/core"
import { selectTask } from "/logic/manipulate.js"
import { clickPos } from "/logic/util.js"
import { getObjectByName } from "../logic/util"

export default (task) => {
  const readyNames = []
  const notReadyNames = []

  task.toNames?.forEach((name) => {
    const obj = getObjectByName(name)
    if (!obj) console.log("неизвестный obj в тегах", name)
    if (obj.ready) {
      readyNames.push(name)
    } else {
      notReadyNames.push(name)
    }
  })

  return html`<div class="text-sm empty:hidden"
    >${notReadyNames.map((to) => {
      return html`<div
        @click="${(e) => {
          selectTask(to) // Добавляем selectTask обратно
          clickPos(e)
          e.stopPropagation()
        }}"
        class="text-white dark:text-lightgray m-0.5 inline-block rounded-lg px-2 bg-mygray dark:bg-nearblack">
        ${to}
      </div>`
    })}${readyNames.map((to) => {
      return html`<div
        @click="${(e) => {
          selectTask(to)
          clickPos(e)
          e.stopPropagation()
        }}"
        class="text-darkgray dark:text-mygray m-0.5 inline-block rounded-lg px-2">
        ${to}
      </div>`
    })}</div
  >`
}
