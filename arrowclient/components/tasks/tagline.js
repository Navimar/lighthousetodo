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

  // Объединение в нужном порядке
  notReadyTasks.sort(sortTasksByName)
  notReadyFutureTasks.sort(sortTasksByName)
  readyTasks.sort(sortTasksByName)
  const mainTasks = [...notReadyTasks, ...notReadyFutureTasks, ...readyTasks]

  importantTasks.sort(sortTasksByName)

  if (!mainTasks.length && !importantTasks.length) {
    return html``
  }

  return html`<div class="text-xs max-h-60 flex overflow-y-auto">
    ${mainTasks.length
      ? html`<div class="flex gap-2 flex-col w-1/2">
          ${() =>
            assignedIds?.map((collaboratorId) => {
              if (
                (direction == "from" && collaboratorId != givenTask.assignedBy && collaboratorId != reData.user.id) ||
                (direction == "to" && collaboratorId != reData.user.id)
              ) {
                let theCollaborator = reData.collaborators.find((cb) => cb.id === collaboratorId)
                return html`<div
                  class="text-neutral-700 dark:text-neutral-350 px-3 py-2 mx-1 inline-block align-middle rounded-lg bg-neutral-200 dark:bg-neutral-800">
                  <div class="flex h-full break-word items-center">${theCollaborator?.name || collaboratorId}</div></div
                >`
              }
            })}
          ${() =>
            mainTasks.map((task) => {
              let cornerbox = ""
              if (task.toIds?.length && direction == "to") cornerbox = "corner-box-bottom-right"
              if (task.fromIds?.length && direction == "from") cornerbox = "corner-box-top-left"
              return html`<div
                @click="${(e) => {
                  selectTaskById(task.id)
                  clickPos(e)
                  e.stopPropagation()
                }}"
                class="${cornerbox} text-neutral-700 dark:text-neutral-350 px-3 py-1 mx-1 inline-block align-middle rounded-lg border border-neutral-200 dark:border-neutral-600 bg-neutral-200 dark:bg-neutral-800">
                <div class="flex h-full items-center"
                  ><div class="break-word">${task.name}</div>${() => taskplate(task, "text-xxs ml-auto")}</div
                ></div
              >`
            })}
        </div>`
      : ""}
    ${importantTasks.length
      ? html`<div class="flex gap-2 flex-col w-1/2">
          ${() =>
            importantTasks.map((task) => {
              return html`<div
                @click="${(e) => {
                  selectTaskById(task.id)
                  clickPos(e)
                  e.stopPropagation()
                }}"
                class="text-neutral-700 dark:text-neutral-350 px-3 py-1 mx-1 inline-block align-middle rounded-lg border border-neutral-200 dark:border-neutral-600">
                <div class="flex h-full items-center"
                  ><div class="break-word">${task.name}</div>${() => taskplate(task, "text-xxs ml-auto")}</div
                ></div
              >`
            })}
        </div>`
      : ""}
  </div>`
}
