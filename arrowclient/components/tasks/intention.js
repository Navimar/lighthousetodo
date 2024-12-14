import { html } from "~/arrow-js/index.js"
import reData from "~/logic/reactive.js"
import taskPlate from "~/components/tasks/taskplate.js"
import { safeSetLocalStorageItem } from "~/logic/util.js"
import data from "~/logic/data.js"
import { sendTasksData } from "~/logic/send.js"
import dayjs from "dayjs"
import { getObjectById } from "~/logic/util.js"
import { selectTaskById } from "~/logic/manipulate.js"
import navigate from "~/logic/router.js"

let dragIndex = null
let startY = 0
let currentY = 0
let placeholderIndex = null
let draggingElement = null

const onMove = (event) => {
  if (dragIndex == null) return

  event.preventDefault() // Предотвращаем скролл страницы при таче и лишние выделения при мыши

  currentY = getYFromEvent(event)
  const deltaY = currentY - startY

  if (draggingElement) {
    draggingElement.style.transform = `translateY(${deltaY}px)`
  }

  // Определяем потенциальную позицию вставки
  const elements = Array.from(document.querySelectorAll(".intention-item"))
  const draggedEl = elements[dragIndex]
  if (!draggedEl) return

  const draggedRect = draggedEl.getBoundingClientRect()
  placeholderIndex = dragIndex

  for (let i = 0; i < elements.length; i++) {
    const rect = elements[i].getBoundingClientRect()
    const middle = rect.top + rect.height / 2
    if (deltaY > 0 && draggedRect.bottom > middle) {
      // Двигаемся вниз
      placeholderIndex = i
    } else if (deltaY < 0 && draggedRect.top < middle) {
      // Двигаемся вверх
      placeholderIndex = i
      break
    }
  }
}

const getYFromEvent = (event) => {
  if (event.touches && event.touches.length > 0) {
    return event.touches[0].clientY
  } else {
    return event.clientY
  }
}

const onStart = (index, event) => {
  if (!event) return
  dragIndex = index
  startY = getYFromEvent(event)
  currentY = startY

  draggingElement = event.currentTarget.closest(".intention-item")
  // draggingElement.style.opacity = "0.7"
  draggingElement.style.zIndex = "999"

  // Добавляем слушатели на документ, чтобы отлавливать движение даже если курсор/палец вышел за пределы элемента
  document.addEventListener("touchmove", onMove, { passive: false })
  document.addEventListener("touchend", onEnd)
  document.addEventListener("mousemove", onMove)
  document.addEventListener("mouseup", onEnd)
}

const onEnd = () => {
  if (dragIndex == null) return

  // Удаляем слушатели с документа, так как перетаскивание закончено
  document.removeEventListener("touchmove", onMove)
  document.removeEventListener("touchend", onEnd)
  document.removeEventListener("mousemove", onMove)
  document.removeEventListener("mouseup", onEnd)

  const index = placeholderIndex == null ? dragIndex : placeholderIndex
  if (index !== dragIndex) {
    const updated = [...reData.intentions]
    const [movedTask] = updated.splice(dragIndex, 1)
    updated.splice(index, 0, movedTask)
    reData.intentions = updated

    // Обновление intentionPriority
    const previousTask = updated[index - 1]
    const nextTask = updated[index + 1]

    let newPriority
    if (!previousTask) {
      // Стал первым
      newPriority = nextTask.intentionPriority / 2
    } else if (!nextTask) {
      // Стал последним
      newPriority = Math.floor(previousTask.intentionPriority + 1.1)
    } else {
      // Между двумя
      newPriority = (previousTask.intentionPriority + nextTask.intentionPriority) / 2
    }

    // Найти соответствующую задачу в data.tasks
    const movedTaskData = getObjectById(movedTask.id)
    if (movedTaskData) {
      movedTaskData.intentionPriority = newPriority || Math.random() + 1
      movedTaskData.timestamp = dayjs().valueOf()
      sendTasksData([movedTaskData])
    }
    movedTask.intentionPriority = movedTaskData.intentionPriority
    // Сохранить данные локально
    safeSetLocalStorageItem("tasks", data.tasks)
  }

  // Сброс стилей
  const elements = document.querySelectorAll(".intention-item")
  elements.forEach((el) => {
    el.style.opacity = "1"
    el.style.transform = "translateY(0)"
    el.style.zIndex = "auto"
  })

  dragIndex = null
  placeholderIndex = null
  startY = 0
  currentY = 0
  draggingElement = null
}

const onIntentionClick = (task) => {
  navigate("tasks")

  selectTaskById(task.id)

  console.log(`Task clicked: ${task.name}`) // Здесь можно добавить нужную логику обработки клика
}

function renderIntention(task, index) {
  const isHighlighted =
    reData.searchString && task.name && task.name.toLowerCase().includes(reData.searchString.toLowerCase())
      ? "border-accent"
      : "border-neutral-100 dark:border-neutral-900"

  return html`<div
    class="intention-item flex flex-col gap-3 break-words bg-neutral-100 dark:bg-neutral-900 p-3 rounded-lg overflow dark:text-white border ${isHighlighted}">
    <div class="flex items-center">
      <div
        class="fontaccent pl-0.5 drag-handle w-7 h-7 bg-neutral-150 dark:bg-neutral-700 rounded-full flex justify-center items-center cursor-move"
        @mousedown="${(e) => onStart(index, e)}"
        @touchstart="${(e) => onStart(index, e)}">
        ${index + 1}
      </div>
      <div @click="${(e) => onIntentionClick(task)}" class="ml-4 flex flex-wrap-reverse gap-3 w-full">
        <div class="w-[28rem] max-w-full mr-auto">
          ${() => task.name}${() => (task.note && task.note.length > 0 ? " 📝" : "")}
        </div>
        <div class="flex gap-3">${() => taskPlate(task, "p-1")}</div>
      </div>
    </div>
  </div>`
}
// <div class="text-xs text-gray-500">${() => task.intentionPriority}</div>

export default () => {
  return html`${() => reData.intentions.map(renderIntention)}`
}
