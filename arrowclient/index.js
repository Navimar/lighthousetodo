import css from "./css.js"
import renderCalendar from "./components/calendar.js"
import {
  authentication,
  authenticationOnLoad,
} from "./components/authentication.js"
import timeSlider from "./components/timeslider.js"
import fromLine from "./components/fromline.js"
import toLine from "./components/toline.js"
import online from "./components/online.js"
import search from "./components/search.js"
import dateInput from "./components/dateinput.js"
import radio from "./components/priorityRadio.js"
import linkDivs from "./components/linkdivs.js"
import controlButtons from "/components/controlButtons.js"
import { clearSearch, selectTask } from "/logic/manipulate.js"
import { saveTask, addScribe } from "./logic/exe.js"
import { loadData, sendData, inputSocket } from "/logic/socket.js"
import {
  safeSetLocalStorageItem,
  safeJSONParse,
  getLocalStorageItem,
  clickPos,
  mouseX,
  mouseY,
} from "/logic/util.js"
import {
  autocomplete,
  searchstring,
  currentTime,
  selectedDate,
  data,
  user,
} from "./logic/reactive.js"

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
    const diffInMinutes = Math.abs(
      time.diff(dayjs(currentTime.timerStarted, "HH:mm"), "minute"),
    )
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

const app = document.getElementById("App")
const newscribetext = "новая запись"

let plusbutton = () => {
  clearSearch()
  saveTask("plusbutton")
  if (!addScribe(newscribetext)) {
    selectTask(newscribetext)
  } else data.selected = data.tasks[0]
}

const timeinputclass = (task) => {
  let taskDate = dayjs(`${task.date}T${task.time}`, "YYYY-MM-DDTHH:mm")

  let isInPast = dayjs().isAfter(taskDate)
  if (task.type == "meeting" && task.pause)
    return "h-fit border-4 border-red-500"
  if (task.type == "meeting" && isInPast)
    return "h-fit dark:bg-darkold bg-old dark:border-darkold border-old text-white"
  if (task.type == "meeting")
    return "h-fit bg-transparent dark:text-darkold text-old  dark:border-darkold border-old"
  if (task.type == "deadline" && task.pause)
    return "h-fit border-old border-2 text-white bg-mygray dark:bg-darkgray "
  if (task.type == "deadline" && isInPast)
    return "h-fit dark:border-black text-white bg-mygray dark:bg-darkgray "
  if (task.type == "deadline")
    return "h-fit dark:border-black border-darkgray bg-transparent text-darkgray dark:text-mygray"
  if (task.type == "frame" && task.pause)
    return "h-fit  dark:border-darkold text-white bg-mygray dark:bg-darkgray border-2 border-old"
  if (task.type == "frame" && isInPast)
    return "h-fit dark:border-black text-white bg-mygray dark:bg-darkgray "
  if (task.type == "frame")
    return "h-fit dark:border-black border-darkgray bg-transparent text-darkgray dark:text-mygray"
  if (isInPast) return "hidden"
  return "h-fit text-mygray bg-transparent dark:text-darkgray"
}

const errorclass = (task) => {
  // // console.log(data.selected.name != task.name, task.error)
  // if (data.selected.name != task.name && task.error) {
  //   return 'bg-old dark:bg-darkold'
  // }
  // else {
  //   task.error = false;
  //   // console.log(task, 'taskafterdel')
  //   return ''
  return ""
}

let getTaskTime = (task) => {
  let now = dayjs()
  let taskDate = dayjs(`${task.date}T${task.time}`, "YYYY-MM-DDTHH:mm")

  if (taskDate.isBefore(now.startOf("day").subtract(1, "day"))) {
    // Если задача была два дня назад или раньше
    return "давно"
  } else if (taskDate.isBefore(now.startOf("day"))) {
    // Если задача была вчера
    return "вчера"
  } else {
    // Если задача сегодня или в будущем
    if (task.type == "deadline") return dayjs(task.date).format("DD.MM")
    return task.time
  }
}

let renderTask = (task, index) => {
  let firstclass =
    index == 0
      ? "border-box border-b-02rem  border-old dark:border-darkold"
      : ""
  if (data.selected.name == task.name)
    // Редактируемый
    return html` <div
      class="${firstclass} flex flex-col gap-3 bg-white dark:bg-black p-3 rounded-lg overflow dark:text-white ${errorclass(
        task,
      )}">
      ${controlButtons(task)} ${radio(task)} ${timeSlider(task)}
      ${dateInput(task)} ${linkDivs(task)} ${() => fromLine(task)}
      <div
        id="edit"
        class="w-full whitespace-pre-wrap focus:outline-none"
        contenteditable="true"
        role="textbox"
        aria-multiline="true"
        >${task.name}${"\n" + task.note}</div
      >
      ${() => toLine(task)}
    </div>`
  // Нередактируемый
  else
    return html`
      <div
        @click="${(e) => {
          selectTask(task)
          clickPos(e)
        }}"
        class="${firstclass} flex flex-col gap-3 bg-nearwhite dark:bg-black p-3 rounded-lg overflow dark:text-white ${errorclass(
          task,
        )}">
        ${() => fromLine(task)}
        <div class="flex gap-3">
          <div
            class="${timeinputclass(
              task,
            )} text-center p-0.5 px-1 uppercase whitespace-nowrap notomono ">
            ${getTaskTime(task)}
          </div>
          <div class="w-full my-auto ">
            ${() => task.name}
            ${() => {
              if (task.note && task.note.length > 0) return "+ 📝"
            }}
          </div>
        </div>
        ${() => toLine(task)}
      </div>
    `
}

let renderTasks = () => {
  if (searchstring.text) {
    let filteredTasks = data.tasks.slice()
    // Filter tasks by matching with the search input
    filteredTasks = data.tasks.filter(
      (task) =>
        task.name &&
        task.name.toLowerCase().includes(searchstring.text.toLocaleLowerCase()),
    )
    if (filteredTasks.length === 0) {
      return html`<div
        class=" notomono flex flex-col gap-3 bg-nearwhite dark:bg-black p-3 rounded-lg overflow dark:text-white italic">
        Ничего не найдено...
      </div>`
    }
    return filteredTasks.map(renderTask)
  }

  if (
    data.visibletasks[0] &&
    (dayjs(data.visibletasks[0].time, "HH:mm").isAfter(dayjs()) ||
      data.visibletasks[0].pause)
  ) {
    let swapedtasks = data.visibletasks.slice()
    // Find the index of the first task that's due or overdue based on the current time
    let index = swapedtasks.findIndex(
      (task) =>
        dayjs(task.time + " " + task.date, "HH:mm YYYY-MM-DD").isSameOrBefore(
          dayjs(),
        ) && !task.pause,
    )

    if (index != -1) {
      // Move the due or overdue task to the start of the list
      let [task] = swapedtasks.splice(index, 1)
      swapedtasks.unshift(task)
    }
    console.log("render swapedtasks", swapedtasks)
    return swapedtasks.map(renderTask)
  }
  console.log("render", data.visibletasks)
  return data.visibletasks.map(renderTask)
}

const render = html`
  ${() => authentication()}
  <div
    class="bgimg bg-nearwhite dark:bg-black fixed w-full h-full -z-10 bg-cover"></div>
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
  <div
    class="flex pointer-events-none justify-end text-lg w-full max-w-5xl fixed bottom-0 left-1/2 -translate-x-1/2">
    <button
      @click="${plusbutton}"
      class="pointer-events-auto rounded-full plusimg text-5xl w-20 h-20 m-5 bg-old dark:bg-darkold"></button>
  </div>
  ${() => online()}
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
        const scrollPosition =
          rect.top + window.scrollY + rect.height / 2 - mouseY
        window.scroll(0, scrollPosition)
      }
    })
  })
  watch(() => {
    currentTime.slider
    const currentTimeMarker = document.getElementById("currentTimeMarker")
    if (currentTimeMarker)
      currentTimeMarker.style = "left:" + currentTime.slider + "px"
  })
  render(app)
})
