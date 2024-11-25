export const pruneTaskIds = (tasks) => {
  if (tasks) {
    const taskIds = new Set(tasks.map((task) => task.id))

    return tasks.map((task) => {
      const toIds = task.toIds.filter((id) => taskIds.has(id))
      const fromIds = task.fromIds.filter((id) => taskIds.has(id))
      return { ...task, toIds, fromIds }
    })
  }
  return []
}

export const prepareTasks = (tasks) => {
  return tasks.map((task) => {
    if (typeof task.readyLogs === "string") {
      try {
        task.readyLogs = JSON.parse(task.readyLogs)
      } catch (e) {
        console.error("Error parsing readyLogs", e)
      }
    }
    return task
  })
}
