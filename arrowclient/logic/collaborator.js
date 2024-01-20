import dayjs from "dayjs"
import reData from "~/logic/reactive.js"
import { sendCollaboratorRequest } from "~/logic/send.js"

// export let addCollaborator = (collaboratorId) => {
//   if (collaboratorId && !reData?.collaborators?.includes(collaboratorId)) {
//     reData.collaborators.push(collaboratorId)
//     sendCollaboratorPermisson(collaboratorId)
//   }
// }

export let addCollaborationRequest = (collaboratorId) => {
  // console.log(reData.collaborators)
  if (collaboratorId && !reData.collaborators.includes(collaboratorId)) {
    reData.collaborationRequests.push(collaboratorId)
    reData.collaboratorDictionary[collaboratorId] = {
      name: collaboratorId,
      timestamp: dayjs().valueOf(),
    }
    sendCollaboratorRequest(collaboratorId)
    // console.log("collaboratorDictionary", reData.collaboratorDictionary)
  }
}
