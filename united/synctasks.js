export default (existingTasks = [], incomingTasks = []) => {
  const updatedTasks = [...existingTasks]

  for (const incomingTask of incomingTasks) {
    // Проверяем наличие ID
    if (!incomingTask.id) {
      console.log("incomingTask", incomingTask)
      throw new Error("Incoming task is missing an ID.")
    }

    // Ищем задачу с тем же id
    const matchingTask = updatedTasks.find((t) => t.id === incomingTask.id)

    // Обновляем задачу, если у нее нет временной метки или если входящая задача новее
    if (!matchingTask?.timestamp || incomingTask.timestamp > matchingTask.timestamp) {
      const index = updatedTasks.findIndex((t) => t.id === incomingTask.id)
      if (index > -1) {
        updatedTasks[index] = incomingTask
      } else {
        updatedTasks.push(incomingTask)
      }
    }
  }

  return updatedTasks
}
