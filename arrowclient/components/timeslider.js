import { html } from "@arrow-js/core"
import { currentTime } from "~/logic/reactive.js"
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
}

export default (task) =>
  html`<div>
    <div
      id="currentTimeMarker"
      style="left:${currentTime.slider}px"
      class="relative top-7 h-0 z-40 text-xs w-0 flex flex-col items-center dark:text-darkold text-old text-center">
      <span class="font-bold">|</span>
      <span
        @click="${() => {
          const currentTimeInMinutes = dayjs().hour() * 60 + dayjs().minute()
          const slider = document.querySelector("#timeSlider")
          slider.value = currentTimeInMinutes
          updateSliderLabel({ target: slider }) // Optional: to update other elements if needed
        }}"
        class="notomono font-bold rounded-lg px-2 bg-lightgray dark:bg-darkold dark:text-lightgray block"
        >${() => currentTime.clock}</span
      >
    </div>

    <div class="w-full px-2.5 ">
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
        class="slider bg-mygray outline-none drop-shadow-none shadow-none h-1 rounded-full w-full appearance-none cursor-pointer "
        @input="${(e) => updateSliderLabel(e)}" />
    </div>
    <div class="w-full pl-[1.055rem] pr-[0.955rem]  flex justify-between text-xs dark:text-white text-mygray">
      <div class="flex flex-col items-center">
        <span>|</span>
      </div>
      <div class="flex flex-col items-center">
        <span>|</span>
      </div>
      <div class="flex flex-col items-center">
        <span>|</span>
      </div>
      <div class="flex flex-col items-center">
        <span>|</span>
      </div>
      <div class="flex flex-col items-center">
        <span>|</span>
      </div>
      <div class="flex flex-col items-center">
        <span>|</span>
      </div>
      <div class="flex flex-col items-center">
        <span>|</span>
      </div>
      <div class="flex flex-col items-center">
        <span>|</span>
      </div>
      <div class="flex flex-col items-center">
        <span>|</span>
      </div>
      <div class="flex flex-col items-center">
        <span>|</span>
      </div>
      <div class="flex flex-col items-center">
        <span>|</span>
      </div>
      <div class="flex flex-col items-center">
        <span>|</span>
      </div>
      <div class="flex flex-col items-center">
        <span>|</span>
      </div>
      <div class="flex flex-col items-center">
        <span>|</span>
      </div>
      <div class="flex flex-col items-center">
        <span>|</span>
      </div>
      <div class="flex flex-col items-center">
        <span>|</span>
      </div>
      <div class="flex flex-col items-center">
        <span>|</span>
      </div>
      <div class="flex flex-col items-center">
        <span>|</span>
      </div>
      <div class="flex flex-col items-center">
        <span>|</span>
      </div>
      <div class="flex flex-col items-center">
        <span>|</span>
      </div>
      <div class="flex flex-col items-center">
        <span>|</span>
      </div>
      <div class="flex flex-col items-center">
        <span>|</span>
      </div>
      <div class="flex flex-col items-center">
        <span>|</span>
      </div>
      <div class="flex flex-col items-center">
        <span>|</span>
      </div>
      <div class="flex flex-col items-center">
        <span>|</span>
      </div>
    </div>
    <div class="w-full flex justify-between text-xs dark:text-white text-darkgray pr-[0.17rem]">
      <div class="flex flex-col items-center">
        <span class="notomono">00:00</span>
      </div>
      <div class="flex flex-col items-center">
        <span class="notomono">03:00</span>
      </div>
      <div class="flex flex-col items-center">
        <span class="notomono">06:00</span>
      </div>
      <div class="flex flex-col items-center">
        <span class="notomono">09:00</span>
      </div>
      <div class="flex flex-col items-center">
        <span class="notomono">12:00</span>
      </div>
      <div class="flex flex-col items-center">
        <span class="notomono">15:00</span>
      </div>
      <div class="flex flex-col items-center">
        <span class="notomono">18:00</span>
      </div>
      <div class="flex flex-col items-center">
        <span class="notomono">21:00</span>
      </div>
      <div class="flex flex-col items-center">
        <span class="w-8"></span>
      </div>
    </div>
  </div>`
