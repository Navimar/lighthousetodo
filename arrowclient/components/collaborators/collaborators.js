import { html } from "@arrow-js/core"
import reData from "~/logic/reactive.js"
import { selectCollaborator } from "~/logic/manipulate.js"
import { controlButtons } from "~/components/collaborators/controlbuttons.js"

export let renderCollabortors = () => {
  return reData.collaborators.map(renderCollabortor)
}

let renderCollabortor = (collaborator, index) => {
  if (reData.selectedCollaborator == collaborator)
    return html`<div class=" w-full dark:bg-alternative-900 bg-alternative-200 text-black dark:text-white p-3">
      ${controlButtons}
      <p>id: ${collaborator}</p>
      <input
        class="text-black w-full"
        id="collaboratorName"
        type="text"
        value="${reData.collaboratorDictionary[collaborator]?.name}" />
    </div>`
  else
    return html`<div
      @click="${() => {
        selectCollaborator(collaborator)
      }}"
      class="w-full dark:bg-alternative-900 bg-alternative-200 text-black dark:text-white p-3">
      <p class="ml-2">${reData.collaboratorDictionary[collaborator]?.name} <small>id: ${collaborator}</p></small></div
    > `
}
export let renderCollaborationRequests = () => {
  return reData.collaborationRequests.map(renderCollaborationRequest)
}

let renderCollaborationRequest = (collaborator, index) => {
  return html`<div class="w-full dark:bg-green-950 bg-green-200 text-black dark:text-white p-3"
    ><p
      @click="${() => {
        selectCollaborator(collaborator)
      }}"
      class="ml-2"
      >${collaborator}</p
    ></div
  > `
}
