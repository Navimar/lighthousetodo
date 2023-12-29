import reData from "~/logic/reactive.js"

export let addCollaborator = (collaboratorId) => {
  if (collaboratorId && !reData.collaborators.includes(collaboratorId)) reData.collaborators.push(collaboratorId)
}
