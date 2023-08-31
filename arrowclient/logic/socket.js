import dayjs from 'dayjs';
import { status, data, user } from '/logic/reactive.js';

import { io } from "socket.io-client";
import { makevisible, sort } from './exe';
const socket = io()
let version = 0
export function inputSocket() {
    socket.on('connect', function () {
        console.log('inputSocket connected');
        status.online = true
    });
    socket.on('disconnect', function () {
        console.log('DISCONNECT!!!');
        status.online = false
    });
    socket.on('update', function (msg) {
        console.log("update", msg);

        if (data.version < msg.version) {
            data.tasks = msg.tasks;
            makevisible()
            sort()
            console.log("loaded");
        } else
            console.log('local data is younger', data.version, msg.version);
    });

    socket.on('err', (val) => {
        console.log('ошибка на сервере', val);
    });
}

export let loadData = () => {
    console.log('loaddata', user)
    socket.emit('load', user);
}

export let sendData = () => {
    let sentdata = {
        user: user,
        version: ++version,
        tasks: data.tasks
    }
    console.log('sendData', sentdata)

    socket.emit('save', sentdata);
}