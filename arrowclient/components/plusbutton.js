import { html } from "@arrow-js/core"
import { NEWSCRIBETEXT } from "~/logic/const.js"
import { selectTaskByName } from "~/logic/manipulate.js"

let plusbutton = () => {
  selectTaskByName(NEWSCRIBETEXT)
}

export default html`<div
  class="z-[49] flex pointer-events-none justify-end text-lg w-full max-w-5xl fixed bottom-0 left-1/2 -translate-x-1/2">
  <button
    @click="${plusbutton}"
    class=" pointer-events-auto rounded-full plusimg text-5xl w-20 h-20 m-5 bg-accent dark:bg-accent"></button>
</div>`
