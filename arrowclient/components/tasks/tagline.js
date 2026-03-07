import { html, reactive } from "~/arrow-js/index.js"
import { selectTaskById } from "~/logic/manipulate.js"
import { clickPos } from "~/logic/util.js"
import { getObjectById, getDayjsDateFromTask } from "~/logic/util"
import taskplate from "~/components/tasks/taskplate.js"
import { relationIcon } from "~/components/tasks/svgicon.js"
import { showSaveButtonHidePause } from "~/logic/manipulate.js"
import reData from "~/logic/reactive.js"
import data from "~/logic/data.js"
import { sendRelation } from "~/logic/send.js"
import sort from "~/logic/sort.js"

import dayjs from "dayjs"

function removeTaskFromLists(givenTask, taskId) {
  showSaveButtonHidePause()
  givenTask = reData.visibleTasks.find((t) => t.id === givenTask.id) || givenTask
  if (!givenTask?.id) return false

  let removedAny = false
  const relations = data.tasks.getRelations(givenTask.id)
  const incoming = data.tasks.getIncomingRelations(givenTask.id)
  ;[...relations.blocks, ...relations.leads].forEach((id) => {
    if (id === taskId) {
      removedAny = true
      data.tasks.removeRelation(givenTask.id, taskId)
      sendRelation({
        added: null,
        removed: {
          from: givenTask.id,
          to: taskId,
          type: relations.blocks.includes(id) ? "blocks" : "leads",
        },
      })
    }
  })
  ;[...incoming.blocks, ...incoming.leads].forEach((id) => {
    if (id === taskId) {
      removedAny = true
      data.tasks.removeRelation(id, givenTask.id)
      sendRelation({
        added: null,
        removed: {
          from: id,
          to: givenTask.id,
          type: incoming.blocks.includes(id) ? "blocks" : "leads",
        },
      })
    }
  })
  return removedAny
}

// Таймер для долгого тапа
let pressTimer = null

function handleTouchStart(e, taskId, givenTask) {
  pressTimer = setTimeout(() => {
    removeTaskFromLists(givenTask, taskId)
    e.stopPropagation()
  }, 600)
}

function handleTouchEnd() {
  clearTimeout(pressTimer)
}

export default (givenTask, direction) => {
  if (!["to", "from"].includes(direction)) {
    throw new Error('The "direction" parameter should be either "to" or "from"')
  }

  // Собираем связанные задачи и заранее считаем флаги
  let relatedTasks = []
  if (direction === "to") {
    const { blocks, leads } = data.tasks.getRelations(givenTask.id)
    relatedTasks = reactive(
      [...blocks, ...leads].map((id) => {
        const task = getObjectById(id)
        return reactive({
          ...task,
          hasOutgoing:
            data.tasks.getRelations(task.id).blocks.length > 0 || data.tasks.getRelations(task.id).leads.length > 0,
          hasBlockRelation: blocks.includes(id),
        })
      }),
    )
  } else {
    const incoming = data.tasks.getIncomingRelations(givenTask.id)
    relatedTasks = reactive(
      [...incoming.blocks, ...incoming.leads].map((id) => {
        const task = getObjectById(id)
        return reactive({
          ...task,
          hasIncoming:
            data.tasks.getIncomingRelations(task.id).blocks.length > 0 ||
            data.tasks.getIncomingRelations(task.id).leads.length > 0,
          hasBlockRelation: incoming.blocks.includes(id),
        })
      }),
    )
  }

  // Отсортировать по имени
  // relatedTasks.sort((a, b) => a.name.localeCompare(b.name))
  sort(relatedTasks)

  if (!relatedTasks.length) return html``

  const listPaddingClass = direction === "from" ? "px-2 pt-2 pb-0" : "px-2 pt-0 pb-2"

  return html`
    <div
      class="text-xs flex max-h-60 overflow-y-auto flex-col gap-2 bg-neutral-50 dark:bg-neutral-900 ${listPaddingClass}">
      ${() =>
        relatedTasks.map((task) => {
          const showCorner = direction === "to" ? task.hasOutgoing : task.hasIncoming
          const cornerbox = showCorner ? (direction === "to" ? "corner-box-bottom-right" : "corner-box-top-left") : ""

          const lockIcon = html`<button
            type="button"
            class="${() => `ml-1 p-1 cursor-pointer ${task.hasBlockRelation ? "text-accent" : "text-neutral-600 dark:text-neutral-400"}`}"
            @click="${(e) => {
              e.stopPropagation()
              const ts = Date.now()
              if (direction === "to") {
                if (task.hasBlockRelation) {
                  data.tasks.addLead(givenTask.id, task.id, ts)
                  sendRelation({
                    added: { from: givenTask.id, to: task.id, type: task.hasBlockRelation ? "leads" : "blocks", ts },
                    removed: { from: givenTask.id, to: task.id, type: task.hasBlockRelation ? "blocks" : "leads" },
                  })
                } else {
                  data.tasks.addBlock(givenTask.id, task.id)
                  sendRelation({
                    added: { from: givenTask.id, to: task.id, type: task.hasBlockRelation ? "leads" : "blocks", ts },
                    removed: { from: givenTask.id, to: task.id, type: task.hasBlockRelation ? "blocks" : "leads" },
                  })
                }
              } else {
                if (task.hasBlockRelation) {
                  data.tasks.addLead(task.id, givenTask.id, ts)
                  sendRelation({
                    added: { from: task.id, to: givenTask.id, type: task.hasBlockRelation ? "leads" : "blocks", ts },
                    removed: { from: task.id, to: givenTask.id, type: task.hasBlockRelation ? "blocks" : "leads" },
                  })
                } else {
                  data.tasks.addBlock(task.id, givenTask.id)
                  sendRelation({
                    added: { from: task.id, to: givenTask.id, type: task.hasBlockRelation ? "leads" : "blocks", ts },
                    removed: { from: task.id, to: givenTask.id, type: task.hasBlockRelation ? "blocks" : "leads" },
                  })
                }
              }
              task.hasBlockRelation = !task.hasBlockRelation
            }}">
            ${() => relationIcon(task.hasBlockRelation ? "blocks" : "leads")}
          </button>`

          return html` <div class="flex items-center gap-1">
            ${() => lockIcon}
            <div
              @click="${(e) => {
                selectTaskById(task.id)
                clickPos(e)
                e.stopPropagation()
              }}"
              @contextmenu="${(e) => {
                e.preventDefault()
                const removed = removeTaskFromLists(givenTask, task.id)
                if (removed) {
                  const index = relatedTasks.findIndex((t) => t.id === task.id)
                  if (index !== -1) relatedTasks.splice(index, 1)
                }
                e.stopPropagation()
              }}"
              @touchstart="${(e) => handleTouchStart(e, task.id, givenTask)}"
              @touchend="${handleTouchEnd}"
              class="${cornerbox} text-neutral-700 dark:text-neutral-350 px-3 p-2 mx-1 inline-block align-middle rounded-lg border border-neutral-150 dark:border-neutral-800 bg-white dark:bg-black">
              <div class="flex h-full gap-1.5 items-center">
                <div class="break-word">${task.name}</div>
                ${() => taskplate(task, "text-xxs ml-auto")}
              </div>
            </div>
          </div>`
        })}
    </div>
  `
}
