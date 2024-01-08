import neo4j from "neo4j-driver"
import dotenv from "dotenv"

dotenv.config()

console.log(process.env.NEO4J_URI, process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD),
)

async function runNeo4jQuery(cypherQuery, queryParameters) {
  const session = driver.session()
  try {
    const result = await session.run(cypherQuery, queryParameters)
    console.log(cypherQuery, queryParameters, result)
    return result.records // Возвращаем результаты запроса
  } catch (error) {
    console.error("Произошла ошибка:", error)
    throw error // Передаем ошибку дальше
  } finally {
    await session.close() // Закрываем сессию с базой данных
  }
}

export async function greetWorld(message) {
  const cypherQuery = "MERGE (a:Greeting {message: $message}) RETURN a.message as message"
  const queryParameters = { message }
  return await runNeo4jQuery(cypherQuery, queryParameters)
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
    OPTIONAL MATCH (task)-[oldAssignedToRelation:ASSIGNED_TO]->()
    DELETE oldAssignedToRelation
    WITH user, task, toIds, assignedTo, assignedBy

    // Удаление старых связей ASSIGNED_BY
    OPTIONAL MATCH (task)-[oldAssignedByRelation:ASSIGNED_BY]->()
    DELETE oldAssignedByRelation
    WITH user, task, toIds, assignedTo, assignedBy

    // Обработка связей TO
    FOREACH (toId IN toIds | 
      MERGE (toTask:Task {id: toId})
      MERGE (task)-[:OPENS]->(toTask)
    )

    // Обработка связей ASSIGNED_TO
    FOREACH (assignToId IN assignedTo | 
      MERGE (assignToUser:User {id: assignToId})
      MERGE (task)-[:ASSIGNED_TO]->(assignToUser)
    )

    // Обработка связей ASSIGNED_BY
    FOREACH (assignById IN assignedBy | 
      MERGE (assignByUser:User {id: assignById})
      MERGE (assignByUser)-[:ASSIGNED_BY]->(task)
    )
`
  const queryParameters = { userName, userId, incomingScribes }

  return await runNeo4jQuery(cypherQuery, queryParameters)
}

export async function addCollaboratorNeo4j(userId, collaboratorId) {
  console.log("newcollaborator")
  const cypherQuery = `
    // Находим или создаем узел пользователя-инициатора
    MERGE (initiator:User {id: $userId})
    WITH initiator
    // Находим или создаем узел пользователя-коллаборатора
    MERGE (collaborator:User {id: $collaboratorId})
    // Создаем связь ASSIGNS_TASKS_TO от инициатора к коллаборатору
    MERGE (initiator)-[:ASSIGNS_TASKS_TO]->(collaborator)
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
    OPTIONAL MATCH (user)-[:ASSIGNS_TASKS_TO]->(collaborator:User)
    WITH scribe, toIds, fromIds, collect(collaborator.id) AS collaboratorIds
    RETURN collect({task: scribe, toIds: toIds, fromIds: fromIds}) AS tasks, collaboratorIds
  `
  const queryParameters = { userId }
  const result = await runNeo4jQuery(cypherQuery, queryParameters)
  const tasks = result[0].get("tasks").map((taskRecord) => {
    const task = taskRecord.task.properties
    const toIds = taskRecord.toIds
    const fromIds = taskRecord.fromIds
    return { ...task, toIds, fromIds }
  })
  const collaborators = result[0].get("collaboratorIds")

  console.log("load", tasks, collaborators)
  return { tasks, collaborators }
}

export async function updateCleanupTimeNeo4j(userId) {
  const updateCleanupTimeQuery = `
    MATCH (user:User {id: $userId})
    SET user.lastCleanup = timestamp()
  `
  const queryParameters = { userId }

  try {
    const result = await runNeo4jQuery(updateCleanupTimeQuery, queryParameters)
    return result
  } catch (error) {
    console.error("Ошибка при обновлении времени последней очистки:", error)
    throw error // Перебрасываем ошибку дальше, если требуется обработка на более высоком уровне
  }
}

export async function removeOldTasksFromNeo4j(userId) {
  const removeOldTasksQuery = `
    MATCH (user:User {id: $userId})-[:HAS_TASK]->(task:Task {ready:TRUE})
    WHERE task.ready = true AND (task.timestamp < ($currentTime - $DIFFERENCE_MILLISECONDS))
    OPTIONAL MATCH (task)-[:OPENS]-(tr {ready:TRUE})
    WITH task, COLLECT(tr) AS toNodesReady
    OPTIONAL MATCH (task)-[:OPENS]-(t)
    WITH task, toNodesReady, COLLECT(t) AS toNodes
    WHERE ALL(node IN toNodes WHERE node IN toNodesReady)
    // RETURN collect(task) AS tasks
    DETACH DELETE task
  `

  const queryParameters = {
    userId,
    currentTime: Date.now(),
    DIFFERENCE_MILLISECONDS: 5000,
  }

  try {
    const result = await runNeo4jQuery(removeOldTasksQuery, queryParameters)
    console.log("Удаление старых задач выполнено:", result)
    // const tasks = result[0].get("tasks").map((task) => task.properties)
    // console.log("Удаление старых задач выполнено:", tasks)
  } catch (error) {
    console.error("Ошибка при удалении старых задач:", error)
    throw error // Перебрасываем ошибку для дальнейшей обработки
  }
}
