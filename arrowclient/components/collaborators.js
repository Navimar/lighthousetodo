import { html } from "@arrow-js/core"
import reData from "~/logic/reactive.js"

export let renderCollabortors = () => {
  return reData.collaborators.map(renderCollabortor)
}

let renderCollabortor = (collaborator, index) => {
  return html`<div class="w-full dark:bg-alternative-900 bg-alternative-200 text-black dark:text-white p-3"
    ><p class="ml-2">${collaborator}</p></div
  > `
}
export let renderCollaborationRequests = () => {
  return reData.collaborationRequests.map(renderCollaborationRequest)
}

let renderCollaborationRequest = (collaborator, index) => {
  return html`<div class="w-full bg-green-200 text-black dark:text-white p-3"
    ><p class="ml-2">${collaborator}</p></div
  > `
}
