import { authentication, authenticationOnLoad } from "./components/authentication.js"
import renderCalendar from "./components/calendar.js"
import online from "./components/online.js"
import search from "./components/search.js"
import plusbutton from "./components/plusbutton.js"
import footer from "~/components/footer.js"
import { renderTasks } from "./components/tasks/tasks.js"
import { renderCollabortors, renderCollaborationRequests } from "./components/collaborators/collaborators.js"
import { inputSocket } from "~/logic/send.js"
import { NEWSCRIBETEXT } from "~/logic/const.js"
import { updateDateClass, updatePauseReadyButton } from "~/logic/manipulate.js"
import { safeSetLocalStorageItem, getLocalStorageItem } from "~/logic/util.js"
import reData from "~/logic/reactive.js"
import { tick } from "~/logic/tick.js"
import data from "~/logic/data.js"
import { getObjectById } from "~/logic/util.js"
import { removeOldTasks } from "~/logic/forget.js"
import { makevisible } from "~/logic/makevisible.js"
import { renderNodeCounter } from "~/components/nodecounter.js"
import performance from "~/logic/performance.js"

import { html, watch } from "~/arrow-js/index.js"
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
  ${() => search()}
  <div class="flex flex-col gap-6 pb-[30rem] max-w-full w-40rem px-3 m-auto">
    ${() => authentication()} ${() => renderNodeCounter()} ${() => renderCalendar(dayjs())}
    ${() => renderCollaborationRequests()} ${() => renderCollabortors()} ${() => renderTasks()} </div
  >${footer()}${plusbutton}${() => online()}
`

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
  inputSocket()

  reData.currentTime.timerStarted = getLocalStorageItem("timer") || "00:00"

  tick()
  watch(() => {
    safeSetLocalStorageItem("timer", reData.currentTime.timerStarted)
  })
  watch(() => {
    performance.start("watch selectedScribe")
    try {
      reData.selectedScribe
      reData.visibleTasks
      Promise.resolve().then(() => {
        let editdiv = document.getElementById("edit")
        if (editdiv) {
          const range = document.createRange()
          const sel = window.getSelection()
          range.selectNodeContents(editdiv)
          if (reData.selectedScribe && !getObjectById(reData.selectedScribe).name.startsWith(NEWSCRIBETEXT))
            range.collapse()
          sel.removeAllRanges()
          sel.addRange(range)
        }
        let selectedtaskdiv = document.getElementById("selectedtask")
        if (selectedtaskdiv) selectedtaskdiv.scrollIntoView(true)
        updateDateClass()
        updatePauseReadyButton()
      })
    } finally {
      performance.end("watch selectedScribe")
    }
  })
  watch(() => {
    reData.currentTime.slider
    const currentTimeMarker = document.getElementById("currentTimeMarker")
    if (currentTimeMarker) currentTimeMarker.style = "left:" + reData.currentTime.slider + "px"
  })
  render(app)
})
