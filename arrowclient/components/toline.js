import { html } from "@arrow-js/core"
import { selectTask } from "~/logic/manipulate.js"
import { clickPos } from "~/logic/util.js"
import { getObjectByName, getDayjsDateFromTask } from "~/logic/util"
import taskplate from "~/components/taskplate.js"

import dayjs from "dayjs"

export default (task) => {
  const readyNames = []
  const notReadyNames = [] // Для задач, которые не готовы и дата в прошлом/настоящем
  const notReadyFutureNames = [] // Для задач, которые не готовы и дата в будущем

  task.toNames?.forEach((name) => {
    const obj = getObjectByName(name)
    const taskDate = getDayjsDateFromTask(obj)

    if (!obj) console.log("неизвестный obj в тегах", name)
    if (!obj || obj.ready) {
      readyNames.push(name)
    } else {
      if (taskDate.isAfter(dayjs())) {
        // Проверка, что дата задачи в будущем
        notReadyFutureNames.push(name)
      } else {
        notReadyNames.push(name)
      }
    }
  })

  return html`<div class=" text-sm empty:hidden"
    >${() =>
      notReadyNames.map((to) => {
        return html`<span class="inline-block"
          ><div
            @click="${(e) => {
              selectTask(to)
              clickPos(e)
              e.stopPropagation()
            }}"
            class=" text-white dark:text-lightgray m-0.5 inline-block align-top  rounded-lg px-2 bg-mygray dark:bg-nearblack">
            <div class="flex h-full items-center gap-2"
              >${() => taskplate(getObjectByName(to), "text-xs")}<div class="">${() => to}</div></div
            ></div
          ></span
        >`
      })}${() =>
      notReadyFutureNames.map((to) => {
        return html`<div
          @click="${(e) => {
            selectTask(to)
            clickPos(e)
            e.stopPropagation()
          }}"
          class=" text-nearblack dark:text-lightgray m-0.5 inline-block align-top rounded-lg px-2 bg-white dark:bg-nearblack">
          <!-- Можете изменить стили для будущих задач -->
          <div class="flex  h-full items-center gap-2"
            >${() => taskplate(getObjectByName(to), "text-xs")}<div class="">${() => to}</div></div
          ></div
        >`
      })}${() =>
      readyNames.map((to) => {
        return html`<div
          @click="${(e) => {
            selectTask(to)
            clickPos(e)
            e.stopPropagation()
          }}"
          class="text-darkgray dark:text-mygray m-0.5 inline-block rounded-lg px-2">
          ${to}</div
        >`
      })}</div
  >`
}
