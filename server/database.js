import neo4j from "neo4j-driver"
import dotenv from "dotenv"
import Graph from "../shared/graph.js"

dotenv.config()

const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD),
)

driver
  .getServerInfo()
  .then((info) => {
    console.log("✅ Успешное подключение к Neo4j:", info)
  })
  .catch((error) => {
    console.error("❌ Ошибка подключения к Neo4j:", error)
  })

const __neoQueue = []
let __neoRunning = false

async function __processNeoQueue() {
  if (__neoRunning || __neoQueue.length === 0) return
  __neoRunning = true
  const { cypherQuery, queryParameters, resolve, reject } = __neoQueue.shift()
  try {
    const res = await runNeo4jQueryDirect(cypherQuery, queryParameters)
    resolve(res)
  } catch (err) {
    reject(err)
  } finally {
    __neoRunning = false
    // запустить следующий элемент очереди
    __processNeoQueue()
  }
}

async function runNeo4jQueryDirect(cypherQuery, queryParameters) {
  const session = driver.session()
  try {
    console.log(
      `📤 Выполняется запрос в Neo4j: ${cypherQuery.trim()} с ${Object.keys(queryParameters || {}).length} параметрами`,
    )
    const result = await session.run(cypherQuery, queryParameters)
    const summary = result?.summary
    const counters = summary?.counters
    try {
      // В разных версиях драйвера counters может иметь разные поля — логируем максимально безопасно
      const updates =
        (typeof counters?.updates === "function" ? counters.updates() : counters?._stats) || counters || null
      // Логируем только в случае изменений
      if (updates) {
        console.log("📈 Счетчики изменений:", updates)
      }
    } catch (e) {
      console.log("⚠️ Не удалось распарсить счетчики:", e?.message || e)
    }
    return result.records // Возвращаем результаты запроса
  } catch (error) {
    console.error("Произошла ошибка:", error)
    throw error // Передаем ошибку дальше
  } finally {
    await session.close() // Закрываем сессию с базой данных
  }
}

function runNeo4jQuery(cypherQuery, queryParameters) {
  return new Promise((resolve, reject) => {
    __neoQueue.push({ cypherQuery, queryParameters, resolve, reject })
    __processNeoQueue()
  })
}

export async function syncTasksNeo4j(userName, userId, incomingScribe) {
  const cypherQuery = `
  MERGE (user:User {id: $userId})
  SET user.name = $userName
  WITH user, $incomingScribe AS incomingScribe
  MERGE (task:Task {id: incomingScribe.id})
  ON CREATE SET task += incomingScribe
  ON MATCH SET  task += incomingScribe
  MERGE (user)-[:HAS_SCRIBE]->(task)
  RETURN user.id AS userId, task.id AS taskId
  `
  const queryParameters = { userName, userId, incomingScribe }
  console.log("🔍 Параметры для syncTasksNeo4j:", {
    userName,
    userId,
    incomingScribe: JSON.stringify(incomingScribe, null, 2),
  })

  return await runNeo4jQuery(cypherQuery, queryParameters)
}

export async function syncRelationNeo4j(userId, relation) {
  console.log("🔄 Обработка связи relation:", JSON.stringify(relation, null, 2))

  if (relation.added) {
    const rel = relation.added
    console.log("🧩 Добавляем связи:", JSON.stringify(rel, null, 2))
    console.log("🔧 Обрабатываем связь (добавить):", rel)
    console.log("Параметры для добавления связи:", {
      userId,
      from: rel.from,
      to: rel.to,
      type: rel.type.toUpperCase(),
      ts: rel.ts,
    })
    const cypherQuery = `
      MATCH (u:User {id: $userId})
      MATCH (u)-[:HAS_SCRIBE]->(from:Task {id: $from})
      MATCH (u)-[:HAS_SCRIBE]->(to:Task {id: $to})
      MERGE (from)-[r:${rel.type.toUpperCase()}]->(to)
      SET r.timestamp = coalesce($ts, r.timestamp)
      RETURN from.id AS fromId, to.id AS toId, type(r) AS type, r.timestamp AS ts
    `
    const addRes = await runNeo4jQuery(cypherQuery, { userId, from: rel.from, to: rel.to, ts: rel.ts })
    console.log("Результат добавления связи:", addRes)
    if (!addRes || addRes.length === 0) {
      console.warn("⚠️ Связь не создана: одна из задач не принадлежит пользователю или не найдена", {
        userId,
        from: rel.from,
        to: rel.to,
        type: rel.type,
      })
    }
  }

  if (relation.removed) {
    const rel = relation.removed
    console.log("🧹 Удаляем связь:", rel)
    console.log("Параметры для удаления связи:", { userId, from: rel.from, to: rel.to, type: rel.type.toUpperCase() })
    const cypherQuery = `
      MATCH (u:User {id: $userId})
      MATCH (u)-[:HAS_SCRIBE]->(from:Task {id: $from})
      MATCH (u)-[:HAS_SCRIBE]->(to:Task {id: $to})
      MATCH (from)-[r:${rel.type.toUpperCase()}]->(to)
      DELETE r
      RETURN from.id AS fromId, to.id AS toId, "${rel.type.toUpperCase()}" AS type
    `
    const delRes = await runNeo4jQuery(cypherQuery, { userId, from: rel.from, to: rel.to })
    console.log("Результат удаления связи:", delRes)
    if (!delRes || delRes.length === 0) {
      console.warn("⚠️ Связь не удалена: одна из задач не принадлежит пользователю, не найдена или ребро отсутствует", {
        userId,
        from: rel.from,
        to: rel.to,
        type: rel.type,
      })
    }
  }

  return true
}

export async function addCollaboratorNeo4j(userId, collaboratorId, collaboratorName) {
  const cypherQuery = `
    // Находим существующий узел пользователя-инициатора
    MATCH (initiator:User {id: $userId})
    WITH initiator
    // Находим существующий узел пользователя-коллаборатора
    MATCH (collaborator:User {id: $collaboratorId})
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
    MATCH (user:User {id: $userId})-[:HAS_SCRIBE]->(scribe:Task)
    OPTIONAL MATCH (scribe)-[l:LEADS]->(toLead:Task)
    OPTIONAL MATCH (scribe)-[b:BLOCKS]->(toBlock:Task)
    WITH user, scribe,
         collect(DISTINCT { id: toLead.id, ts: l.timestamp, node: toLead }) AS leads,
         collect(DISTINCT { id: toBlock.id, ts: b.timestamp, node: toBlock }) AS blocks
    RETURN collect({task: scribe, leads: leads, blocks: blocks}) AS tasks
  `

  const queryParameters = { userId }
  const result = await runNeo4jQuery(cypherQuery, queryParameters)

  const graph = new Graph()

  const items = result[0]?.get("tasks") || []
  for (const item of items) {
    // Источник: сам scribe
    const srcProps = item.task?.properties || item.task || {}
    const srcId = srcProps.id
    if (!srcId) continue

    // 1) Добавляем исходный узел с полными свойствами
    graph.addNode(srcId, { ...srcProps })

    // 2) Связи LEADS — перед созданием ребра гарантированно добавляем целевой узел
    for (const lead of item.leads || []) {
      const toProps = lead?.node?.properties || null
      if (toProps?.id) {
        graph.addNode(toProps.id, { ...toProps })
        graph.addLead(srcId, toProps.id, lead.ts)
      }
    }

    // 3) Связи BLOCKS — то же самое
    for (const block of item.blocks || []) {
      const toProps = block?.node?.properties || null
      if (toProps?.id) {
        graph.addNode(toProps.id, { ...toProps })
        graph.addBlock(srcId, toProps.id, block.ts)
      }
    }
  }

  // Возвращаем слепок JSON
  return graph.toJSON()
}

export async function removeOldTasksFromNeo4j(userId) {
  const removeOldTasksQuery = `
    MATCH (user:User {id: $userId})-[:HAS_SCRIBE]->(task:Task)
    WHERE task.ready = true AND task.timestamp < ($currentTime - $DIFFERENCE_MILLISECONDS)
    WITH task
    OPTIONAL MATCH (task)-[:LEADS|BLOCKS]-(tr {ready:TRUE})
    WITH task, COLLECT(tr) AS toNodesReady
    OPTIONAL MATCH (task)-[:LEADS|BLOCKS]-(t)
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
