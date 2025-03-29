import { html } from "~/arrow-js/index.js"
import { selectTaskById } from "~/logic/manipulate.js"
import { clickPos } from "~/logic/util.js"
import { getObjectById, getDayjsDateFromTask } from "~/logic/util"
import taskplate from "~/components/tasks/taskplate.js"
import reData from "~/logic/reactive.js"

import dayjs from "dayjs"

function removeTaskFromList(givenTask, listName, taskId) {
  givenTask = reData.visibleTasks.find((t) => t.id === givenTask.id)

  if (Array.isArray(givenTask[listName])) {
    const idx = givenTask[listName].indexOf(taskId)
    if (idx !== -1) {
      givenTask[listName].splice(idx, 1)
    }
  }
}

// Таймер для долгого тапа
let pressTimer = null

function handleTouchStart(e, taskId, givenTask, listNames = []) {
  // Ставим таймер – если пользователь удерживает палец более 600 мс, удаляем из нужных списков
  pressTimer = setTimeout(() => {
    listNames.forEach((ln) => removeTaskFromList(givenTask, ln, taskId))
    e.stopPropagation()
  }, 600)
}

function handleTouchEnd() {
  clearTimeout(pressTimer)
}
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
    importantTasks.push(taskItem)
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

  return html`<div class="text-xs flex ">
    ${() => {
      const bg =
        direction == "to" ? "bg-opens dark:bg-opens-dark pb-2" : "bg-blocked dark:bg-blocked-dark pt-2 justify-end"
      return html`<div class="max-h-60 overflow-y-auto flex gap-2 flex-col ${bg} w-1/2">
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
              @contextmenu="${(e) => {
                e.preventDefault()
                // Удалим задачу из разных списков
                if (direction == "to") removeTaskFromList(givenTask, "toIds", task.id)
                if (direction == "from") removeTaskFromList(givenTask, "fromIds", task.id)
                e.stopPropagation()
              }}"
              @touchstart="${(e) => handleTouchStart(e, task.id, givenTask, ["toIds", "moreImportantIds"])}"
              @touchend="${handleTouchEnd}"
              class="${cornerbox} text-neutral-700 dark:text-neutral-350 px-3 p-2 mx-1 inline-block align-middle rounded-lg border border-neutral-150 dark:border-neutral-800 bg-white dark:bg-black">
              <div class="flex h-full gap-1 items-center"
                ><div class="break-word">${task.name}</div>${() => taskplate(task, "text-xxs ml-auto")}</div
              ></div
            >`
          })}
      </div>`
    }}
    ${() => {
      const bg =
        direction == "to"
          ? "bg-lessimportant dark:bg-lessimportant-dark pb-2"
          : "bg-moreimportant dark:bg-moreimportant-dark pt-2 justify-end"
      return html`<div class="max-h-60 overflow-y-auto flex gap-2 flex-col ${bg} w-1/2">
        ${() => {
          return importantTasks.map((task) => {
            let cornerbox = ""
            if (task.toIds?.length && direction == "to") cornerbox = "corner-box-bottom-right"
            if (task.fromIds?.length && direction == "from") cornerbox = "corner-box-top-left"
            return html`<div
              @click="${(e) => {
                selectTaskById(task.id)
                clickPos(e)
                e.stopPropagation()
              }}"
              @contextmenu="${(e) => {
                e.preventDefault()
                // Удалим задачу из разных списков
                if (direction == "from") removeTaskFromList(givenTask, "moreImportantIds", task.id)
                if (direction == "to") removeTaskFromList(givenTask, "lessImportantIds", task.id)

                e.stopPropagation()
              }}"
              @touchstart="${(e) => handleTouchStart(e, task.id, givenTask, ["toIds", "moreImportantIds"])}"
              @touchend="${handleTouchEnd}"
              class="${cornerbox} text-neutral-700 dark:text-neutral-350 px-3 p-2 mx-1 inline-block align-middle rounded-lg border bg-white dark:bg-black border-neutral-150 dark:border-neutral-800">
              <div class="flex h-full gap-1 items-center"
                ><div class="break-word">${task.name}</div>${() => taskplate(task, "text-xxs ml-auto")}</div
              ></div
            >`
          })
        }}
      </div>`
    }}
  </div>`
}

// не удалять ни в коем случае!
//  ${() =>
//               assignedIds?.map((collaboratorId) => {
//                 if (
//                   (direction == "from" && collaboratorId != givenTask.assignedBy && collaboratorId != reData.user.id) ||
//                   (direction == "to" && collaboratorId != reData.user.id)
//                 ) {
//                   let theCollaborator = reData.collaborators.find((cb) => cb.id === collaboratorId)
//                   return html`<div
//                     class="text-neutral-700 dark:text-neutral-350 px-3 py-2 mx-1 inline-block align-middle rounded-lg bg-white dark:bg-neutral-800">
//                     <div class="flex h-full break-word items-center"
//                       >${theCollaborator?.name || collaboratorId}</div
//                     ></div
//                   >`
//                 }
//               })}
