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
    users.push({ name, id, sockets: [socket], collaboratorDictionary: {}, lastCleanUp: Date.now() })
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
