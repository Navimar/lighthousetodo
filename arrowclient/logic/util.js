import { data } from '/reactive.js';

const isNameTaken = (name) => data.tasks.some(task => task.name === name);

let mouseX
let mouseY

const clickPos = (e) => {
    mouseX = e.clientX
    mouseY = e.clientY
}


export { isNameTaken, clickPos, mouseX, mouseY }