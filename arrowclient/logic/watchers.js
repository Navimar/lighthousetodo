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
  setTaskEditorValue,
} from "~/components/tasks/editor/taskEditor.js"

let editorTaskId = null

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
      Promise.resolve().then(() => {
        let editdiv = document.getElementById("edit")
        let selectedScribe = null
        if (reData.selectedScribe) selectedScribe = getObjectById(reData.selectedScribe)
        if (editdiv && selectedScribe) {
          const activeEditor = getActiveTaskEditor()
          if (!activeEditor) {
            createTaskEditor({
              element: editdiv,
              initialName: selectedScribe.name || "",
              initialNote: selectedScribe.note || "",
              onChange: showSaveButtonHidePause,
            })
            editorTaskId = selectedScribe.id
            if (selectedScribe.name.startsWith(NEWSCRIBETEXT)) {
              selectTaskTitle()
            } else {
              focusTaskEditor({ atStart: true })
            }
          } else if (editorTaskId !== selectedScribe.id) {
            if (activeEditor.dom.parentElement !== editdiv) {
              editdiv.appendChild(activeEditor.dom)
            }
            setTaskEditorValue(activeEditor, {
              name: selectedScribe.name || "",
              note: selectedScribe.note || "",
            })
            editorTaskId = selectedScribe.id
            if (selectedScribe.name.startsWith(NEWSCRIBETEXT)) {
              selectTaskTitle()
            } else {
              focusTaskEditor({ atStart: true })
            }
          } else {
            if (activeEditor.dom.parentElement !== editdiv) {
              editdiv.appendChild(activeEditor.dom)
            }
          }
        } else {
          destroyTaskEditor(getActiveTaskEditor())
          editorTaskId = null
        }
        let selectedtaskdiv = document.getElementById("selectedtask")
        if (selectedtaskdiv) selectedtaskdiv.scrollIntoView(true)
        updateDateClass()
        if (selectedScribe) updatePauseReadyButton(selectedScribe)
      })
    } finally {
      performance.end("watch selectedScribe")
    }
  })
}
