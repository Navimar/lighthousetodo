const fs = require('fs');
const sha256 = require('sha256');
const user = require('./user.js');
const salt = 'salty89xdXKd';


module.exports = (io) => {
    let n = 0;

    io.on('connection', function (socket) {

        console.log('connection');

        socket.on('disconnect', function () {
            console.log('disconnect');
        });

        socket.on('save', function (msg) {
            if (!msg.id) {
                msg.id = 'demo';
            }
            user.add(msg.id, socket);

            let sockets = user.get(msg.id)
            sockets.forEach(s => {
                if (s != socket) {
                    s.emit('update', msg);
                }
            });

            let dir = sha256(sha256.x2(msg.id + salt));
            if (!fs.existsSync('../data/' + dir)) {
                console.log('folder created');
                fs.mkdirSync('../data/' + dir);
            }

            // fs.createReadStream('../data/' + dir + '/data.txt').pipe(fs.createWriteStream('..data/' + dir + '/old' + n + '.txt'));
            fs.writeFileSync('../data/' + dir + '/data.txt', JSON.stringify(msg), function (err) {
                return console.log(err);
            });
            n++;
            if (n > 100) { n = 0 }

        });
        socket.on('load', function (msg) {
            if (!msg)
                msg = 'demo';
            user.add(msg, socket);
            load(msg, socket);
        });
    });

};

let load = (key, socket) => {
    let dir = sha256(sha256.x2(key + salt));
    if (fs.existsSync('../data/' + dir + '/data.txt')) {
        console.log('load ' + dir);
        // console.log(msg);
        fs.readFile('../data/' + dir + '/data.txt', 'utf8', function (err, data) {
            // console.log(JSON.parse(data));
            socket.emit('update', JSON.parse(data));
        });
    } else {
        console.log('create ' + dir);
        let o = {
            tasks: [{ name: 'hello!', tags: [], opns: [] }]
        }
        fs.mkdirSync('../data/' + dir);
        fs.writeFileSync('../data/' + dir + '/data.txt', JSON.stringify(o));
        socket.emit('update', o);
    }
}