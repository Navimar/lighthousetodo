import { getObjectById, getDayjsDateFromTask } from "~/logic/util"
import dayjs from "dayjs"
import data from "~/logic/data.js"
import { safeSetLocalStorageItem } from "~/logic/util.js"
import { makevisible } from "~/logic/makevisible.js"

const isTaskReadyToDelete = (task) => {
  const now = dayjs()
  const taskDate = getDayjsDateFromTask(task)

  // 1. Проверяем, что дата и время задачи в прошлом.
  if (taskDate.isAfter(now)) return false

  // 2. Проверяем, что timestamp задачи старше месяца.
  const timeAgo = now.subtract(1, "hour")
  if (dayjs(task.timestamp).isAfter(timeAgo)) return false

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

export const removeOldTasks = (tasks) => {
  // 1. Создаем список ID задач, которые будут удалены
  const tasksToDelete = data.tasks.filter(isTaskReadyToDelete).map((task) => task.id)

  // 2. Обновляем связи в оставшихся задачах
  data.tasks.forEach((task) => {
    task.fromIds = (task.fromIds || []).filter((id) => !tasksToDelete.includes(id))
    task.toIds = (task.toIds || []).filter((id) => !tasksToDelete.includes(id))
    task.moreImportantIds = (task.moreImportantIds || []).filter((id) => !tasksToDelete.includes(id))
    task.lessImportantIds = (task.lessImportantIds || []).filter((id) => !tasksToDelete.includes(id))
  })

  // 3. Фильтруем и удаляем старые задачи
  data.tasks = data.tasks.filter((task) => !tasksToDelete.includes(task.id))
  safeSetLocalStorageItem("tasks", data.tasks)
  makevisible()
}

export default removeOldTasks
