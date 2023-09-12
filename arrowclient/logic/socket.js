import { auth } from "/components/authentication.js";
import { status, data, user } from "/logic/reactive.js";

import { io } from "socket.io-client";
import { makevisible, sort } from "./exe";
const socket = io();

let version = 0;

async function getToken() {
	if (auth.currentUser)
		try {
			return await auth.currentUser.getIdToken(true);
		} catch (error) {
			console.error("Error getting token:", error);
			throw error;
		}
}

export function inputSocket() {
	socket.on("connect", function () {
		status.online = true;
	});
	socket.on("disconnect", function () {
		console.log("DISCONNECT!!!");
		status.online = false;
	});
	socket.on("update", function (msg) {
		console.log("update", msg);

		if (data.version < msg.version) {
			data.tasks = msg.tasks ? msg.tasks : data.tasks;
			version = msg.version ? msg.version : version;
			makevisible();
			sort();
			console.log("loaded");
		} else console.log("local data is younger", version, msg.version);
	});

	socket.on("err", (val) => {
		console.log("ошибка на сервере", val);
	});
}

export const loadData = async () => {
	console.log("loaddata", user);
	if (auth.currentUser)
		try {
			const token = await getToken("ld"); // Получение нового токена
			user.token = token; // Добавляем токен к данным пользователя
			socket.emit("load", user);
		} catch (error) {
			console.error("Error loading data with token:", error);
		}
};

export const sendData = async () => {
	let sentdata = {
		user: user,
		version: ++version,
		tasks: data.tasks,
	};
	if (auth.currentUser)
		try {
			const token = await getToken("sd"); // Получение нового токена
			sentdata.user.token = token; // Добавляем токен к данным, которые отправляем
			console.log("sendData", sentdata);
			socket.emit("save", sentdata);
		} catch (error) {
			console.error("Error sending data with token:", error);
		}
};
