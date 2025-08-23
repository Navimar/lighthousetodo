import { html } from "~/arrow-js/index.js"
import dayjs from "dayjs"

import { dateInputPauseButtonHTMLCSS } from "~/logic/manipulate.js"

const updateTimeSlider = (event, task) => {
  const time = event.target.value
  const dayjsTime = dayjs(time, "HH:mm")
  const totalMinutes = dayjsTime.hour() * 60 + dayjsTime.minute()
  const slider = document.getElementById("timeSlider")
  slider.value = totalMinutes
  dateInputPauseButtonHTMLCSS(task)
}

function adjustDate(daysToAdd, task) {
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
  dateInputPauseButtonHTMLCSS(task)
}

function adjustTime(min, task) {
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
  dateInputPauseButtonHTMLCSS(task)
}

function setTodayDate(task) {
  const dateInput = document.getElementById("dateInput")
  dateInput.value = dayjs().format("YYYY-MM-DD")
  dateInputPauseButtonHTMLCSS(task)
}

export default (task) => {
  return html`
    <div class="flex flex-wrap gap-3 justify-between mt-3">
      <div class="flex gap-3">
        <input
          id="timeInput"
          value="${task.time}"
          type="time"
          class="oswald text-base shrink-0 dark:bg-black bg-white my-auto dark:border-black text-center h-10 border-b-02rem border-white dark:border-black rounded-none"
          @input="${(e) => updateTimeSlider(e, task)}" />
        <input
          id="dateInput"
          value="${task.date}"
          class="oswald whitespace-nowrap text-base shrink-0 dark:bg-black bg-white dark:border-black my-auto text-center h-10 border-b-02rem border-white  dark:border-black rounded-none"
          type="date"
          id="task-date"
          name="task-date"
          @change="${() => dateInputPauseButtonHTMLCSS(task)}" />
      </div>
      <div class="flex flex-wrap gap-3">
        <button class="button-light" @click="${() => setTodayDate(task)}">Сегодня</button>
        <button class="button-light" @click="${() => adjustDate(1, task)}">+День</button>
        <button class="button-light" @click="${() => adjustDate(7, task)}">+Неделя</button>
        <button class="button-light" @click="${() => adjustTime(15, task)}">+15&nbsp;мин</button>
        <button class="button-light" @click="${() => adjustTime(60, task)}">+Час</button>
      </div>
    </div>
  `
}
