import { html } from "~/arrow-js/index.js"
import reData from "~/logic/reactive.js"

export default () =>
  html` <footer class="py-6 text-lg text-white dark:text-neutral-400 fontaccent">
    <div class="container mx-auto text-center">
      <p class="mb-4 fontaccent"
        ><a href="https://t.me/vaulinblog" class="underline fontaccent" target="_blank" rel="noopener noreferrer"
          >Система управления делами Игоря Ваулина</a
        ></p
      >
      <p class="mt-4 mb-12 fontaccent">${reData.version}</p>
    </div>
  </footer>`
