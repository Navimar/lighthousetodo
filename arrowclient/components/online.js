import { html } from "@arrow-js/core"
import { status } from "~/logic/reactive.js"

export default () => {
  if (status.online) return
  // html`<div class="fixed left-1/2 transform -translate-x-1/2 notomono border bottom-3 text-sm bg-white ">Online</div>`
  else
    return html`<div
      class="fixed left-1/2 transform -translate-x-1/2 notomono border bottom-3 text-sm bg-white text-red-600 ">
      Offline
    </div>`
}
