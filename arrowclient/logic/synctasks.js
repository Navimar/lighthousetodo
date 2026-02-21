import data from "~/logic/data.js"

export function syncTask(incomingTask) {
  if (!incomingTask?.id) {
    throw new Error("Incoming task is missing an ID.")
  }

  const id = incomingTask.id

  if (!data.tasks.nodes.has(id)) {
    data.tasks.addNode(id, incomingTask)
  } else {
    const existing = data.tasks.nodes.get(id)
    if (incomingTask.timestamp > (existing.timestamp ?? 0)) {
      Object.assign(existing, incomingTask)
    }
  }
}

export function syncRelation(relation) {
  console.log("syncRelation", relation)

  // базовая валидация
  if (!relation || typeof relation !== "object") {
    throw new Error("Invalid relation object")
  }

  const graph = data.tasks

  // Нормализация форматов входа:
  // поддерживаем как новый формат (один объект в added/removed),
  // так и старый (массивы), а также прямой единичный объект без обертки.
  const toArray = (v) => (v == null ? [] : Array.isArray(v) ? v : [v])

  let added = toArray(relation.added)
  let removed = toArray(relation.removed)

  // Если пришёл чистый единичный объект без added/removed
  if (!added.length && !removed.length && relation.from && relation.to) {
    if (relation.type) {
      added = [relation]
    } else {
      removed = [relation]
    }
  }

  if (!added.length && !removed.length) {
    throw new Error("Invalid relation object")
  }

  // Удаление связей (ожидается объект { from, to })
  for (const rel of removed) {
    if (rel && rel.from && rel.to && graph.nodes.has(rel.from) && graph.nodes.has(rel.to)) {
      graph.removeRelation(rel.from, rel.to)
    }
  }

  // Добавление связей (ожидается объект { from, to, type })
  for (const rel of added) {
    if (rel && rel.from && rel.to && rel.type && graph.nodes.has(rel.from) && graph.nodes.has(rel.to)) {
      if (rel.type === "leads") graph.addLead(rel.from, rel.to)
      else if (rel.type === "blocks") graph.addBlock(rel.from, rel.to)
    }
  }
}
