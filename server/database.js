import neo4j from "neo4j-driver"
import dotenv from "dotenv"

dotenv.config()

// console.log("NEO4J connection", process.env.NEO4J_URI, process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD),
)

async function runNeo4jQuery(cypherQuery, queryParameters) {
  const session = driver.session()
  try {
    const result = await session.run(cypherQuery, queryParameters)
    // console.log(result)
    return result.records // Возвращаем результаты запроса
  } catch (error) {
    console.error("Произошла ошибка:", error)
    throw error // Передаем ошибку дальше
  } finally {
    await session.close() // Закрываем сессию с базой данных
  }
}

export async function syncTasksNeo4j(userName, userId, incomingScribes) {
  // console.log("userId", userId)
  // console.log("incomingScribes", incomingScribes)

  const cypherQuery = `
    MERGE (user:User {id: $userId})
    SET user.name = $userName
    WITH user
    UNWIND $incomingScribes AS incomingScribe
    MERGE (task:Task {id: incomingScribe.id})
    ON CREATE SET task += incomingScribe, task.fromIds = NULL, task.toIds = NULL
    ON MATCH SET task += incomingScribe, task.fromIds = NULL, task.toIds = NULL
    MERGE (user)-[:HAS_SCRIBE]->(task)
    WITH user, task, incomingScribe.fromIds AS fromIds, incomingScribe.toIds AS toIds, incomingScribe.assignedTo AS assignedTo, incomingScribe.assignedBy AS assignedBy

    // Удаление старых связей OPENS
    OPTIONAL MATCH (task)-[oldOpenRelation:OPENS]->()
    DELETE oldOpenRelation
    WITH user, task, toIds, assignedTo, assignedBy

    // Удаление старых связей ASSIGNED_TO
    OPTIONAL MATCH (task)-[oldAssignedToRelation:HAS_SCRIBE]->()
    DELETE oldAssignedToRelation
    WITH user, task, toIds, assignedTo, assignedBy

    // Обработка связей TO
    FOREACH (toId IN toIds | 
      MERGE (toTask:Task {id: toId})
      MERGE (task)-[:OPENS]->(toTask)
    )

    // Обработка связей ASSIGNED_TO
    FOREACH (assignToId IN assignedTo | 
      MERGE (assignToUser:User {id: assignToId})
      MERGE (task)<-[:HAS_SCRIBE]-(assignToUser)
    )
`
  const queryParameters = { userName, userId, incomingScribes }

  return await runNeo4jQuery(cypherQuery, queryParameters)
}

export async function addCollaboratorNeo4j(userId, collaboratorId, collaboratorName) {
  const cypherQuery = `
    // Находим существующий узел пользователя-инициатора
    MATCH (initiator:User {id: $userId})
    WITH initiator
    // Находим или создаем узел пользователя-коллаборатора
    MERGE (collaborator:User {id: $collaboratorId})
    WITH initiator, collaborator
    // Создаем или обновляем связь COLLABORATE с добавлением имени
    MERGE (initiator)-[relation:COLLABORATE]->(collaborator)
    SET relation.name = $collaboratorName
  `

  const queryParameters = {
    userId,
    collaboratorId,
    collaboratorName,
  }

  return await runNeo4jQuery(cypherQuery, queryParameters)
}

export async function removeCollaboratorNeo4j(userId, collaboratorId) {
  const cypherQuery = `
    // Находим узел пользователя-инициатора
    MATCH (initiator:User {id: $userId})
    WITH initiator
    // Находим узел пользователя-коллаборатора
    MATCH (collaborator:User {id: $collaboratorId})
    WITH initiator, collaborator
    // Удаляем связь COLLABORATE между инициатором и коллаборатором
    MATCH (initiator)-[collaboration:COLLABORATE]->(collaborator)
    DELETE collaboration
  `

  const queryParameters = {
    userId,
    collaboratorId,
  }

  return await runNeo4jQuery(cypherQuery, queryParameters)
}

export async function loadDataFromNeo4j(userId) {
  const cypherQuery = `
    MATCH (user:User {id: $userId})-[:HAS_SCRIBE]->(scribe)
    OPTIONAL MATCH (scribe)-[:OPENS]->(toTask:Task)
    
    WITH user, scribe, collect(toTask.id) AS toIds
    OPTIONAL MATCH (fromTask:Task)-[:OPENS]->(scribe)

    WITH user, scribe, toIds, collect(fromTask.id) AS fromIds
    OPTIONAL MATCH (user)-[outRel:COLLABORATE]->(outCollaborator:User)
    WITH user, scribe, toIds, fromIds, collect({id: outCollaborator.id, name: outRel.name}) AS outCollaborations
    OPTIONAL MATCH (user)<-[inRel:COLLABORATE]-(inCollaborator:User)
    WITH scribe, toIds, fromIds, outCollaborations, collect({id: inCollaborator.id, name: inRel.name}) AS inCollaborations
    RETURN collect({task: scribe, toIds: toIds, fromIds: fromIds}) AS tasks, outCollaborations, inCollaborations
  `
  const queryParameters = { userId }
  const result = await runNeo4jQuery(cypherQuery, queryParameters)
  const tasks = result[0]?.get("tasks").map((taskRecord) => {
    const task = taskRecord.task.properties
    const toIds = taskRecord.toIds
    const fromIds = taskRecord.fromIds
    return { ...task, toIds, fromIds }
  })
  const outCollaborations = result[0]?.get("outCollaborations").filter((collab) => collab.id != null) || []
  const inCollaborations = result[0]?.get("inCollaborations").filter((collab) => collab.id != null) || []

  // Формируем список текущих коллабораторов
  const collaborators = outCollaborations.filter((outCollab) =>
    inCollaborations.some((inCollab) => inCollab.id === outCollab.id),
  )

  // Фильтруем исходящие запросы на сотрудничество, исключая текущих коллабораторов
  const collaborationRequests = outCollaborations.filter(
    (outCollab) => !collaborators.some((collab) => collab.id === outCollab.id),
  )

  return { tasks, collaborators, collaborationRequests }
}

export async function removeOldTasksFromNeo4j(userId) {
  const removeOldTasksQuery = `
    MATCH (user:User {id: $userId})-[:HAS_SCRIBE]->(task:Task {ready:TRUE})
    WHERE task.ready = true AND (task.timestamp < ($currentTime - $DIFFERENCE_MILLISECONDS))
    WITH task
    OPTIONAL MATCH (task)-[:OPENS]-(tr {ready:TRUE})
    WITH task, COLLECT(tr) AS toNodesReady
    OPTIONAL MATCH (task)-[:OPENS]-(t)
    WITH task, toNodesReady, COLLECT(t) AS toNodes
    WHERE ALL(node IN toNodes WHERE node IN toNodesReady)
    DETACH DELETE task
  `

  const queryParameters = {
    userId,
    currentTime: Date.now(),
    DIFFERENCE_MILLISECONDS: 1000 * 60 * 60 * 24 * 7,
  }

  try {
    const result = await runNeo4jQuery(removeOldTasksQuery, queryParameters)
    console.log("Удаление старых задач выполнено", result)
    // const tasks = result[0].get("tasks").map((task) => task.properties)
    // console.log("Удаление старых задач выполнено:", tasks)
  } catch (error) {
    console.error("Ошибка при удалении старых задач:", error)
    throw error // Перебрасываем ошибку для дальнейшей обработки
  }
}
