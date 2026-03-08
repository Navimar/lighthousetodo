import { getObjectByName } from "~/logic/util.js"
import reData from "~/logic/reactive.js"
import data from "~/logic/data.js"
import { makevisible } from "~/logic/makevisible"
import saveTask from "~/logic/savetask.js"
import { sendRelation } from "~/logic/send.js"

function normalizeRelationType(relationType) {
  const relationMap = {
    block: "blocks",
    lead: "leads",
  }
  return relationMap[relationType]
}

function resolveCurrentTask(task) {
  const selectedTaskId = task?.id
  if (!selectedTaskId) return null
  return reData.visibleTasks.find((t) => t.id === selectedTaskId) || data.tasks.nodes.get(selectedTaskId) || null
}

export function clearAddConnectionDraft() {
  reData.addConnectionDraft.value = ""
  reData.addConnectionDraft.side = ""
}

export function setAddConnectionDraft(side, value) {
  reData.addConnectionDraft.side = side
  reData.addConnectionDraft.value = value
}

export function addRelationBetweenTasks(fromId, toId, relationType, ts = Date.now()) {
  const normalizedType = normalizeRelationType(relationType)
  if (!fromId || !toId || !normalizedType) {
    console.warn("addRelationBetweenTasks: invalid relation parameters", { fromId, toId, relationType })
    return null
  }
  if (fromId === toId) {
    console.warn("addRelationBetweenTasks: self relation is not allowed", { fromId, toId, relationType })
    return null
  }
  if (!data.tasks.nodes.has(fromId) || !data.tasks.nodes.has(toId)) {
    console.warn("addRelationBetweenTasks: relation points to missing nodes", { fromId, toId, relationType })
    return null
  }

  const outgoing = data.tasks.getRelations(fromId)
  const existingType = outgoing.leads.includes(toId) ? "leads" : outgoing.blocks.includes(toId) ? "blocks" : null
  if (existingType === normalizedType) {
    return { added: null, removed: null, skipped: true }
  }

  if (normalizedType === "leads") {
    data.tasks.addLead(fromId, toId, ts)
  } else {
    data.tasks.addBlock(fromId, toId, ts)
  }

  return {
    added: { from: fromId, to: toId, type: normalizedType, ts },
    removed: existingType ? { from: fromId, to: toId, type: existingType } : null,
    skipped: false,
  }
}

export function addTaskByName(task, taskName, direction, relationType) {
  saveTask()
  const normalizedType = normalizeRelationType(relationType)
  const isIncoming = direction === "from"
  if (!["from", "to"].includes(direction) || !normalizedType) {
    throw new Error(`Неверные параметры связи: direction=${direction}, relationType=${relationType}`)
  }

  const currentTask = resolveCurrentTask(task)
  if (!currentTask?.id || !data.tasks.nodes.has(currentTask.id)) {
    console.warn("addTaskByName: selected task is not available in graph", { task, taskName, direction, relationType })
    return false
  }

  const taskObj = getObjectByName(taskName)
  if (!taskObj) {
    console.warn(`Задача с именем "${taskName}" не найдена`)
    return false
  }
  if (taskObj.id === currentTask.id) {
    console.warn(`Нельзя связать задачу "${taskObj.name}" саму с собой`)
    return false
  }

  const fromId = isIncoming ? taskObj.id : currentTask.id
  const toId = isIncoming ? currentTask.id : taskObj.id
  const change = addRelationBetweenTasks(fromId, toId, relationType)
  if (!change || change.skipped) return false

  sendRelation({
    added: change.added,
    removed: change.removed,
  })
  makevisible()
  return true
}

export function bridgeTaskByName(task, rowTask, direction, taskName, relationType) {
  saveTask()
  if (!["from", "to"].includes(direction)) {
    throw new Error(`Неверное направление bridge-связи: ${direction}`)
  }

  const currentTask = resolveCurrentTask(task)
  if (!currentTask?.id || !rowTask?.id) {
    console.warn("bridgeTaskByName: task ids are missing", { task, rowTask, direction, taskName, relationType })
    return false
  }
  if (!data.tasks.nodes.has(currentTask.id) || !data.tasks.nodes.has(rowTask.id)) {
    console.warn("bridgeTaskByName: task is not available in graph", {
      currentTaskId: currentTask.id,
      rowTaskId: rowTask.id,
      direction,
      taskName,
      relationType,
    })
    return false
  }

  const taskObj = getObjectByName(taskName)
  if (!taskObj) return false
  if (taskObj.id === currentTask.id || taskObj.id === rowTask.id) {
    console.warn("bridgeTaskByName: bridge task must differ from current and row task", {
      bridgeTaskId: taskObj.id,
      currentTaskId: currentTask.id,
      rowTaskId: rowTask.id,
    })
    return false
  }

  const ts = Date.now()
  const changes = []

  if (direction === "to") {
    changes.push(addRelationBetweenTasks(currentTask.id, taskObj.id, relationType, ts))
    changes.push(addRelationBetweenTasks(taskObj.id, rowTask.id, "lead", ts))
  } else {
    changes.push(addRelationBetweenTasks(rowTask.id, taskObj.id, "lead", ts))
    changes.push(addRelationBetweenTasks(taskObj.id, currentTask.id, relationType, ts))
  }

  const validChanges = changes.filter((change) => change && !change.skipped)
  if (!validChanges.length) return false

  sendRelation({
    added: validChanges.map((change) => change.added).filter(Boolean),
    removed: validChanges.map((change) => change.removed).filter(Boolean),
  })
  makevisible()
  return true
}
