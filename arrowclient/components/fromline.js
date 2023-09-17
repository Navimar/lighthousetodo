import { html } from "@arrow-js/core"
import { selectTask } from "/logic/manipulate.js"
import { clickPos } from "/logic/util.js"
import { getObjectByName } from "../logic/util"

export default (task) => {
  const readyNames = []
  const notReadyNames = []

  task.fromNames?.forEach((name) => {
    const obj = getObjectByName(name)
    if (obj.ready) {
      readyNames.push(name)
    } else {
      notReadyNames.push(name)
    }
  })

  return html`<div class="flex gap-2 text-sm empty:hidden"
    >${readyNames.map((from) => {
      return html`<div
        @click="${(e) => {
          selectTask(from)
          clickPos(e)
          e.stopPropagation()
        }}"
        class="text-mygray m-0.5 inline-block rounded-lg px-2 bg-transparent ">
        ${from}
      </div>`
    })}${notReadyNames.map((from) => {
      return html`<div
        @click="${(e) => {
          selectTask(from)
          clickPos(e)
          e.stopPropagation()
        }}"
        class="text-white rounded-lg px-2 bg-mygray dark:bg-darkgray">
        ${from}
      </div>`
    })}</div
  >`
}
