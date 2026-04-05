import { html } from "~/arrow-js/index.js"
import reData from "~/logic/reactive.js"
import data from "~/logic/data.js"
import navigate from "~/logic/router.js"
import { fitMindmap, relayoutMindmap, zoomMindmap } from "~/logic/mindmap.js"
import timeSlider from "~/components/tasks/timeslider.js"
import dateInput from "~/components/tasks/dateinput.js"
import controlButtons from "~/components/tasks/controlButtons.js"
import tagLine from "~/components/tasks/tagline.js"
import addConnection from "~/components/tasks/addConnection.js"
import hiddenData from "~/components/tasks/hiddenData.js"

function selectedTask() {
  const id = reData.selectedScribe || reData.mapSelectedNodeId
  if (!id) return null
  return data.tasks.nodes.get(id) || null
}

function relationSummary(taskId) {
  if (!taskId) return { leads: 0, blocks: 0, incomingLeads: 0, incomingBlocks: 0 }

  const outgoing = data.tasks.getRelations(taskId)
  const incoming = data.tasks.getIncomingRelations(taskId)

  return {
    leads: outgoing.leads.length,
    blocks: outgoing.blocks.length,
    incomingLeads: incoming.leads.length,
    incomingBlocks: incoming.blocks.length,
  }
}

export default () => {
  if (reData.route[0] !== "map") return ""

  return html`<div class="fixed inset-0 z-[45] bg-neutral-100 dark:bg-neutral-950 text-black dark:text-white">
    <div class="flex h-full gap-4 p-4">
      <aside class="flex w-[30rem] shrink-0 flex-col gap-3 overflow-hidden rounded-xl bg-white p-4 dark:bg-black">
        <div class="flex items-center gap-2">
          <button class="button-gray" @click="${() => navigate("tasks")}">К списку</button>
          <button class="button-gray" @click="${() => relayoutMindmap()}">Переложить</button>
          <button class="button-gray" @click="${() => zoomMindmap(0.85)}">-</button>
          <button class="button-gray" @click="${() => zoomMindmap(1.15)}">+</button>
          <button class="button-gray" @click="${() => fitMindmap()}">Вместить</button>
        </div>
        <div class="flex items-center gap-2 text-sm">
          <span class="text-neutral-500 dark:text-neutral-400">Предки:</span>
          <button
            class="${() =>
              reData.mapAncestorFocusMode === "single" ? "button-blue" : "button-gray"}"
            @click="${() => {
              reData.mapAncestorFocusMode = "single"
            }}">
            Один слой
          </button>
          <button
            class="${() =>
              reData.mapAncestorFocusMode === "chain" ? "button-blue" : "button-gray"}"
            @click="${() => {
              reData.mapAncestorFocusMode = "chain"
            }}">
            Цепочка
          </button>
        </div>
        <div class="text-sm text-neutral-500 dark:text-neutral-400">
          Весь граф на одном поле. Два пальца двигают холст, правая кнопка с движением мыши меняет масштаб.
        </div>
        <div class="min-h-0 flex-1 overflow-y-auto rounded-lg bg-neutral-100 p-3 dark:bg-neutral-900">
          <div class="mb-3 text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Выбрано</div>
          ${() => {
            const task = selectedTask()
            const stats = relationSummary(task?.id)

            if (!task) {
              return html`<div class="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                Нажми на узел, чтобы увидеть детали.
              </div>`
            }

            return html`<div
              id="selectedtask"
              data-task-id="${() => task.id || ""}"
              class="flex flex-col overflow dark:text-white">
              ${() => timeSlider(task)} ${() => dateInput(task)}
              <div class="mt-6">${() => controlButtons(task)}</div>
              <div class="mt-6 flex flex-col">
                ${() => tagLine(task, "from")} ${() => addConnection(task, "from")}
                <div
                  id="edit"
                  data-task-id="${() => task.id || ""}"
                  class="mx-2 py-8 min-h-[18rem] whitespace-pre-wrap focus:outline-none"
                  role="textbox"
                  aria-multiline="true"></div>
                ${() => addConnection(task, "to")} ${() => tagLine(task, "to")}
              </div>
              <div class="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div class="rounded bg-white p-2 dark:bg-black">Исходящие leads: ${stats.leads}</div>
                <div class="rounded bg-white p-2 dark:bg-black">Исходящие blocks: ${stats.blocks}</div>
                <div class="rounded bg-white p-2 dark:bg-black">Входящие leads: ${stats.incomingLeads}</div>
                <div class="rounded bg-white p-2 dark:bg-black">Входящие blocks: ${stats.incomingBlocks}</div>
              </div>
              ${() => hiddenData(task)}
            </div>`
          }}
        </div>
      </aside>
      <div class="relative min-w-0 flex-1 rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-black">
        <div id="mindmap-canvas" class="h-full w-full"></div>
      </div>
    </div>
  </div>`
}
