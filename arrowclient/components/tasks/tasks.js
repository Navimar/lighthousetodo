import timeSlider from "~/components/tasks/timeslider.js"
import tagLine from "~/components/tasks/tagline.js"
import reData from "~/logic/reactive.js"
import dateInput from "~/components/tasks/dateinput.js"
import controlButtons from "~/components/tasks/controlButtons.js"
import taskPlate from "~/components/tasks/taskplate.js"
import { selectTaskById, showSaveButtonHidePause } from "~/logic/manipulate.js"
import { clickPos } from "~/logic/util.js"
import data from "~/logic/data.js"
import performance from "~/logic/performance.js"
import sort from "~/logic/sort.js"
import addConnection from "~/components/tasks/addConnection.js"
import hiddenData from "~/components/tasks/hiddenData.js"

import { html } from "~/arrow-js/index.js"

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
      class="-mx-3 z-[45] flex min-h-screen flex-col bg-white dark:bg-black p-3 sm:rounded-lg overflow dark:text-white"
      >${timeSlider(task)}${dateInput(task)}
      <div class="mt-14"> ${controlButtons(task)}</div>
      <div class="flex my-16 flex-col "
        >${() => tagLine(task, "from")} ${() => addConnection(task, "from")}<div
          id="edit"
          @input="${showSaveButtonHidePause}"
          class="mx-2 py-16 min-h-full whitespace-pre-wrap focus:outline-none"
          contenteditable="true"
          role="textbox"
          aria-multiline="true"
          ><div>${task.name}</div>${task.note && html`<div>${task.note}</div>`}</div
        >${() => addConnection(task, "to")} ${() => tagLine(task, "to")}</div
      >
    </div>`
  } else {
    // Нередактируемый
    let cornerClass = ""
    if (task.toIds?.length && task.fromIds?.length) {
      cornerClass = "corner-box-both-corners"
    } else if (task.toIds?.length) {
      cornerClass = "corner-box-bottom-right"
    } else if (task.fromIds?.length) {
      cornerClass = "corner-box-top-left"
    }
    return html`<div
      @click="${(e) => {
        selectTaskById(task.id)
        clickPos(e)
      }}"
      class="${cornerClass} flex flex-col break-words bg-neutral-100 dark:bg-neutral-950 p-3 rounded-lg overflow dark:text-white"
      ><div class=" ml-2 flex justify-between gap-3"
        ><div class=" break-word"
          >${() => task.name}${() => {
            if (task.note && task.note.length > 0)
              return html`<div class="text-gray-800 dark:text-gray-300 text-[0.5rem]">${maskString(task.note)}</div>`
          }}</div
        ><div class="flex items-center gap-3">${() => taskPlate(task, "px-1")}</div></div
      ></div
    >`
  }
}

function maskString(str, char = "◻", n = 10) {
  if (!char || char.length !== 1) {
    throw new Error("Аргумент 'char' должен быть одним символом.")
  }

  let masked = ""
  for (let i = 0; i < str.length && masked.length < n; i++) {
    const currentChar = str[i]
    if (currentChar === " " || currentChar === "\n") {
      masked += currentChar
    } else {
      masked += char
    }
  }

  return masked.slice(0, n)
}
