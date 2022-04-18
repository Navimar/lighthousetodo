const fs = require('fs');
const crypto = require('crypto');
const user = require('./user.js');

module.exports = (io) => {
    let n = 0;

    io.on('connection', function (socket) {

        console.log('connection');

        socket.on('disconnect', function () {
            console.log('disconnect');
        });

        socket.on('save', function (msg) {
            if (msg.user.hash && user.check(msg.user)) {
                user.add(msg.user.id, socket);

                let sockets = user.get(msg.user.id)
                sockets.forEach(s => {
                    if (s != socket) {
                        console.log(s.id, socket.id);
                        s.emit('update', msg);
                    }
                });

                // let dir = sha256(sha256.x2(msg.id + salt));
                let dir = path(msg.user.id);
                if (!fs.existsSync('../data/' + dir)) {
                    console.log('folder created');
                    fs.mkdirSync('../data/' + dir);
                }

                // fs.createReadStream('../data/' + dir + '/data.txt').pipe(fs.createWriteStream('..data/' + dir + '/old' + n + '.txt'));
                fs.writeFileSync('../data/' + dir + '/data.txt', JSON.stringify({ tasks: msg.tasks, timestamp: msg.timestamp }), function (err) {
                    return console.log(err);
                });
                n++;
                if (n > 100) { n = 0 }
            }
            else console.log(msg, 'login error on save');

        });
        socket.on('load', function (userdata) {
            if (userdata && userdata.hash && user.check(userdata)) {
                user.add(userdata.id, socket);
                load(userdata.id, socket);
            } else {
                console.log(userdata, 'login error on load');
                socket.emit('err', 'Скорее всего вышла новая версия и вам нужно перезайти в приложение! Если эта табличка появляется вновь и вновь, значит что-то сломалось, сообщите мне об этом как можно скорее.');
            }
        });
    });

};

let path = (key) => {
    key = key + 'salty89xdXKd';
    return crypto.createHash('sha256').update(key).digest('hex');
}

let load = (key, socket) => {
    console.log('id', key);
    // let dir = sha256(sha256.x2(key + salt));
    let dir = path(key);


    if (fs.existsSync('../data/' + dir + '/data.txt')) {
        console.log('load ' + dir);
        // console.log(msg);
        fs.readFile('../data/' + dir + '/data.txt', 'utf8', function (err, data) {
            // console.log(JSON.parse(data));
            socket.emit('update', JSON.parse(data));
        });
    } else {
        fs.readFile('src/server/welcome.txt', 'utf8', function (err, data) {
            if (err)
                throw 0;
            // console.log(JSON.parse(data));
            console.log('create ' + dir);
            // let o = {
            //     tasks: [{ name: 'hello!', tags: [], opns: [] }]
            // }
            fs.mkdirSync('../data/' + dir);
            fs.writeFileSync('../data/' + dir + '/data.txt', data);
            socket.emit('update', JSON.parse(data));
        });


    }
}