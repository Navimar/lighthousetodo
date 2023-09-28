import { html } from "@arrow-js/core"

import { autocomplete } from "~/logic/reactive.js"

function complete(e, divId) {
  console.log("complete", divId)
  // Получить элемент по его ID
  const divElement = document.getElementById(divId)
  console.log("divElement", divElement)

  // Если div не найден, выходим из функции
  if (!divElement) {
    console.error(`Element with id '${divId}' not found.`)
    return
  }

  // Получить текущий текст из div и разделить его на строки
  const lines = divElement.innerText.trim().split("\n")
  console.log("autocomplete.line", autocomplete.line)
  // Найти индекс строки, которую нужно заменить
  const lowerCaseLines = lines.map((line) => line.toLowerCase())
  const lineIndex = lowerCaseLines.indexOf(autocomplete.line.toLowerCase())

  if (lineIndex !== -1) {
    // Замена строки
    lines[lineIndex] = e.currentTarget.innerText
  } else {
    console.log(lineIndex, "lineindex error")
    return
  }

  // Объединить строки, обернув каждую из них в <div> и установить обратно в div
  divElement.innerHTML = lines.map((line) => `<div>${line}</div>`).join("")

  autocomplete.list = []
}

export default (divId) => {
  if (autocomplete.list && autocomplete.div == divId && autocomplete.list.length > 0)
    return html`
      <div id="autocomplete-list" class="w-full sm:w-1/2 absolute z-10 top-full ">
        <div class=" border border-mygray dark:border-nearblack rounded shadow-md bg-white dark:bg-black">
          ${autocomplete.list.map((e) => {
            return html`
              <div
                class="cursor-pointer  hover:bg-lightgray dark:hover:bg-nearblack p-2"
                @click="${(event) => complete(event, divId)}">
                ${e}
              </div>
            `
          })}
        </div>
      </div>
    `
  else return ""
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
  autocomplete.list = []
})
