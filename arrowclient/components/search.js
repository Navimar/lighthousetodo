import { searchstring } from "~/logic/reactive.js"
import { html } from "@arrow-js/core"
import { clearSearch } from "~/logic/manipulate.js"

export default () => {
  return html`
<div class="z-[40] max-w-full m-auto w-40rem sticky top-0">
  ${() => crossbutton()}
    <input 
      id="searchinput" 
      placeholder="Поиск..."
      class="box-border h-11 rounded-lg p-2 block w-full top-0 bg-nearwhite dark:bg-black dark:text-white focus:outline-none"
      @input="${(e) => {
        searchstring.text = e.target.value
      }}"
      @touchstart="${(e) => {
        e.preventDefault()
        e.target.focus({
          preventScroll: true,
        })
      }}"
    >
    </input>
  </div>
  `
}

let crossbutton = () => {
  let crossbuttoncss = searchstring.text == "" ? "hidden" : ""
  return html` <button
    class="dark:text-white text-4xl absolute z-[100] right-2 font-extrabold ${crossbuttoncss}"
    @click="${() => {
      clearSearch()
    }}">
    ×
  </button>`
}
