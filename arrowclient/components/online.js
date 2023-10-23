import { html } from "@arrow-js/core"
import { status } from "~/logic/reactive.js"

export default () => {
  if (status.online) return
  // html`<div
  //   class="fixed uppercase left-1/2 transform -translate-x-1/2 px-2 fontaccent border-2 border-neutral-350 dark:border-neutral-350 bottom-3 text-sm bg-white dark:bg-black text-black dark:text-white ">
  //   Online
  // </div>`
  else
    return html`<div
      class="fixed uppercase left-1/2 transform -translate-x-1/2 px-2 fontaccent border-2 border-accent dark:border-accent-dark bottom-3 text-sm bg-white dark:bg-black text-accent dark:text-accent-dark ">
      Offline
    </div>`
}
