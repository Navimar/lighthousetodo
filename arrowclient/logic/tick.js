import { makevisible } from "~/logic/makevisible.js"
import { selectedDate, currentTime, reData } from "~/logic/reactive.js"
import data from "~/logic/data.js"
import dayjs from "dayjs"

export let tick = () => {
  const time = dayjs()
  const totalMinutes = time.hour() * 60 + time.minute()
  const slider = document.getElementById("timeSlider")
  if (slider) {
    const sliderWidth = slider.offsetWidth - 16
    currentTime.slider = (totalMinutes / 1440) * sliderWidth + 16
  }

  let newTime = time.format("HH:mm")
  if (currentTime.clock !== newTime) {
    data.tasks.forEach((task) => {
      if (task.time === currentTime.clock && task.date === currentTime.date) {
        if (task.ready === true) task.ready = false
      }
    })
    currentTime.clock = newTime
  }

  currentTime.date = time.format("YYYY-MM-DD")

  // Update selectedDate.date if it's in the past
  if (dayjs(selectedDate.date).isBefore(currentTime.date)) {
    selectedDate.date = currentTime.date
    makevisible()
  }

  if (currentTime.timerStarted) {
    const diffInMinutes = Math.abs(time.diff(dayjs(currentTime.timerStarted, "HH:mm"), "minute"))
    const hours = ((diffInMinutes % (24 * 60)) / 60) | 0
    const minutes = diffInMinutes % 60
    currentTime.timer =
      hours.toLocaleString("en-US", { minimumIntegerDigits: 2 }) +
      ":" +
      minutes.toLocaleString("en-US", { minimumIntegerDigits: 2 })
  }

  setTimeout(tick, 1000)
}