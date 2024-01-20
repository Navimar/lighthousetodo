export let users = []
export let addUser = (name, id, socket) => {
  const maxSocketsPerUser = 10 // Максимальное количество сокетов на одного пользователя

  let userExists = false
  users.forEach((e) => {
    if (e.id == id) {
      if (e.sockets.indexOf(socket) == -1) {
        if (e.sockets.length >= maxSocketsPerUser) {
          e.sockets.shift() // Удалить самый старый сокет
        }
        e.sockets.push(socket)
      }
      userExists = true
    }
  })
  if (!userExists) {
    users.push({ name, id, sockets: [socket], collaboratorDictionary: {} })
  }
}

export let getUser = (id) => {
  return users.find((user) => user.id === id)
}

export let removeUser = (id, socket) => {
  users.forEach((e) => {
    if (e.id == id) {
      let n = e.socket.indexOf(socket)
      if (n >= 0) {
        e.socket.slice(n, 1)
      }
      // break;
    }
  })
}

export function updateCollaboratorDictionary(userId, dic) {
  let collaboratorId = dic.id
  let collaboratorName = dic.name
  let timestamp = dic.timestamp

  // Получаем текущий словарь коллабораторов пользователя
  const user = getUser(userId)
  let currentDictionary = user.collaboratorDictionary || {}

  // Проверяем, нужно ли обновить запись
  if (!currentDictionary[collaboratorId] || timestamp > currentDictionary[collaboratorId].timestamp) {
    // Обновляем или добавляем запись о коллабораторе
    currentDictionary[collaboratorId] = { name: collaboratorName, timestamp: timestamp }
  }

  // Обновляем словарь коллабораторов пользователя
  user.collaboratorDictionary = currentDictionary
  console.log("updateCollaboratorDictionary", user.collaboratorDictionary)
}
