const express = require('express');
const app = express();
const http = require('http').Server(app);
const os = require('os');
const run = require('./server/run.js');


app.use(express.static(__dirname + '/static'));

app.get('*', function (req, res) {
    res.status(404).send("nothing there");
});

let config={};
if (os.platform() == 'darwin'|| os.platform() == 'win32') {
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

run();

const port = config.port;
const ip = config.ip;

http.listen(port, ip, function () {
    console.log('jinwish server listening on ' + ip +":"+ port);
});