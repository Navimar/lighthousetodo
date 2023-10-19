import { getObjectById, getDayjsDateFromTask } from "~/logic/util"
import dayjs from "dayjs"
import data from "~/logic/data.js"
import { safeSetLocalStorageItem } from "~/logic/util.js"

const isTaskReadyToDelete = (taskId) => {
  const task = getObjectById(taskId)
  if (!task) return false

  const now = dayjs()
  const taskDate = getDayjsDateFromTask(task)

  // 1. Проверяем, что дата и время задачи в прошлом.
  if (taskDate.isAfter(now)) return false

  // 2. Проверяем, что timestamp задачи старше месяца.
  const monthAgo = now.subtract(1, "month")
  if (dayjs(task.timestamp).isAfter(monthAgo)) return false

  // 3. Проверяем, что задача помечена как готова.
  if (!task.ready) return false

  // 4. Проверяем, что все потомки и предки задачи также помечены как готовые.
  const relatives = [...(task.fromIds || []), ...(task.toIds || [])]
  for (let relativeId of relatives) {
    const relativeTask = getObjectById(relativeId)
    if (!relativeTask || !relativeTask.ready) return false
  }

  return true
}

const removeOldTasks = (tasks) => {
  // Фильтруем массив задач, убирая из него задачи, которые подходят для удаления
  data.tasks = data.tasks.filter((task) => !isTaskReadyToDelete(task.id))
  safeSetLocalStorageItem("tasks", data.tasks)
}

export default removeOldTasks
