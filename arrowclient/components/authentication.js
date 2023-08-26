import { html, reactive, watch } from "@arrow-js/core";

import css from '/css.js';
import { user, data } from '/logic/reactive.js';
import { findGetParameter } from "/logic/util";

export let authentication = () => {
  return
  if (user.name) {
    return html`
        <div class="fixed">
        ${() => user.name}
<button class="${css.button}"  @click="${() => logout()}">Выйти</button>
</div>
`}
  else return html`
    <div class="fixed z-50 bg-white w-full h-full">
<div class="m-auto flex flex-col gap-3 w-1/4 bg-nearwhite " >

    <form class="flex-col bg-mygray flex m-3" id="registerForm" @submit="${(e) => { e.preventDefault(); register(); }}">
    <input class="p-1" type="text" id="regUsername" placeholder="Username" required />
    <input class="p-1" type="password" id="regPassword" placeholder="Password" required />
    <input class="${css.button}" type="submit" value="Регистрация" />
</form>

<form class="flex-col flex bg-mygray m-3" id="loginForm" @submit="${(e) => { e.preventDefault(); login(); }}">
    <input class="p-1" type="text" id="loginUsername" placeholder="Username" required />
    <input class="p-1" type="password" id="loginPassword" placeholder="Password" required />
    <input class="${css.button}"  type="submit" value="Вход" />
</form>
</div></div>
`

}
export let authenticationOnLoad = () => {
  let name = findGetParameter('user') || 'testuser'
  user.name = name
}