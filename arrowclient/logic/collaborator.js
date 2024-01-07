import reData from "~/logic/reactive.js"
import { sendCollaboratorPermisson } from "~/logic/send.js"

export let addCollaborator = (collaboratorId) => {
  if (collaboratorId && !reData.collaborators.includes(collaboratorId)) {
    reData.collaborators.push(collaboratorId)
    sendCollaboratorPermisson(collaboratorId)
  }
}
