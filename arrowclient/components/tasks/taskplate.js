import { html } from "~/arrow-js/index.js"
import dayjs from "dayjs"

export default (task, additionalClass = "") => {
  let taskDate = dayjs(`${task.date}T${task.time}`, "YYYY-MM-DDTHH:mm")

  const bulletSymbol = () => {
    let symbol = ""
    let now = dayjs()
    if (task.pause) {
      symbol = "<b class='text-base'>II</b>" // Пауза как приоритетный символ
    } else if (task.ready) {
      symbol = "<b class='text-accent text-base'>✓</b>"
    } else {
      // Проверяем, находится ли задача в будущем
      if (taskDate.isAfter(now)) {
        symbol = "<span class='text-yellow-500 text-base'>⧗</span>" // Песочные часы для задач в будущем
      }
    }
    return `<span class="text-xs inline-block">${symbol}</span>`
  }

  const isPastTask = () => {
    let now = dayjs()
    return task.urgency == "onTime" && taskDate.isBefore(now) && !task.ready
  }

  let finalClass = `${additionalClass} ${isPastTask() ? "text-accent" : ""}`.trim()

  return html`<div
    class="h-fit flex items-center text-center uppercase whitespace-nowrap fontaccent text-sm gap-2 empty:hidden ${finalClass}"
    >${bulletSymbol()}</div
  >`
}

// else if (task.intention) symbol = "<b class='text-base'>!</b>"
// switch (task.difficulty) {
//   case "long":
//     symbol = "▲"
//     break
//   case "day":
//     symbol = "◉"
//     break
//   case "hour":
//     symbol = "<span class='text-yellow-500 text-base'>⧗</span>"
//     break
//   case "quick":
//     symbol = "★"
//     break
//   case "kairos":
//     return ""
//   default:
//     symbol = "?"
// }

// const bulletClass = () => {
//   if (task.ready) return "text-black"
//   if (task.intention) return "text-compliment"
//   if (task.importance == "critical") return "text-accent"
//   if (task.importance == "important") return "text-yellow-500"
//   if (task.importance == "noticeable") return "text-lime-500"
//   if (task.importance == "trivial") return "text-neutral-350 dark:text-neutral-600"
//   return ""
// }
