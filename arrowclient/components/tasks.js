import timeSlider from "/components/timeslider.js"
import fromLine from "/components/fromline.js"
import toLine from "/components/toline.js"
import { searchstring, data } from "/logic/reactive.js"
import dateInput from "/components/dateinput.js"
import radio from "/components/priorityRadio.js"
import linkDivs from "/components/linkdivs.js"
import controlButtons from "/components/controlButtons.js"
import taskPlate from "/components/taskplate.js"
import { selectTask } from "/logic/manipulate.js"
import { clickPos } from "/logic/util.js"

import dayjs from "dayjs"
import { html } from "@arrow-js/core"
let firststicky = true

export let renderTasks = () => {
  firststicky = true
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
  return data.visibletasks.map(renderTask)
}
let renderTask = (task, index) => {
  let firstclass
  if (task.ready) firstclass += "border-box border-b-02rem border-green-500 dark:border-green-900"
  else firstclass = index == 0 ? "border-box border-b-02rem border-old dark:border-darkold " : ""
  if (task.type == "meeting" && firststicky) {
    firstclass += "sticky bottom-0"
    firststicky = false
  }
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
    return html` <div
      @click="${(e) => {
        selectTask(task)
        clickPos(e)
      }}"
      class="${firstclass} flex flex-col gap-3 break-words bg-nearwhite dark:bg-black p-3 rounded-lg overflow dark:text-white ${errorclass(
        task,
      )}">
      ${() => fromLine(task)}
      <div class="flex gap-3">
        ${() => taskPlate(task)}
        <div class="w-full my-auto ">
          ${() => task.name}
          ${() => {
            if (task.note && task.note.length > 0) return "+ 📝"
          }}
        </div>
      </div>
      ${() => toLine(task)}
    </div>`
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
