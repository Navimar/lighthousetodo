import reData from "~/logic/reactive.js"
import { html } from "~/arrow-js/index.js"
import { clearSearch } from "~/logic/manipulate.js"

export default () => {
  return html`
<div class="m-auto max-w-full w-40rem h-11 mb-6">
<div class="z-[40] max-w-full w-40rem px-3 fixed top-0 ">
  ${() => crossbutton()}
    <input 
      id="searchinput" 
      placeholder="Поиск..."
      class="oswald box-border h-11 rounded-lg p-2 block w-full top-0 bg-neutral-100 dark:bg-neutral-950 dark:text-white focus:outline-none"
       @focus="${(e) => {
         console.log(e.target.parentElement)
         e.target.parentElement.style.zIndex = "1000"
       }}"
      @blur="${(e) => {
        e.target.parentElement.style.zIndex = "40"
      }}"
      @input="${(e) => {
        window.scrollTo(0, 0)
        reData.searchString = e.target.value
      }}"
    >
    </input>
  </div>
</div>
  `
}

let crossbutton = () => {
  let crossbuttoncss = reData.searchString == "" ? "hidden" : ""
  return html` <button
    class="dark:text-white text-4xl absolute z-[100] right-5 font-extrabold ${crossbuttoncss}"
    @click="${() => {
      clearSearch()
    }}">
    ×
  </button>`
}

document.addEventListener("keydown", function (event) {
  if ((event.metaKey || event.ctrlKey) && event.key === "f") {
    const searchInput = document.querySelector("#searchinput")

    if (searchInput) {
      event.preventDefault() // Отменяем стандартный поиск
      // window.scrollBy({ top: -50, behavior: "smooth" })
      searchInput.focus()

      // Добавляем фон
      searchInput.classList.add("bg-accent")
      searchInput.classList.remove("bg-neutral-100")
      searchInput.classList.remove("dark:bg-neutral-950")

      // Убираем фон через 1 сек
      setTimeout(() => {
        searchInput.classList.remove("bg-accent")
        searchInput.classList.add("bg-neutral-100")
        searchInput.classList.add("dark:bg-neutral-950")
      }, 1000)
    }
  }
})
