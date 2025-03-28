import reData from "~/logic/reactive.js"
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
    reData.currentTime.clock = newTime
  }

  reData.currentTime.date = time.format("YYYY-MM-DD")

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
