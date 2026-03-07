import { html } from "~/arrow-js/index.js"
import { getObjectByName } from "~/logic/util.js"
import reData from "~/logic/reactive.js"
import data from "~/logic/data.js"
import taskplate from "~/components/tasks/taskplate.js"
import { relationIcon } from "~/components/tasks/svgicon.js"
import { makevisible } from "~/logic/makevisible"
import saveTask from "~/logic/savetask.js"

import { sendRelation } from "~/logic/send.js"

/**
 * Добавляет связь между задачей (task) и другой задачей,
 * найденной по имени (taskName), с учетом направления и типа связи.
 */
function addTaskByName(task, taskName, direction, relationType) {
  saveTask()
  const ts = Date.now()
  const selectedTaskId = task?.id
  if (!selectedTaskId) {
    console.warn("addTaskByName: selected task id is missing", { task, taskName, direction, relationType })
    return
  }

  const relationMap = {
    block: "blocks",
    lead: "leads",
  }
  const normalizedType = relationMap[relationType]
  const isIncoming = direction === "from"
  if (!["from", "to"].includes(direction) || !normalizedType) {
    throw new Error(`Неверные параметры связи: direction=${direction}, relationType=${relationType}`)
  }

  // Актуализируем задачу из "видимых"
  task = reData.visibleTasks.find((t) => t.id === selectedTaskId) || data.tasks.nodes.get(selectedTaskId)
  if (!task?.id || !data.tasks.nodes.has(task.id)) {
    console.warn("addTaskByName: selected task is not available in graph", {
      selectedTaskId,
      taskName,
      direction,
      relationType: normalizedType,
    })
    return
  }

  // Считаем, что getObjectByName гарантированно возвращает объект
  const taskObj = getObjectByName(taskName)
  if (!taskObj) {
    console.warn(`Задача с именем "${taskName}" не найдена`)
    return
  }
  if (taskObj.id === task.id) {
    console.warn(`Нельзя связать задачу "${taskObj.name}" саму с собой`)
    return
  }
  console.log("taskObj in addTaskByName", taskObj)

  // Определяем from/to на основе направления
  const fromId = isIncoming ? taskObj.id : task.id
  const toId = isIncoming ? task.id : taskObj.id
  if (!fromId || !toId) {
    console.warn("addTaskByName: invalid relation ids", {
      fromId,
      toId,
      taskName,
      direction,
      relationType: normalizedType,
    })
    return
  }
  if (!data.tasks.nodes.has(fromId) || !data.tasks.nodes.has(toId)) {
    console.warn("addTaskByName: relation points to missing nodes", {
      fromId,
      toId,
      taskName,
      direction,
      relationType: normalizedType,
    })
    return
  }

  // Проверяем, есть ли уже связь между этими задачами (в том же направлении)
  const outgoing = data.tasks.getRelations(fromId)
  const existingType = outgoing.leads.includes(toId) ? "leads" : outgoing.blocks.includes(toId) ? "blocks" : null

  if (existingType === normalizedType) {
    console.warn(`Задача "${taskObj.name}" уже связана (по типу ${normalizedType})`)
    return
  }

  // Если связь другого типа — отправим removed для замены
  const removed = existingType ? { from: fromId, to: toId, type: existingType } : null

  // Добавляем связь в граф (граф сам удалит старую через _removeExistingRelation)
  if (normalizedType === "leads") {
    data.tasks.addLead(fromId, toId, ts)
  } else {
    data.tasks.addBlock(fromId, toId, ts)
  }

  sendRelation({
    added: { from: fromId, to: toId, type: normalizedType, ts },
    removed,
  })
  makevisible()
}

/**
 * При клике на элемент автокомплита:
 * - находим имя задачи,
 * - создаем связь типа leads,
 * - скрываем сам список подсказок.
 */
function complete(e, divId, task, direction) {
  const taskName = e.currentTarget.innerText.trim()
  if (!taskName) return

  // По умолчанию клик по автокомплиту создает связь типа leads.
  addTaskByName(task, taskName, direction, "lead")

  const input = document.getElementById(divId)
  if (input) {
    input.value = ""
  }

  // Скрываем подсказки
  reData.autoComplete.list = []
}

function handleInputKeyDown(e, task, direction) {
  // Обработка Enter/Escape для инпута автокомплита
  if (e.key === "Enter") {
    e.preventDefault()
    const name = e.target.value.trim()
    if (!name) {
      reData.autoComplete.list = []
      return
    }

    // Enter -> leads, Shift+Enter/Cmd+Enter -> blocks
    const relationType = e.shiftKey || e.metaKey ? "block" : "lead"
    addTaskByName(task, name, direction, relationType)
    e.target.value = ""
    reData.autoComplete.list = []
  } else if (e.key === "Escape") {
    // Закрыть подсказки по Esc
    reData.autoComplete.list = []
  }
}

function debounce(fn, delay = 150) {
  let timer
  return function (...args) {
    clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), delay)
  }
}

function handleInputCore(e) {
  reData.autoComplete.div = e.target.id

  const currentLineText = e.target.value.toLowerCase() // Преобразование к нижнему регистру

  reData.autoComplete.list = []
  reData.autoComplete.line = currentLineText

  if (!currentLineText) {
    return
  }

  // Искать совпадения в data.tasks на основе поля name
  const allTasks = Array.from(data.tasks.nodes.entries()).map(([id, nodeData]) => {
    const rels = data.tasks.getRelations(id)
    return {
      id,
      ...nodeData,
      leadsCount: rels.leads.length,
      blocksCount: rels.blocks.length,
    }
  })

  const matches = allTasks
    .filter(
      (taskItem) =>
        taskItem.name && taskItem.name.toLowerCase().includes(currentLineText) && taskItem.id !== reData.selectedScribe,
    )
    .sort((a, b) => {
      const difference = b.leadsCount + b.blocksCount - (a.leadsCount + a.blocksCount)
      if (difference !== 0) return difference
      return a.name.length - b.name.length
    })
    .slice(0, 7)

  // Обновлять reData.autoComplete.list с найденными именами совпадений
  reData.autoComplete.list = matches.map((match) => {
    const escapedText = currentLineText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    const highlightedName = match.name.replace(
      new RegExp(escapedText, "ig"),
      (matchText) => `<strong>${matchText}</strong>`,
    )

    return html`
      <div class="flex gap-1.5 items-center">
        <div class="break-words">${highlightedName}</div>
        <div
          class="ml-auto h-fit flex items-center text-center uppercase whitespace-nowrap fontaccent text-sm gap-2 empty:hidden text-xxs">
          ${taskplate(match)}
        </div>
      </div>
    `
  })
}

const debouncedHandleInput = debounce(handleInputCore, 150)
function handleInput(e) {
  debouncedHandleInput(e)
}

function renderAutocomplete(divId, task, direction) {
  // Если есть совпадения и мы сейчас "под" этим инпутом показываем подсказки
  if (!(reData.autoComplete.list.length > 0 && reData.autoComplete.div === divId)) return ""

  const elements = reData.autoComplete.list.map(
    (itemHtml) => html`
      <div
        class="text-base cursor-pointer break-words hover:bg-neutral-200 dark:hover:bg-neutral-600 p-2"
        @click="${(event) => complete(event, divId, task, direction)}">
        ${() => itemHtml}
      </div>
    `,
  )

  return html`
    <div id="autocomplete-list-${divId}" class="w-full z-10 top-full">
      <div
        class="overflow-hidden border border-neutral-400 dark:bg-neutral-800 dark:border-neutral-600 rounded bg-white dark:bg-black">
        ${() => elements}
      </div>
    </div>
  `
}

// Закрываем автокомплит при клике вне него
function onAutocompleteDocumentClick(event) {
  const activeDivId = reData.autoComplete.div
  if (!activeDivId) return
  const autocompleteElem = document.getElementById(`autocomplete-list-${activeDivId}`)
  if (!autocompleteElem) return

  let targetElem = event.target
  while (targetElem) {
    if (targetElem === autocompleteElem) {
      // Клик внутри автокомплита – не скрываем
      return
    }
    targetElem = targetElem.parentNode
  }
  // Клик снаружи – скрываем
  reData.autoComplete.list = []
}
if (typeof window !== "undefined" && !window.__adastra_ac_clickBound) {
  document.addEventListener("click", onAutocompleteDocumentClick)
  window.__adastra_ac_clickBound = true
}

/**
 * Экспортируемый компонент с одним полем ввода:
 * направление определяется type ("from"/"to"),
 * тип связи задается кнопкой подтверждения ("🔗" или "🤝").
 */
export default (task, type) => {
  const inputId = type === "from" ? "fromInput" : "toInput"
  const placeholder =
    type === "from"
      ? "Добавить более приоритетную / блокирующую задачу..."
      : "Добавить менее приоритетную / открывающуюся задачу..."
  const bg = "bg-neutral-50 dark:bg-neutral-900"

  return html`
    <div class="${bg} py-2">
      <div
        class="
          flex items-center
          px-3 p-1 mx-2.5 gap-2
          align-middle
          rounded-lg bg-white dark:bg-black
          border border-neutral-150 dark:border-neutral-800
          text-neutral-700 dark:text-neutral-350
          relative">
        <input
          id="${inputId}"
          class="placeholder:italic placeholder:opacity-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-700 focus:outline-none text-xs bg-transparent flex-grow"
          placeholder="${placeholder}"
          @input="${handleInput}"
          @keydown="${(e) => handleInputKeyDown(e, task, type)}" />
        <button
          type="button"
          class="flex-none p-1 text-neutral-600 dark:text-neutral-400 bg-transparent border-none cursor-pointer"
          title="приоритизирующая связь · Enter"
          @click="${() => {
            const input = document.getElementById(inputId)
            if (!input) return
            const name = input.value.trim()
            if (!name) return
            addTaskByName(task, name, type, "lead")
            input.value = ""
            reData.autoComplete.list = []
          }}">
          ${relationIcon("leads")}
        </button>
        <button
          type="button"
          class="flex-none p-1 text-accent bg-transparent border-none cursor-pointer"
          title="Блокирующая связь · Shift + Enter"
          @click="${() => {
            const input = document.getElementById(inputId)
            if (!input) return
            const name = input.value.trim()
            if (!name) return
            addTaskByName(task, name, type, "block")
            input.value = ""
            reData.autoComplete.list = []
          }}">
          ${relationIcon("blocks")}
        </button>
      </div>
    </div>
    ${() => renderAutocomplete(inputId, task, type)}
  `
}
