let express = require('express');
let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);
let run = require('./server/run.js');
const os = require('os');


app.use(express.static(__dirname + '/static'));
app.use(express.static(__dirname + '/desktop'));
app.use(express.static(__dirname + '/mobile'));


app.get('*', function (req, res) {
    res.status(404).send("nothing there");
    // res.sendFile('/index.html');
});

let config = {};
if (os.platform() == 'darwin' || os.platform() == 'win32') {
    config = {
        ip: "127.0.0.1",
        port: "8888",
    }
} else {
    config = {
        ip: "165.22.49.60",
        port: "80",
    }
}

run(io);

const port = config.port;
const ip = config.ip;

http.listen(port, ip, function () {
    console.log('lighthouse server listening on ' + ip + ":" + port);
});