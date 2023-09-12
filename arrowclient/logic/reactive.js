import { html, reactive, watch } from "@arrow-js/core";
import dayjs from "dayjs";

export const currentTime = reactive({
	clock: dayjs().format("HH:mm"),
	date: dayjs().format("YYYY-MM-DD"),
	timerStarted: false,
	timer: "00:00",
	slider: dayjs().hour() * 60 + dayjs().minute(),
});

export const searchstring = reactive({
	text: "",
});

export const selectedDate = reactive({
	date: dayjs().format("YYYY-MM-DD"),
});

export const autocomplete = reactive({
	list: [],
	line: "",
	div: "",
});

export const user = reactive({});

export const status = reactive({
	online: true,
});
export const data = reactive({
	calendarSet: {},
	selected: false,
	version: 0,
	tasks: [],
	deleted: [],
	visibletasks: [],
});
