import { html, reactive, watch } from "@arrow-js/core";
import { currentTime, selectedDate, data } from "/logic/reactive.js";
import dayjs from "dayjs";

function updateSliderLabel(e) {
	let value = e.target.value;
	const time = dayjs().startOf("day").add(value, "minutes");
	const formattedTime = time.format("HH:mm");
	document.querySelector("#timeInput").value = formattedTime;

	if (dayjs(document.querySelector("#dateInput").value).isBefore(dayjs())) {
		document.querySelector("#dateInput").value =
			dayjs().format("YYYY-MM-DD");
	}
}

export default (task) =>
	html`<div>
		<div
			id="currentTimeMarker"
			style="left:${currentTime.slider}px"
			class="relative top-7 h-0 z-40 text-xs w-0 flex flex-col items-center dark:text-darkold text-old text-center"
		>
			<span class="font-bold">|</span>
			<span
				class="notomono font-bold rounded-lg px-2 bg-lightgray dark:bg-darkold dark:text-lightgray block"
				>${() => currentTime.clock}</span
			>
		</div>

		<div class="w-full px-2 ">
			<input
				id="timeSlider"
				value="${() => {
					const dayjsTime = dayjs(task.time, "HH:mm");
					return dayjsTime.hour() * 60 + dayjsTime.minute();
				}}"
				type="range"
				min="0"
				max="1439"
				step="15"
				class="slider bg-mygray outline-none drop-shadow-none shadow-none h-1 rounded-full w-full appearance-none cursor-pointer "
				@input="${(e) => updateSliderLabel(e)}"
			/>
		</div>
		<div
			class="w-full  px-3.5 flex justify-between text-xs dark:text-white text-mygray"
		>
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
		<div
			class="w-full flex justify-between text-xs dark:text-white text-darkgray"
		>
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
	</div>`;
