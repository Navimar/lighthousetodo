import { html } from "@arrow-js/core"
import { selectTask } from "/logic/manipulate.js"
import { clickPos } from "/logic/util.js"
import { addScribe } from "/logic/exe"

export default (task) => {
  return html`<div class=" text-sm  empty:hidden"
    >${task.toNamesReady?.map((to) => {
      return html`<div
        @click="${(e) => {
          e.stopPropagation()
        }}"
        class="text-darkgray dark:text-mygray m-0.5 inline-block rounded-lg px-2">
        ${to}
      </div>`
    })}${task.toNames?.map((to) => {
      return html`<div
        @click="${(e) => {
          selectTask(to)
          clickPos(e)
          e.stopPropagation()
        }}"
        class="text-white dark:text-lightgray m-0.5 inline-block rounded-lg px-2 bg-mygray dark:bg-nearblack">
        ${to}
      </div>`
    })}</div
  > `
}
