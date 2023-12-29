import dayjs from "dayjs"
// import { database, path } from "./database.js"

const isTaskReadyToDelete = (task, tasks) => {
  if (!task) return false

  const now = dayjs()

  // 1. Проверяем, что дата и время задачи в прошлом.
  if (dayjs(task.date, "YYYY-MM-DD").isAfter(now)) return false

  // 2. Проверяем, что timestamp задачи старше месяца.
  const monthAgo = now.subtract(1, "month")
  if (dayjs(task.timestamp).isAfter(monthAgo)) return false

  // 3. Проверяем, что задача помечена как готова.
  if (!task.ready) return false

  // 4. Проверяем, что все потомки и предки задачи также помечены как готовые.
  const relatives = [...(task.fromIds || []), ...(task.toIds || [])]
  for (let relativeId of relatives) {
    const relativeTask = tasks.find((t) => t.id === relativeId)
    if (!relativeTask || !relativeTask.ready) return false
  }

  return true
}

async function removeOldTasksFromFirebase(userId, userData) {
  const tasks = userData.tasks

  if (tasks) {
    const userTasksRef = database.ref(`data/${userId}/tasks`)
    const tasksToDelete = tasks.filter((task) => isTaskReadyToDelete(task, tasks))

    for (let task of tasksToDelete) {
      await userTasksRef.child(task.id).set(null)
    }
  }
}

export default removeOldTasksFromFirebase
