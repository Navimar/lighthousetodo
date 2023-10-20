import { html } from "@arrow-js/core"
import dayjs from "dayjs"

export default (task, additionalClass = "") => {
  let taskDate = dayjs(`${task.date}T${task.time}`, "YYYY-MM-DDTHH:mm")
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
      return "сегодня"
    } else if (task.type == "deadline") {
      return dayjs(task.date).format("DD.MM")
    } else return ""
  }

  const timeClass = () => {
    if (task.type == "meeting" && task.pause)
      return "text-neutral-600 bg-accent dark:bg-accent-dark border-accent dark:border-accent-dark"
    if (task.type == "meeting" && isInPast)
      return "text-neutral-100 dark:text-neutral-200 bg-accent dark:bg-accent-dark border-transparent"
    if (task.type == "meeting") return "text-accent dark:text-accent-dark border-neutral-200 dark:border-neutral-800"
    if (task.type == "deadline" && task.pause)
      return "text-neutral-600 dark:text-neutral-350 bg-neutral-200 dark:bg-neutral-800 border-accent dark:border-accent-dark"
    if (task.type == "deadline" && isInPast)
      return "text-neutral-600 dark:text-neutral-350 bg-neutral-200 dark:bg-neutral-800 border-transparent"
    if (task.type == "deadline")
      return "text-neutral-600 dark:text-neutral-350 border-neutral-200 dark:border-neutral-800"
    if (task.type == "frame" && task.pause)
      return "text-neutral-600 dark:text-neutral-350 bg-neutral-200 dark:bg-neutral-800 border-accent dark:border-accent-dark"
    if (task.type == "frame" && isInPast)
      return "text-neutral-600 dark:text-neutral-350  bg-neutral-200 dark:bg-neutral-800 border-transparent"
    if (task.type == "frame")
      return "text-neutral-600 dark:text-neutral-350  border-neutral-200 dark:border-neutral-800 "
    if (isInPast) return "hidden"
    return "text-neutral-350 border-transparent"
  }

  return html`<div
      class="h-fit border-2 box-border text-center px-1 uppercase whitespace-nowrap fontaccent text-sm empty:hidden rounded-sm ${additionalClass} ${timeClass()}"
      >${getTaskDay()}</div
    ><div
      class="h-fit border-2 box-border text-center px-1 uppercase whitespace-nowrap fontaccent text-sm empty:hidden rounded-sm ${additionalClass} ${timeClass()}"
      >${getTaskTime()}</div
    >`
}
