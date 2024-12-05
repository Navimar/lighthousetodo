import { html } from "~/arrow-js/index.js"
import reData from "~/logic/reactive.js"
import { selectCollaborator } from "~/logic/manipulate.js"
import { controlButtons } from "~/components/collaborators/controlbuttons.js"

export let renderCollabortors = () => {
  return reData.collaborators.map(renderCollabortor)
}

let renderCollabortor = (collaborator, index) => {
  // console.log(collaborator)
  if (reData.selectedCollaborator == collaborator)
    return html`<div
      class=" w-full dark:bg-alternative-900 rounded-lg bg-alternative-200 text-black dark:text-white p-3">
      ${controlButtons}
      <small class="select-text">id: ${collaborator.id}</small>
      <input
        class="text-black dark:text-white dark:bg-black p-2 w-full"
        id="collaboratorName"
        type="text"
        value="${collaborator.name}" />
    </div>`
  //не выделенный
  else
    return html`<div
      @click="${() => {
        selectCollaborator(collaborator)
      }}"
      class="w-full dark:bg-alternative-900 rounded-lg bg-alternative-200 text-black dark:text-white p-3">
      <p class="ml-2">${collaborator.name} <small class="select-text">id: ${collaborator.id}</p></small></div
    > `
}
export let renderCollaborationRequests = () => {
  return reData.collaborationRequests.map(renderCollaborationRequest)
}

let renderCollaborationRequest = (collaborator, index) => {
  return html`<div class="w-full rounded-lg dark:bg-green-950 bg-green-200 text-black dark:text-white p-3"
    ><p
      @click="${() => {
        selectCollaborator(collaborator)
      }}"
      class="ml-2"
      >${collaborator.name} <small class="select-text">id: ${collaborator.id}</p
    ></div
  > `
}
