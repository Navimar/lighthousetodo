import { authentication, authenticationOnLoad } from "./components/authentication.js"
import renderCalendar from "./components/calendar.js"
import online from "./components/online.js"
import search from "./components/search.js"
import plusbutton from "./components/plusbutton.js"
import footer from "~/components/footer.js"
import renderTasks from "./components/tasks/tasks.js"
import pages from "./components/tasks/pages.js"

import { renderCollabortors, renderCollaborationRequests } from "./components/collaborators/collaborators.js"
import { inputSocket } from "~/logic/send.js"
import watchers from "~/logic/watchers.js"

import { safeSetLocalStorageItem, getLocalStorageItem } from "~/logic/sync.js"
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

dayjs.extend(isSameOrBefore)
dayjs.extend(customParseFormat)
dayjs.extend(localizedFormat)
dayjs.locale("ru")

const app = document.getElementById("App")

const render = html`
  ${search}
  <div class="flex flex-col gap-6 pb-[30rem] max-w-full w-40rem px-3 m-auto"
    >${authentication}${renderCalendar}${renderCollaborationRequests}${renderCollabortors}${renderTasks}${pages}</div
  >${footer()}${plusbutton}${() => online()}
`

function updateBackground() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches

  const candidates = isDark
    ? [`test.jpg`, `back_${month}-${day}_dark.jpg`, `back_${month}_dark.jpg`, `back_dark.jpg`]
    : [`test.jpg`, `back_${month}-${day}.jpg`, `back_${month}.jpg`, `back.jpg`]

  const testImage = (url) => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => resolve(url)
      img.onerror = () => resolve(null)
      img.src = url
    })
  }

  ;(async () => {
    for (const url of candidates) {
      const found = await testImage(url)
      if (found) {
        document.querySelector(".bgimg").style.backgroundImage = `url("${found}")`
        break
      }
    }
  })()
}

window.addEventListener("load", function () {
  window.addEventListener("paste", function (e) {
    e.preventDefault()
    let text = e.clipboardData.getData("text/plain")
    document.execCommand("insertText", false, text)
  })

  updateBackground()
  const darkModeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
  darkModeMediaQuery.addListener(updateBackground)
  darkModeMediaQuery.addEventListener("change", updateBackground)

  authenticationOnLoad()
  removeOldTasks()
  data.pendingRequests = getLocalStorageItem("pendingRequests") || []

  makevisible()
  inputSocket()

  reData.currentTime.timerStarted = getLocalStorageItem("timer") || "00:00"

  tick()
  watchers()
  render(app)
})
