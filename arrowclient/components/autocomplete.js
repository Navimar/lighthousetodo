import { html } from "~/arrow-js/index.js"

import reData from "~/logic/reactive.js"
import data from "~/logic/data.js"

function complete(e, inputId) {
  const inputElement = document.getElementById(inputId)

  if (!inputElement) {
    console.error(`Input element with id '${inputId}' not found.`)
    return
  }

  // Заменить значение input на выбранный текст
  inputElement.value = e.currentTarget.innerText

  // Очистить список автокомплита
  reData.autoComplete.list = []
}

export default (divId) => {
  reData.autoComplete.list
  if (!divId) return

  const element = document.getElementById(divId)
  if (!element) return

  let currentLineText = document.getElementById(divId).value
  if (!currentLineText) return

  const matches = data.tasks
    .filter((taskItem) => taskItem.name.toLowerCase().includes(currentLineText) && taskItem.id != reData.selectedScribe) // Преобразование к нижнему регистру
    .sort((a, b) => {
      // Основная сортировка на основе длины toNames
      const difference =
        (b.toIds?.length || 0) + (b.fromIds?.length || 0) - ((a.toIds?.length || 0) + (a.fromIds?.length || 0))
      if (difference !== 0) return difference

      // Дополнительная сортировка на основе длины name, если длины toNames одинаковы
      return a.name.length - b.name.length
    })
    .slice(0, 7) // Ограничиваем список

  // Обновлять reData.autoComplete.list с найденными именами совпадений
  reData.autoComplete.list = matches.map((match) => {
    const escapedText = currentLineText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    const highlightedName = match.name.replace(new RegExp(escapedText, "ig"), (match) => `<strong>${match}</strong>`)
    return highlightedName
  })

  if (reData.autoComplete.list && reData.autoComplete.div == divId && reData.autoComplete.list.length > 0) {
    const elements = []
    for (let i = 0; i < reData.autoComplete.list.length; i++) {
      const e = reData.autoComplete.list[i]
      const div = html`
        <div
          class="text-base cursor-pointer break-words hover:bg-neutral-200 dark:hover:bg-neutral-600 p-2"
          @click="${(event) => complete(event, divId)}">
          ${e}
        </div>
      `
      elements.push(div)
    }
    return html`
      <div id="absolute autocomplete-list" class="w-full z-10 top-full ">
        <div
          class=" border border-neutral-400 dark:bg-neutral-800 dark:border-neutral-600 rounded bg-white dark:bg-black">
          ${() => elements}
        </div>
      </div>
    `
  } else return ""
}

document.addEventListener("click", function (event) {
  const autocompleteElem = document.querySelector("#autocomplete-list")

  if (!autocompleteElem) return

  let targetElem = event.target // элемент, на который был совершен клик

  // проверяем, является ли targetElem потомком autocompleteElem
  while (targetElem) {
    if (targetElem === autocompleteElem) {
      return // клик был внутри элемента .autocomplete-list
    }
    targetElem = targetElem.parentNode
  }

  // клик был за пределами элемента .autocomplete-list
  reData.autoComplete.list = []
})
