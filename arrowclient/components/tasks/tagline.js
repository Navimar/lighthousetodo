import { html } from "~/arrow-js/index.js"
import { selectTaskById } from "~/logic/manipulate.js"
import { clickPos } from "~/logic/util.js"
import { getObjectById, getDayjsDateFromTask } from "~/logic/util"
import taskplate from "~/components/tasks/taskplate.js"
import reData from "~/logic/reactive.js"

import dayjs from "dayjs"

export default (givenTask, direction) => {
  const readyTasks = []
  const notReadyTasks = []
  const notReadyFutureTasks = []
  const importantTasks = []

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

  const importantField = direction === "from" ? "moreImportantIds" : "lessImportantIds"
  givenTask[importantField]?.forEach((id) => {
    const taskItem = getObjectById(id)
    if (!taskItem.ready) importantTasks.push(taskItem)
  })

  const assignedField = direction === "from" ? "assignedTo" : "assignedBy"
  let assignedIds = givenTask[assignedField]
  if (direction == "to") assignedIds = [assignedIds]

  const sortTasksByName = (a, b) => a.name.localeCompare(b.name)
  notReadyTasks.sort(sortTasksByName)
  notReadyFutureTasks.sort(sortTasksByName)
  readyTasks.sort(sortTasksByName)
  importantTasks.sort(sortTasksByName)

  return html`<div class="text-sm empty:hidden flex flex-wrap gap-1 tagLine max-h-32 overflow-y-auto"
    >${() =>
      assignedIds?.map((collaboratorId) => {
        if (
          (direction == "from" && collaboratorId != givenTask.assignedBy && collaboratorId != reData.user.id) ||
          (direction == "to" && collaboratorId != reData.user.id)
        ) {
          let theCollaborator = reData.collaborators.find((cb) => cb.id === collaboratorId)
          return html`<div
            class="text-neutral-700 dark:text-neutral-350 bg-alternative-200 dark:bg-alternative-700 px-2 m-0.5 border border-neutral-200 dark:border-neutral-700 rounded-lg"
            ><div class="flex h-full break-word items-center">${theCollaborator?.name || collaboratorId}</div></div
          >`
        }
      })}${() =>
      notReadyTasks.map((task) => {
        let cornerbox = ""
        if (task.toIds?.length && direction == "to") cornerbox = "corner-box-bottom-right"
        if (task.fromIds?.length && direction == "from") cornerbox = "corner-box-top-left"
        return html`<div
          @click="${(e) => {
            selectTaskById(task.id)
            clickPos(e)
            e.stopPropagation()
          }}"
          class="${cornerbox} text-neutral-700 dark:text-neutral-350 m-0.5 inline-block align-middle rounded-lg px-2 bg-neutral-200 dark:bg-neutral-800">
          <div class="flex h-full items-center"
            ><div class="p-1 break-word">${task.name}</div>${() => taskplate(task, "text-xs p-0.5")}</div
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
          class="text-neutral-700 dark:text-neutral-350 border-neutral-200 dark:border-neutral-700 border m-0.5 inline-block align-middle rounded-lg px-2 bg-white dark:bg-black">
          <div class="flex  h-full items-center"
            ><div class="p-1 break-word">${task.name}</div>${() => taskplate(task, "text-xs p-0.5")}</div
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
          <div class="p-1 break-word">${task.name}</div></div
        >`
      })}${() =>
      importantTasks.map((task) => {
        return html`<div
          @click="${(e) => {
            selectTaskById(task.id)
            clickPos(e)
            e.stopPropagation()
          }}"
          class="text-neutral-700 dark:text-neutral-350 border border-gray-500 dark:border-gray-600 bg-neutral-200 dark:bg-neutral-800 m-0.5 inline-block align-middle rounded-lg px-2">
          <div class="flex h-full items-center"
            ><div class="p-1 break-word">${task.name}</div>${() => taskplate(task, "text-xs p-0.5")}</div
          ></div
        >`
      })}</div
  >`
}
