export let users = []
export let addUser = (name, id, socket) => {
  const maxSocketsPerUser = 10 // Максимальное количество сокетов на одного пользователя

  let userExists = false
  users.forEach((e) => {
    if (e.id == id) {
      if (e.socket.indexOf(socket) == -1) {
        if (e.socket.length >= maxSocketsPerUser) {
          e.socket.shift() // Удалить самый старый сокет
        }
        e.socket.push(socket)
      }
      userExists = true
    }
  })
  if (!userExists) {
    users.push({ name, id, socket: [socket] })
  }
}

export let getUser = (id) => {
  let r
  users.forEach((e) => {
    if (e.id == id) r = e.socket
  })
  return r
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
