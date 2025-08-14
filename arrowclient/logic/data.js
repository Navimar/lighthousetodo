import { loadGraphFromLocalStorage } from "./sync.js"

const tasks = loadGraphFromLocalStorage()

export default {
  tasks,
  pendingRequests: [],
}
