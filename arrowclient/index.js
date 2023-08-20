import css from './css.js';
import renderCalendar from './components/calendar.js'
import timeSlider from './components/timeslider.js'
import fromLine from './components/fromline.js'
import { adjustDate, selectTask } from '/components/manipulate.js'
import { saveTask, addScribe } from './logic/exe.js'
import { clickPos, mouseX, mouseY } from '/logic/util.js';


import { currentTime, selectedDate, data } from './reactive.js';

import { html, reactive, watch } from "@arrow-js/core";
import dayjs from 'dayjs';
import 'dayjs/locale/ru'; // Импорт русской локали
import localizedFormat from 'dayjs/plugin/localizedFormat'; // Плагин для локализованного форматирования
import customParseFormat from 'dayjs/plugin/customParseFormat';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
dayjs.extend(isSameOrBefore)
dayjs.extend(customParseFormat);
dayjs.extend(localizedFormat);
dayjs.locale('ru');

const updateTimeSlider = (event) => {
  const time = event.target.value;
  const dayjsTime = dayjs(time, 'HH:mm');
  const totalMinutes = dayjsTime.hour() * 60 + dayjsTime.minute();
  const slider = document.getElementById('timeSlider');
  slider.value = totalMinutes;
}

function updateCurrentTimeMarker() {
  const time = dayjs();
  const totalMinutes = time.hour() * 60 + time.minute();
  const slider = document.getElementById('timeSlider');
  if (slider) {
    const sliderWidth = slider.offsetWidth - 16;
    currentTime.slider = (totalMinutes / 1440) * sliderWidth + 16
  }
  currentTime.clock = time.format("HH:mm")
  currentTime.date = time.format("YYYY-MM-DD")
  // console.log('currentTime.timerStarted', currentTime.timerStarted)
  if (currentTime.timerStarted) {
    const diffInMinutes = Math.abs(time.diff(dayjs(currentTime.timerStarted, "HH:mm"), 'minute'))
    // console.log('diffInMinutes', diffInMinutes)
    const hours = (diffInMinutes % (24 * 60)) / 60 | 0;  // Остаток минут после деления на 24 часа преобразуем в часы
    const minutes = diffInMinutes % 60;
    currentTime.timer = hours.toLocaleString('en-US', { minimumIntegerDigits: 2 }) + ":" + minutes.toLocaleString('en-US', { minimumIntegerDigits: 2 })
    // console.log('currentTime.timer', currentTime.timer, minutes)

  }
  setTimeout(updateCurrentTimeMarker, 1000);
}


const app = document.getElementById("App");

const newscribetext = "новая запись";

let plusbutton = () => {
  saveTask('plusbutton')
  if (!addScribe(newscribetext)) {
    selectTask(newscribetext)
  }
  else
    data.selected = data.tasks[0];
}



const timeinputclass = (task) => {
  let taskDate = dayjs(`${task.date}T${task.time}`, 'YYYY-MM-DDTHH:mm');

  let isInPast = dayjs().isAfter(taskDate)
  if (task.type == 'meeting' && isInPast)
    return "dark:bg-darkold bg-old dark:border-darkold border-old text-white"
  if (task.type == 'meeting')
    return "bg-transparent dark:text-darkold text-old  dark:border-darkold border-old"
  if (task.type == 'frame' && isInPast)
    return "dark:border-black text-white bg-mygray "
  if (task.type == 'frame')
    return " dark:border-black border-darkgray bg-transparent text-darkgray "
  if (isInPast)
    return "hidden"
  return "text-mygray bg-transparent"
}



const errorclass = (task) => {

  // // console.log(data.selected.name != task.name, task.error)
  // if (data.selected.name != task.name && task.error) {
  //   return 'bg-old dark:bg-darkold'
  // }
  // else {
  //   task.error = false;
  //   // console.log(task, 'taskafterdel')
  //   return ''
  return ''
}




let saveButton = () => {
  saveTask('sv');
  data.selected = false
}




let sinkTask = (task) => {
  const index = data.tasks.indexOf(task);

  if (index !== -1) {
    data.tasks.splice(index, 1); // Удаляем объект из массива
    data.tasks.push(task); // Добавляем объект обратно в конец массива
  }
  saveTask('sink');

}


let riseTask = (task) => {
  const index = data.tasks.indexOf(task);
  if (index !== -1) {
    data.tasks.splice(index, 1); // Удалить объект из текущего местоположения
    data.tasks.unshift(task);
  }

  saveTask('rise')
  // window.scrollTo(0, 0)
}

let checked = (task, type) => {
  if (task.type == type)
    return 'checked'
  else
    return ''
}

let radio = (task) => html`
<div class="grid grid-cols-3 gap-3 w-full">
  <div>
    <input type="radio" id="meeting" name="typeradio" value="meeting" class="hidden peer" ${checked(task, 'meeting')} />
    <label
      for="meeting"
      class="${css.radio}"
    >
      Встреча
    </label>
  </div>

  <div>
    <input type="radio" id="frame" name="typeradio" value="frame" class="hidden peer" ${checked(task, 'frame')}/>
    <label
      for="frame"
      class="${css.radio}"
    >
      Рамка
    </label>
  </div>

  <div>
    <input type="radio" id="window" name="typeradio" value="window" class="hidden peer" ${checked(task, 'window')}/>
    <label
      for="window"
      class="${css.radio}"
    >
      Окно
    </label>
  </div>
</div>
`


let getTaskTime = (task) => {
  let now = dayjs();
  let taskDate = dayjs(`${task.date}T${task.time}`, 'YYYY-MM-DDTHH:mm');

  if (taskDate.isBefore(now.startOf('day').subtract(1, 'day'))) {
    // Если задача была два дня назад или раньше
    return "давно";
  } else if (taskDate.isBefore(now.startOf('day'))) {
    // Если задача была вчера
    return "вчера";
  } else {
    // Если задача сегодня или в будущем
    return task.time;
  }
}

let dateInput = (task) => {
  return html` <div class="">
            <input id="timeInput" value ="${task.time}" type="time" class="dark:bg-black bg-white dark:border-black text-center h-7 " @input="${(e) => updateTimeSlider(e)}">
            <input id="dateInput" value ="${task.date}" class="dark:bg-black bg-white dark:border-black text-center h-7 " type="date" id="task-date" name="task-date">
            <button class="${css.button}" @click="${() => adjustDate(0)}">Сегодня</button>
            <button class="${css.button}" @click="${() => adjustDate(1)}">+1 день</button>
            <button class="${css.button}" @click="${() => adjustDate(7)}">+1 неделя</button>
          </div>`
}


let renderTask = (task, index) => {
  let firstclass = index == 0 ? "border-box border-b-02rem  border-old dark:border-darkold" : 0
  if (data.selected.name == task.name)
    // Редактируемый
    return html` 
        <div class="${firstclass} flex flex-col gap-3 bg-white dark:bg-black p-3 rounded-lg overflow dark:text-white ${errorclass(task)}">
        <div class="grid grid-cols-4 gap-3">
          <button class="${css.button}" @click="${() => riseTask(task)}">Поднять</button>
          <button class="${css.button}" @click="${() => sinkTask(task)}">Притопить</button>
             <label class="${css.button}" for="deleteCheckbox" >
              <input class=" w-3.5 h-3.5 shadow-none dark:accent-darkold rounded-lg appearance-none dark:checked:bg-darkold mx-2 border-2 border-old dark:border-darkold checked:bg-old accent-old" type="checkbox" id="deleteCheckbox" />
               Удалить
           </label>
          <button class="${css.button}" @click="${saveButton}">Сохранить</button>
          </div>
          ${radio(task)}
          ${timeSlider(task)}
          ${dateInput(task)}
           <div
            id="fromEdit"
            class="w-full auto-expand whitespace-pre-wrap bg-nearwhite dark:bg-nearblack  focus:outline-none"
            contenteditable="true"
            role="textbox"
            aria-multiline="true"
          >${task.fromNames.map((from) => { return html`${from}\n` })}${task.fromNamesReady.map((from) => { return html`${from}\n` })}</div>
                  ${fromLine(task)}
        <div
            id="edit"
            class="w-full auto-expand whitespace-pre-wrap focus:outline-none"
            contenteditable="true"
            role="textbox"
            aria-multiline="true"
          >${task.name}\n${task.note}</div>
          <div class=" flex gap-2 text-sm  empty:hidden">${task.toNamesReady.map((from) => {
      return html`<div 
    @click="${(e) => {
          e.stopPropagation()
        }}" 
    class="text-darkgray rounded-lg px-2">${from}<div>`
    })}${task.toNames.map((from) => {
      return html`<div 
        @click="${(e) => {
          selectTask(from);
          clickPos(e);
          e.stopPropagation()
        }}" 
            class="text-white rounded-lg px-2 bg-mygray dark:bg-darkgray">${from}<div>`
    })}</div>
          </div></div>`;
  else
    // Нередактируемый
    return html`<div
      @click="${(e) => { selectTask(task); clickPos(e) }}"
      class="${firstclass} flex flex-col gap-3 bg-nearwhite dark:bg-black p-3 rounded-lg overflow dark:text-white ${errorclass(task)}"
        >
        ${fromLine(task)}
        <div class="flex gap-3">
  <div  class="${timeinputclass(task)} text-center p-0.5 px-1  notomono " >${getTaskTime(task)}</div>
        <div class="w-full pt-0.5 ">${() => task.name} ${() => { if (task.note && task.note.length > 0) return "+ 📝"; }}</div>
        </div>
        <div class=" flex gap-2 text-sm  empty:hidden">${task.toNamesReady.map((from) => {
      return html`<div 
    @click="${(e) => {
          e.stopPropagation()
        }}" 
    class="text-darkgray rounded-lg px-2">${from}<div>`
    })}${task.toNames.map((from) => {
      return html`<div 
        @click="${(e) => {
          selectTask(from);
          clickPos(e);
          e.stopPropagation()
        }}" 
            class="text-white rounded-lg px-2 bg-mygray dark:bg-darkgray">${from}<div>`
    })}</div>
        </div>`;
}

let renderTasks = () => {
  console.log('renderTasks', data.tasks)
  let todayTasks = data.tasks.filter(task => {
    if (selectedDate.date === currentTime.date) {
      return dayjs(task.date).isBefore(dayjs(selectedDate.date).add(1, 'day')) || task.date == selectedDate || !task.date
    } else {
      return dayjs(task.date).isSame(dayjs(selectedDate.date)) || !task.date;
    }
  });
  if (todayTasks[0] && dayjs(todayTasks[0].time, "HH:mm").isAfter(dayjs())) {
    let swapedtasks = todayTasks.slice();

    // Найти индекс первого элемента, удовлетворяющего условию
    let index = data.tasks.findIndex(task => dayjs(task.time + ' ' + task.date, "HH:mm YYYY-MM-DD").isSameOrBefore(dayjs()));

    if (index != -1) {
      // Удалить элемент из массива и добавить его в начало
      let [task] = swapedtasks.splice(index, 1);
      swapedtasks.unshift(task);
    }
    console.log('swaped')
    return swapedtasks.map(renderTask)
  } else
    return todayTasks.map(renderTask)
}

const render = html`
  <div class="bgimg bg-nearwhite dark:bg-black fixed w-full h-full -z-10 bg-cover" ></div>
  <input placeholder="Поиск..." class="z-50 rounded-lg p-2 left-1/2 -translate-x-1/2 max-w-full  w-40rem fixed top-0 bg-nearwhite dark:bg-black dark:text-white"></input>
  <div class="flex flex-col gap-6 pb-80 max-w-full w-40rem m-auto">
    <input placeholder="Заглушка" class=" rounded-lg p-2 w-40rem -z-[1] bg-transparent "></input>
    ${() => renderCalendar(dayjs())}
    <div class="dark:text-white bg-nearwhite dark:bg-black p-3">${() => currentTime.timerStarted} <button class="notomono w-1/6 ${css.button}" @click="${() => { currentTime.timerStarted = currentTime.clock }}">► ${() => currentTime.timer}</button></div>
    ${() => renderTasks()}
  </div>
    <div class="flex pointer-events-none justify-end text-lg w-full max-w-5xl fixed bottom-0 left-1/2 -translate-x-1/2">
      <button @click="${plusbutton}" class="pointer-events-auto rounded-full plusimg text-5xl w-20 h-20 m-5 bg-old dark:bg-darkold"></button>
  </div>
`;

window.addEventListener("load", function () {
  let dt = JSON.parse(localStorage.getItem('data'))
  data.tasks = dt ? dt : data.tasks
  currentTime.timerStarted = JSON.parse(localStorage.getItem('timer'));
  data.calendarSet = JSON.parse(localStorage.getItem('calendarSet')) || {}
  updateCurrentTimeMarker();
  watch(() => {
    localStorage.setItem('timer', JSON.stringify(currentTime.timerStarted));
  })
  watch(() => {
    localStorage.setItem('calendarSet', JSON.stringify(data.calendarSet));
  })
  watch(() => {
    localStorage.setItem('data', JSON.stringify(data.tasks));
  })
  watch(() => {
    data.selected;
    data.tasks;
    Promise.resolve().then(() => {
      let div = document.getElementById("edit")
      if (div) {
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(div);
        if (!data.selected.name.startsWith(newscribetext))
          range.collapse();
        sel.removeAllRanges();
        sel.addRange(range);
        const rect = div.getBoundingClientRect();
        const scrollPosition = rect.top + window.scrollY + rect.height / 2 - mouseY;
        window.scroll(0, scrollPosition);
      }
    });
  })
  watch(() => {
    currentTime.slider;
    const currentTimeMarker = document.getElementById('currentTimeMarker');
    if (currentTimeMarker)
      currentTimeMarker.style = "left:" + currentTime.slider + "px"
  })
  render(app);
});

