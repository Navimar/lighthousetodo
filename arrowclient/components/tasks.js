import timeSlider from "~/components/timeslider.js"
import tagLine from "~/components/tagline.js"
import { searchstring, reData, selected } from "~/logic/reactive.js"
import dateInput from "~/components/dateinput.js"
import radio from "~/components/priorityRadio.js"
import linkDivs from "~/components/linkdivs.js"
import controlButtons from "~/components/controlButtons.js"
import taskPlate from "~/components/taskplate.js"
import { selectTaskById } from "~/logic/manipulate.js"
import { clickPos } from "~/logic/util.js"
import data from "~/logic/data.js"
import { sort } from "~/logic/makevisible.js"
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
        class=" fontmono flex flex-col gap-3 bg-near dark:bg-black p-3 rounded-lg overflow dark:text-white italic">
        Ничего не найдено...
      </div>`
    }
    // sort(filteredTasks)
    return filteredTasks.map(renderTask)
  }
  return reData.visibletasks.map(renderTask)
}

let renderTask = (task, index) => {
  let firstclass
  let sticky = ""
  if (task.ready) firstclass += "border-box border-b-02rem border-compliment dark:border-compliment"
  else firstclass = index == 0 ? "border-box border-b-02rem border-accent dark:border-accent-dark " : ""
  if (task.type == "meeting" && firststicky) {
    sticky = "sticky bottom-0"
    firststicky = false
  }
  if (selected.id == task.id)
    // Редактируемый
    return html` <div
      id="selectedtask"
      class="${firstclass} -mx-3 z-[45] flex min-h-screen flex-col gap-5 bg-white dark:bg-black p-3 sm:rounded-lg overflow dark:text-white ${errorclass(
        task,
      )}">
      <div class="flex flex-col gap-3"> ${controlButtons(task)} ${radio(task)}</div> ${dateInput(task)} ${timeSlider(
        task,
      )}  
      ${linkDivs(task)}
      <div class="flex flex-col gap-3 ml-3"
        >${() => tagLine(task, "from")}
        <div
          id="edit"
          class="ml-2 pr-5 w-full min-h-full whitespace-pre-wrap focus:outline-none"
          contenteditable="true"
          role="textbox"
          aria-multiline="true"
          ><div
            >${task.name}</div
              ><div>${task.note}</div
              ></div>
              ${() => tagLine(task, "to")}
            </div></div
          ></div
        ></div
      ></div
    >`
  // Нередактируемый
  else
    return html` <div
      @click="${(e) => {
        selectTaskById(task.id)
        clickPos(e)
      }}"
      class="${sticky} ${firstclass} flex flex-col gap-3 break-words bg-neutral-100 dark:bg-neutral-900 p-3 rounded-lg overflow dark:text-white ${errorclass(
        task,
      )}">
      ${() => tagLine(task, "from")}
      <div class="ml-2 flex gap-3">
        <div class="w-full my-auto ">
          ${() => task.name}
          ${() => {
            if (task.note && task.note.length > 0) return "+ 📝"
          }}
        </div>
        ${() => taskPlate(task)}
      </div>
      ${() => tagLine(task, "to")}
    </div>`
}

const errorclass = (task) => {
  // // console.log(selected.task.name != task.name, task.error)
  // if (selected.task.name != task.name && task.error) {
  //   return 'bg-accent dark:bg-accent-dark'
  // }
  // else {
  //   task.error = false;
  //   // console.log(task, 'taskafterdel')
  //   return ''
  return ""
}
