import reData from "~/logic/reactive.js"
import { dateInputPauseButtonHTMLCSS } from "~/logic/manipulate.js"

import { html } from "~/arrow-js/index.js"
import dayjs from "dayjs"

function updateSliderLabel(e) {
  let value = e.target.value
  const currentTime = dayjs()
  const time = dayjs().startOf("day").add(value, "minutes")
  const formattedTime = time.format("HH:mm")

  // Устанавливаем выбранное время
  document.querySelector("#timeInput").value = formattedTime

  // Получаем текущую и выбранную даты
  const currentDate = dayjs().format("YYYY-MM-DD")
  const selectedDate = document.querySelector("#dateInput").value

  // Устанавливаем дату и время на выбранную дату с новым временем
  let selectedDateTime = dayjs(`${selectedDate} ${formattedTime}`)

  // Проверяем, находится ли выбранное дата+время в прошлом
  if (selectedDateTime.isBefore(currentTime)) {
    // Если выбранное время в прошлом, проверяем, в прошлом ли оно и сегодня
    let selectedTodayDateTime = dayjs(`${currentDate} ${formattedTime}`)
    if (selectedTodayDateTime.isBefore(currentTime)) {
      // Если выбранное время сегодня также в прошлом, устанавливаем дату на завтра
      const tomorrow = currentTime.add(1, "day").format("YYYY-MM-DD")
      document.querySelector("#dateInput").value = tomorrow
    } else {
      // В противном случае устанавливаем сегодняшнюю дату
      document.querySelector("#dateInput").value = currentDate
    }
  }
  // Если выбранное время в будущем, не меняем дату
  dateInputPauseButtonHTMLCSS()
}

export default (task) =>
  html` <div class="w-full mt-5 flex justify-between text-xs dark:text-neutral-350 pl-[0rem] pr-[0.33rem]">
      <div class="flex flex-col items-center"><span class="fontmono">00:00</span></div>
      <div class="flex flex-col items-center"><span class="fontmono">03:00</span></div>
      <div class="flex flex-col items-center"><span class="fontmono">06:00</span></div>
      <div class="flex flex-col items-center"><span class="fontmono">09:00</span></div>
      <div class="flex flex-col items-center"><span class="fontmono">12:00</span></div>
      <div class="flex flex-col items-center"><span class="fontmono">15:00</span></div>
      <div class="flex flex-col items-center"><span class="fontmono">18:00</span></div>
      <div class="flex flex-col items-center"><span class="fontmono">21:00</span></div>
      <div class="flex flex-col items-center"><span class="w-8"></span></div>
    </div>

    <div class="mx-3.5">
      <div
        class="w-full fontmono pl-[0.1rem] pr-[0.1rem] flex justify-between text-xs dark:text-neutral-700 text-black">
        <div class="fontmono flex flex-col items-center">
          <span class="fontmono">ˈ</span>
        </div>
        <div class="flex flex-col items-center">
          <span class="fontmono">ˈ</span>
        </div>
        <div class="flex flex-col items-center">
          <span class="fontmono">ˈ</span>
        </div>
        <div class="flex flex-col items-center">
          <span class="fontmono">ˈ</span>
        </div>
        <div class="flex flex-col items-center">
          <span class="fontmono">ˈ</span>
        </div>
        <div class="flex flex-col items-center">
          <span class="fontmono">ˈ</span>
        </div>
        <div class="flex flex-col items-center">
          <span class="fontmono">ˈ</span>
        </div>
        <div class="flex flex-col items-center">
          <span class="fontmono">ˈ</span>
        </div>
        <div class="flex flex-col items-center">
          <span class="fontmono">ˈ</span>
        </div>
        <div class="flex flex-col items-center">
          <span class="fontmono">ˈ</span>
        </div>
        <div class="flex flex-col items-center">
          <span class="fontmono">ˈ</span>
        </div>
        <div class="flex flex-col items-center">
          <span class="fontmono">ˈ</span>
        </div>
        <div class="flex flex-col items-center">
          <span class="fontmono">ˈ</span>
        </div>
        <div class="flex flex-col items-center">
          <span class="fontmono">ˈ</span>
        </div>
        <div class="flex flex-col items-center">
          <span class="fontmono">ˈ</span>
        </div>
        <div class="flex flex-col items-center">
          <span class="fontmono">ˈ</span>
        </div>
        <div class="flex flex-col items-center">
          <span class="fontmono">ˈ</span>
        </div>
        <div class="flex flex-col items-center">
          <span class="fontmono">ˈ</span>
        </div>
        <div class="flex flex-col items-center">
          <span class="fontmono">ˈ</span>
        </div>
        <div class="flex flex-col items-center">
          <span class="fontmono">ˈ</span>
        </div>
        <div class="flex flex-col items-center">
          <span class="fontmono">ˈ</span>
        </div>
        <div class="flex flex-col items-center">
          <span class="fontmono">ˈ</span>
        </div>
        <div class="flex flex-col items-center">
          <span class="fontmono">ˈ</span>
        </div>
        <div class="flex flex-col items-center">
          <span class="fontmono">ˈ</span>
        </div>
        <div class="flex flex-col items-center">
          <span class="fontmono">ˈ</span>
        </div></div
      ><div
        id="currentTimeMarker"
        style="left:${reData.currentTime.slider}px"
        class="relative bottom-8 h-0 z-40 text-xs w-0 flex flex-col items-center dark:text-accent-dark text-accent text-center">
        <span
          @click="${() => {
            const timeInput = document.getElementById("timeInput")
            const dateInput = document.getElementById("dateInput")
            timeInput.value = dayjs().format("HH:mm")
            dateInput.value = dayjs().format("YYYY-MM-DD")
            const currentTimeInMinutes = dayjs().hour() * 60 + dayjs().minute()
            const slider = document.querySelector("#timeSlider")
            slider.value = currentTimeInMinutes
            dateInputPauseButtonHTMLCSS()
          }}"
          class="text-white fontmono rounded-lg px-2 bg-accent dark:bg-accent-dark block"
          >${() => reData.currentTime.clock}</span
        ><span class="font-bold fontmono">ˈ</span>
      </div>

      <div class="w-full h-3">
        <input
          id="timeSlider"
          value="${() => {
            const dayjsTime = dayjs(task.time, "HH:mm")
            return dayjsTime.hour() * 60 + dayjsTime.minute()
          }}"
          type="range"
          min="0"
          max="1439"
          step="15"
          class="slider bg-neutral-150 align-top dark:bg-neutral-700 outline-none drop-shadow-none shadow-none h-1 rounded-full w-full appearance-none cursor-pointer"
          @input="${(e) => updateSliderLabel(e)}" />
      </div>
    </div>`
