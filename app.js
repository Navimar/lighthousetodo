let express = require('express');
let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);
let run = require('./src/server/run.js');
const config = require('./config.js');

app.use(express.static(__dirname + '/src/static/'));
app.use(express.static(__dirname + '/src/static/img'));
app.use(express.static(__dirname + '/src/static/src'));
app.use(express.static(__dirname + '/src/static/lib'));

app.get('*', function (req, res) {
    res.status(404).send("nothing there");
});

run(io);

const port = config.port;
const ip = config.ip;

http.listen(port, ip, function () {
    console.log('lighthouse server listening on ' + ip + ":" + port);
});

