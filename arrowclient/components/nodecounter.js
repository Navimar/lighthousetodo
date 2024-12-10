import { html } from "~/arrow-js/index.js"
import data from "~/logic/data.js"
import css from "~/css.js"

import reData from "~/logic/reactive.js"

export const renderNodeCounter = () => {
  if (reData.searchString) return ""
  return html`
    <div class="flex bg-neutral-100 font-mono dark:bg-neutral-900 dark:text-white p-2 text-sm">
      <div class="self-center"> ${data.tasks.length}/250 записей </div>
      <div class="ml-auto">
        <button
          class="inline-block border-b-neutral-100 ${css.button}"
          @click="${() => {
            window.open("https://boosty.to/adastratodo", "_blank")
          }}"
          >Поддержать проект</button
        >
      </div>
    </div>
  `
}
