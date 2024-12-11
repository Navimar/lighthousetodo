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
  // Создаем Map для быстрого поиска задач в старом массиве по их id: { id -> индекс }
  const oldTasksMap = new Map(reData.visibleTasks.map((task, index) => [task.id, index]))

  // В процессе прохода по newVisibleTasks мы:
  // - обновим уже существующие задачи
  // - добавим новые задачи
  // После чего, удалим лишние задачи.

  for (let task of newVisibleTasks) {
    const oldIndex = oldTasksMap.get(task.id)
    if (oldIndex !== undefined) {
      // Задача уже есть в visibleTasks — обновляем её данные
      Object.assign(reData.visibleTasks[oldIndex], task)
      // Удаляем её из oldTasksMap, чтобы потом не считать её "лишней"
      oldTasksMap.delete(task.id)
    } else {
      // Задачи нет в старом массиве — добавляем её
      reData.visibleTasks.push(task)
    }
  }

  // Теперь в oldTasksMap остались только те задачи, которые нет в newVisibleTasks.
  // Их нужно удалить.
  // Получаем индексы таких задач:
  const indicesToRemove = Array.from(oldTasksMap.values())
  // Сортируем индексы по убыванию, чтобы удалять с конца массива (так эффективнее)
  indicesToRemove.sort((a, b) => b - a)

  // Удаляем лишние задачи, двигаясь от больших индексов к меньшим:
  for (let i of indicesToRemove) {
    reData.visibleTasks.splice(i, 1)
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

    performance.start("mainLoop")

    reData.intentions = []
    let visibleTasks = []
    const selectedDateObj = dayjs(reData.selectedDate)

    for (let task of data.tasks) {
      if (task.id === reData.selectedScribe) {
        visibleTasks.push(task)
        continue
      }

      const isCurrentOrFutureTask =
        reData.selectedDate === reData.currentTime.date
          ? dayjs(task.date).isBefore(selectedDateObj.add(1, "day")) || task.date == reData.selectedDate || !task.date
          : dayjs(task.date).isSame(selectedDateObj) || !task.date

      if (!task.ready && isCurrentOrFutureTask && (areAllFromIdsReady(task) || task.intention)) {
        visibleTasks.push(task)
      }

      if (!task.ready && task.intention) {
        reData.intentions.push(task)
      }
      // Обновление `highestPriorityPerDate` для текущих и будущих задач
      // if (task.date && !task.ready && dayjs(task.date).isSameOrAfter(today)) {
      //   if (
      //     !highestPriorityPerDate[task.date] ||
      //     PRIORITY[task.urgency] < PRIORITY[highestPriorityPerDate[task.date]]
      //   ) {
      //     highestPriorityPerDate[task.date] = task.urgency
      //   }
      // }
    }

    // Применяем оптимизированную функцию обновления visibleTasks
    updateVisibleTasks(visibleTasks)

    performance.end("mainLoop")

    // performance.start("updateCalendarSet")
    // Object.assign(reData.calendarSet, highestPriorityPerDate)
    // performance.end("updateCalendarSet")

    sort()
    reData.intentions.sort((a, b) => a.intentionPriority - b.intentionPriority)
  } finally {
    performance.end("makevisible")
  }
}
