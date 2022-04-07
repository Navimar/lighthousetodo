const crypto = require('crypto');
const config = require('../../config');


let users = [];
module.exports = {
    check: ({ hash, ...userData }) => {
        const secretKey = crypto.createHash('sha256')
            .update(config.token)
            .digest();
        const dataCheckString = Object.keys(userData)
            .sort()
            .map(key => (`${key}=${userData[key]}`))
            .join('\n');
        const hmac = crypto.createHmac('sha256', secretKey)
            .update(dataCheckString)
            .digest('hex');
        return hmac === hash;
    },
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
        let r;
        users.forEach((e) => {
            if (e.id == id)
                r = e.socket;
        });
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
