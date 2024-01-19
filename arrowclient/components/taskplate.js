import { html } from "@arrow-js/core"
import dayjs from "dayjs"

export default (task, additionalClass = "") => {
  let taskDate = dayjs(`${task.date}T${task.time}`, "YYYY-MM-DDTHH:mm")
  let isInPast = dayjs().isAfter(taskDate)

  let getTaskTime = () => {
    if (task.type == "onTime") return task.time

    let now = dayjs()
    let taskDate = dayjs(`${task.date}T${task.time}`, "YYYY-MM-DDTHH:mm")

    if (taskDate.isBefore(now.startOf("day").subtract(1, "day"))) {
      // Если задача была два дня назад или раньше
      return "давно"
    } else if (taskDate.isBefore(now.startOf("day"))) {
      // Если задача была вчера
      return "вчера"
    } else if (task.type == "onDay" && taskDate.isSame(now, "day")) {
      // Если задача была сегодня
      return "сегодня"
    } else if (task.type == "onDay") {
      return dayjs(task.date).format("DD.MM")
    } else return ""
  }

  let paused = () => {
    return task.pause ? "II" : ""
  }

  const timeClass = () => {
    if (task.consequence == "yearsDuration" && isInPast)
      return "text-neutral-100 dark:text-neutral-200 bg-accent dark:bg-accent-dark border-transparent"
    if (task.consequence == "yearsDuration")
      return "text-accent dark:text-accent-dark border-neutral-200 dark:border-neutral-800"
    if (task.consequence == "monthsDuration" && isInPast)
      return "text-neutral-600 dark:text-neutral-350 bg-neutral-200 dark:bg-neutral-800 dark:border-neutral-350 border-neutral-350"
    if (task.consequence == "monthsDuration")
      return "text-neutral-600 dark:text-neutral-350 border-neutral-200 dark:border-neutral-800"
    if (task.consequence == "weeksDuration" && isInPast)
      return "text-neutral-600 dark:text-neutral-350 bg-neutral-200 dark:bg-neutral-800 border-transparent"
    if (task.consequence == "weeksDuration") return "text-neutral-600 dark:text-neutral-350 border-transparent"
    return "hidden"
  }

  return html`<div
      class="h-fit border-2 box-border text-center uppercase whitespace-nowrap fontaccent text-sm empty:hidden rounded-sm ${additionalClass} ${timeClass()}"
      >${getTaskTime()}</div
    ><div
      class="h-fit box-border border-2 border-transparent font-bold text-center uppercase whitespace-nowrap fontaccent text-sm empty:hidden rounded-sm ${additionalClass}"
      >${paused()}</div
    >`
}
