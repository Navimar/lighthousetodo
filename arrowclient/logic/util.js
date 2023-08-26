import { data } from '/logic/reactive.js';

const isNameTaken = (name) => {
    return data.tasks.some(task => task.name === name) || name.trim() == "";
};


let mouseX
let mouseY

const clickPos = (e) => {
    mouseX = e.clientX
    mouseY = e.clientY
}

function getCurrentLine() {
    let sel = document.getSelection()
    console.log(sel)
    let nd = sel.anchorNode
    let text = nd.textContent.slice(0, sel.focusOffset);

    return text.split("\n").pop().trim();
}

export function getLocalStorageItem(key) {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : undefined;
    } catch (e) {
        console.warn(`Ошибка при чтении ключа "${key}" из localStorage:`, e);
        return undefined;
    }
}

export function safeJSONParse(value, defaultValue) {
    try {
        return JSON.parse(value);
    } catch (e) {
        return defaultValue !== undefined ? defaultValue : undefined;
    }
}
export function safeSetLocalStorageItem(key, value) {
    try {
        const serializedValue = JSON.stringify(value);
        localStorage.setItem(key, serializedValue);
        return true; // успешное сохранение
    } catch (e) {
        console.warn(`Ошибка при записи ключа "${key}" в localStorage:`, e);
        return false; // сохранение не удалось
    }
}

export function findGetParameter(name, url) {
    if (!url) {
        url = window.location.href;
    }
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}
export { getCurrentLine, isNameTaken, clickPos, mouseX, mouseY }