import dayjs from 'dayjs';
import { currentTime, selectedDate, data } from '/reactive.js';
import { saveTask, addScribe } from '/logic/exe.js'

function adjustDate(daysToAdd) {
    const dateInput = document.getElementById('dateInput');
    if (dateInput) {
        console.log('dateinp', daysToAdd)
        let newDate;

        if (daysToAdd === 0) {
            newDate = dayjs();
        } else {
            let currentInputDate = dayjs(dateInput.value);
            if (currentInputDate.isBefore(dayjs())) {
                newDate = dayjs().add(daysToAdd, 'day');
            } else {
                newDate = currentInputDate.add(daysToAdd, 'day');
            }
        }

        dateInput.value = newDate.format('YYYY-MM-DD');
    }
}

function selectTask(identifier) {
    let taskToSelect = null;

    // Если идентификатор - это строка, ищем задачу по имени
    if (typeof identifier === 'string') {
        taskToSelect = data.tasks.find(task => task.name === identifier);
    } else {
        taskToSelect = identifier;
    }

    // Если задача найдена и она отличается от текущей выбранной
    if (taskToSelect && data.selected !== taskToSelect) {
        saveTask("cot");
        data.selected = taskToSelect;
    }
}

export { adjustDate, selectTask }