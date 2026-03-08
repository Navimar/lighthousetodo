import { html } from "~/arrow-js/index.js"
import reData from "~/logic/reactive.js"
import data from "~/logic/data.js"
import taskplate from "~/components/tasks/taskplate.js"
import { relationIcon } from "~/components/tasks/svgicon.js"
import { addTaskByName, clearAddConnectionDraft, setAddConnectionDraft } from "~/components/tasks/connectionActions.js"

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
  clearAddConnectionDraft()

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
    const added = addTaskByName(task, name, direction, relationType)
    if (added) {
      e.target.value = ""
      clearAddConnectionDraft()
      reData.autoComplete.list = []
    }
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
  setAddConnectionDraft(e.target.id === "fromInput" ? "from" : "to", e.target.value)
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
            const added = addTaskByName(task, name, type, "lead")
            if (!added) return
            input.value = ""
            clearAddConnectionDraft()
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
            const added = addTaskByName(task, name, type, "block")
            if (!added) return
            input.value = ""
            clearAddConnectionDraft()
            reData.autoComplete.list = []
          }}">
          ${relationIcon("blocks")}
        </button>
      </div>
    </div>
    ${() => renderAutocomplete(inputId, task, type)}
  `
}
