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
    } else return "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"
  }

  let paused = () => {
    return task.pause ? "II" : ""
  }

  const timeClass = () => {
    if (task.consequence == "yearsDuration" && isInPast) return "border-accent"
    if (task.consequence == "yearsDuration") return "border-transparent border-b-accent "

    if (task.consequence == "monthsDuration" && isInPast) return "border-yellow-500 "
    if (task.consequence == "monthsDuration") return "border-transparent border-b-yellow-500 "

    if (task.consequence == "weeksDuration" && isInPast) return "border-lime-500 "
    if (task.consequence == "weeksDuration") return "border-transparent border-b-lime-500 "

    if (task.consequence == "daysDuration" && isInPast) return "border-neutral-200 dark:border-neutral-800"
    if (task.consequence == "daysDuration") return "border-transparent border-b-neutral-200 dark:border-b-neutral-800"
    return "hidden"
  }

  return html`<div
      class="h-fit box-border border-2 border-transparent font-bold text-center uppercase whitespace-nowrap fontaccent text-sm empty:hidden rounded-sm ${additionalClass}"
      >${paused()}</div
    ><div
      class="h-fit border-2 box-border text-neutral-600 dark:text-neutral-350 text-center uppercase whitespace-nowrap fontaccent text-sm empty:hidden rounded-sm ${additionalClass} ${timeClass()}"
      >${getTaskTime()}</div
    >`
}
