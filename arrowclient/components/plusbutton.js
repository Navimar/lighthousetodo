import { html } from "@arrow-js/core"
import { NEWSCRIBETEXT } from "~/logic/const.js"
import saveTask from "~/logic/savetask.js"
import { clearSearch } from "~/logic/manipulate.js"
import reData from "~/logic/reactive.js"
import { getObjectByName } from "~/logic/util"
import { makevisible } from "~/logic/makevisible.js"
import audio from "~/logic/audio.js"

let plusbutton = () => {
  saveTask("selectTaskByName")
  clearSearch()
  let newScribe = getObjectByName(NEWSCRIBETEXT)
  reData.selectedScribe = newScribe.id
  newScribe.type = "onDay"
  newScribe.consequence = "monthsDuration"
  newScribe.enthusiasm = "interesting"

  makevisible()
  audio.playSound(audio.add)
}

export default html`<div
  class="z-[49] flex pointer-events-none justify-end text-lg w-full max-w-5xl fixed bottom-0 left-1/2 -translate-x-1/2">
  <button
    @click="${plusbutton}"
    class=" pointer-events-auto rounded-full plusimg text-5xl w-20 h-20 m-5 bg-accent dark:bg-accent"></button>
</div>`
