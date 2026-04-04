import { html } from "~/arrow-js/index.js"
import dayjs from "dayjs"
import { taskStatusIcon } from "~/components/tasks/svgicon.js"
import reData from "~/logic/reactive.js"

export default (task, additionalClass = "") => {
  const bulletSymbol = () => {
    reData.currentTime.clock
    reData.currentTime.date

    let classes = ""
    let kind = ""
    const taskDate = dayjs(`${task.date}T${task.time}`, "YYYY-MM-DDTHH:mm")
    const now = dayjs(`${reData.currentTime.date}T${reData.currentTime.clock}`, "YYYY-MM-DDTHH:mm")

    if (task.pause) {
      kind = "pause"
    } else if (task.ready) {
      kind = "ready"
      classes += " text-green-500"
    } else if (taskDate.isAfter(now, "day")) {
      kind = "futureDay"
      classes += " text-compliment"
    } else if (taskDate.isAfter(now)) {
      kind = "futureToday"
      classes += " text-yellow-500"
    } else if (task.blocked) {
      kind = "blocked"
      classes += " text-gray-500"
    } else if (task.depth > 0) {
      kind = "depth"
      classes += " text-swamp"
    } else if (taskDate.isBefore(now, "day")) {
      kind = "past"
      classes += " text-accent"
    }

    if (!kind) return ""
    return html`<span class="${classes}">${taskStatusIcon(kind)}</span>`
  }

  return html`<div
    class="h-fit flex items-center text-center uppercase whitespace-nowrap fontaccent text-sm gap-2 empty:hidden ${additionalClass}"
    >${() => bulletSymbol()}</div
  >`
}
