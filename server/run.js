const fs = require('fs');
module.exports = (io) => {
    let n = 0;

    io.on('connection', function (socket) {
        console.log('connection');

        socket.on('disconnect', function () {
            console.log('disconnect');
        });

        socket.on('save', function (msg) {
            fs.createReadStream('data/data.txt').pipe(fs.createWriteStream('data/old' + n + '.txt'));
            fs.writeFileSync("data/data.txt", JSON.stringify(msg), function (err) {
                return console.log(err);
            });
            console.log("The file was saved!");
            n++;
            if (n > 100) { n = 0 }
        });
        socket.on('load', function (msg) {
            console.log('load!');
            fs.readFile('data/data.txt', 'utf8', function (err, data) {
                //console.log(JSON.parse(data));
                socket.emit('update', JSON.parse(data));
            });
        });
    });

};