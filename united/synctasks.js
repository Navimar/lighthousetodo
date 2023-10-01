export default (existingTasks = [], incomingTasks = []) => {
  const updatedTasks = [...existingTasks]

  for (const incomingTask of incomingTasks) {
    // Ищем задачу с тем же id или, при отсутствии id, с тем же именем
    // console.log("incomingTask", incomingTask)
    const matchingTask = updatedTasks.find((t) => (t.id ? t.id === incomingTask?.id : t.name === incomingTask?.name))

    // Обновляем задачу, если у нее нет временной метки или если входящая задача новее
    if (!matchingTask?.timestamp || incomingTask.timestamp > matchingTask.timestamp) {
      const index = updatedTasks.findIndex((t) => (t.id ? t.id === incomingTask?.id : t.name === incomingTask?.name))
      if (index > -1) {
        updatedTasks[index] = incomingTask
      } else {
        updatedTasks.push(incomingTask)
      }
    }
  }

  return updatedTasks
}
