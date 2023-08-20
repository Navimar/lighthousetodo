import { currentTime, selectedDate, data } from '/reactive.js';
import { isNameTaken } from '/logic/util.js';


import dayjs from 'dayjs';

let updateLinks = (task) => {
    data.tasks.forEach(otherTask => {
        if (otherTask === task) return; // Пропускаем текущую задачу
        // Обновляем связи на основе `toNames` и `toNamesReady` текущей задачи
        if (task.toNames.includes(otherTask.name) || task.toNamesReady.includes(otherTask.name)) {
            if (!otherTask.fromNames.includes(task.name)) {
                otherTask.fromNames.push(task.name);
            }

            if (task.toNamesReady.includes(otherTask.name)) {
                task.toNamesReady = task.toNamesReady.filter(name => name !== otherTask.name);
                if (!task.toNames.includes(otherTask.name)) {
                    task.toNames.push(otherTask.name);
                }
            }
        }

        // Обновляем связи на основе `fromNames` и `fromNamesReady` текущей задачи
        if (task.fromNames.includes(otherTask.name) || task.fromNamesReady.includes(otherTask.name)) {
            if (!otherTask.toNames.includes(task.name)) {
                otherTask.toNames.push(task.name);
            }

            if (task.fromNamesReady.includes(otherTask.name)) {
                task.fromNamesReady = task.fromNamesReady.filter(name => name !== otherTask.name);
                if (!task.fromNames.includes(otherTask.name)) {
                    task.fromNames.push(otherTask.name);
                }
            }
        }

        // Если имя текущей задачи найдено в `toNamesReady` или `toNames` другой задачи,
        // добавляем эту другую задачу в `fromNames` текущей задачи (если она еще не добавлена)
        if (otherTask.toNamesReady.includes(task.name) || otherTask.toNames.includes(task.name)) {
            if (!task.fromNames.includes(otherTask.name)) {
                task.fromNames.push(otherTask.name);
            }
            // Перемещаем имя из ready массивов, если оно там
            if (otherTask.toNamesReady.includes(task.name)) {
                otherTask.toNamesReady = otherTask.toNamesReady.filter(name => name !== task.name);
                if (!otherTask.toNames.includes(task.name)) {
                    otherTask.toNames.push(task.name);
                }
            }
        }

        // Если имя текущей задачи найдено в `fromNamesReady` или `fromNames` другой задачи,
        // добавляем эту другую задачу в `toNames` текущей задачи (если она еще не добавлена)
        if (otherTask.fromNamesReady.includes(task.name) || otherTask.fromNames.includes(task.name)) {
            if (!task.toNames.includes(otherTask.name)) {
                task.toNames.push(otherTask.name);
            }
            // Перемещаем имя из ready массивов, если оно там
            if (otherTask.fromNamesReady.includes(task.name)) {
                otherTask.fromNamesReady = otherTask.fromNamesReady.filter(name => name !== task.name);
                if (!otherTask.fromNames.includes(task.name)) {
                    otherTask.fromNames.push(task.name);
                }
            }
        }
    });
};

let addScribe = (name) => {
    if (isNameTaken(name))
        return false

    // Инициализируем массивы
    let fromNames = [];
    let toNames = [];

    // Проверяем каждую задачу в data.tasks
    for (let task of data.tasks) {
        console.log(task, 'addscr')
        if (task.fromNamesReady.includes(name)) {
            toNames.push(task.name);
        }
        if (task.toNamesReady.includes(name)) {
            fromNames.push(task.name);
        }
    }
    data.tasks.unshift({
        name,
        note: "",
        time: dayjs().format('HH:mm'),
        date: selectedDate.date,
        type: 'window',
        fromNames,
        toNames,
        fromNamesReady: [],
        toNamesReady: [],
    });
    data.calendarSet[data.selected.date] = data.calendarSet[data.selected.date] ? data.calendarSet[data.selected.date] + 1 : 1;
    updateLinks(data.tasks[0])
    return name
}

let saveTask = (m) => {

    const sort = () => {
        data.tasks.sort((a, b) => {
            let datetimeA = dayjs(`${a.date}T${a.time}`, 'YYYY-MM-DDTHH:mm');
            let datetimeB = dayjs(`${b.date}T${b.time}`, 'YYYY-MM-DDTHH:mm');

            // Приоритет встречам и рамкам перед окнами
            if ((a.type == "meeting" || a.type == "frame") && b.type == "window") return -1;
            if (a.type == "window" && (b.type == "meeting" || b.type == "frame")) return 1;

            // Если обе встречи или рамки, сравниваем datetime
            if ((a.type == "meeting" || a.type == "frame") && (b.type == "meeting" || b.type == "frame")) {
                if (!datetimeA.isSame(datetimeB)) return datetimeA.isAfter(datetimeB) ? 1 : -1;
            }

            // Если обе задачи окна
            if (a.type == 'window' && b.type == 'window') {
                let now = dayjs();

                let aIsFuture = datetimeA.isAfter(now);
                let bIsFuture = datetimeB.isAfter(now);

                // Если одна задача в будущем, а другая в прошлом, возвращаем будущую первой
                if (aIsFuture && !bIsFuture) return 1;
                if (!aIsFuture && bIsFuture) return -1;

                // Если обе задачи в будущем, сравниваем их по времени
                if (aIsFuture && bIsFuture) return datetimeA.isAfter(datetimeB) ? 1 : -1;
            }

            return 0;
        });
    }

    function splitTextToNameAndNote(text) {
        const lines = text.trim().split("\n");
        const name = lines[0];
        const note = lines.slice(1).join("\n");
        return { name, note };
    }

    console.log('saveTask', m)

    let div = document.getElementById("edit")
    if (div) {
        const deleteCheckbox = document.getElementById("deleteCheckbox");
        let { name, note } = splitTextToNameAndNote(div.innerText);
        //удаление
        if (deleteCheckbox && deleteCheckbox.checked) {
            data.calendarSet[data.selected.date]--
            if (data.calendarSet[data.selected.date] < 0)
                data.calendarSet[data.selected.date] = 0

            let taskIndex = data.tasks.indexOf(data.selected);
            if (taskIndex > -1) {
                data.tasks.splice(taskIndex, 1);
            }

            console.log('name', name)
            data.tasks.forEach(task => {
                // Перемещаем из `toNames` в `toNamesReady`
                if (task.toNames.includes(name)) {
                    task.toNames = task.toNames.filter(taskName => taskName !== name);
                    if (!task.toNamesReady.includes(name)) {
                        task.toNamesReady.push(name);
                    }
                }
                console.log('task.fromNames', task.fromNames)

                // Перемещаем из `fromNames` в `fromNamesReady`
                if (task.fromNames.includes(name)) {
                    console.log('before', task.fromNames)
                    task.fromNames = task.fromNames.filter(taskName => taskName !== name);
                    if (!task.fromNamesReady.includes(name)) {
                        task.fromNamesReady.push(name);
                    }
                    console.log('after', task.fromNames, task.fromNamesReady)
                }
            });
        }
        //редактирование
        else {
            let radios = document.getElementsByName('typeradio');
            let choosenradio = false
            for (let i = 0; i < radios.length; i++) {
                if (radios[i].checked) {
                    choosenradio = radios[i].value; // Выводим значение выбранного элемента
                    break; // Выходим из цикла, так как радио-кнопка найдена
                }
            }
            if (choosenradio)
                data.selected.type = choosenradio

            const timeInput = document.getElementById("timeInput");
            const dateInput = document.getElementById("dateInput");

            if (!isNameTaken(name))
                data.selected.name = name
            else if (data.selected.name != name) {
                data.selected.error = true
            }
            data.selected.note = note
            data.selected.time = timeInput.value

            data.calendarSet[data.selected.date]--
            data.selected.date = dateInput.value
            data.calendarSet[data.selected.date] = data.calendarSet[data.selected.date] ? data.calendarSet[data.selected.date] + 1 : 1;


            const fromEdit = document.getElementById("fromEdit");
            if (fromEdit) {
                const childNodes = fromEdit.childNodes;

                const lines = [];

                childNodes.forEach(node => {
                    if (node.nodeType === Node.TEXT_NODE) {
                        // Добавляем текстовый узел, если он не состоит только из пробельных символов
                        const textContent = node.textContent.trim();
                        if (textContent) {
                            lines.push(textContent);
                        }
                    } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName === "DIV") {
                        // Добавляем содержимое узла DIV, если оно не пустое
                        const textContent = node.textContent.trim();
                        if (textContent) {
                            lines.push(textContent);
                        }
                    }
                });
                // Удалить имена из fromNames и fromNamesReady, если они не перечислены в lines
                data.selected.fromNames = data.selected.fromNames.filter(name => lines.includes(name));
                data.selected.fromNamesReady = data.selected.fromNamesReady.filter(name => lines.includes(name));

                // Для каждого имени в lines, если оно не в fromNames и не в fromNamesReady, 
                // добавить его в fromNames и вызвать addScribe
                lines.forEach(line => {
                    if (!data.selected.fromNames.includes(line) && !data.selected.fromNamesReady.includes(line)) {
                        data.selected.fromNames.push(line);
                        addScribe(line);
                    }
                });
                updateLinks(data.selected)
            }
        }
        sort();
    }
}

export { saveTask, addScribe }