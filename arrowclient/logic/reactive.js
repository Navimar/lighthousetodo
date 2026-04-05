import { reactive } from "~/arrow-js/index.js"
import dayjs from "dayjs"

export default reactive({
  collaboratorDictionary: {},
  calendarSet: {},
  visibleTasks: [],
  collaborators: [],
  route: [],
  intentions: [],
  collaborationRequests: [],
  selectedScribe: "",
  clientIsOnline: false,
  currentPage: 1,
  user: {},
  autoComplete: {
    list: [],
    line: "",
    div: "",
  },
  addConnectionDraft: {
    value: "",
    side: "",
  },
  selectedDate: dayjs().format("YYYY-MM-DD"),
  collabState: false,
  mapSelectedNodeId: "",
  mapAncestorFocusMode: "chain",
  searchString: "",
  currentTime: {
    clock: dayjs().format("HH:mm"),
    date: dayjs().format("YYYY-MM-DD"),
    slider: dayjs().hour() * 60 + dayjs().minute(),
  },
})
