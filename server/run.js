const fs = require('fs');
const sha256 = require('sha256');
const salt = 'salty89xdXKd';

module.exports = (io) => {
    let n = 0;

    io.on('connection', function (socket) {
        // console.log('connection');

        socket.on('disconnect', function () {
            // console.log('disconnect');
        });

        socket.on('save', function (msg) {

            if (!msg.id) {
                msg.id = 'demo';
            }
            let dir = sha256(sha256.x2(msg.id + salt));
            if (!fs.existsSync('./data/' + dir)) {
                console.log('folder created');
                fs.mkdirSync('./data/' + dir);
            }

            console.log('save' + msg);
            console.log(msg);
            console.log(dir);


            fs.createReadStream('data/' + dir + '/data.txt').pipe(fs.createWriteStream('data/' + dir + '/old' + n + '.txt'));
            fs.writeFileSync('data/' + dir + '/data.txt', JSON.stringify(msg), function (err) {
                return console.log(err);
            });
            n++;
            if (n > 100) { n = 0 }
        });
        socket.on('load', function (msg) {
            // console.log('load!');
            if (!msg) {
                msg = 'demo';
            }
            let dir = sha256(sha256.x2(msg + salt));
            if (fs.existsSync('data/' + dir + '/data.txt')) {
                console.log('load ' + dir);
                console.log(msg);
                fs.readFile('data/' + dir + '/data.txt', 'utf8', function (err, data) {
                    console.log(JSON.parse(data));
                    socket.emit('update', JSON.parse(data));
                });
            } else {
                console.log('create ' + dir);
                let o = {
                    tasks: [{ name: 'hello!', tags: [], opns: [] }]
                }
                fs.mkdirSync('./data/' + dir);
                fs.writeFileSync('./data/' + dir + '/data.txt', JSON.stringify(o));
                socket.emit('update', o);
            }
        });
    });

};