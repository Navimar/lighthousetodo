import { getObjectById, getDayjsDateFromTask } from "~/logic/util"
import dayjs from "dayjs"
import data from "~/logic/data.js"
import { makevisible } from "~/logic/makevisible.js"

const isTaskReadyToDelete = (task) => {
  const now = dayjs()
  const taskDate = getDayjsDateFromTask(task)

  // 1. Проверяем, что дата и время задачи в прошлом.
  if (taskDate.isAfter(now)) return false

  // 2. Проверяем, что timestamp задачи старше часа.
  const timeAgo = now.subtract(1, "hour")
  if (dayjs(task.timestamp).isAfter(timeAgo)) return false

  // 3. Проверяем, что задача помечена как готова.
  if (!task.ready) return false

  // 4. Проверяем, что все связанные задачи также готовы.
  const relations = data.tasks.getRelations(task.id)
  const relatives = [...relations.leads, ...relations.blocks]
  for (let relativeId of relatives) {
    const relativeTask = getObjectById(relativeId)
    if (!relativeTask || !relativeTask.ready) return false
  }

  return true
}

export const removeOldTasks = () => {
  // 1. Собираем ID задач, которые будут удалены
  const tasksToDelete = []
  for (const task of data.tasks.nodes.values()) {
    if (isTaskReadyToDelete(task)) {
      tasksToDelete.push(task.id)
    }
  }

  // 2. Удаляем связи с удаляемыми задачами
  for (const taskId of tasksToDelete) {
    data.tasks.deleteNode(taskId)
  }

  // 3. Сохраняем обновленные данные и обновляем видимость
  // safeSetLocalStorageItem("tasks", data.tasks)
  makevisible()
}

export default removeOldTasks
