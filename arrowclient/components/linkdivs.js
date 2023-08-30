import { html } from "@arrow-js/core";
import { getCurrentLine } from '/logic/util.js'
import { autocomplete, data } from '/logic/reactive.js'

import renderAutocomplete from '/components/autocomplete.js'

function handleInput(e) {
  const currentLineText = getCurrentLine().toLowerCase(); // Преобразование к нижнему регистру

  autocomplete.list = [];
  autocomplete.line = currentLineText
  autocomplete.div = e.target.id
  console.log(e, e.target.id)

  // Если строка пустая, вернуть пустой массив
  if (!currentLineText) {
    return;
  }
  console.log(currentLineText)

  // Искать совпадения в data.tasks на основе поля name
  const matches = data.tasks
    .filter(taskItem => taskItem.name.toLowerCase().includes(currentLineText)) // Преобразование к нижнему регистру
    .sort((a, b) => a.name.length - b.name.length)
    .slice(0, 15);  // Ограничиваем список до 15 элементов

  // Обновлять autocomplete.list с найденными именами совпадений
  autocomplete.list = matches.map(match => {
    const highlightedName = match.name.replace(new RegExp(currentLineText, 'ig'), match => `<strong>${match}</strong>`); // Добавлен флаг 'i' для поиска без учета регистра
    return highlightedName;
  });
}

export default (task) => html`
<div class="flex relative gap-4">
  <div
    id="fromEdit"
    class="flex flex-col gap-2 w-1/2 h-8 overflow-hidden  bg-nearwhite dark:bg-nearblack  focus:outline-none"
    contenteditable="true"
    role="textbox"
    aria-multiline="true"
    tabindex="0"
    @click="${(e) => {
    if (!e.currentTarget.classList.contains('h-auto')) {
      e.currentTarget.classList.add('h-auto');
      e.currentTarget.classList.remove('h-8');
    }
  }}"
    @input="${(e) => handleInput(e)}"
  >
    ${task.fromNames.map((from) => html`<div>${from}</div>`)}
    ${task.fromNamesReady.map((from) => html`<div>${from}</div>`)}
  </div>
  ${() => renderAutocomplete('fromEdit')}

  <div
    id="toEdit"
    class="flex flex-col gap-2 w-1/2 h-8 overflow-hidden bg-nearwhite dark:bg-nearblack  focus:outline-none"
    contenteditable="true"
    role="textbox"
    aria-multiline="true"
    tabindex="0"
    @click="${(e) => {
    if (!e.currentTarget.classList.contains('h-auto')) {
      e.currentTarget.classList.add('h-auto');
      e.currentTarget.classList.remove('h-8');
    }
  }}"
    @input="${(e) => handleInput(e)}"
  >
    ${task.toNames.map((to) => html`<div>${to}</div>`)}
    ${task.toNamesReady.map((to) => html`<div>${to}</div>`)}
  </div>
  ${() => renderAutocomplete('toEdit')}
</div>
`;
