import timeSlider from "~/components/tasks/timeslider.js"
import tagLine from "~/components/tasks/tagline.js"
import reData from "~/logic/reactive.js"
import dateInput from "~/components/tasks/dateinput.js"
import radio from "~/components/tasks/priorityRadio.js"
import linkDivs from "~/components/tasks/linkdivs.js"
import controlButtons from "~/components/tasks/controlButtons.js"
import taskPlate from "~/components/tasks/taskplate.js"
import { selectTaskById, showSaveButtonHidePause } from "~/logic/manipulate.js"
import { clickPos } from "~/logic/util.js"
import data from "~/logic/data.js"
import performance from "~/logic/performance.js"
import sort from "~/logic/sort.js"

import css from "~/css.js"

import { html } from "~/arrow-js/index.js"
import dayjs from "dayjs"

export default () => {
  performance.start("renderTasks")
  try {
    if (reData.route[0] != "tasks") return ""
    if (reData.searchString) {
      // Filter tasks by matching with the search input
      let filteredTasks = data.tasks.filter(
        (task) => task.name && task.name.toLowerCase().includes(reData.searchString.toLocaleLowerCase()),
      )
      if (filteredTasks.length === 0) {
        return html`<div
          class="fontmono flex flex-col gap-3 bg-near dark:bg-black p-3 rounded-lg overflow dark:text-white italic"
          >Ничего не найдено...</div
        >`
      }
      sort(filteredTasks)
      filteredTasks = filteredTasks.slice(0, 40)
      return filteredTasks.map(renderTask)
    }
    return reData.visibleTasks.map(renderTask)
  } finally {
    performance.end("renderTasks")
  }
}

let renderTask = (task, index) => {
  if (reData.selectedScribe == task.id) {
    // Редактируемый
    return html`<div
      id="selectedtask"
      class="-mx-3 z-[45] flex min-h-screen flex-col gap-5 bg-white dark:bg-black p-3 sm:rounded-lg overflow dark:text-white"
      ><div class="flex flex-col gap-3">
        ${controlButtons(task)}
        ${
          ""
          //radio(task)
        }
      </div>
      ${dateInput(task)} ${timeSlider(task)} ${linkDivs(task)}<div class="flex flex-col gap-3 mx-3"
        >${() => tagLine(task, "from")}<div
          id="edit"
          @input="${showSaveButtonHidePause}"
          class="ml-2 pr-5 w-full min-h-full whitespace-pre-wrap focus:outline-none"
          contenteditable="true"
          role="textbox"
          aria-multiline="true"
          ><div>${task.name}</div><div>${task.note}</div></div
        >${() => tagLine(task, "to")}</div
      >${() => renderTimeToNextTask(index)}</div
    >`
  } else {
    // Нередактируемый
    return html`<div
      @click="${(e) => {
        selectTaskById(task.id)
        clickPos(e)
      }}"
      class="flex flex-col gap-3 break-words bg-neutral-100 dark:bg-neutral-900 p-3 rounded-lg overflow dark:text-white"
      >${() => tagLine(task, "from")}<div class="ml-2 flex justify-between gap-3"
        ><div class="break-word"
          >${() => task.name}${() => {
            if (task.note && task.note.length > 0) return " 📝"
          }}</div
        ><div class="flex gap-3">${() => taskPlate(task, "p-1")}</div></div
      >${() => tagLine(task, "to")}</div
    >`
  }
}

let renderTimeToNextTask = (index) => {
  let nextTaskIndex = index + 1
  while (nextTaskIndex < reData.visibleTasks.length) {
    let nextTask = reData.visibleTasks[nextTaskIndex]
    if (nextTask.urgency === "meeting" || nextTask.urgency === "frame") {
      let now = dayjs(reData.currentTime.clock, "HH:mm")
      let nextTaskTime = dayjs(`${nextTask.date}T${nextTask.time}`, "YYYY-MM-DDTHH:mm")
      let difference = nextTaskTime.diff(now)

      let minus = difference < 0 ? "-" : ""
      difference = Math.abs(difference)
      let hours = String(Math.floor(difference / (1000 * 60 * 60))).padStart(2, "0")
      let minutes = String(Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, "0")

      return html`<div
        class="flex flex-col gap-3 break-words box-content  border-neutral-100 dark:border-neutral-900 mt-auto px-3 rounded-lg overflow dark:text-white">
        <div class="flex justify-center items-center my-auto">
          <div class="w-full my-auto"></div>
          <div
            class="h-fit border-2 border-white dark:border-black text-center uppercase whitespace-nowrap fontaccent text-sm rounded-sm p-1 text-neutral-600 dark:text-neutral-350">
            ${minus}${hours}:${minutes}
          </div>
        </div>
      </div> `
    }
    nextTaskIndex++
  }
  return
}
