import { html, reactive, watch } from "@arrow-js/core";
import dayjs from 'dayjs';


export const currentTime = reactive({
    clock: dayjs().format("HH:mm"),
    date: dayjs().format("YYYY-MM-DD"),
    timerStarted: false,
    timer: "00:00",
    slider: dayjs().hour() * 60 + dayjs().minute(),
});

export const searchstring = reactive({
    text: '',
})

export const selectedDate = reactive({
    date: dayjs().format("YYYY-MM-DD")
});

export const autocomplete = reactive({
    list: [],
    line: '',
    div: '',
});

export const user = reactive({

});
export const status = reactive({
    online: false
});
export const data = reactive({
    calendarSet: {},
    selected: false,
    version: 0,
    tasks: [
        {
            name: "name1",
            note: "note1",
            type: 'window',
            time: "00:00",
            date: "1900-10-01",
            fromNames: [],
            toNames: [],
            fromNamesReady: [],
            toNamesReady: [],
        },
        {
            name: "name2",
            note: "note2", error: true, type: 'window', time: "00:00", date: "1900-10-01",
            fromNames: [],
            toNames: [],
            fromNamesReady: [],
            toNamesReady: [],
        },
    ],
    deleted: [],
    visibletasks: [],
});

