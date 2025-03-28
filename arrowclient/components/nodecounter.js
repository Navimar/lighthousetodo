import { html } from "~/arrow-js/index.js"
import data from "~/logic/data.js"

export const renderNodeCounter = () => {
  // if (reData.searchString) return ""
  return html`
    <div class="flex bg-neutral-100 fontmono dark:bg-neutral-950 dark:text-white p-2 text-sm">
      <div class="self-center"> ${data.tasks.length}/250 записей </div>
      <div class="ml-auto">
        <button
          class="inline-block border-b-neutral-100 button-gray"
          @click="${() => {
            window.location.href = "/info/donate/"
          }}"
          >Поддержать проект</button
        >
      </div>
    </div>
  `
}
