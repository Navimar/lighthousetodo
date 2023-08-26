import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { inputSocket } from './server/run.js';
import config from './config.js';

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server);

app.use(express.static(new URL('./src/static/', import.meta.url).pathname));
app.use(express.static(new URL('./src/static/img', import.meta.url).pathname));
app.use(express.static(new URL('./src/static/src', import.meta.url).pathname));
app.use(express.static(new URL('./src/static/lib', import.meta.url).pathname));

app.get('*', function (req, res) {
    res.status(404).send("nothing there");
});

inputSocket(io);

const { port, ip } = config;

server.listen(port, ip, function () {
    console.log(`lighthouse server listening on ${ip}:${port}`);
});
