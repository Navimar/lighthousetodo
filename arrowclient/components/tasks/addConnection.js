import { html } from "~/arrow-js/index.js"
import { getObjectByName } from "~/logic/util.js"
import reData from "~/logic/reactive.js"
import data from "~/logic/data.js"

/**
 * Добавляет связь между задачей (task) и другой задачей,
 * найденной по имени (taskName), в нужное поле (fromIds/toIds/moreImportantIds/lessImportantIds).
 */
function addTaskByName(task, taskName, type) {
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
  if (!task[fieldName].includes(taskObj.id)) {
    task[fieldName].push(taskObj.id)
  }
}

/**
 * При клике на элемент автокомплита:
 * - находим имя задачи,
 * - добавляем связь,
 * - очищаем поле ввода,
 * - скрываем сам список подсказок.
 */
function complete(e, divId, task, type) {
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
function renderAutocomplete(divId, task, type) {
  reData.autoComplete.list
  const element = document.getElementById(divId)
  if (!element) return ""

  const currentLineText = element.value.trim()
  if (!currentLineText) return ""

  // Ищем подходящие задачи
  const matches = data.tasks
    .filter((t) => t.name.toLowerCase().includes(currentLineText.toLowerCase()) && t.id !== reData.selectedScribe)
    .sort((a, b) => {
      // Сортируем: сначала по количеству связей, потом по длине имени
      const diff =
        (b.toIds?.length || 0) + (b.fromIds?.length || 0) - ((a.toIds?.length || 0) + (a.fromIds?.length || 0))
      if (diff !== 0) return diff
      return a.name.length - b.name.length
    })
    .slice(0, 7)

  // Заполняем список подсветок
  reData.autoComplete.list = matches.map((match) => {
    const escaped = currentLineText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    return match.name.replace(new RegExp(escaped, "ig"), (found) => `<strong>${found}</strong>`)
  })

  // Если есть совпадения и мы сейчас "под" этим инпутом показываем подсказки
  if (reData.autoComplete.list.length > 0 && reData.autoComplete.div === divId) {
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
      <div id="absolute autocomplete-list" class="w-full z-10 top-full">
        <div
          class="border border-neutral-400 dark:bg-neutral-800 dark:border-neutral-600 rounded bg-white dark:bg-black">
          ${() => elements}
        </div>
      </div>
    `
  }

  return ""
}

// Закрываем автокомплит при клике вне него
document.addEventListener("click", function (event) {
  const autocompleteElem = document.querySelector("#autocomplete-list")
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
      <!-- Левое поле -->
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
            @keydown="${(e) => {
              // Запоминаем, под каким инпутом показывать список
              reData.autoComplete.div = e.target.id
              reData.autoComplete.list = []
              // При Enter – сразу связываем
              if (e.key === "Enter") {
                e.preventDefault()
                const name = e.target.value.trim()
                if (name) {
                  addTaskByName(task, name, type === "from" ? "from" : "to")
                  e.target.value = ""
                }
              }
            }}" />
          <button
            class="flex-none text-base fontmono text-accent hover:text-compliment bg-transparent border-none cursor-pointer"
            @click="${() => {
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

      <!-- Правое поле -->
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
            @keydown="${(e) => {
              reData.autoComplete.div = e.target.id
              reData.autoComplete.list = []
              if (e.key === "Enter") {
                e.preventDefault()
                const name = e.target.value.trim()
                if (name) {
                  addTaskByName(task, name, type === "from" ? "moreImportant" : "lessImportant")
                  e.target.value = ""
                }
              }
            }}" />
          <button
            class="flex-none text-base fontmono text-accent hover:text-compliment bg-transparent border-none cursor-pointer"
            @click="${() => {
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

    <!-- Важно: два вызова renderAutocomplete,
         каждый для своего инпута (left/right).
         Так компонент может рендериться несколько раз на странице,
         и у каждого будут свои поля, свой список подсказок. -->
    ${() => renderAutocomplete(inputIds.regular, task, type === "from" ? "from" : "to")}
    ${() => renderAutocomplete(inputIds.important, task, type === "from" ? "moreImportant" : "lessImportant")}
  `
}
