import navigate from "~/logic/router.js"
import { html } from "~/arrow-js/index.js"
import { clickPos } from "~/logic/util.js"

import css from "/css.js"
import { makevisible } from "~/logic/makevisible.js"

export default () => {
  return html`
    <div id="navigationmenu" class="bg-neutral-100 dark:bg-neutral-950 flex justify-center p-2">
      <label class="flex items-center mr-2">
        <input
          type="radio"
          name="navigation"
          value="intentions"
          class="appearance-none peer sr-only"
          @change="${(e) => {
            navigate("intentions")
            clickPos(e)
          }}" />
        <span class="button-gray whitespace-nowrap">Намерения</span>
      </label>
      <label class="flex items-center mr-2">
        <input
          type="radio"
          name="navigation"
          value="tasks"
          class="appearance-none peer sr-only"
          @change="${(e) => {
            navigate("tasks")
            makevisible()

            clickPos(e)
          }}" />
        <span class="button-gray whitespace-nowrap">Задачи</span>
      </label>
    </div>
  `
}
