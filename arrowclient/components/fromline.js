import { html } from "@arrow-js/core"
import { selectTask } from "/logic/manipulate.js"
import { clickPos } from "~/logic/util.js"
import { getObjectByName } from "~/logic/util"

export default (task) => {
  const readyNames = []
  const notReadyNames = []

  task.fromNames?.forEach((name) => {
    const obj = getObjectByName(name)
    if (!obj || obj.ready) {
      readyNames.push(name)
    } else {
      notReadyNames.push(name)
    }
  })

  return html`<div class="text-sm empty:hidden"
    >${() =>
      readyNames.map((from) => {
        return html`<div
          @click="${(e) => {
            selectTask(from)
            clickPos(e)
            e.stopPropagation()
          }}"
          class="text-neutral-800 dark:text-neutral-400 m-0.5 inline-block rounded-lg px-2">
          ${() => from}
        </div>`
      })}${() =>
      notReadyNames.map((from) => {
        return html`<div
          @click="${(e) => {
            selectTask(from)
            clickPos(e)
            e.stopPropagation()
          }}"
          class=" text-white dark:text-white m-0.5 inline-block align-middle rounded-lg px-2 bg-neutral-400 dark:bg-neutral-700">
          ${() => from}
        </div>`
      })}</div
  >`
}
