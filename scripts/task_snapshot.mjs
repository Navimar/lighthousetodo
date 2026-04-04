import "dotenv/config"
import pg from "pg"
import dayjs from "dayjs"
import Graph from "../shared/graph.js"

const { Pool } = pg

function getPool() {
  const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL
  return new Pool({
    connectionString,
    ssl: connectionString ? { rejectUnauthorized: false } : undefined,
  })
}

function isFutureTask(task) {
  if (!task?.date || !task?.time) return false
  const ts = Date.parse(`${task.date}T${task.time}`)
  return Number.isFinite(ts) && ts > Date.now()
}

function sortTasksLikeApp(tasks) {
  const now = dayjs()

  tasks.sort((a, b) => {
    if (!a.ready && b.ready) return -1
    if (a.ready && !b.ready) return 1

    if (!a.blocked && b.blocked) return -1
    if (a.blocked && !b.blocked) return 1

    if (!a.pause && b.pause) return -1
    if (a.pause && !b.pause) return 1

    const futureA = dayjs(`${a.date}T${a.time}`, "YYYY-MM-DDTHH:mm").isAfter(now)
    const futureB = dayjs(`${b.date}T${b.time}`, "YYYY-MM-DDTHH:mm").isAfter(now)
    const futureDiff = Number(futureA) - Number(futureB)
    if (futureDiff !== 0) return futureDiff

    const depthDiff = (a.depth || 0) - (b.depth || 0)
    if (depthDiff !== 0) return depthDiff

    const pureDepthDiff = (a.pureDepth || 0) - (b.pureDepth || 0)
    if (pureDepthDiff !== 0) return pureDepthDiff

    const blockScoreInDiff = (b.blockScoreIn || 0) - (a.blockScoreIn || 0)
    if (blockScoreInDiff !== 0) return blockScoreInDiff

    const blockScoreOutDiff = (a.blockScoreOut || 0) - (b.blockScoreOut || 0)
    if (blockScoreOutDiff !== 0) return blockScoreOutDiff

    return (b.timestamp || 0) - (a.timestamp || 0)
  })
}

function buildGraphFromRows(taskRows, relationRows) {
  const graph = new Graph()

  for (const row of taskRows) {
    graph.addNode(row.id, row.payload || {})
  }

  for (const row of relationRows) {
    const type = String(row.relation_type || "").toUpperCase()
    if (type === "BLOCKS") {
      graph.addBlock(row.from_task_id, row.to_task_id, row.ts ?? Date.now())
    } else {
      graph.addLead(row.from_task_id, row.to_task_id, row.ts ?? Date.now())
    }
  }

  graph.updateDepths()
  graph.updateBlockedStatuses()
  graph.resumePausedTasks()
  graph.updateBlockedStatuses()

  return graph
}

function computeStatus(task) {
  if (task?.pause) return "pause"
  if (task?.ready) return "ready"
  if (isFutureTask(task)) return "future"
  if (task?.blocked) return "blocked"
  if ((task?.depth || 0) > 0) return "depth"
  return "active"
}

function summarizeTask(id, task, outgoing, incoming, taskNames) {
  const blockedBy = incoming.blocks.map((fromId) => ({
    id: fromId,
    name: taskNames.get(fromId) || fromId,
  }))
  const openedBy = incoming.leads.map((fromId) => ({
    id: fromId,
    name: taskNames.get(fromId) || fromId,
  }))
  const blocks = outgoing.blocks.map((toId) => ({
    id: toId,
    name: taskNames.get(toId) || toId,
  }))
  const opens = outgoing.leads.map((toId) => ({
    id: toId,
    name: taskNames.get(toId) || toId,
  }))

  return {
    id,
    name: task?.name || "",
    note: task?.note || "",
    status: computeStatus(task),
    ready: !!task?.ready,
    pause: !!task?.pause,
    blocked: !!task?.blocked,
    isFuture: isFutureTask(task),
    date: task?.date || "",
    time: task?.time || "",
    depth: task?.depth ?? 0,
    pureDepth: task?.pureDepth ?? 0,
    blockScoreIn: task?.blockScoreIn ?? 0,
    blockScoreOut: task?.blockScoreOut ?? 0,
    relations: {
      blockedBy,
      openedBy,
      blocks,
      opens,
    },
    relationCounts: {
      blockedBy: blockedBy.length,
      openedBy: openedBy.length,
      blocks: blocks.length,
      opens: opens.length,
    },
  }
}

async function listOwners(pool) {
  const query = `
    select
      t.owner_user_id,
      coalesce(u.name, '') as name,
      count(*)::int as task_count
    from tasks t
    left join app_users u on u.id = t.owner_user_id
    group by t.owner_user_id, u.name
    order by count(*) desc
  `
  const result = await pool.query(query)
  console.log(JSON.stringify(result.rows, null, 2))
}

async function buildSnapshot(pool, ownerUserId) {
  const [taskResult, relationResult, ownerResult] = await Promise.all([
    pool.query(
      `
        select id, payload
        from tasks
        where owner_user_id = $1
      `,
      [ownerUserId],
    ),
    pool.query(
      `
        select from_task_id, to_task_id, relation_type, ts
        from task_relations
        where owner_user_id = $1
      `,
      [ownerUserId],
    ),
    pool.query(
      `
        select id, name
        from app_users
        where id = $1
      `,
      [ownerUserId],
    ),
  ])

  const graph = buildGraphFromRows(taskResult.rows, relationResult.rows)
  const tasksById = new Map()
  const taskNames = new Map()
  const outgoingById = new Map()
  const incomingById = new Map()

  for (const row of taskResult.rows) {
    const task = graph.nodes.get(row.id) || row.payload || {}
    task.id = row.id
    tasksById.set(row.id, task)
    taskNames.set(row.id, task.name || row.id)
    outgoingById.set(row.id, { leads: [], blocks: [] })
    incomingById.set(row.id, { leads: [], blocks: [] })
  }

  for (const row of relationResult.rows) {
    const fromId = row.from_task_id
    const toId = row.to_task_id
    const kind = String(row.relation_type || "").toUpperCase() === "BLOCKS" ? "blocks" : "leads"

    if (!outgoingById.has(fromId)) outgoingById.set(fromId, { leads: [], blocks: [] })
    if (!incomingById.has(toId)) incomingById.set(toId, { leads: [], blocks: [] })

    outgoingById.get(fromId)[kind].push(toId)
    incomingById.get(toId)[kind].push(fromId)
  }

  const tasks = [...tasksById.entries()].map(([id, task]) =>
    summarizeTask(
      id,
      task,
      outgoingById.get(id) || { leads: [], blocks: [] },
      incomingById.get(id) || { leads: [], blocks: [] },
      taskNames,
    ),
  )
  const sortedTasks = tasks.map((task) => ({ ...task }))
  sortTasksLikeApp(sortedTasks)
  sortedTasks.forEach((task, index) => {
    task.rank = index + 1
  })

  const summary = {
    taskCount: tasks.length,
    readyCount: tasks.filter((task) => task.ready).length,
    blockedCount: tasks.filter((task) => task.blocked).length,
    pausedCount: tasks.filter((task) => task.pause).length,
    futureCount: tasks.filter((task) => task.isFuture).length,
    relationCount: relationResult.rows.length,
  }

  const snapshot = {
    owner: ownerResult.rows[0] || { id: ownerUserId, name: "" },
    generatedAt: new Date().toISOString(),
    summary,
    sortedTasks,
    tasks,
  }

  console.log(JSON.stringify(snapshot, null, 2))
}

async function main() {
  const pool = getPool()
  const mode = process.argv[2] || "owners"
  const ownerUserId = process.argv[3]

  try {
    if (mode === "owners") {
      await listOwners(pool)
      return
    }

    if (mode === "snapshot") {
      if (!ownerUserId) {
        throw new Error("owner_user_id is required: node scripts/task_snapshot.mjs snapshot <owner_user_id>")
      }
      await buildSnapshot(pool, ownerUserId)
      return
    }

    throw new Error(`Unknown mode: ${mode}`)
  } finally {
    await pool.end()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
