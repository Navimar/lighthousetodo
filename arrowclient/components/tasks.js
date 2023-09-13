import timeSlider from "/components/timeslider.js"
import fromLine from "/components/fromline.js"
import toLine from "/components/toline.js"
import { searchstring, data } from "/logic/reactive.js"
import dateInput from "/components/dateinput.js"
import radio from "/components/priorityRadio.js"
import linkDivs from "/components/linkdivs.js"
import controlButtons from "/components/controlButtons.js"
import { selectTask } from "/logic/manipulate.js"
import { clickPos } from "/logic/util.js"

import dayjs from "dayjs"
import { html } from "@arrow-js/core"

export let renderTasks = () => {
  if (searchstring.text) {
    let filteredTasks = data.tasks.slice()
    // Filter tasks by matching with the search input
    filteredTasks = data.tasks.filter(
      (task) => task.name && task.name.toLowerCase().includes(searchstring.text.toLocaleLowerCase()),
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
    (dayjs(data.visibletasks[0].time, "HH:mm").isAfter(dayjs()) || data.visibletasks[0].pause)
  ) {
    let swapedtasks = data.visibletasks.slice()
    // Find the index of the first task that's due or overdue based on the current time
    let index = swapedtasks.findIndex(
      (task) => dayjs(task.time + " " + task.date, "HH:mm YYYY-MM-DD").isSameOrBefore(dayjs()) && !task.pause,
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

let renderTask = (task, index) => {
  let firstclass = index == 0 ? "border-box border-b-02rem  border-old dark:border-darkold" : ""
  if (task.ready) firstclass += " border-4 border-green-500"
  if (data.selected.name == task.name)
    // Редактируемый
    return html` <div
      class="${firstclass} flex flex-col gap-3 bg-white dark:bg-black p-3 rounded-lg overflow dark:text-white ${errorclass(
        task,
      )}">
      ${controlButtons(task)} ${radio(task)} ${timeSlider(task)} ${dateInput(task)} ${linkDivs(task)}
      ${() => fromLine(task)}
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
          <div class="${timeinputclass(task)}"> ${getTaskTime(task)} </div>
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

const timeinputclass = (task) => {
  let taskDate = dayjs(`${task.date}T${task.time}`, "YYYY-MM-DDTHH:mm")
  let gc = " text-center  px-1 uppercase whitespace-nowrap notomono"
  let isInPast = dayjs().isAfter(taskDate)
  if (task.type == "meeting" && task.pause) return "h-fit border-2 border-red-500"
  if (task.type == "meeting" && isInPast)
    return "h-fit dark:bg-darkold bg-old dark:border-darkold border-old text-white" + gc
  if (task.type == "meeting")
    return "h-fit bg-transparent dark:text-darkold text-old  dark:border-darkold border-old" + gc
  if (task.type == "deadline" && task.pause)
    return "h-fit border-old border-2 text-white bg-mygray dark:bg-darkgray" + gc
  if (task.type == "deadline" && isInPast) return "h-fit dark:border-black text-white bg-mygray dark:bg-darkgray" + gc
  if (task.type == "deadline")
    return "h-fit dark:border-black border-darkgray bg-transparent text-darkgray dark:text-mygray" + gc
  if (task.type == "frame" && task.pause)
    return "h-fit  dark:border-darkold text-white bg-mygray dark:bg-darkgray border-2 border-old" + gc
  if (task.type == "frame" && isInPast)
    return "h-fit dark:border-black text-white bg-mygray dark:bg-darkgray border-2 border-mygray" + gc
  if (task.type == "frame")
    return (
      "h-fit dark:border-black border-darkgray bg-transparent text-darkgray border-2 border-transparent dark:text-mygray" +
      gc
    )
  if (isInPast) return "hidden"
  return "h-fit text-mygray bg-transparent dark:text-darkgray" + gc
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
