import { html } from "@arrow-js/core"
import dayjs from "dayjs"

export default (task, additionalClass = "") => {
  let taskDate = dayjs(`${task.date}T${task.time}`, "YYYY-MM-DDTHH:mm")
  let gc = " text-center  px-1 uppercase whitespace-nowrap notomono " + additionalClass
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
    if (task.type == "meeting" && task.pause) return "h-fit border-2 border-red-500"
    if (task.type == "meeting" && isInPast)
      return "h-fit dark:bg-darkold bg-old dark:border-darkold border-old text-white" + gc
    if (task.type == "meeting")
      return "h-fit bg-transparent dark:text-darkold text-old  dark:border-darkold border-old" + gc
    if (task.type == "deadline" && task.pause)
      return "h-fit border-old border-2 text-white bg-mygray dark:bg-darkgray" + gc
    if (task.type == "deadline" && isInPast) return "h-fit dark:border-black text-white bg-mygray dark:bg-darkgray" + gc
    if (task.type == "deadline") return "h-fit text-mygray bg-transparent dark:text-darkgray" + gc
    if (task.type == "frame" && task.pause)
      return "h-fit  dark:border-darkold text-white bg-mygray dark:bg-darkgray border-2 border-old" + gc
    if (task.type == "frame" && isInPast)
      return "h-fit dark:border-black text-white bg-mygray dark:bg-darkgray border-2 border-mygray" + gc
    if (task.type == "frame")
      return (
        "h-fit dark:border-black border-darkgray bg-transparent text-darkgray border-2 border-transparent dark:text-mygray" +
        gc
      )
    if (isInPast) return "hidden"
    return "h-fit text-mygray bg-transparent dark:text-darkgray" + gc
  }

  return html`<div class="empty:hidden ${timeClass()}">${getTaskDay()}</div
    ><div class="empty:hidden ${timeClass()}">${getTaskTime()}</div>`
}
