import { authentication, authenticationOnLoad } from "./components/authentication.js"
import renderCalendar from "./components/calendar.js"
import online from "./components/online.js"
import search from "./components/search.js"
import plusbutton from "./components/plusbutton.js"
import { renderTasks } from "./components/tasks.js"
import { loadData, sendData, inputSocket } from "/logic/socket.js"
import { NEWSCRIBETEXT } from "./logic/const.js"
import { safeSetLocalStorageItem, getLocalStorageItem, mouseY } from "/logic/util.js"
import { currentTime, selectedDate, data, user } from "/logic/reactive.js"

import { html, watch } from "@arrow-js/core"
import dayjs from "dayjs"
import "dayjs/locale/ru" // Импорт русской локали
import localizedFormat from "dayjs/plugin/localizedFormat" // Плагин для локализованного форматирования
import customParseFormat from "dayjs/plugin/customParseFormat"
import isSameOrBefore from "dayjs/plugin/isSameOrBefore"
import { riseTask } from "./logic/manipulate.js"
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

  let newTime = time.format("HH:mm")
  if (currentTime.clock !== newTime) {
    data.tasks.forEach((task) => {
      if (task.time === currentTime.clock && task.date === currentTime.date) {
        // riseTask(task)
        if (task.ready === true) task.ready = false
      }
    })
    currentTime.clock = newTime
  }

  currentTime.date = time.format("YYYY-MM-DD")

  // Update selectedDate.date if it's in the past
  if (dayjs(selectedDate.date).isBefore(currentTime.date)) {
    selectedDate.date = currentTime.date
  }

  if (currentTime.timerStarted) {
    const diffInMinutes = Math.abs(time.diff(dayjs(currentTime.timerStarted, "HH:mm"), "minute"))
    const hours = ((diffInMinutes % (24 * 60)) / 60) | 0
    const minutes = diffInMinutes % 60
    currentTime.timer =
      hours.toLocaleString("en-US", { minimumIntegerDigits: 2 }) +
      ":" +
      minutes.toLocaleString("en-US", { minimumIntegerDigits: 2 })
  }

  // for (let date in data.calendarSet) {
  //   if (dayjs(date, "YYYY-MM-DD").isBefore(currentTime.date)) {
  //     delete data.calendarSet[date]
  //   }
  // }
  setTimeout(updateCurrentTimeMarker, 1000)
}

//  <div class="dark:text-white bg-nearwhite dark:bg-black p-3">
//       ${() => currentTime.timerStarted}
//       <button
//         class="notomono w-1/6 ${css.button}"
//         @click="${() => {
//           currentTime.timerStarted = currentTime.clock
//         }}">
//         ► ${() => currentTime.timer}
//       </button>
//     </div>
const render = html`
  <div class="flex flex-col gap-4 pb-80 max-w-full w-40rem m-auto">
    ${() => search()} ${() => authentication()} ${() => renderCalendar(dayjs())} ${() => renderTasks()}
  </div>
  ${plusbutton} ${() => online()}
`

window.addEventListener("load", function () {
  window.addEventListener("paste", function (e) {
    e.preventDefault()
    let text = e.clipboardData.getData("text/plain")
    document.execCommand("insertText", false, text)
  })

  function preventScrollAboveTop() {
    if (window.scrollY < 0) {
      // Прокрутить страницу к верху
      window.scrollTo(0, 0)

      // Применить стили для блокировки прокрутки
      document.documentElement.style.overflow = "initial"
      document.documentElement.style.position = "fixed"
      document.documentElement.style.width = "100%"

      isScrollLocked = true
    } else if (window.scrollY >= 0) {
      // Сбросить стили при прокрутке вниз
      document.documentElement.style.overflow = ""
      document.documentElement.style.position = ""
      document.documentElement.style.width = ""
    }
  }
  window.addEventListener("scroll", preventScrollAboveTop)

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
    // safeSetLocalStorageItem("calendarSet", JSON.stringify(data.calendarSet))
  })
  // watch(() => {
  //   data.tasks
  //   if (user) {
  //     sendData()
  //     safeSetLocalStorageItem("data", JSON.stringify(data.tasks))
  //     safeSetLocalStorageItem("timestamp", dayjs().format())
  //   }
  // })
  watch(() => {
    data.selected
    data.tasks
    Promise.resolve().then(() => {
      let div = document.getElementById("edit")
      if (div) {
        const range = document.createRange()
        const sel = window.getSelection()
        range.selectNodeContents(div)
        if (!data.selected.name.startsWith(NEWSCRIBETEXT)) range.collapse()
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
