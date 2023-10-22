import { html } from "@arrow-js/core"
import { selectTaskById } from "~/logic/manipulate.js"
import { clickPos } from "~/logic/util.js"
import { getObjectById, getDayjsDateFromTask } from "~/logic/util"
import taskplate from "~/components/taskplate.js"

import dayjs from "dayjs"

export default (task, direction) => {
  const readyTasks = []
  const notReadyTasks = [] // Для задач, которые не готовы и дата в прошлом/настоящем
  const notReadyFutureTasks = [] // Для задач, которые не готовы и дата в будущем

  // Проверка, чтобы убедиться, что direction имеет одно из допустимых значений
  if (!["to", "from"].includes(direction)) {
    throw new Error('The "direction" parameter should be either "toIds" or "fromIds"')
  }

  task[direction + "Ids"]?.forEach((id) => {
    const task = getObjectById(id)
    const taskDate = getDayjsDateFromTask(task)

    if (task.ready) {
      readyTasks.push(task)
    } else if (taskDate.isAfter(dayjs())) {
      notReadyFutureTasks.push(task)
    } else {
      notReadyTasks.push(task)
    }
  })

  notReadyTasks.sort((a, b) => a.name.localeCompare(b.name))
  notReadyFutureTasks.sort((a, b) => a.name.localeCompare(b.name))
  readyTasks.sort((a, b) => a.name.localeCompare(b.name))

  return html`<div class="text-sm empty:hidden"
    >${() =>
      notReadyTasks.map((task) => {
        return html`<span class="inline-block"
          ><div
            @click="${(e) => {
              selectTaskById(task.id)
              clickPos(e)
              e.stopPropagation()
            }}"
            class=" text-neutral-700 dark:text-neutral-350 m-0.5 inline-block align-middle rounded-lg px-2 bg-neutral-200 dark:bg-neutral-800">
            <div class="flex h-full items-center gap-2"
              >${() => taskplate(task, "text-xs")}<div class="">${() => task.name}</div></div
            ></div
          ></span
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
            >${() => taskplate(task, "text-xs")}<div class="">${() => task.name}</div></div
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
          ${task.name}</div
        >`
      })}</div
  >`
}
