import { html } from "@arrow-js/core"
import { selectTaskById } from "~/logic/manipulate.js"
import { clickPos } from "~/logic/util.js"
import { getObjectById, getDayjsDateFromTask } from "~/logic/util"
import taskplate from "~/components/taskplate.js"

import dayjs from "dayjs"

export default (givenTask, direction) => {
  const readyTasks = []
  const notReadyTasks = []
  const notReadyFutureTasks = []

  if (!["to", "from"].includes(direction)) {
    throw new Error('The "direction" parameter should be either "to" or "from"')
  }

  const taskIds = givenTask[`${direction}Ids`]
  if (taskIds) {
    taskIds.forEach((id) => {
      const taskItem = getObjectById(id)
      const taskDate = getDayjsDateFromTask(taskItem)

      if (taskItem.ready) {
        readyTasks.push(taskItem)
      } else if (taskDate.isAfter(dayjs())) {
        notReadyFutureTasks.push(taskItem)
      } else {
        notReadyTasks.push(taskItem)
      }
    })
  }

  const assignedField = direction === "from" ? "assignedTo" : "assignedBy"
  const assignedIds = givenTask[assignedField]
  // console.log("assignedIds", direction, assignedIds, givenTask)

  const sortTasksByName = (a, b) => a.name.localeCompare(b.name)
  notReadyTasks.sort(sortTasksByName)
  notReadyFutureTasks.sort(sortTasksByName)
  readyTasks.sort(sortTasksByName)

  return html`<div class="text-sm empty:hidden flex flex-wrap gap-1 tagLine"
    >${() =>
      assignedIds?.map(
        (collaborator) => html`<div class="bg-alternative-200 dark:bg-alternative-700 p-1">${collaborator}</div>`,
      )}${() =>
      notReadyTasks.map((task) => {
        return html`<div
          @click="${(e) => {
            selectTaskById(task.id)
            clickPos(e)
            e.stopPropagation()
          }}"
          class=" text-neutral-700 dark:text-neutral-350 m-0.5 inline-block align-middle rounded-lg px-2 bg-neutral-200 dark:bg-neutral-800">
          <div class="flex h-full items-center gap-2"
            >${() => taskplate(task, "text-xs p-0.5")}<div class="p-1">${task.name}</div></div
          ></div
        >`
      })}${() =>
      notReadyFutureTasks.map((task) => {
        return html`<div
          @click="${(e) => {
            selectTaskById(task.id)
            clickPos(e)
            e.stopPropagation()
          }}"
          class=" text-neutral-700 dark:text-neutral-350 border-neutral-200 dark:border-neutral-700 border m-0.5 inline-block align-middle rounded-lg px-2 bg-white dark:bg-black">
          <div class="flex  h-full items-center gap-2"
            >${() => taskplate(task, "text-xs p-0.5")}<div class="p-1">${task.name}</div></div
          ></div
        >`
      })}${() =>
      readyTasks.map((task) => {
        return html`<div
          @click="${(e) => {
            selectTaskById(task.id)
            clickPos(e)
            e.stopPropagation()
          }}"
          class="text-neutral-400 dark:text-neutral-500 border-neutral-200 dark:border-neutral-700 border m-0.5 inline-block rounded-lg px-2">
          <div class="p-1">${task.name}</div></div
        >`
      })}</div
  >`
}
