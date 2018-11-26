let express = require('express');
let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);
let run = require('./server/run.js');
const os = require('os');


app.use(express.static(__dirname + '/static'));

app.get('*', function (req, res) {
    res.status(404).send("nothing there");
});

let config = {};
if (os.platform() == 'darwin' || os.platform() == 'win32') {
    config = {
        ip: "127.0.0.1",
        port: "8888",
    }
} else {
    config = {
        ip: "46.101.23.21",
        port: "80",
    }
}

run(io);

const port = config.port;
const ip = config.ip;

http.listen(port, ip, function () {
    console.log('jinwish server listening on ' + ip + ":" + port);
});