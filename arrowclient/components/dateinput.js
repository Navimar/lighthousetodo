import { html } from "@arrow-js/core";
import dayjs from 'dayjs';

import css from '../css.js';

function adjustDateTime(daysToAdd, min) {
  const dateInput = document.getElementById('dateInput');
  const timeInput = document.getElementById('timeInput');

  // Получаем текущее значение даты и времени из инпутов
  const currentInputDateTime = dayjs(`${dateInput.value} ${timeInput.value}`, 'YYYY-MM-DD HH:mm');

  // Добавляем указанные дни и минуты
  const newDateTime = currentInputDateTime.add(daysToAdd, 'day').add(min, 'minute');

  if (newDateTime.isBefore(dayjs())) {
    // Если получившееся время в прошлом, добавляем дни и минуты к текущему времени
    const adjustedDateTime = dayjs().add(daysToAdd, 'day').add(min, 'minute');
    dateInput.value = adjustedDateTime.format('YYYY-MM-DD');
    timeInput.value = adjustedDateTime.format('HH:mm');
  } else {
    // Иначе, устанавливаем вычисленные дату и время
    dateInput.value = newDateTime.format('YYYY-MM-DD');
    timeInput.value = newDateTime.format('HH:mm');
  }

  // updateTimeSlider
  const time = document.getElementById('timeInput').value;
  const dayjsTime = dayjs(time, 'HH:mm');
  const totalMinutes = dayjsTime.hour() * 60 + dayjsTime.minute();
  const slider = document.getElementById('timeSlider');
  slider.value = totalMinutes;
}

function setTodayDate() {
  const dateInput = document.getElementById('dateInput');
  dateInput.value = dayjs().format('YYYY-MM-DD');
}

export default (task) => {
  return html` <div class="flex gap-3">
    <input id="timeInput" value ="${task.time}" type="time" class="dark:bg-black bg-white my-auto dark:border-black text-center h-7 " @input="${(e) => updateTimeSlider(e)}">
    <input id="dateInput" value ="${task.date}" class="dark:bg-black bg-white dark:border-black my-auto text-center h-7 " type="date" id="task-date" name="task-date">
    <button class="${css.button}" @click="${() => setTodayDate()}">Сегодня</button>
    <button class="${css.button}" @click="${() => adjustDateTime(1, 0)}">+День</button>
    <button class="${css.button}" @click="${() => adjustDateTime(7, 0)}">+Неделя</button>
    <button class="${css.button}" @click="${() => adjustDateTime(0, 15)}">+15мин</button>
    <button class="${css.button}" @click="${() => adjustDateTime(0, 60)}">+Час</button>
  </div>`
}

