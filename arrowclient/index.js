import { authentication, authenticationOnLoad } from "./components/authentication.js"
import renderCalendar from "./components/calendar.js"
import online from "./components/online.js"
import search from "./components/search.js"
import plusbutton from "./components/plusbutton.js"
import footer from "~/components/footer.js"
import renderTasks from "./components/tasks/tasks.js"
import renderIntention from "./components/tasks/intention.js"
import pages from "./components/tasks/pages.js"
import navigation from "./components/navigation.js"

import { renderCollabortors, renderCollaborationRequests } from "./components/collaborators/collaborators.js"
import { inputSocket } from "~/logic/send.js"
import watchers from "~/logic/watchers.js"

import { safeSetLocalStorageItem, getLocalStorageItem } from "~/logic/util.js"
import reData from "~/logic/reactive.js"
import { tick } from "~/logic/tick.js"
import data from "~/logic/data.js"
import { removeOldTasks } from "~/logic/forget.js"
import { makevisible } from "~/logic/makevisible.js"
import { renderNodeCounter } from "~/components/nodecounter.js"
import router from "~/logic/router.js"

import { html } from "~/arrow-js/index.js"
import dayjs from "dayjs"
import "dayjs/locale/ru" // Импорт русской локали
import localizedFormat from "dayjs/plugin/localizedFormat" // Плагин для локализованного форматирования
import customParseFormat from "dayjs/plugin/customParseFormat"
import isSameOrBefore from "dayjs/plugin/isSameOrBefore"
import { makevisibleIntentions } from "./logic/makevisible.js"
dayjs.extend(isSameOrBefore)
dayjs.extend(customParseFormat)
dayjs.extend(localizedFormat)
dayjs.locale("ru")

const app = document.getElementById("App")

const render = html`
  ${search}
  <div class="flex flex-col gap-6 pb-[30rem] max-w-full w-40rem px-3 m-auto"
    >${authentication}${renderNodeCounter}${renderCalendar}${navigation()}${renderCollaborationRequests}${renderCollabortors}${renderTasks}${pages}${renderIntention}</div
  >${footer()}${plusbutton}${() => online()}
`

document.addEventListener("keydown", function (event) {
  if ((event.metaKey || event.ctrlKey) && event.key === "f") {
    const searchInput = document.querySelector("#searchinput")

    if (searchInput) {
      event.preventDefault() // Отменяем стандартный поиск
      window.scrollBy({ top: -50, behavior: "smooth" })
      searchInput.focus()

      // Добавляем желтый фон
      searchInput.classList.add("bg-neutral-350")
      searchInput.classList.remove("bg-neutral-100")
      searchInput.classList.remove("dark:bg-neutral-900")

      // Убираем фон через 1 сек
      setTimeout(() => {
        searchInput.classList.remove("bg-neutral-350")
        searchInput.classList.add("bg-neutral-100")
        searchInput.classList.add("dark:bg-neutral-900")
      }, 1000)
    }
  }
})

window.addEventListener("load", function () {
  window.addEventListener("paste", function (e) {
    e.preventDefault()
    let text = e.clipboardData.getData("text/plain")
    document.execCommand("insertText", false, text)
  })

  authenticationOnLoad()

  data.tasks = getLocalStorageItem("tasks") || []
  removeOldTasks()
  data.pendingRequests = getLocalStorageItem("pendingRequests") || []

  makevisible()
  makevisibleIntentions()
  inputSocket()

  reData.currentTime.timerStarted = getLocalStorageItem("timer") || "00:00"

  tick()
  watchers()
  render(app)
})
