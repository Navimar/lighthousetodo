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
  // Проверяем, содержит ли массив объект с данным id
  const isCollaboratorExists = reData.collaborators.some((collaborator) => collaborator.id === collaboratorId)

  if (collaboratorId && !isCollaboratorExists) {
    reData.collaborationRequests.push(collaboratorId)
    sendCollaboratorRequest({
      id: collaboratorId,
      name: collaboratorId,
      timestamp: dayjs().valueOf(),
    })
  }
}
