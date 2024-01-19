import reData from "~/logic/reactive.js"
import { sendCollaboratorRequest } from "~/logic/send.js"

// export let addCollaborator = (collaboratorId) => {
//   if (collaboratorId && !reData?.collaborators?.includes(collaboratorId)) {
//     reData.collaborators.push(collaboratorId)
//     sendCollaboratorPermisson(collaboratorId)
//   }
// }

export let addCollaborationRequest = (collaboratorId) => {
  if (collaboratorId && !reData?.collaborators?.includes(collaboratorId)) {
    reData.collaborationRequests.push(collaboratorId)
    sendCollaboratorRequest(collaboratorId)
  }
}
