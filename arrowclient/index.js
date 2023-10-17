import { authentication, authenticationOnLoad } from "./components/authentication.js"
import renderCalendar from "./components/calendar.js"
import online from "./components/online.js"
import search from "./components/search.js"
import plusbutton from "./components/plusbutton.js"
import { renderTasks } from "./components/tasks.js"
import { inputSocket } from "~/logic/socket.js"
import { NEWSCRIBETEXT } from "~/logic/const.js"
import { updateDateClass } from "~/logic/manipulate.js"
import { safeSetLocalStorageItem, getLocalStorageItem, mouseY } from "~/logic/util.js"
import { currentTime, reData, selected } from "~/logic/reactive.js"
import { tick } from "~/logic/tick.js"

import { html, watch } from "@arrow-js/core"
import dayjs from "dayjs"
import "dayjs/locale/ru" // Импорт русской локали
import localizedFormat from "dayjs/plugin/localizedFormat" // Плагин для локализованного форматирования
import customParseFormat from "dayjs/plugin/customParseFormat"
import isSameOrBefore from "dayjs/plugin/isSameOrBefore"
import { getObjectById } from "~/logic/util.js"
dayjs.extend(isSameOrBefore)
dayjs.extend(customParseFormat)
dayjs.extend(localizedFormat)
dayjs.locale("ru")

const app = document.getElementById("App")

const render = html`
  ${() => search()}
  <div class="flex flex-col gap-6 pb-80 max-w-full w-40rem px-3 m-auto">
    ${() => authentication()} ${() => renderCalendar(dayjs())} ${() => renderTasks()}
  </div>
  ${plusbutton} ${() => online()}
`

window.addEventListener("load", function () {
  window.addEventListener("paste", function (e) {
    e.preventDefault()
    let text = e.clipboardData.getData("text/plain")
    document.execCommand("insertText", false, text)
  })

  authenticationOnLoad()
  inputSocket()

  currentTime.timerStarted = getLocalStorageItem("timer") || "00:00"
  // data.calendarSet = safeJSONParse(getLocalStorageItem('calendarSet'), {})
  // data.timestamp = getLocalStorageItem('timestamp');

  tick()
  watch(() => {
    safeSetLocalStorageItem("timer", currentTime.timerStarted)
  })
  watch(() => {
    selected.id
    reData.visibletasks
    Promise.resolve().then(() => {
      let editdiv = document.getElementById("edit")
      if (editdiv) {
        const range = document.createRange()
        const sel = window.getSelection()
        range.selectNodeContents(editdiv)
        if (!getObjectById(selected.id).name.startsWith(NEWSCRIBETEXT)) range.collapse()
        sel.removeAllRanges()
        sel.addRange(range)
      }
      let selectedtaskdiv = document.getElementById("selectedtask")
      if (selectedtaskdiv) selectedtaskdiv.scrollIntoView(true)
      updateDateClass()
    })
  })
  watch(() => {
    currentTime.slider
    const currentTimeMarker = document.getElementById("currentTimeMarker")
    if (currentTimeMarker) currentTimeMarker.style = "left:" + currentTime.slider + "px"
  })
  render(app)
})
