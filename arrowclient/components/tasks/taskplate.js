import { html } from "@arrow-js/core"
import dayjs from "dayjs"

export default (task, additionalClass = "") => {
  let taskDate = dayjs(`${task.date}T${task.time}`, "YYYY-MM-DDTHH:mm")

  let getTaskTime = () => {
    if (task.ready) return "готово"
    if (task.urgency == "onTime") return task.time

    let now = dayjs()
    if (taskDate.isAfter(now.endOf("day"))) return `с ${taskDate.format("DD.MM")}`
    if (taskDate.isAfter(now)) return `с ${taskDate.format("HH:mm")}`
    if (task.intention) return "цель"
    if (task.urgency == "onDay" && taskDate.isBefore(now.startOf("day").subtract(1, "day"))) {
      return "давно"
    } else if (task.urgency == "onDay" && taskDate.isBefore(now.startOf("day"))) {
      return "вчера"
    } else if (task.urgency == "onDay" && taskDate.isSame(now, "day")) {
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
    if (task.ready) return "text-black"
    if (task.intention) return "text-compliment"
    if (task.importance == "critical") return "text-accent"
    if (task.importance == "important") return "text-yellow-500"
    if (task.importance == "noticeable") return "text-lime-500"
    if (task.importance == "trivial") return "text-neutral-350 dark:text-neutral-600"
    return ""
  }

  const bulletSymbol = () => {
    let symbol = ""
    if (task.ready) symbol = "✓"
    else if (task.intention) symbol = "<b class='text-base'>!</b>"
    else
      switch (task.difficulty) {
        case "long":
          symbol = "▲"
          break
        case "day":
          symbol = "◉"
          break
        case "hour":
          symbol = "<span class='text-base'>⧗</span>"
          break
        case "quick":
          symbol = "★"
          break
        case "kairos":
          return ""
        default:
          symbol = "?"
      }
    return `<span class="mr-2 ${bulletClass()} text-xs inline-block">${symbol}</span>`
  }

  const isPastTask = () => {
    let now = dayjs()
    return task.urgency == "onTime" && taskDate.isBefore(now) && !task.ready
  }

  let finalClass = `${additionalClass} ${isPastTask() ? "text-accent" : ""}`.trim()

  return html`<div
      class="h-fit box-border font-bold text-center uppercase whitespace-nowrap fontaccent text-sm empty:hidden ${finalClass}"
      >${paused()}</div
    ><div
      class="h-fit flex items-center text-center uppercase whitespace-nowrap fontaccent text-sm empty:hidden ${finalClass}"
      >${bulletSymbol()}${getTaskTime()}</div
    >`
}
