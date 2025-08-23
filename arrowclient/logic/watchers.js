import { watch } from "~/arrow-js/index.js"
import { safeSetLocalStorageItem } from "~/logic/sync.js"
import reData from "~/logic/reactive.js"
import performance from "~/logic/performance.js"
import { updateDateClass, updatePauseReadyButton } from "~/logic/manipulate.js"
import { getObjectById } from "~/logic/util.js"
import { NEWSCRIBETEXT } from "~/logic/const.js"

export default () => {
  watch(() => {
    safeSetLocalStorageItem("timer", reData.currentTime.timerStarted)
  })
  watch(() => {
    const route = reData.route[0]

    // Получаем радио-кнопки по их значениям
    const intentionsRadio = document.querySelector("input[name='navigation'][value='intentions']")
    const tasksRadio = document.querySelector("input[name='navigation'][value='tasks']")

    // Устанавливаем checked в зависимости от маршрута
    if (route === "intentions" && intentionsRadio) {
      intentionsRadio.checked = true
    } else if (route === "tasks" && tasksRadio) {
      tasksRadio.checked = true
    }
  })
  watch(() => {
    performance.start("watch selectedScribe")
    try {
      reData.selectedScribe
      reData.visibleTasks
      Promise.resolve().then(() => {
        let editdiv = document.getElementById("edit")
        let selectedScribe = null
        if (reData.selectedScribe) selectedScribe = getObjectById(reData.selectedScribe)
        if (editdiv) {
          const range = document.createRange()
          const sel = window.getSelection()
          range.selectNodeContents(editdiv)
          if (reData.selectedScribe && !selectedScribe.name.startsWith(NEWSCRIBETEXT)) range.collapse()
          sel.removeAllRanges()
          sel.addRange(range)
        }
        let selectedtaskdiv = document.getElementById("selectedtask")
        if (selectedtaskdiv) selectedtaskdiv.scrollIntoView(true)
        updateDateClass()
        updatePauseReadyButton(selectedScribe)
      })
    } finally {
      performance.end("watch selectedScribe")
    }
  })
  watch(() => {
    reData.currentTime.slider
    const currentTimeMarker = document.getElementById("currentTimeMarker")
    if (currentTimeMarker) currentTimeMarker.style = "left:" + reData.currentTime.slider + "px"
  })
}
