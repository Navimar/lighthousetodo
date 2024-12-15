import { html } from "~/arrow-js/index.js"
import reData from "~/logic/reactive.js"
import css from "~/css.js"
import { makevisible } from "~/logic/makevisible.js"

function scroll() {
  const navigationMenu = document.getElementById("navigationmenu")
  const navigationMenuRect = navigationMenu?.getBoundingClientRect()
  const targetScroll = navigationMenuRect?.top
  console.log(targetScroll, navigationMenuRect?.top, navigationMenuRect?.bottom)

  window.scrollTo({ top: window.scrollY + navigationMenuRect.top + navigationMenuRect.top - navigationMenuRect.bottom })
}
export default () => {
  if (reData.route[0] !== "tasks") return ""

  //   console.log(reData.currentPage, reData.totalPages)
  let hiddenPrev = reData.currentPage === 1 ? "opacity-50 hidden" : ""
  let hiddenNext = reData.currentPage === reData.totalPages ? "opacity-50 hidden" : ""
  //    <div class="flex items-center justify-center space-x-4">
  return html`
    <div class="bg-neutral-100 items-baseline  dark:bg-neutral-900 flex gap-3 justify-center p-2">
  
        <!-- Кнопка "Предыдущая страница" -->
        <button
          class="${css.button} ${hiddenPrev}"
          @click="${() => {
            if (reData.currentPage > 1) {
              reData.currentPage--
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
          class="${css.button} ${hiddenNext}"
          @click="${() => {
            if (reData.currentPage < reData.totalPages) {
              reData.currentPage++
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
