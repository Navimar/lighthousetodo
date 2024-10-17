import data from "~/logic/data.js"

export default (incomingTasks = []) => {
  for (const incomingTask of incomingTasks) {
    // Проверяем наличие ID
    if (!incomingTask.id) {
      // console.log("incomingTask", incomingTask)
      throw new Error("Incoming task is missing an ID.")
    }

    // Ищем задачу с тем же ID
    let matchingTask = data.tasks.find((t) => t.id === incomingTask.id)

    if (!matchingTask) {
      data.tasks.push(incomingTask)
      // Обновляем задачу, если у нее нет временной метки или если входящая задача новее
    } else if (incomingTask.timestamp > matchingTask.timestamp) {
      Object.assign(matchingTask, incomingTask)
    }
  }
}
