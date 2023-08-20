import { html, reactive, watch } from "@arrow-js/core";
import dayjs from 'dayjs';

import { currentTime, selectedDate, data } from '/reactive.js';
import { saveTask, addScribe } from '/logic/exe.js'


let today = () => {
  selectedDate.date = dayjs().format('YYYY-MM-DD');
}

function nextMonth() {
  const nextMonthDate = dayjs(selectedDate.date).add(1, 'month').format('YYYY-MM-DD');
  selectedDate.date = nextMonthDate; // обновление вашей реактивной переменной
}

function prevMonth() {
  const prevMonthDate = dayjs(selectedDate.date).subtract(1, 'month').format('YYYY-MM-DD');
  selectedDate.date = prevMonthDate;
}

function nextYear() {
  const nextYearDate = dayjs(selectedDate.date).add(1, 'year').format('YYYY-MM-DD');
  selectedDate.date = nextYearDate;
}

function prevYear() {
  const prevYearDate = dayjs(selectedDate.date).subtract(1, 'year').format('YYYY-MM-DD');
  selectedDate.date = prevYearDate;
}

function clickOnCaldendarDay(date) {
  saveTask();
  // let date = e.target.innerText;
  let clickedDate = dayjs(selectedDate.date).set('date', date);

  // Проверяем, является ли выбранный день прошлым или сегодняшним
  if (clickedDate.isBefore(dayjs()) || clickedDate.isSame(dayjs(), 'day')) {
    selectedDate.date = dayjs().format('YYYY-MM-DD'); // Устанавливаем сегодняшний день
  } else {
    selectedDate.date = clickedDate.format('YYYY-MM-DD'); // Устанавливаем выбранный день
  }
}

export default () => {

  let renderCalendarControls = () => {
    return html`
        <div class="flex justify-between gap-4">
            <button @click="${prevYear}" class="text-darkgray">\<\<</button>
            <button @click="${prevMonth}" class="text-darkgray">\<</button>
            <button @click="${today}" class="w-1/2 notomono uppercase">${dayjs(selectedDate.date).format('D MMMM YYYY')}</button>
            <button @click="${nextMonth}" class="text-darkgray">\></button>
            <button @click="${nextYear}" class="text-darkgray" >\>\></button >
        </div >
  `;
  }

  let week = (date) => {
    const isToday = dayjs().isSame(date, 'day');
    const isSelectedDate = dayjs(selectedDate.date).isSame(date, 'day');
    const today = isToday ? 'text-white bg-old dark:bg-darkold' : ''
    const focused = isSelectedDate ? 'dark:border-mygray border-darkgray ' : 'border-transparent';

    const calendarDot = () => {
      if (!isToday && data.calendarSet[date.format("YYYY-MM-DD")])
        return 'bg-lightgray dark:bg-nearblack'
      return 'bg-nearwhite dark:bg-black'
    }

    if (date)
      return html`<td @click="${() => clickOnCaldendarDay(date.date())}" class="border-2 border-lightgray dark:border-nearblack text-center p-0 "><div class="notomono leading-6 w-full h-full border-2 ${focused} ${calendarDot()} ${today}">${date.date()}</div></td>`
    else
      return html`<td class="leading-3 text-center p-0">&nbsp;</td>`
  }
  const dateObject = dayjs(selectedDate.date);

  let start = dateObject.date(0).day()
  start == 0 ? 7 : start - 1 //0 становится понедельником
  let end = dateObject.daysInMonth()

  let month = []
  let weeks = []
  month = Array(start).fill(false)
  for (let i = 1; i <= end; i++) {
    month.push(dateObject.date(i));
  }
  for (let i = 0; i < month.length; i += 7) {
    weeks.push(month.slice(i, i + 7));
  }

  return html`
<div class="notomono w-full text-center p-3 bg-nearwhite dark:text-white dark:bg-black">
  <div class="pb-3 text-base">${renderCalendarControls}</div>
  <table class="text-base w-full">
    <tr>
      <td class="text-center pb-1 notomono">Пн</td>
      <td class="text-center pb-1 notomono">Вт</td>
      <td class="text-center pb-1 notomono">Ср</td>
      <td class="text-center pb-1 notomono">Чт</td>
      <td class="text-center pb-1 notomono">Пт</td>
      <td class="text-center pb-1 notomono">Сб</td>
      <td class="text-center pb-1 notomono">Вс</td>
    </tr>
    <tr>
      ${() => weeks[0].map(week)}
    </tr>
    <tr>
      ${() => weeks[1].map(week)}
    </tr>
    <tr>
      ${() => weeks[2].map(week)}
    </tr>
    <tr>
      ${() => weeks[3].map(week)}
    </tr>
    <tr>
      ${() => weeks[4].map(week)}
    </tr>
  </table>
</div>
`;
}