import Graph from "./graph.js"

export const pruneTaskIds = (tasks) => {
  if (!tasks) return []

  const graph = new Graph()
  tasks.forEach((task) => graph.addNode(task.id))

  tasks.forEach((task) => {
    ;(task.leads || [])
      .forEach((toId) => graph.addLead(task.id, toId))(task.blocks || [])
      .forEach((toId) => graph.addBlock(task.id, toId))
  })

  return tasks.map((task) => {
    const { leads, blocks } = graph.getRelations(task.id)
    const { leads: leadIns, blocks: blockIns } = graph.getIncomingRelations(task.id)
    return { ...task, leads, blocks, leadIns, blockIns }
  })
}

export const prepareTasks = (tasks) => {
  return tasks.map((task) => {
    return task
  })
}
