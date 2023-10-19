import { html } from "@arrow-js/core"
import { getCurrentLine, getObjectById } from "~/logic/util.js"
import { autocomplete } from "~/logic/reactive.js"
import renderAutocomplete from "/components/autocomplete.js"
import data from "~/logic/data.js"

function handleInput(e) {
  const currentLineText = getCurrentLine().toLowerCase() // Преобразование к нижнему регистру

  autocomplete.list = []
  autocomplete.line = currentLineText
  autocomplete.div = e.target.id

  // Если строка пустая, вернуть пустой массив
  if (!currentLineText) {
    return
  }

  // Искать совпадения в data.tasks на основе поля name
  const matches = data.tasks
    .filter((taskItem) => taskItem.name.toLowerCase().includes(currentLineText)) // Преобразование к нижнему регистру
    .sort((a, b) => {
      // Основная сортировка на основе длины toNames
      const difference = (b.toIds?.length || 0) - (a.toIds?.length || 0)
      if (difference !== 0) return difference

      // Дополнительная сортировка на основе длины name, если длины toNames одинаковы
      return a.name.length - b.name.length
    })
    .slice(0, 15) // Ограничиваем список до 15 элементов

  // Обновлять autocomplete.list с найденными именами совпадений
  autocomplete.list = matches.map((match) => {
    const highlightedName = match.name.replace(
      new RegExp(currentLineText, "ig"),
      (match) => `<strong>${match}</strong>`,
    ) // Добавлен флаг 'i' для поиска без учета регистра
    return highlightedName
  })
}

function handleDivClick(e) {
  const divElement = e.currentTarget

  if (!divElement.classList.contains("h-auto")) {
    divElement.classList.add("h-auto")
    divElement.classList.remove("h-8")
    const range = document.createRange()
    const sel = window.getSelection()
    range.selectNodeContents(divElement)
    range.collapse(false)
    sel.removeAllRanges()
    sel.addRange(range)
  }
}

export default (task) => html`
  <div class="flex relative gap-4">
    <div
      id="fromEdit"
      class="flex flex-col gap-2 text-sm w-1/2 h-8 overflow-hidden bg-neutral-50 dark:bg-neutral-900 focus:outline-none"
      contenteditable="true"
      role="textbox"
      aria-multiline="true"
      tabindex="0"
      @click="${handleDivClick}"
      @input="${handleInput}">
      ${task.fromIds?.map((id) => html`<div>${getObjectById(id).name}</div>`)}
    </div>
    ${() => renderAutocomplete("fromEdit")}

    <div
      id="toEdit"
      class="flex flex-col gap-2 text-sm w-1/2 h-8 overflow-hidden bg-neutral-50 dark:bg-neutral-900 focus:outline-none"
      contenteditable="true"
      role="textbox"
      aria-multiline="true"
      tabindex="0"
      @click="${handleDivClick}"
      @input="${handleInput}">
      ${task.toIds?.map((id) => html`<div>${getObjectById(id).name}</div>`)}
    </div>
    ${() => renderAutocomplete("toEdit")}
  </div>
`
