import { html } from "@arrow-js/core"
import { status } from "~/logic/reactive.js"

export default () => {
  if (!status.online)
    return html`<div
      class="fixed uppercase z-[52] left-1/2 transform -translate-x-1/2 p-1 fontaccent border-2 border-accent dark:border-accent-dark bottom-3 text-sm bg-white dark:bg-black text-accent dark:text-accent-dark ">
      Offline
    </div>`
}
