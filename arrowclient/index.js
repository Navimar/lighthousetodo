import css from "./css.js"

import { authentication, authenticationOnLoad } from "./components/authentication.js"
import renderCalendar from "./components/calendar.js"
import online from "./components/online.js"
import search from "./components/search.js"
import plusbutton from "./components/plusbutton.js"
import { renderTasks } from "./components/tasks.js"
import { loadData, sendData, inputSocket } from "/logic/socket.js"
import { newscribetext } from "./logic/const.js"
import { safeSetLocalStorageItem, getLocalStorageItem, mouseY } from "/logic/util.js"
import { currentTime, data, user } from "./logic/reactive.js"

import { html, watch } from "@arrow-js/core"
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

function updateCurrentTimeMarker() {
  const time = dayjs()
  const totalMinutes = time.hour() * 60 + time.minute()
  const slider = document.getElementById("timeSlider")
  if (slider) {
    const sliderWidth = slider.offsetWidth - 16
    currentTime.slider = (totalMinutes / 1440) * sliderWidth + 16
  }
  currentTime.clock = time.format("HH:mm")
  currentTime.date = time.format("YYYY-MM-DD")
  // console.log('currentTime.timerStarted', currentTime.timerStarted)
  if (currentTime.timerStarted) {
    const diffInMinutes = Math.abs(time.diff(dayjs(currentTime.timerStarted, "HH:mm"), "minute"))
    // console.log('diffInMinutes', diffInMinutes)
    const hours = ((diffInMinutes % (24 * 60)) / 60) | 0 // Остаток минут после деления на 24 часа преобразуем в часы
    const minutes = diffInMinutes % 60
    currentTime.timer =
      hours.toLocaleString("en-US", { minimumIntegerDigits: 2 }) +
      ":" +
      minutes.toLocaleString("en-US", { minimumIntegerDigits: 2 })
    // console.log('currentTime.timer', currentTime.timer, minutes)
  }
  setTimeout(updateCurrentTimeMarker, 1000)
}

const render = html`
  ${() => authentication()}
  <div class="bgimg bg-nearwhite dark:bg-black fixed w-full h-full -z-10 bg-cover"></div>
  <div class="flex flex-col gap-4 pb-80 max-w-full w-40rem m-auto">
    ${() => search()} ${() => renderCalendar(dayjs())}
    <div class="dark:text-white bg-nearwhite dark:bg-black p-3">
      ${() => currentTime.timerStarted}
      <button
        class="notomono w-1/6 ${css.button}"
        @click="${() => {
          currentTime.timerStarted = currentTime.clock
        }}">
        ► ${() => currentTime.timer}
      </button>
    </div>
    ${() => renderTasks()}
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

  updateCurrentTimeMarker()
  watch(() => {
    safeSetLocalStorageItem("timer", currentTime.timerStarted)
  })
  watch(() => {
    safeSetLocalStorageItem("calendarSet", JSON.stringify(data.calendarSet))
  })
  watch(() => {
    data.tasks
    if (user) {
      console.log(user, "before sd")
      sendData()
      safeSetLocalStorageItem("data", JSON.stringify(data.tasks))
      safeSetLocalStorageItem("timestamp", dayjs().format())
    }
  })
  watch(() => {
    data.selected
    data.tasks
    Promise.resolve().then(() => {
      let div = document.getElementById("edit")
      if (div) {
        const range = document.createRange()
        const sel = window.getSelection()
        range.selectNodeContents(div)
        if (!data.selected.name.startsWith(newscribetext)) range.collapse()
        sel.removeAllRanges()
        sel.addRange(range)
        const rect = div.getBoundingClientRect()
        const scrollPosition = rect.top + window.scrollY + rect.height / 2 - mouseY
        window.scroll(0, scrollPosition)
      }
    })
  })
  watch(() => {
    currentTime.slider
    const currentTimeMarker = document.getElementById("currentTimeMarker")
    if (currentTimeMarker) currentTimeMarker.style = "left:" + currentTime.slider + "px"
  })
  render(app)
})
