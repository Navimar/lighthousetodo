const fs = require('fs');
module.exports = (io) => {


    let obj = {text: 'hi'};

    io.on('connection', function (socket) {
        console.log('connection');

        socket.on('disconnect', function () {
            console.log('disconnect');
        });

        socket.on('save', function (msg) {
            fs.createReadStream('data/data.txt').pipe(fs.createWriteStream('data/old.txt'));
            fs.writeFileSync("data/data.txt", JSON.stringify(msg), function (err) {
                if (err) {
                    return console.log(err);
                }
                console.log("The file was saved!");
            });
        });

        socket.on('load', function (msg) {
            console.log('load!');
            fs.readFile('data/data.txt', 'utf8', function (err, data) {
                console.log(JSON.parse(data));
                socket.emit('update',JSON.parse(data));
            });
        });
    });

};