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

export async function syncTasksWithNeo4j(userId, incomingTasks) {
  console.log("userId", userId)
  console.log("incomingTasks", incomingTasks)
  const cypherQuery = `
MERGE (user:User {id: $userId})
WITH user
UNWIND $incomingTasks AS incomingTask
MERGE (task:Task {id: incomingTask.id})
ON CREATE SET task += incomingTask, task.fromIds = NULL, task.toIds = NULL
ON MATCH SET task += incomingTask, task.fromIds = NULL, task.toIds = NULL
MERGE (user)-[:HAS_TASK]->(task)
WITH user, task, incomingTask.fromIds AS fromIds, incomingTask.toIds AS toIds

// Удаление старых связей OPENS
OPTIONAL MATCH (task)-[oldRelation:OPENS]->()
DELETE oldRelation
WITH task, toIds

// Обработка связей TO
FOREACH (toId IN toIds | 
  MERGE (toTask:Task {id: toId})
  MERGE (task)-[:OPENS]->(toTask)
)
`

  const queryParameters = { userId, incomingTasks }

  return await runNeo4jQuery(cypherQuery, queryParameters)
}

export async function loadDataFromNeo4j(userId) {
  const cypherQuery = `
   MATCH (user:User {id: $userId})-[:HAS_TASK]->(task:Task)
OPTIONAL MATCH (task)-[:OPENS]->(toTask:Task)
WITH task, collect(toTask.id) AS toIds
OPTIONAL MATCH (fromTask:Task)-[:OPENS]->(task)
WITH task, toIds, collect(fromTask.id) AS fromIds
RETURN collect({task: task, toIds: toIds, fromIds: fromIds}) AS tasks
  `
  const queryParameters = { userId }
  const result = await runNeo4jQuery(cypherQuery, queryParameters)
  const tasks = result[0].get("tasks").map((taskRecord) => {
    const task = taskRecord.task.properties
    const toIds = taskRecord.toIds
    const fromIds = taskRecord.fromIds
    return { ...task, toIds, fromIds }
  })
  console.log("load", tasks)
  return tasks
}

// export async function loadDataFromNeo4j(userId) {
//   const cypherQuery = `
//     MATCH (user:User {id: $userId})-[:HAS_TASK]->(task:Task)
//     RETURN collect(task) AS tasks
//   `
//   const queryParameters = { userId }
//   const result = await runNeo4jQuery(cypherQuery, queryParameters)
//   if (result && result[0]) {
//     const tasks = result[0].get("tasks").map((task) => task.properties)
//     console.log("load", tasks)
//     return tasks
//   } else {
//     return null
//   }
// }

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
