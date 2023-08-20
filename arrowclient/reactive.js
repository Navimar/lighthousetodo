import { html, reactive, watch } from "@arrow-js/core";
import dayjs from 'dayjs';


const currentTime = reactive({
    clock: dayjs().format("HH:mm"),
    date: dayjs().format("YYYY-MM-DD"),
    timerStarted: false,
    timer: "00:00",
    slider: dayjs().hour() * 60 + dayjs().minute(),
});

const selectedDate = reactive({
    date: dayjs().format("YYYY-MM-DD")
});


const data = reactive({
    calendarSet: {},
    selected: false,
    tasks: [
        { name: "name1", note: "note1", type: 'window', time: "00:00", date: "1900-10-01" },
        { name: "name2", note: "note2", error: true, type: 'window', time: "00:00", date: "1900-10-01" },
    ],
});

export { currentTime, selectedDate, data };