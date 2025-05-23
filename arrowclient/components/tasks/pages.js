import { html } from "~/arrow-js/index.js"
import reData from "~/logic/reactive.js"
import { makevisible } from "~/logic/makevisible.js"

function scroll() {
  const navigationMenu = document.getElementById("navigationmenu")
  const navigationMenuRect = navigationMenu?.getBoundingClientRect()

  window.scrollTo({ top: window.scrollY + navigationMenuRect.top + navigationMenuRect.top - navigationMenuRect.bottom })
}

export default () => {
  if (reData.route[0] !== "tasks" || reData.totalPages == 1 || reData.searchString != "") return ""

  let hiddenPrev = reData.currentPage === 1 ? "opacity-50 hidden" : ""
  let hiddenNext = reData.currentPage === reData.totalPages ? "opacity-50 hidden" : ""

  return html`
    <div class="bg-neutral-100 items-baseline  dark:bg-neutral-950 flex gap-3 justify-center p-2">

     <button
          class="button-gray "
          @click="${() => {
            reData.currentPage = 1
            reData.selectedScribe = false
            makevisible()
            reData.selectedScribe = reData.visibleTasks[0]?.id
          }}">
          В поток
        </button>

        <!-- Кнопка "Предыдущая страница" -->
        <button
          class="button-gray ${hiddenPrev}"
          @click="${() => {
            if (reData.currentPage > 1) {
              reData.currentPage--
              reData.selectedScribe = false
              makevisible()
              scroll()
            }
          }}">
          Назад
        </button>

        <!-- Индикатор текущей страницы -->
        <div class="fontaccent text-sm text-black dark:text-white">
          ${() => reData.currentPage} из ${() => reData.totalPages}
        </div>

        <!-- Кнопка "Следующая страница" -->
        <button
          class="button-gray ${hiddenNext}"
          @click="${() => {
            if (reData.currentPage < reData.totalPages) {
              reData.currentPage++
              reData.selectedScribe = false
              makevisible()
              scroll()
            }
          }}">
          вперед
        </button>
      </div>
    </div>
  `
}
