import { html } from "@arrow-js/core"
import dayjs from "dayjs"

import css from "../css.js"

const updateTimeSlider = (event) => {
  const time = event.target.value
  const dayjsTime = dayjs(time, "HH:mm")
  const totalMinutes = dayjsTime.hour() * 60 + dayjsTime.minute()
  const slider = document.getElementById("timeSlider")
  slider.value = totalMinutes
}

function adjustDate(daysToAdd) {
  let pc = document.getElementById("pauseCheckbox")
  if (pc) pc.checked = false

  const dateInput = document.getElementById("dateInput")

  // Получаем текущую дату из инпута
  const currentInputDate = dayjs(dateInput.value, "YYYY-MM-DD")

  // Добавляем указанные дни
  const newDate = currentInputDate.add(daysToAdd, "day")

  if (newDate.isBefore(dayjs())) {
    // Если получившаяся дата в прошлом, добавляем дни к текущей дате
    const adjustedDate = dayjs().add(daysToAdd, "day")
    dateInput.value = adjustedDate.format("YYYY-MM-DD")
  } else {
    // Иначе, устанавливаем вычисленную дату
    dateInput.value = newDate.format("YYYY-MM-DD")
  }
}

function adjustTime(min) {
  const dateInput = document.getElementById("dateInput")
  const timeInput = document.getElementById("timeInput")

  // Получаем текущую дату и время из инпутов
  const currentInputDateTime = dayjs(`${dateInput.value} ${timeInput.value}`, "YYYY-MM-DD HH:mm")

  // Добавляем указанные минуты
  const newDateTime = currentInputDateTime.add(min, "minute")

  if (newDateTime.isBefore(dayjs())) {
    // Если получившееся время в прошлом, добавляем минуты к текущему времени
    const adjustedDateTime = dayjs().add(min, "minute")
    dateInput.value = adjustedDateTime.format("YYYY-MM-DD")
    timeInput.value = adjustedDateTime.format("HH:mm")
  } else {
    // Иначе, устанавливаем вычисленные дату и время
    dateInput.value = newDateTime.format("YYYY-MM-DD")
    timeInput.value = newDateTime.format("HH:mm")
  }

  // updateTimeSlider
  const time = document.getElementById("timeInput").value
  const dayjsTime = dayjs(time, "HH:mm")
  const totalMinutes = dayjsTime.hour() * 60 + dayjsTime.minute()
  const slider = document.getElementById("timeSlider")
  slider.value = totalMinutes
}

function setTodayDate() {
  const dateInput = document.getElementById("dateInput")
  dateInput.value = dayjs().format("YYYY-MM-DD")
}

export default (task) => {
  return html` <div class="flex gap-3">
    <input
      id="timeInput"
      value="${task.time}"
      type="time"
      class="shrink-0 dark:bg-black bg-white my-auto dark:border-black text-center h-7 "
      @input="${(e) => updateTimeSlider(e)}" />
    <input
      id="dateInput"
      value="${task.date}"
      class="shrink-0 dark:bg-black bg-white dark:border-black my-auto text-center h-7 "
      type="date"
      id="task-date"
      name="task-date" />
    <div class="flex justify-between w-full">
      <button class="${css.button}" @click="${() => setTodayDate()}"> Сегодня </button>
      <button class="${css.button}" @click="${() => adjustDate(1)}">+День</button>
      <button class="${css.button}" @click="${() => adjustDate(7)}">+Неделя</button>
      <button class="${css.button}" @click="${() => adjustTime(15)}">+15мин</button>
      <button class="${css.button}" @click="${() => adjustTime(60)}">+Час</button>
    </div></div
  >`
}
