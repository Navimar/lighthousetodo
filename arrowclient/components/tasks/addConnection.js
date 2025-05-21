import { html } from "~/arrow-js/index.js"
import { getObjectByName } from "~/logic/util.js"
import reData from "~/logic/reactive.js"
import data from "~/logic/data.js"
import { showSaveButtonHidePause } from "~/logic/manipulate.js"
import taskplate from "~/components/tasks/taskplate.js"

/**
 * Добавляет связь между задачей (task) и другой задачей,
 * найденной по имени (taskName), в нужное поле (fromIds/toIds/moreImportantIds/lessImportantIds).
 */
function addTaskByName(task, taskName, type) {
  showSaveButtonHidePause()
  const fieldMap = {
    from: "fromIds",
    to: "toIds",
    moreImportant: "moreImportantIds",
    lessImportant: "lessImportantIds",
  }
  const fieldName = fieldMap[type]
  if (!fieldName) {
    throw new Error(`Неверный тип связи: ${type}`)
  }

  // Актуализируем задачу из "видимых"
  task = reData.visibleTasks.find((t) => t.id === task.id)

  // Считаем, что getObjectByName гарантированно возвращает объект
  const taskObj = getObjectByName(taskName)
  // Добавляем связь
  if (!task[fieldName]) {
    task[fieldName] = []
  }

  if (Object.keys(fieldMap).some((key) => (task[fieldMap[key]] || []).includes(taskObj.id))) {
    console.warn(`Задача "${taskObj.name}" уже связана (по любому типу)`)
    return
  }
  task[fieldName].push(taskObj.id)
}

/**
 * При клике на элемент автокомплита:
 * - находим имя задачи,
 * - добавляем связь,
 * - очищаем поле ввода,
 * - скрываем сам список подсказок.
 */
function complete(e, divId, task, type) {
  console.log("complete")
  const taskName = e.currentTarget.innerText.trim()
  if (!taskName) return

  addTaskByName(task, taskName, type)

  // Очищаем инпут
  const input = document.getElementById(divId)
  if (input) {
    input.value = ""
  }

  // Скрываем подсказки
  reData.autoComplete.list = []
}

/**
 * Генерирует автокомплит для инпута с id = divId.
 * Если компонент встречается несколько раз, то у каждого
 * будут свои поля и своя логика отображения.
 */
function handleInputKeyDown(e, task, type) {
  console.log(type)
  if (e.key === "Enter") {
    e.preventDefault()
    const name = e.target.value.trim()
    if (name) {
      addTaskByName(task, name, type)
      e.target.value = ""
      reData.autoComplete.list = []
    }
  }
}

function handleInput(e) {
  reData.autoComplete.div = e.target.id

  const currentLineText = e.target.value.toLowerCase() // Преобразование к нижнему регистру

  reData.autoComplete.list = []
  reData.autoComplete.line = currentLineText
  reData.autoComplete.div = e.target.id

  if (!currentLineText) {
    return
  }

  // Искать совпадения в data.tasks на основе поля name
  const matches = data.tasks
    .filter((taskItem) => taskItem.name.toLowerCase().includes(currentLineText) && taskItem.id != reData.selectedScribe) // Преобразование к нижнему регистру
    .sort((a, b) => {
      // Основная сортировка на основе длины toNames
      const difference =
        (b.toIds?.length || 0) + (b.fromIds?.length || 0) - ((a.toIds?.length || 0) + (a.fromIds?.length || 0))
      if (difference !== 0) return difference

      // Дополнительная сортировка на основе длины name, если длины toNames одинаковы
      return a.name.length - b.name.length
    })
    .slice(0, 7) // Ограничиваем список

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

function renderAutocomplete(divId, task, type) {
  // Если есть совпадения и мы сейчас "под" этим инпутом показываем подсказки
  if (!(reData.autoComplete.list.length > 0 && reData.autoComplete.div === divId)) return ""

  const elements = reData.autoComplete.list.map(
    (itemHtml) => html`
      <div
        class="text-base cursor-pointer break-words hover:bg-neutral-200 dark:hover:bg-neutral-600 p-2"
        @click="${(event) => complete(event, divId, task, type)}">
        ${itemHtml}
      </div>
    `,
  )

  return html`
    <div id="autocomplete-list" class="w-full z-10 top-full">
      <div class="border border-neutral-400 dark:bg-neutral-800 dark:border-neutral-600 rounded bg-white dark:bg-black">
        ${() => elements}
      </div>
    </div>
  `
}

// Закрываем автокомплит при клике вне него
document.addEventListener("click", function (event) {
  const autocompleteElem = document.getElementById("autocomplete-list")

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
})

/**
 * Экспортируемый компонент (может использоваться несколько раз),
 * у которого есть два текстовых поля (левое и правое).
 * Для каждого поля отдельно вызываем renderAutocomplete(...).
 */
export default (task, type) => {
  // Идентификаторы для двух полей
  const inputIds =
    type === "from"
      ? { important: "moreImportantInput", regular: "fromInput" }
      : { important: "lessImportantInput", regular: "toInput" }

  // Подписи для placeholder
  const placeholders =
    type === "from"
      ? {
          important: "Более важные задачи...",
          regular: "Блокирующие выполнение задачи...",
        }
      : {
          important: "Менее важные задачи...",
          regular: "Открывающиеся задачи...",
        }

  // Визуальный цвет/стиль фона для каждого блока
  const bg1 = type === "from" ? "bg-blocked dark:bg-blocked-dark" : "bg-opens dark:bg-opens-dark"
  const bg2 =
    type === "to" ? "bg-lessimportant dark:bg-lessimportant-dark" : "bg-moreimportant dark:bg-moreimportant-dark"

  return html`
    <div class="flex">
      <div class="${bg1} py-2 w-1/2">
        <div
          class="
            flex items-center
            px-3 py-1 mx-1 gap-1
            rounded-lg bg-white dark:bg-black
            border border-neutral-150 dark:border-neutral-800
            text-neutral-700 dark:text-neutral-350
            relative">
          <input
            id="${inputIds.regular}"
            class="placeholder:italic focus:outline-none text-xs bg-transparent flex-grow"
            placeholder="${placeholders.regular}"
            @input="${handleInput}"
            @keydown="${(e) => handleInputKeyDown(e, task, type === "from" ? "from" : "to")}"
            } />
          <button
            class="flex-none text-base fontmono text-accent hover:text-compliment bg-transparent border-none cursor-pointer"
            @click="${() => {
              console.log("click1")
              const input = document.getElementById(inputIds.regular)
              if (!input) return
              const name = input.value.trim()
              if (!name) return
              addTaskByName(task, name, type === "from" ? "from" : "to")
              input.value = ""
            }}">
            <svg class="w-2.5" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M2 8H14M8 2V14" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
          </button>
        </div>
      </div>

      <div class="${bg2} py-2 w-1/2">
        <div
          class="
            flex items-center
            px-3 py-1 mx-1 gap-1
            rounded-lg bg-white dark:bg-black
            border border-neutral-150 dark:border-neutral-800
            text-neutral-700 dark:text-neutral-350
            relative">
          <input
            id="${inputIds.important}"
            class="placeholder:italic focus:outline-none text-xs bg-transparent flex-grow"
            placeholder="${placeholders.important}"
            @input="${handleInput}"
            @keydown="${(e) => {
              handleInputKeyDown(e, task, type === "from" ? "moreImportant" : "lessImportant")
            }}" />
          <button
            class="flex-none text-base fontmono text-accent hover:text-compliment bg-transparent border-none cursor-pointer"
            @click="${() => {
              console.log("click2")
              const input = document.getElementById(inputIds.important)
              if (!input) return
              const name = input.value.trim()
              if (!name) return
              addTaskByName(task, name, type === "from" ? "moreImportant" : "lessImportant")
              input.value = ""
            }}">
            <svg class="w-2.5" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M2 8H14M8 2V14" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
    ${() => renderAutocomplete(inputIds.regular, task, type)}${() =>
      renderAutocomplete(inputIds.important, task, type === "from" ? "moreImportant" : "lessImportant")}
  `
}
