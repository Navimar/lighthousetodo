import { html } from "@arrow-js/core"
import reData from "~/logic/reactive.js"

export let renderCollabortors = () => {
  return reData.collaborators.map(renderCollabortor)
}
let renderCollabortor = (collaborator, index) => {
  return html`<div class="w-full bg-alternative-900 text-white p-3"><p class="ml-2">${collaborator}</p></div> `
}
