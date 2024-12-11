import { html } from "~/arrow-js/index.js"
import reData from "~/logic/reactive.js"
import taskPlate from "~/components/tasks/taskplate.js"
import { clickPos, safeSetLocalStorageItem } from "~/logic/util.js"
import data from "~/logic/data.js"
import { sendTasksData } from "~/logic/send.js"
import dayjs from "dayjs"

export default () => {
  let dragIndex = null

  const handleDragStart = (index, event) => {
    dragIndex = index
    event.target.style.opacity = "0.5" // Установить полупрозрачность
  }

  const handleDragEnd = (event) => {
    event.target.style.opacity = "1" // Восстановить непрозрачность
  }

  const handleDrop = (index) => {
    if (dragIndex == null || dragIndex == index) return
    // Переместить элемент
    const updated = [...reData.intentions]
    const [movedTask] = updated.splice(dragIndex, 1)
    updated.splice(index, 0, movedTask)
    reData.intentions = updated

    // Обновить intentionPriority для перемещённой задачи
    const previousTask = updated[index - 1]
    const nextTask = updated[index + 1]

    let newPriority
    if (!previousTask) {
      // Если задача стала первой
      newPriority = nextTask.intentionPriority / 2
    } else if (!nextTask) {
      // Если задача стала последней
      newPriority = Math.floor(previousTask.intentionPriority + 1.1)
    } else {
      // Если задача между двумя другими
      newPriority = (previousTask.intentionPriority + nextTask.intentionPriority) / 2
    }

    // Найти соответствующую задачу в data.tasks
    const correspondingTask = data.tasks.find((t) => t.id === movedTask.id)
    if (correspondingTask) {
      correspondingTask.intentionPriority = newPriority || Math.random() + 1
      correspondingTask.timestamp = dayjs().valueOf()
      sendTasksData([correspondingTask])
    }
    movedTask.intentionPriority = correspondingTask.intentionPriority
    // Сохранить данные локально
    safeSetLocalStorageItem("tasks", data.tasks)

    // Отправить изменённые задачи на сервер

    dragIndex = null
  }

  return html`${() =>
    reData.intentions.map((task, index) => renderIntention(task, index, handleDragStart, handleDragEnd, handleDrop))}`
}

function renderIntention(task, index, handleDragStart, handleDragEnd, handleDrop) {
  return html`<div
    draggable="true"
    @dragstart="${(e) => handleDragStart(index, e)}"
    @dragover="${(e) => e.preventDefault()}"
    @drop="${() => handleDrop(index)}"
    @dragend="${(e) => handleDragEnd(e)}"
    class="flex flex-col gap-3 break-words bg-neutral-100 dark:bg-neutral-900 p-3 rounded-lg overflow dark:text-white"
    ><div class="ml-2 flex flex-wrap-reverse gap-3"
      ><div class="w-[28rem] max-w-full mr-auto ">
        ${() => task.name}${() => {
          if (task.note && task.note.length > 0) return " 📝"
        }}</div
      ><div class="flex gap-3">${() => taskPlate(task, "p-1")}</div></div
    ></div
  >`
}
