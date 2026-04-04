import { watch } from "~/arrow-js/index.js"
import { safeSetLocalStorageItem } from "~/logic/sync.js"
import reData from "~/logic/reactive.js"
import performance from "~/logic/performance.js"
import { showSaveButtonHidePause, updateDateClass, updatePauseReadyButton } from "~/logic/manipulate.js"
import { getObjectById } from "~/logic/util.js"
import { NEWSCRIBETEXT } from "~/logic/const.js"
import {
  createTaskEditor,
  destroyTaskEditor,
  focusTaskEditor,
  getActiveTaskEditor,
  selectTaskTitle,
} from "~/components/tasks/editor/taskEditor.js"

let editorTaskId = null
let pendingEditorMountObserver = null
let pendingEditorReattachObserver = null

function stopPendingEditorMountObserver() {
  if (!pendingEditorMountObserver) return
  pendingEditorMountObserver.disconnect()
  pendingEditorMountObserver = null
}

function stopPendingEditorReattachObserver() {
  if (!pendingEditorReattachObserver) return
  pendingEditorReattachObserver.disconnect()
  pendingEditorReattachObserver = null
}

function waitForSelectedTaskDom(taskId, onReady) {
  stopPendingEditorMountObserver()
  if (!taskId || typeof MutationObserver === "undefined" || typeof document === "undefined") return

  pendingEditorMountObserver = new MutationObserver(() => {
    const selectedtaskdiv = document.getElementById("selectedtask")
    const editdiv = document.getElementById("edit")
    const domMatchesSelectedTask =
      selectedtaskdiv?.dataset.taskId === taskId && editdiv?.dataset.taskId === taskId

    if (!domMatchesSelectedTask) return

    stopPendingEditorMountObserver()
    onReady()
  })

  pendingEditorMountObserver.observe(document.body, {
    childList: true,
    subtree: true,
  })
}

function watchForSelectedTaskReattach(taskId, onReady) {
  stopPendingEditorReattachObserver()
  if (!taskId || typeof MutationObserver === "undefined" || typeof document === "undefined") return

  pendingEditorReattachObserver = new MutationObserver(() => {
    const selectedtaskdiv = document.getElementById("selectedtask")
    const editdiv = document.getElementById("edit")
    const activeEditor = getActiveTaskEditor()
    const domMatchesSelectedTask =
      selectedtaskdiv?.dataset.taskId === taskId && editdiv?.dataset.taskId === taskId

    if (!domMatchesSelectedTask || !activeEditor) return
    if (activeEditor.dom.parentElement === editdiv) return

    stopPendingEditorReattachObserver()
    onReady()
  })

  pendingEditorReattachObserver.observe(document.body, {
    childList: true,
    subtree: true,
  })
}

export default () => {
  watch(() => {
    safeSetLocalStorageItem("timer", reData.currentTime.timerStarted)
  })
  watch(() => {
    performance.start("watch selectedScribe")
    try {
      reData.selectedScribe
      reData.visibleTasks
      reData.searchString
      reData.addConnectionDraft.value
      reData.addConnectionDraft.side
      reData.autoComplete.div
      reData.autoComplete.line
      reData.autoComplete.list.length
      const syncSelectedScribeView = () => {
        let selectedScribe = null
        if (reData.selectedScribe) selectedScribe = getObjectById(reData.selectedScribe)
        let selectedtaskdiv = document.getElementById("selectedtask")
        let editdiv = document.getElementById("edit")
        const domMatchesSelectedTask =
          !selectedScribe ||
          (selectedtaskdiv?.dataset.taskId === selectedScribe.id && editdiv?.dataset.taskId === selectedScribe.id)

        if (selectedScribe && !domMatchesSelectedTask) {
          return false
        }

        stopPendingEditorMountObserver()
        stopPendingEditorReattachObserver()

        const selectedTaskChanged = editorTaskId !== selectedScribe?.id
        let shouldScrollToSelected = false
        if (editdiv && selectedScribe) {
          const activeEditor = getActiveTaskEditor()
          if (!activeEditor || selectedTaskChanged) {
            destroyTaskEditor(activeEditor)
            createTaskEditor({
              element: editdiv,
              initialName: selectedScribe.name || "",
              initialNote: selectedScribe.note || "",
              onChange: showSaveButtonHidePause,
            })
            editorTaskId = selectedScribe.id
            shouldScrollToSelected = true
            if (selectedScribe.name.startsWith(NEWSCRIBETEXT)) {
              selectTaskTitle()
            } else {
              focusTaskEditor({ atStart: true })
            }
          } else {
            if (activeEditor.dom.parentElement !== editdiv) {
              editdiv.appendChild(activeEditor.dom)
            }
            watchForSelectedTaskReattach(selectedScribe.id, syncSelectedScribeView)
          }
        } else {
          destroyTaskEditor(getActiveTaskEditor())
          editorTaskId = null
        }
        if (selectedtaskdiv && shouldScrollToSelected) selectedtaskdiv.scrollIntoView(true)
        updateDateClass()
        if (selectedScribe) updatePauseReadyButton(selectedScribe)
        return Boolean(editdiv || !selectedScribe)
      }

      if (!syncSelectedScribeView()) {
        waitForSelectedTaskDom(reData.selectedScribe, syncSelectedScribeView)
      }
    } finally {
      performance.end("watch selectedScribe")
    }
  })
}
