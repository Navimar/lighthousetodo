let users = [];
module.exports = {
    add: (id, socket) => {
        let ok = true;
        users.forEach((e) => {
            if (e.id == id) {
                if (e.socket.indexOf(socket) == -1) {
                    e.socket.push(socket);
                }
                ok = false;
                // break;
            }
        });
        if (ok) {
            users.push({ id, socket: [socket] });
        }
        // console.log(users);
    },
    get: (id) => {
        let r ;
        users.forEach((e) => {
            // console.log (e.id,id);
            if (e.id == id) {
                r = e.socket;
            }
        });
        // console.log('return',r)
        return r;
    },
    remove: (id, socket) => {
        users.forEach((e) => {
            if (e.id == id) {
                let n = e.socket.indexOf(socket)
                if (n >= 0) {
                    e.socket.slice(n, 1);
                }
                // break;
            }
        });
    },
}
