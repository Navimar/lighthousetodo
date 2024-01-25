export const pruneTaskIds = (tasks) => {
  const taskIds = new Set(tasks.map((task) => task.id))

  return tasks.map((task) => {
    const toIds = task.toIds.filter((id) => taskIds.has(id))
    const fromIds = task.fromIds.filter((id) => taskIds.has(id))
    return { ...task, toIds, fromIds }
  })
}
