import { html } from "~/arrow-js/index.js"

import reData from "~/logic/reactive.js"

function complete(e, divId) {
  // Получить элемент по его ID
  const divElement = document.getElementById(divId)

  // Если div не найден, выходим из функции
  if (!divElement) {
    console.error(`Element with id '${divId}' not found.`)
    return
  }

  // Получить текущий текст из div и разделить его на строки
  const lines = divElement.innerText.trim().split("\n")
  // Найти индекс строки, которую нужно заменить
  const lowerCaseLines = lines.map((line) => line.toLowerCase())
  const lineIndex = lowerCaseLines.indexOf(reData.autoComplete.line.toLowerCase())

  if (lineIndex !== -1) {
    // Замена строки
    lines[lineIndex] = e.currentTarget.innerText
  } else return

  // Объединить строки, обернув каждую из них в <div> и установить обратно в div
  divElement.innerHTML = lines.map((line) => `<div>${line}</div>`).join("")

  reData.autoComplete.list = []
}

export default (divId) => {
  if (reData.autoComplete.list && reData.autoComplete.div == divId && reData.autoComplete.list.length > 0) {
    const elements = []
    for (let i = 0; i < reData.autoComplete.list.length; i++) {
      const e = reData.autoComplete.list[i]
      const div = html`
        <div
          class="cursor-pointer break-words hover:bg-neutral-200 dark:hover:bg-neutral-600 p-2"
          @click="${(event) => complete(event, divId)}">
          ${e}
        </div>
      `
      elements.push(div)
    }
    return html`
      <div id="autocomplete-list" class="w-full z-10 top-full ">
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
