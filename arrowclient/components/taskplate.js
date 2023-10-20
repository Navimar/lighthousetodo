import { html } from "@arrow-js/core"
import dayjs from "dayjs"

export default (task, additionalClass = "") => {
  let taskDate = dayjs(`${task.date}T${task.time}`, "YYYY-MM-DDTHH:mm")
  let gc = " h-fit border-2 box-border text-center px-1 uppercase whitespace-nowrap notomono " + additionalClass
  let isInPast = dayjs().isAfter(taskDate)

  let getTaskTime = () => {
    if (task.type == "deadline" && isInPast) return ""
    return task.time
  }

  let getTaskDay = () => {
    let now = dayjs()
    let taskDate = dayjs(`${task.date}T${task.time}`, "YYYY-MM-DDTHH:mm")

    if (taskDate.isBefore(now.startOf("day").subtract(1, "day"))) {
      // Если задача была два дня назад или раньше
      return "давно"
    } else if (taskDate.isBefore(now.startOf("day"))) {
      // Если задача была вчера
      return "вчера"
    } else if (task.type == "deadline" && taskDate.isSame(now, "day")) {
      // Если задача была сегодня
      return "сёдня"
    } else if (task.type == "deadline") {
      return dayjs(task.date).format("DD.MM")
    } else return ""
  }

  const timeClass = () => {
    if (task.type == "meeting" && task.pause) return "text-white bg-accent dark:bg-accent-dark border-red-600" + gc
    if (task.type == "meeting" && isInPast) return "text-white bg-accent dark:bg-accent-dark border-transparent" + gc
    if (task.type == "meeting") return "text-accent dark:text-accent-dark border-neutral-200 dark:border-black" + gc
    if (task.type == "deadline" && task.pause)
      return "text-white bg-neutral-400 dark:bg-neutral-700 border-red-600" + gc
    if (task.type == "deadline" && isInPast)
      return "text-white bg-neutral-400 dark:bg-neutral-700 border-transparent" + gc
    if (task.type == "deadline") return "text-neutral-500 border-neutral-200 dark:border-black" + gc
    if (task.type == "frame" && task.pause) return "text-white bg-neutral-400 dark:bg-neutral-700 border-red-600" + gc
    if (task.type == "frame" && isInPast) return "text-white bg-neutral-400 dark:bg-neutral-700 border-transparent" + gc
    if (task.type == "frame") return "text-neutral-500 border-neutral-200 dark:border-black" + gc
    if (isInPast) return "hidden" + gc
    return "text-neutral-350 border-transparent" + gc
  }

  return html`<div class="text-sm empty:hidden ${timeClass()}">${getTaskDay()}</div
    ><div class="text-sm empty:hidden ${timeClass()}">${getTaskTime()}</div>`
}
