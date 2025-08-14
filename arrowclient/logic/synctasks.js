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
  if (!relation || (!Array.isArray(relation.added) && !Array.isArray(relation.removed))) {
    throw new Error("Invalid relation object")
  }

  const graph = data.tasks

  // Удаление связей
  if (Array.isArray(relation.removed)) {
    for (const rel of relation.removed) {
      if (rel.from && rel.to) {
        graph.removeRelation(rel.from, rel.to)
      }
    }
  }

  // Добавление связей
  if (Array.isArray(relation.added)) {
    for (const rel of relation.added) {
      if (rel.from && rel.to && rel.type) {
        if (rel.type === "leads") graph.addLead(rel.from, rel.to)
        else if (rel.type === "blocks") graph.addBlock(rel.from, rel.to)
      }
    }
  }
}
