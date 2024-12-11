import reData from "~/logic/reactive.js"
import { getObjectById } from "~/logic/util.js"
import { PRIORITY, IMPORTANCE_PRIORITY, DIFFICULTY_PRIORITY } from "~/logic/const"
import data from "~/logic/data.js"
import performance from "~/logic/performance.js"
import sort from "~/logic/sort.js"
import dayjs from "dayjs"
import isSameOrAfter from "dayjs/plugin/isSameOrAfter"

dayjs.extend(isSameOrAfter)

const updateVisibleTasks = (newVisibleTasks) => {
  // Создаем Map для быстрого доступа к задачам из newVisibleTasks по id
  const newTasksMap = new Map(newVisibleTasks.map((task) => [task.id, task]))

  // Задачи, которые нужно добавить (есть в новом, но нет в старом)
  const tasksToAdd = newVisibleTasks.filter((task) => !reData.visibleTasks.some((t) => t.id === task.id))

  // Задачи, которые нужно удалить (есть в старом, но нет в новом)
  const tasksToRemove = reData.visibleTasks.filter((task) => !newTasksMap.has(task.id))

  // Удаляем задачи, которых больше нет в новом массиве
  for (let task of tasksToRemove) {
    const index = reData.visibleTasks.findIndex((t) => t.id === task.id)
    if (index > -1) {
      reData.visibleTasks.splice(index, 1)
    }
  }

  // Добавляем задачи, которых не было в старом массиве
  for (let task of tasksToAdd) {
    reData.visibleTasks.push(task)
  }

  // Обновляем задачи, которые уже находятся в массиве visibleTasks
  for (let task of reData.visibleTasks) {
    const newTask = newTasksMap.get(task.id)
    if (newTask) {
      Object.assign(task, newTask)
    }
  }
}

export const makevisible = () => {
  performance.start("makevisible")
  try {
    const areAllFromIdsReady = (task) => {
      if (!task?.fromIds?.length) return true
      for (let id of task.fromIds) {
        const theTask = getObjectById(id)
        if (!theTask) console.log("in makevisible не найден таск по ID", id, task.name)
        if (!theTask?.ready) return false
      }
      return true
    }

    const highestPriorityPerDate = {}

    performance.start("mainLoop")

    // Собираем задачи в новый массив
    reData.intentions = []
    const visibleTasks = []
    const selectedDateObj = dayjs(reData.selectedDate) // Кэшируем объект даты для оптимизации
    const today = dayjs() // Текущая дата

    for (let task of data.tasks) {
      if (task.id === reData.selectedScribe) {
        visibleTasks.push(task)
        continue
      }

      // Проверка на текущую или будущую задачу
      const isCurrentOrFutureTask =
        reData.selectedDate === reData.currentTime.date
          ? dayjs(task.date).isBefore(selectedDateObj.add(1, "day")) || task.date == reData.selectedDate || !task.date
          : dayjs(task.date).isSame(selectedDateObj) || !task.date

      // Добавление задачи в видимые задачи, если все условия соблюдены
      if (!task.ready && isCurrentOrFutureTask && (areAllFromIdsReady(task) || task.intention)) {
        visibleTasks.push(task)
        if (task.intention) reData.intentions.push(task)
      }

      // Обновление `highestPriorityPerDate` для текущих и будущих задач
      if (task.date && !task.ready && dayjs(task.date).isSameOrAfter(today)) {
        if (
          !highestPriorityPerDate[task.date] ||
          PRIORITY[task.urgency] < PRIORITY[highestPriorityPerDate[task.date]]
        ) {
          highestPriorityPerDate[task.date] = task.urgency
        }
      }
    }

    // Присваивание массива видимых задач
    updateVisibleTasks(visibleTasks)

    performance.end("mainLoop")

    performance.start("updateCalendarSet")
    Object.assign(reData.calendarSet, highestPriorityPerDate)
    performance.end("updateCalendarSet")

    sort()
    reData.intentions.sort((a, b) => a.intentionPriority - b.intentionPriority)
  } finally {
    performance.end("makevisible")
  }
}
