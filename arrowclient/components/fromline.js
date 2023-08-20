import { html, reactive, watch } from "@arrow-js/core";
import { adjustDate, selectTask } from '/components/manipulate.js'
import { clickPos } from '/logic/util.js';
import { addScribe } from "../logic/exe";

export default (task) => {
    return html`
    <div class=" flex gap-2 text-sm  empty:hidden">${task.fromNamesReady.map((from) => {
        return html`<div 
    @click="${(e) => {
                addScribe(from)
                selectTask(from);
                clickPos(e);
                e.stopPropagation()
            }}" 
    class="text-darkgray rounded-lg px-2">${from}<div>`
    })}${task.fromNames.map((from) => {
        return html`<div 
        @click="${(e) => {
                selectTask(from);
                clickPos(e);
                e.stopPropagation()
            }}" 
            class="text-white rounded-lg px-2 bg-mygray dark:bg-darkgray">${from}<div>`
    })}</div>
    `
}
