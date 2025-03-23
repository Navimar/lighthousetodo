import { html } from "~/arrow-js/index.js"
import dayjs from "dayjs"

import reData from "~/logic/reactive.js"
import { sendCollaboratorRequest, sendCollaboratorRemovalRequest } from "~/logic/send.js"

export function controlButtons() {
  return html`<button @click="${remove}" class="button-gray">Удалить</button
    ><button @click="${save}" class="button-gray">Сохранить</button>`
}

let save = () => {
  let name = document.getElementById("collaboratorName")?.value || reData.selectedCollaborator.name
  reData.selectedCollaborator.name = name
  sendCollaboratorRequest({
    id: reData.selectedCollaborator.id,
    name,
    timestamp: dayjs().valueOf(),
  })
  reData.selectedCollaborator = false
}
let remove = () => {
  reData.collaborators = reData.collaborators.filter((c) => {
    c.id != reData.selectedCollaborator.id
  })
  sendCollaboratorRemovalRequest(reData.selectedCollaborator.id)
}
