let express = require('express');
let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);
let run = require('./server/run.js');
const config = require('./config.js');

app.use(express.static(__dirname + '/static/'));
app.use(express.static(__dirname + '/static/img'));
app.use(express.static(__dirname + '/static/src'));
app.use(express.static(__dirname + '/static/lib'));
app.use(express.static(__dirname + '/desktop/'));

app.get('*', function (req, res) {
    res.status(404).send("nothing there");
});

run(io);

const port = config.port;
const ip = config.ip;

http.listen(port, ip, function () {
    console.log('lighthouse server listening on ' + ip + ":" + port);
});