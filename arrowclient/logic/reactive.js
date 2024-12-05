import { reactive } from "~/arrow-js/index.js"
import dayjs from "dayjs"

export default reactive({
  collaboratorDictionary: {},
  calendarSet: [],
  visibleTasks: [],
  collaborators: [],
  collaborationRequests: [],
  selectedScribe: "",
  clientIsOnline: false,
  user: {},
  autoComplete: {
    list: [],
    line: "",
    div: "",
  },
  selectedDate: dayjs().format("YYYY-MM-DD"),
  collabState: false,
  searchString: "",
  currentTime: {
    clock: dayjs().format("HH:mm"),
    date: dayjs().format("YYYY-MM-DD"),
    slider: dayjs().hour() * 60 + dayjs().minute(),
  },
})
