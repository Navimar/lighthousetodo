import dotenv from "dotenv"
import { Pool } from "pg"
import Graph from "../shared/graph.js"

dotenv.config()

const relationTypes = new Set(["LEADS", "BLOCKS"])

const buildPoolConfig = () => {
  const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL
  const sslMode = (process.env.PGSSLMODE || "").toLowerCase()
  const ssl = sslMode === "require" ? { rejectUnauthorized: false } : undefined

  if (connectionString) {
    return { connectionString, ssl }
  }

  return {
    host: process.env.PGHOST,
    port: process.env.PGPORT ? Number(process.env.PGPORT) : undefined,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    ssl,
  }
}

const pool = new Pool(buildPoolConfig())
let schemaReadyPromise

function normalizeType(type) {
  const normalized = String(type || "").trim().toUpperCase()
  if (!relationTypes.has(normalized)) {
    throw new Error(`Unsupported relation type: ${type}`)
  }
  return normalized
}

async function ensureSchema() {
  if (!schemaReadyPromise) {
    schemaReadyPromise = (async () => {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS app_users (
          id TEXT PRIMARY KEY,
          name TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
      `)

      await pool.query(`
        CREATE TABLE IF NOT EXISTS tasks (
          owner_user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
          id TEXT NOT NULL,
          payload JSONB NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          PRIMARY KEY (owner_user_id, id)
        );
      `)

      await pool.query(`
        CREATE TABLE IF NOT EXISTS task_relations (
          owner_user_id TEXT NOT NULL,
          from_task_id TEXT NOT NULL,
          to_task_id TEXT NOT NULL,
          relation_type TEXT NOT NULL CHECK (relation_type IN ('LEADS', 'BLOCKS')),
          ts BIGINT,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          PRIMARY KEY (owner_user_id, from_task_id, to_task_id, relation_type)
        );
      `)

      // Drop legacy FK constraints if they exist (migration from old schema)
      await pool.query(`
        DO $$ BEGIN
          ALTER TABLE task_relations DROP CONSTRAINT IF EXISTS task_relations_owner_user_id_from_task_id_fkey;
          ALTER TABLE task_relations DROP CONSTRAINT IF EXISTS task_relations_owner_user_id_to_task_id_fkey;
        END $$;
      `)

      await pool.query(`
        CREATE TABLE IF NOT EXISTS collaborations (
          user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
          collaborator_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
          collaborator_name TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          PRIMARY KEY (user_id, collaborator_id)
        );
      `)

      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_tasks_owner ON tasks(owner_user_id);
      `)
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_relations_owner_from ON task_relations(owner_user_id, from_task_id);
      `)
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_relations_owner_to ON task_relations(owner_user_id, to_task_id);
      `)
    })().catch((error) => {
      schemaReadyPromise = undefined
      throw error
    })
  }

  return schemaReadyPromise
}

async function withTransaction(fn) {
  await ensureSchema()
  const client = await pool.connect()
  try {
    await client.query("BEGIN")
    const result = await fn(client)
    await client.query("COMMIT")
    return result
  } catch (error) {
    await client.query("ROLLBACK")
    throw error
  } finally {
    client.release()
  }
}

async function ensureUser(client, userId, userName = null) {
  await client.query(
    `
      INSERT INTO app_users (id, name)
      VALUES ($1, $2)
      ON CONFLICT (id)
      DO UPDATE SET
        name = COALESCE(EXCLUDED.name, app_users.name),
        updated_at = now()
    `,
    [userId, userName],
  )
}

export async function syncTasks(userName, userId, incomingScribe) {
  if (!incomingScribe?.id) {
    throw new Error("Task payload must contain id")
  }

  return withTransaction(async (client) => {
    await ensureUser(client, userId, userName)

    const res = await client.query(
      `
        INSERT INTO tasks (owner_user_id, id, payload, updated_at)
        VALUES ($1, $2, $3::jsonb, now())
        ON CONFLICT (owner_user_id, id)
        DO UPDATE SET
          payload = tasks.payload || EXCLUDED.payload,
          updated_at = now()
        RETURNING owner_user_id AS "userId", id AS "taskId"
      `,
      [userId, incomingScribe.id, JSON.stringify(incomingScribe)],
    )

    return res.rows
  })
}

export async function syncRelation(userId, relation) {
  if (!relation) return true

  return withTransaction(async (client) => {
    await ensureUser(client, userId)

    if (relation.added) {
      const rel = relation.added
      const type = normalizeType(rel.type)

      await client.query(
        `
          DELETE FROM task_relations
          WHERE owner_user_id = $1
            AND from_task_id = $2
            AND to_task_id = $3
        `,
        [userId, rel.from, rel.to],
      )

      await client.query(
        `
          INSERT INTO task_relations (owner_user_id, from_task_id, to_task_id, relation_type, ts, updated_at)
          VALUES ($1, $2, $3, $4, $5, now())
          ON CONFLICT (owner_user_id, from_task_id, to_task_id, relation_type)
          DO UPDATE SET ts = EXCLUDED.ts, updated_at = now()
        `,
        [userId, rel.from, rel.to, type, rel.ts ?? null],
      )
    }

    if (relation.removed) {
      const rel = relation.removed
      const type = normalizeType(rel.type)
      await client.query(
        `
          DELETE FROM task_relations
          WHERE owner_user_id = $1
            AND from_task_id = $2
            AND to_task_id = $3
            AND relation_type = $4
        `,
        [userId, rel.from, rel.to, type],
      )
    }

    return true
  })
}

export async function addCollaborator(userId, collaboratorId, collaboratorName) {
  return withTransaction(async (client) => {
    await ensureUser(client, userId)
    await ensureUser(client, collaboratorId, collaboratorName)

    const res = await client.query(
      `
        INSERT INTO collaborations (user_id, collaborator_id, collaborator_name, updated_at)
        VALUES ($1, $2, $3, now())
        ON CONFLICT (user_id, collaborator_id)
        DO UPDATE SET
          collaborator_name = EXCLUDED.collaborator_name,
          updated_at = now()
        RETURNING user_id AS "userId", collaborator_id AS "collaboratorId"
      `,
      [userId, collaboratorId, collaboratorName || collaboratorId],
    )

    return res.rows
  })
}

export async function removeCollaborator(userId, collaboratorId) {
  return withTransaction(async (client) => {
    const res = await client.query(
      `
        DELETE FROM collaborations
        WHERE user_id = $1
          AND collaborator_id = $2
        RETURNING user_id AS "userId", collaborator_id AS "collaboratorId"
      `,
      [userId, collaboratorId],
    )

    return res.rows
  })
}

export async function loadData(userId) {
  await ensureSchema()

  const [taskRows, relationRows, collaboratorRows, requestRows] = await Promise.all([
    pool.query(
      `
        SELECT id, payload
        FROM tasks
        WHERE owner_user_id = $1
      `,
      [userId],
    ),
    pool.query(
      `
        SELECT from_task_id, to_task_id, relation_type, ts
        FROM task_relations
        WHERE owner_user_id = $1
      `,
      [userId],
    ),
    pool.query(
      `
        SELECT c.collaborator_id AS id,
               COALESCE(c.collaborator_name, u.name, c.collaborator_id) AS name
        FROM collaborations c
        LEFT JOIN app_users u ON u.id = c.collaborator_id
        WHERE c.user_id = $1
        ORDER BY name, id
      `,
      [userId],
    ),
    pool.query(
      `
        SELECT c.user_id AS id,
               COALESCE(u.name, c.user_id) AS name
        FROM collaborations c
        LEFT JOIN app_users u ON u.id = c.user_id
        WHERE c.collaborator_id = $1
        ORDER BY name, id
      `,
      [userId],
    ),
  ])

  const graph = new Graph()

  for (const row of taskRows.rows) {
    const payload = row.payload && typeof row.payload === "object" ? { ...row.payload, id: row.id } : { id: row.id }
    if (!payload?.name) continue // skip legacy ghost tasks with empty payload
    graph.addNode(row.id, payload)
  }

  for (const row of relationRows.rows) {
    if (!graph.nodes.has(row.from_task_id) || !graph.nodes.has(row.to_task_id)) {
      continue
    }

    if (row.relation_type === "LEADS") {
      graph.addLead(row.from_task_id, row.to_task_id, row.ts ?? undefined)
    } else if (row.relation_type === "BLOCKS") {
      graph.addBlock(row.from_task_id, row.to_task_id, row.ts ?? undefined)
    }
  }

  const result = graph.toJSON()
  result.collaborators = collaboratorRows.rows.map((row) => ({ id: row.id, name: row.name }))
  result.collaborationRequests = requestRows.rows.map((row) => ({ id: row.id, name: row.name }))

  return result
}

export async function removeOldTasks(userId) {
  return withTransaction(async (client) => {
    const now = Date.now()
    const cutoff = now - 1000 * 60 * 60 * 24 * 7

    const tasksRes = await client.query(
      `
        SELECT id, payload
        FROM tasks
        WHERE owner_user_id = $1
      `,
      [userId],
    )

    const relationsRes = await client.query(
      `
        SELECT from_task_id, to_task_id
        FROM task_relations
        WHERE owner_user_id = $1
      `,
      [userId],
    )

    const tasksById = new Map()
    for (const row of tasksRes.rows) {
      tasksById.set(row.id, row.payload || {})
    }

    const adjacency = new Map()
    for (const row of relationsRes.rows) {
      if (!adjacency.has(row.from_task_id)) adjacency.set(row.from_task_id, new Set())
      if (!adjacency.has(row.to_task_id)) adjacency.set(row.to_task_id, new Set())
      adjacency.get(row.from_task_id).add(row.to_task_id)
      adjacency.get(row.to_task_id).add(row.from_task_id)
    }

    const toDelete = []
    for (const [taskId, task] of tasksById.entries()) {
      const isReady = task?.ready === true
      const ts = Number(task?.timestamp)
      if (!isReady || !Number.isFinite(ts) || ts >= cutoff) {
        continue
      }

      const neighbors = adjacency.get(taskId) || new Set()
      const allNeighborsReady = [...neighbors].every((neighborId) => {
        const neighbor = tasksById.get(neighborId)
        return neighbor?.ready === true
      })

      if (allNeighborsReady) {
        toDelete.push(taskId)
      }
    }

    if (toDelete.length === 0) return []

    const deleted = await client.query(
      `
        DELETE FROM tasks
        WHERE owner_user_id = $1
          AND id = ANY($2::text[])
        RETURNING id
      `,
      [userId, toDelete],
    )

    return deleted.rows
  })
}

ensureSchema()
  .then(async () => {
    await pool.query("SELECT 1")
    console.log("✅ PostgreSQL connection established")
  })
  .catch((error) => {
    console.error("❌ PostgreSQL initialization error:", error)
  })
