import { data } from "/logic/reactive.js"
import dayjs from "dayjs"

export default () => {
  data.visibletasks.sort((a, b) => {
    let datetimeA = dayjs(`${a.date}T${a.time}`, "YYYY-MM-DDTHH:mm")
    let datetimeB = dayjs(`${b.date}T${b.time}`, "YYYY-MM-DDTHH:mm")

    // Приоритет пазе над всеми
    if (!a.pause && b.pause) return 1
    if (a.pause && !b.pause) return -1

    // Приоритет встречам и рамкам перед окнами
    if ((a.type == "meeting" || a.type == "frame") && (b.type == "window" || b.type == "deadline")) return -1
    if ((a.type == "window" || a.type == "deadline") && (b.type == "meeting" || b.type == "frame")) return 1

    // Приоритет сроку над окном
    if (a.type == "deadline" && b.type == "window") return -1
    if (b.type == "deadline" && a.type == "window") return 1

    // Если обе встречи или рамки, сравниваем datetime
    if ((a.type == "meeting" || a.type == "frame") && (b.type == "meeting" || b.type == "frame")) {
      if (!datetimeA.isSame(datetimeB)) return datetimeA.isAfter(datetimeB) ? 1 : -1
    }

    // Если обе задачи окна
    if (a.type == "window" && b.type == "window") {
      let now = dayjs()

      let aIsFuture = datetimeA.isAfter(now)
      let bIsFuture = datetimeB.isAfter(now)

      // Если одна задача в будущем, а другая в прошлом, возвращаем будущую первой
      if (aIsFuture && !bIsFuture) return 1
      if (!aIsFuture && bIsFuture) return -1

      // Если обе задачи в будущем, сравниваем их по времени
      if (aIsFuture && bIsFuture) return datetimeA.isAfter(datetimeB) ? 1 : -1
    }

    return 0
  })
  //   console.log("aftersort", data.visibletasks)
}
