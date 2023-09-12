import {
	currentTime,
	searchstring,
	selectedDate,
	data,
} from "/logic/reactive.js";
import { isNameTaken } from "/logic/util.js";

import dayjs from "dayjs";

let addScribe = (name, fromNames = [], toNames = []) => {
	// Дополнение fromNames именем из data.tasks, если toNamesReady равен name
	data.tasks.forEach((task) => {
		if (task.toNamesReady?.includes(name)) {
			fromNames.push(task.name);
		}
		if (task.fromNamesReady?.includes(name)) {
			toNames.push(task.name);
		}
	});

	// Удаление дубликатов (если они возникли)
	fromNames = [...new Set(fromNames)];
	toNames = [...new Set(toNames)];

	if (isNameTaken(name)) return false;

	data.tasks.unshift({
		name,
		note: "",
		time: dayjs().format("HH:mm"),
		date: selectedDate.date,
		type: "window",
		fromNames: fromNames,
		toNames: toNames,
		fromNamesReady: [],
		toNamesReady: [],
	});

	data.calendarSet[data.selected.date] = data.calendarSet[data.selected.date]
		? data.calendarSet[data.selected.date] + 1
		: 1;

	makevisible();
	return name;
};

let deleteScribe = (name) => {
	data.calendarSet[data.selected.date]--;
	if (data.calendarSet[data.selected.date] < 0)
		data.calendarSet[data.selected.date] = 0;

	let taskIndex = data.tasks.indexOf(data.selected);
	if (taskIndex > -1) {
		data.tasks.splice(taskIndex, 1);
	}
	data.deleted.push(data.selected);
	console.log("data.deleted:", data.deleted);

	data.tasks.forEach((task) => {
		// Перемещаем из `toNames` в `toNamesReady`
		if (task.toNames?.includes(name)) {
			task.toNames = task.toNames.filter((taskName) => taskName !== name);
			task.toNamesReady = task.toNamesReady || [];
			if (!task.toNamesReady.includes(name)) {
				task.toNamesReady.push(name);
			}
		}

		// Перемещаем из `fromNames` в `fromNamesReady`
		if (task.fromNames?.includes(name)) {
			console.log("before", task.fromNames);
			task.fromNames = task.fromNames?.filter(
				(taskName) => taskName !== name,
			);
			task.fromNamesReady = task.fromNamesReady || [];
			if (!task.fromNamesReady.includes(name)) {
				task.fromNamesReady.push(name);
			}
		}
	});
	makevisible();
	sort();
	return true;
};

export const makevisible = () => {
	console.log("makevisible", data);
	data.visibletasks = data.tasks.filter((task) => {
		if (task === data.selected) {
			return true;
		}

		const isCurrentOrFutureTask =
			selectedDate.date === currentTime.date
				? dayjs(task.date).isBefore(
						dayjs(selectedDate.date).add(1, "day"),
				  ) ||
				  task.date == selectedDate ||
				  !task.date
				: dayjs(task.date).isSame(dayjs(selectedDate.date)) ||
				  !task.date;
		return (
			isCurrentOrFutureTask &&
			(!task.fromNames?.length || task.type === "meeting")
		);
	});

	// Сортировка visibletasks на основе свойства hidden
	data.visibletasks.sort((a, b) => b.hidden - a.hidden);

	// Обновление свойства hidden для всех задач
	const visibleTaskSet = new Set(data.visibletasks);
	data.tasks.forEach((task) => (task.hidden = !visibleTaskSet.has(task)));

	console.log("makevisible  data.visibletasks", data.visibletasks);
};

export const sort = () => {
	data.visibletasks.sort((a, b) => {
		let datetimeA = dayjs(`${a.date}T${a.time}`, "YYYY-MM-DDTHH:mm");
		let datetimeB = dayjs(`${b.date}T${b.time}`, "YYYY-MM-DDTHH:mm");

		// Приоритет пазе над всеми
		if (!a.pause && b.pause) return 1;
		if (a.pause && !b.pause) return -1;

		// Приоритет встречам и рамкам перед окнами
		if (
			(a.type == "meeting" || a.type == "frame") &&
			(b.type == "window" || b.type == "deadline")
		)
			return -1;
		if (
			(a.type == "window" || a.type == "deadline") &&
			(b.type == "meeting" || b.type == "frame")
		)
			return 1;

		// Приоритет сроку над окном
		if (a.type == "deadline" && b.type == "window") return -1;
		if (b.type == "deadline" && a.type == "window") return 1;

		// Если обе встречи или рамки, сравниваем datetime
		if (
			(a.type == "meeting" || a.type == "frame") &&
			(b.type == "meeting" || b.type == "frame")
		) {
			if (!datetimeA.isSame(datetimeB))
				return datetimeA.isAfter(datetimeB) ? 1 : -1;
		}

		// Если обе задачи окна
		if (a.type == "window" && b.type == "window") {
			let now = dayjs();

			let aIsFuture = datetimeA.isAfter(now);
			let bIsFuture = datetimeB.isAfter(now);

			// Если одна задача в будущем, а другая в прошлом, возвращаем будущую первой
			if (aIsFuture && !bIsFuture) return 1;
			if (!aIsFuture && bIsFuture) return -1;

			// Если обе задачи в будущем, сравниваем их по времени
			if (aIsFuture && bIsFuture)
				return datetimeA.isAfter(datetimeB) ? 1 : -1;
		}

		return 0;
	});
	console.log("aftersort", data.visibletasks);
};

let saveTask = (m) => {
	//понять откуда вызвано сохрание
	console.log("saveTask", m);
	//если нет выделенных то выйти
	if (!data.selected) return false;

	//найти див редактирования
	const eDiv = document.getElementById("edit");

	if (eDiv) {
		// if (edit)
		// найти имя и заметку
		const lines = eDiv.innerText.trim().split("\n");
		let name = lines[0];
		const note = lines.slice(1).join("\n");

		// если выделено готово, то удалить запись
		let deleteCheckbox = document.getElementById("deleteCheckbox");
		if (deleteCheckbox && deleteCheckbox.checked) return deleteScribe(name);

		// добываем массив строк из фром и ту
		const fromEdit = document.getElementById("fromEdit");
		const fromEditLines = [
			...new Set(
				fromEdit.innerText
					.trim()
					.split("\n")
					.filter((line) => line.trim() !== ""),
			),
		];
		const toEdit = document.getElementById("toEdit");
		const toEditLines = [
			...new Set(
				toEdit.innerText
					.trim()
					.split("\n")
					.filter((line) => line.trim() !== ""),
			),
		];

		// создаем массив фром и ту исключая реади
		let fromEditLinesWOR = fromEditLines.filter(
			(name) => !data.selected.fromNamesReady?.includes(name),
		);
		let toEditLinesWOR = toEditLines.filter(
			(name) => !data.selected.toNamesReady?.includes(name),
		);

		// создаем массив фром  реади
		let fromEditLinesReady = fromEditLines.filter((name) =>
			data.selected.fromNamesReady?.includes(name),
		);
		let toEditLinesReady = toEditLines.filter((name) =>
			data.selected.toNamesReady?.includes(name),
		);

		// создаем массив задач для создания из новых ссылок
		let newScribesFromNames = fromEditLinesWOR.slice();
		let newScribesToNames = toEditLinesWOR.slice();

		// добаываем дату и время из инпутов
		const timeInput = document.getElementById("timeInput").value;
		const dateInput = document.getElementById("dateInput").value;

		// добываем данные из радио
		let radios = document.getElementsByName("typeradio");
		let choosenradio = false;
		for (let i = 0; i < radios.length; i++) {
			if (radios[i].checked) {
				choosenradio = radios[i].value; // Выводим значение выбранного элемента
				break; // Выходим из цикла, так как радио-кнопка найдена
			}
		}

		//провереяем что имя не занято
		if (isNameTaken(name)) {
			name = data.selected.name;
			data.selected.error = true;
		}

		for (let theTask of data.tasks) {
			// ищем и удаляем все ссылки на старое имя
			for (let fni in theTask.fromNames) {
				if (
					theTask.fromNames[fni] &&
					theTask.fromNames[fni].toLowerCase() ==
						data.selected.name.toLowerCase()
				) {
					theTask.fromNames.splice(fni, 1);
				}
			}

			for (let tni in theTask.toNames) {
				if (
					theTask.toNames[tni] &&
					theTask.toNames[tni].toLowerCase() ==
						data.selected.name.toLowerCase()
				) {
					theTask.toNames.splice(tni, 1);
				}
			}

			//добавляем ссылки на новое имя удаляем из массива новых задач найденные ссылки
			for (let index in fromEditLines) {
				if (
					theTask.name.toLowerCase() ===
					fromEditLines[index].toLowerCase()
				) {
					newScribesFromNames.splice(index, 1);
					if (
						theTask.toNames &&
						theTask.toNames.indexOf(name) === -1
					) {
						//удаляем из реади
						if (
							theTask.toNamesReady &&
							theTask.toNamesReady.indexOf(name) !== -1
						) {
							const index = theTask.toNamesReady.indexOf(name);
							theTask.toNamesReady.splice(index, 1);
						}
						//дописываем в ссылки
						theTask.toNames.push(name);
					}
				}
			}

			for (let index in toEditLines) {
				if (
					theTask.name.toLowerCase() ===
					toEditLines[index].toLowerCase()
				) {
					newScribesToNames.splice(index, 1);
					if (
						theTask.fromNames &&
						theTask.fromNames.indexOf(name) === -1
					) {
						//удаляем из реади
						if (
							theTask.fromNamesReady &&
							theTask.fromNamesReady.indexOf(name) !== -1
						) {
							const index = theTask.fromNamesReady.indexOf(name);
							theTask.fromNamesReady.splice(index, 1);
						}
						//дописываем в ссылки
						theTask.fromNames.push(name);
					}
				}
			}
		}

		//сохраняем новые значение
		data.selected.name = name;
		data.selected.note = note;

		if (choosenradio) data.selected.type = choosenradio;

		data.selected.fromNames = fromEditLinesWOR;
		data.selected.fromNamesReady = fromEditLinesReady;

		data.selected.toNames = toEditLinesWOR;
		data.selected.toNamesReady = toEditLinesReady;

		data.selected.time = timeInput;

		data.calendarSet[data.selected.date]--;
		data.selected.date = dateInput;
		data.calendarSet[data.selected.date] = data.calendarSet[
			data.selected.date
		]
			? data.calendarSet[data.selected.date] + 1
			: 1;

		// устанавливаем паузу
		let pauseCheckbox = document.getElementById("pauseCheckbox");
		if (pauseCheckbox && pauseCheckbox.checked) data.selected.pause = true;
		else data.selected.pause = false;
		//создаем новые записи
		newScribesFromNames.forEach((txt) => {
			addScribe(txt, [], [name]);
		});
		newScribesToNames.forEach((txt) => {
			addScribe(txt, [name], []);
		});

		data.selected = false;

		makevisible();
		sort();
		return true;
	}
};

export { saveTask, addScribe };
