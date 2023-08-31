
import crypto from 'crypto';
import * as fs from 'fs';
import admin from 'firebase-admin';
import config from '../config.js';
import { addUser, getUser } from './user.js';
import serviceAccount from '../firebase.config.js';

async function verifyToken(idToken) {
    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        return decodedToken.uid;
    } catch (error) {
        // Обработка ошибок
        console.error('Error verifying token:', error);
        // В зависимости от вашего сценария использования вы можете выбросить ошибку или вернуть что-либо:
        throw error;
        // или
        // return null;
    }
}

export let inputSocket = (io) => {
    console.log(admin)
    console.log(admin.credential)
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: 'https://adastratodo.firebaseio.com'
    });

    let n = 0;

    io.on('connection', function (socket) {

        console.log('connection', socket.id);

        socket.on('disconnect', function () {
            console.log('disconnect');
        });

        socket.on('save', async function (msg) {
            if (msg.user.idToken) {
                const userId = await verifyToken(msg.user.idToken);
                if (userId) {
                    console.log('save user', msg.user)
                    addUser(userId, socket);

                    let sockets = getUser(userId)
                    sockets.forEach(s => {
                        if (s != socket) {
                            console.log(s.id, socket.id);
                            s.emit('update', msg);
                        } else {
                            console.log('mysocket', socket.id)
                        }
                    });

                    // let dir = sha256(sha256.x2(msg.id + salt));
                    let dir = path(userId);
                    if (!fs.existsSync('../data/' + dir)) {
                        console.log('folder created');
                        fs.mkdirSync('../data/' + dir);
                    }

                    // fs.createReadStream('../data/' + dir + '/data.txt').pipe(fs.createWriteStream('..data/' + dir + '/old' + n + '.txt'));
                    fs.writeFileSync('../data/' + dir + '/data.txt', JSON.stringify({ tasks: msg.tasks, version: msg.version }), function (err) {
                        return console.log(err);
                    });
                    fs.writeFileSync('../data/' + dir + '/data' + n + '.txt', JSON.stringify({ tasks: msg.tasks, version: msg.version }), function (err) {
                        return console.log(err);
                    });
                    n++;
                    if (n > 30) { n = 0 }
                } else {
                    console.log("Invalid token or not authenticated", msg);
                    socket.emit('err', 'Invalid token or not authenticated')
                }
            } else {
                console.log(msg, 'Не найден токен при загрузке');
                socket.emit('err', 'Не найден токен при загрузке');
                socket.emit('err', msg);
            }

        });
        socket.on('load', async function (msg) {
            if (msg.idToken) {
                const userId = await verifyToken(msg.idToken);
                if (userId) {
                    addUser(msg.name, socket);
                    console.log(msg, 'load')
                    let data = load(msg.name)
                    socket.emit('update', JSON.parse(data));
                } else {
                    console.log(msg, 'login error on load');
                    socket.emit('err', 'Скорее всего вышла новая версия и вам нужно перезайти в приложение! Если эта табличка появляется вновь и вновь, значит что-то сломалось, сообщите мне об этом как можно скорее.');
                }
            }
            else {
                console.log(msg, 'Не найден токен при сохранении');
                socket.emit('err', 'Не найден токен при сохранении');
                socket.emit('err', msg);
            }
        });
    });

};

let path = (key) => {
    key = key + config.salt;
    return crypto.createHash('sha256').update(key).digest('hex');
}

let load = (key) => {
    let rdata = '???';
    console.log('id', key);
    let dir = path(key);

    if (fs.existsSync('../data/' + dir + '/data.txt')) {
        console.log('load ' + dir);
        rdata = fs.readFileSync('../data/' + dir + '/data.txt', 'utf8');
    } else {
        console.log('welcome', dir);
        rdata = fs.readFileSync('./server/welcome.txt', 'utf8');

        if (!fs.existsSync('../data/' + dir)) {
            fs.mkdirSync('../data/' + dir);
        }
        fs.writeFileSync('../data/' + dir + '/data.txt', rdata);
    }
    return rdata;
}
