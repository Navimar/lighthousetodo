import { html } from "@arrow-js/core"
import { NEWSCRIBETEXT } from "~/logic/const.js"
import { clearSearch, selectTask } from "~/logic/manipulate.js"
import saveTask from "~/logic/savetask.js"
import addScribe from "~/logic/addscribe"
import { data } from "~/logic/reactive.js"

let plusbutton = () => {
  clearSearch()
  saveTask("plusbutton")
  if (!addScribe(NEWSCRIBETEXT)) {
    selectTask(NEWSCRIBETEXT)
  } else data.selected = data.tasks[0]
}

export default html`<div
  class="flex pointer-events-none justify-end text-lg w-full max-w-5xl fixed bottom-0 left-1/2 -translate-x-1/2">
  <button
    @click="${plusbutton}"
    class="pointer-events-auto rounded-full plusimg text-5xl w-20 h-20 m-5 bg-old dark:bg-darkold"></button>
</div>`
