import { html } from "@arrow-js/core"
import dayjs from "dayjs"

export default (task, additionalClass = "") => {
  let taskDate = dayjs(`${task.date}T${task.time}`, "YYYY-MM-DDTHH:mm")
  let isInPast = dayjs().isAfter(taskDate)

  let getTaskTime = () => {
    if (task.urgency == "onTime") return task.time

    let now = dayjs()
    let taskDate = dayjs(`${task.date}T${task.time}`, "YYYY-MM-DDTHH:mm")

    if (task.intention) {
      return "цель"
    } else if (task.urgency == "onDay" && taskDate.isBefore(now.startOf("day").subtract(1, "day"))) {
      // Если задача была два дня назад или раньше
      return "давно"
    } else if (task.urgency == "onDay" && taskDate.isBefore(now.startOf("day"))) {
      // Если задача была вчера
      return "вчера"
    } else if (task.urgency == "onDay" && taskDate.isSame(now, "day")) {
      // Если задача была сегодня
      return "сегодня"
    } else if (task.urgency == "onDay") {
      return dayjs(task.date).format("DD.MM")
    } else if (task.urgency == "shortTerm") {
      return "на днях"
    } else return "&#8205;"
  }

  let paused = () => {
    return task.pause ? "II" : ""
  }

  const timeClass = () => {
    if (task.intention) return "border-transparent"
    if (task.importance == "critical" && isInPast) return "border-accent"
    if (task.importance == "critical") return "border-transparent border-l-accent "

    if (task.importance == "important" && isInPast) return "border-yellow-500 "
    if (task.importance == "important") return "border-transparent border-l-yellow-500 "

    if (task.importance == "noticeable" && isInPast) return "border-lime-500 "
    if (task.importance == "noticeable") return "border-transparent border-l-lime-500 "

    if (task.importance == "trivial" && isInPast) return "border-neutral-350 dark:border-neutral-600"
    if (task.importance == "trivial") return "border-transparent border-l-neutral-350 dark:border-r-neutral-600"
    return "hidden"
  }

  const сolorClass = () => {
    return task.intention ? "text-accent" : "text-neutral-600 dark:text-neutral-350"
  }

  const duration = () => {
    if (task.intention) return ""
    const importanceBorderClass = () => {
      switch (task.importance) {
        case "critical":
          return "border-accent"
        case "important":
          return "border-yellow-500"
        case "noticeable":
          return "border-lime-500"
        case "trivial":
          return "border-neutral-350 dark:border-neutral-600"
        default:
          return ""
      }
    }

    let count = 0
    switch (task.difficulty) {
      case "long":
        count = 3
        break
      case "day":
        count = 2
        break
      case "hour":
        count = 1
        break
      case "quick":
        count = 0
        break
      case "kairos":
        count = 0
        break
      default:
        count = 4
    }

    let result = ""
    for (let i = 0; i < count; i++) {
      result += `<div class="w-0 h-fit border-[1px] fontaccent whitespace-nowrap box-border ${importanceBorderClass()}"><span class=" uppercase">&#8203;</span></div>`
    }
    return result
  }

  return html`
  <div
    class="h-fit box-border border-2 border-transparent font-bold text-center uppercase whitespace-nowrap fontaccent text-sm empty:hidden ${additionalClass} ${сolorClass()}"
  >
    ${paused()}
  </div>
  ${duration()}
  <div
    class="h-fit border-2 box-border ${сolorClass()} text-center uppercase whitespace-nowrap fontaccent text-sm ${additionalClass} ${timeClass()}"
  >
    ${getTaskTime()}
  </div>
</div>
`
}
