import { html, reactive, watch } from "@arrow-js/core"
import dayjs from "dayjs"

import { selectedDate, reData, selected } from "~/logic/reactive.js"
import { makevisible } from "~/logic/makevisible.js"
import saveTask from "~/logic/savetask.js"
import { searchstring } from "~/logic/reactive.js"

let today = () => {
  selectedDate.date = dayjs().format("YYYY-MM-DD")
}

function nextMonth() {
  const nextMonthDate = dayjs(selectedDate.date).add(1, "month").format("YYYY-MM-DD")
  selectedDate.date = nextMonthDate // обновление вашей реактивной переменной
  makevisible()
}

function prevMonth() {
  const prevMonthDate = dayjs(selectedDate.date).subtract(1, "month").format("YYYY-MM-DD")
  selectedDate.date = prevMonthDate
  makevisible()
}

function nextYear() {
  const nextYearDate = dayjs(selectedDate.date).add(1, "year").format("YYYY-MM-DD")
  selectedDate.date = nextYearDate
  makevisible()
}

function prevYear() {
  const prevYearDate = dayjs(selectedDate.date).subtract(1, "year").format("YYYY-MM-DD")
  selectedDate.date = prevYearDate
  makevisible()
}

function clickOnCaldendarDay(date) {
  saveTask("clickOnCaldendarDay")
  selected.id = false
  // let date = e.target.innerText;
  let clickedDate = dayjs(selectedDate.date).set("date", date)

  // Проверяем, является ли выбранный день прошлым или сегодняшним
  if (clickedDate.isBefore(dayjs()) || clickedDate.isSame(dayjs(), "day")) {
    selectedDate.date = dayjs().format("YYYY-MM-DD") // Устанавливаем сегодняшний день
  } else {
    selectedDate.date = clickedDate.format("YYYY-MM-DD") // Устанавливаем выбранный день
  }
  makevisible()
}

export default () => {
  let renderCalendarControls = () => {
    return html`
      <div class="flex justify-between gap-4">
        <button @click="${prevYear}" class=""><<</button>
        <button @click="${prevMonth}" class=""><</button>
        <button @click="${today}" class="w-1/2 notomono uppercase">
          ${dayjs(selectedDate.date).format("D MMMM YYYY")}
        </button>
        <button @click="${nextMonth}" class="">></button>
        <button @click="${nextYear}" class="">>></button>
      </div>
    `
  }

  let week = (date) => {
    const isToday = dayjs().isSame(date, "day")
    const isSelectedDate = dayjs(selectedDate.date).isSame(date, "day")
    const today = isToday ? "text-white bg-accent dark:bg-accent-dark" : ""
    // const today = isToday ? " border-accent dark:border-accent-dark" : ""
    const focused = isSelectedDate ? "dark:border-neutral-600 border-neutral-400 " : "border-transparent"

    // const calendarDot = () => {
    //   const formattedDate = date.format("YYYY-MM-DD")
    //   const taskType = reData.calendarSet[formattedDate]

    //   const taskTypeToCSS = {
    //     meeting: "text-old bg-bright dark:bg-near-dark",
    //     frame: "bg-bright dark:bg-near-dark",
    //     deadline: "text-mygray bg-bright dark:bg-near-dark",
    //     window: "bg-bright dark:bg-near-dark",
    //   }

    //   if (taskType) {
    //     return taskTypeToCSS[taskType] || "bg-yellow-100 dark:bg-black" // Возвращает специфический стиль для типа или стиль по умолчанию
    //   }

    //   return "bg-near dark:bg-black"
    // }

    const calendarDot = () => {
      const formattedDate = date.format("YYYY-MM-DD")
      const taskType = reData.calendarSet[formattedDate]

      const taskTypeToCSS = {
        meeting: "text-accent dark:text-accent-dark",
        frame: "text-neutral-500",
        deadline: "text-neutral-500",
        window: "text-neutral-200 dark:text-black",
      }

      if (taskType) {
        return html`<span class="absolute ${taskTypeToCSS[taskType]}">&nbsp;●</span>`
      } else return ""
    }

    if (date)
      return html`<td
        @click="${() => clickOnCaldendarDay(date.date())}"
        class="border-2 border-bright dark:border-neutral-800 text-center p-0 ">
        <div class="notomono leading-6 w-full h-full border-2 ${focused} ${today}">
          ${date.date()}${calendarDot()}
        </div>
      </td>`
    else return html`<td class="leading-3 text-center border-bright dark:border-neutral-800 border-2 p-0">&nbsp;</td>`
  }
  const dateObject = dayjs(selectedDate.date)

  let start = dateObject.date(0).day()
  start == 0 ? 7 : start - 1 //0 становится понедельником
  let end = dateObject.daysInMonth()

  let month = []
  let weeks = []
  month = Array(start).fill(false)
  for (let i = 1; i <= end; i++) {
    month.push(dateObject.date(i))
  }
  for (let i = 0; i < month.length; i += 7) {
    weeks.push(month.slice(i, i + 7))
  }
  if (searchstring.text === "")
    return html`
      <div class="notomono w-full text-center p-3 dark:text-white bg-neutral-100  dark:bg-neutral-900">
        <div class="pb-3 text-base">${renderCalendarControls}</div>
        <table class="text-base w-full">
          <tr class="bg-neutral-200 dark:bg-neutral-800 dark:border-neutral-800 border-neutral-200 border-2">
            <td class="text-center pb-1 notomono">Пн</td>
            <td class="text-center pb-1 notomono">Вт</td>
            <td class="text-center pb-1 notomono">Ср</td>
            <td class="text-center pb-1 notomono">Чт</td>
            <td class="text-center pb-1 notomono">Пт</td>
            <td class="text-center pb-1 notomono">Сб</td>
            <td class="text-center pb-1 notomono">Вс</td>
          </tr>
          <tr> ${() => weeks[0].map(week)} </tr>
          <tr> ${() => weeks[1].map(week)} </tr>
          <tr> ${() => weeks[2].map(week)} </tr>
          <tr> ${() => weeks[3].map(week)} </tr>
          <tr> ${() => weeks[4].map(week)} </tr>
          ${weeks[5] ? html`<tr> ${() => weeks[5].map(week)} </tr>` : ""}
        </table>
      </div>
    `
  else return ""
}
