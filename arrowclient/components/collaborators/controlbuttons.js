import { html } from "@arrow-js/core"
import dayjs from "dayjs"
import css from "~/css.js"
import reData from "~/logic/reactive.js"
import { sendCollaboratorDictionaryRequest } from "~/logic/send.js"

export function controlButtons() {
  return html`<button @click="${remove}" class="${css.button}">Удалить</button
    ><button @click="${save}" class="${css.button}">Сохранить</button>`
}

let save = () => {
  reData.collaboratorDictionary[reData.selectedCollaborator] = {
    name: document.getElementById("collaboratorName")?.value || reData.selectedCollaborator,
    timestamp: dayjs().valueOf(),
  }
  sendCollaboratorDictionaryRequest({
    ...reData.collaboratorDictionary[reData.selectedCollaborator],
    id: reData.selectedCollaborator,
  })
  reData.selectedCollaborator = false
}
let remove = () => {}
