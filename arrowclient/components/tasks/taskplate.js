import { html } from "@arrow-js/core"
import dayjs from "dayjs"

export default (task, additionalClass = "") => {
  let taskDate = dayjs(`${task.date}T${task.time}`, "YYYY-MM-DDTHH:mm")

  let getTaskTime = () => {
    if (task.urgency == "onTime") return task.time

    let now = dayjs()

    if (taskDate.isAfter(now)) {
      // Если задача находится в будущем (по дате и времени)
      return `с ${taskDate.format("HH:mm")}`
    } else if (task.intention) {
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
    } else return ""
  }

  let paused = () => {
    return task.pause ? "II" : ""
  }

  const bulletClass = () => {
    if (task.intention) return "text-blue-500"
    if (task.importance == "critical") return "text-accent"
    if (task.importance == "important") return "text-yellow-500"
    if (task.importance == "noticeable") return "text-lime-500"
    if (task.importance == "trivial") return "text-neutral-350 dark:text-neutral-600"
    return ""
  }

  const bulletSymbol = () => {
    let symbol = ""
    if (task.intention) symbol = "<b class='text-base'>!</b>"
    else
      switch (task.difficulty) {
        case "long":
          symbol = "▲"
          break
        case "day":
          symbol = "☀"
          break
        case "hour":
          symbol = "◉"
          break
        case "quick":
          symbol = "★"
          break
        case "kairos":
          return "" // Сразу возвращаем пустую строку для "kairos"
        default:
          symbol = "?"
      }
    return `<span class="mr-2 ${bulletClass()} text-xs inline-block">${symbol}</span>`
  }

  return html`
  <div
    class="h-fit box-border font-bold text-center uppercase whitespace-nowrap fontaccent text-sm empty:hidden ${additionalClass}"
  >${paused()}</div><div
    class="h-fit flex items-center text-center uppercase whitespace-nowrap fontaccent text-sm empty:hidden ${additionalClass}">${bulletSymbol()}${getTaskTime()}</div>
</div>
`
}
