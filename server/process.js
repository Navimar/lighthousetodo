export const pruneTaskIds = (tasks) => {
  if (!tasks) return [] // Если tasks = undefined/null → вернуть пустой массив

  const taskIds = new Set(tasks.map((task) => task.id)) // 1️⃣ Собираем все task.id в Set

  return tasks.map((task) => {
    const toIds = (task.toIds || []).filter((id) => taskIds.has(id)) // 2️⃣ Фильтруем toIds
    const fromIds = (task.fromIds || []).filter((id) => taskIds.has(id)) // 3️⃣ Фильтруем fromIds
    const moreImportantIds = (task.moreImportantIds || []).filter((id) => taskIds.has(id)) // 4️⃣ Фильтруем moreImportantIds
    const lessImportantIds = (task.lessImportantIds || []).filter((id) => taskIds.has(id)) // 5️⃣ Фильтруем lessImportantIds

    return { ...task, toIds, fromIds, moreImportantIds, lessImportantIds } // 6️⃣ Обновленный task
  })
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
