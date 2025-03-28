import { html } from "~/arrow-js/index.js"

// Отображает скрытые данные задачи
export default (task) => {
  return html`
    <div class="text-[0.6rem] italic text-gray-500">
      Weight: ${task.weight} | Readiness: ${task.readyPercentage}% | Descendants: ${task.descendantCount}
    </div>
  `
}
