import { makevisible } from "~/logic/makevisible.js"
import reData from "~/logic/reactive.js"
import data from "~/logic/data.js"
import { socket } from "~/logic/socket.js"

import dayjs from "dayjs"

export let tick = () => {
  reData.clientIsOnline = socket.connected

  const time = dayjs()
  const totalMinutes = time.hour() * 60 + time.minute()
  const slider = document.getElementById("timeSlider")
  if (slider) {
    const sliderWidth = slider.offsetWidth - 16
    reData.currentTime.slider = (totalMinutes / 1440) * sliderWidth + 16
  }

  let newTime = time.format("HH:mm")
  if (reData.currentTime.clock !== newTime) {
    let needMv = false
    data.tasks.forEach((task) => {
      if (task.time === reData.currentTime.clock && task.date === reData.currentTime.date) {
        if (task.ready === true) {
          task.ready = false
          // needMv = true
        }
      }
      if (task.pause) {
        // Если разница между текущим временем и task.pause больше 5 минут
        if (dayjs().diff(dayjs(task.pause), "minute") > 5 * task.pauseTimes) {
          // needMv = true
          task.pause = false
        }
      }
    })
    reData.currentTime.clock = newTime
    if (needMv) makevisible()
  }

  reData.currentTime.date = time.format("YYYY-MM-DD")

  // Update reData.selectedDate if it's in the past
  if (dayjs(reData.selectedDate).isBefore(reData.currentTime.date)) {
    reData.selectedDate = reData.currentTime.date
    makevisible()
  }

  if (reData.currentTime.timerStarted) {
    const diffInMinutes = Math.abs(time.diff(dayjs(reData.currentTime.timerStarted, "HH:mm"), "minute"))
    const hours = ((diffInMinutes % (24 * 60)) / 60) | 0
    const minutes = diffInMinutes % 60
    reData.currentTime.timer =
      hours.toLocaleString("en-US", { minimumIntegerDigits: 2 }) +
      ":" +
      minutes.toLocaleString("en-US", { minimumIntegerDigits: 2 })
  }

  setTimeout(tick, 1000)
}
