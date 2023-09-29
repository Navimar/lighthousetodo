import { html, reactive, watch } from "@arrow-js/core"
import { initializeApp } from "firebase/app"
import { GoogleAuthProvider, signInWithPopup, getAuth, onAuthStateChanged, signOut } from "firebase/auth"
import { loadData } from "~/logic/socket.js"
import { searchstring } from "~/logic/reactive.js"

import css from "/css.js"
import { user, data } from "~/logic/reactive.js"
import firebaseConfig from "~/firebase.config.js"
initializeApp(firebaseConfig)

export let authentication = () => {
  if (user && user.name) {
    console.log("logged in as", user)
    if (searchstring.text === "")
      return html`
        <div class="flex bg-nearwhite notomono dark:bg-nearblack dark:text-white p-2 text-sm ">
          <div class="self-center">👤 <strong class="select-text">${() => user.name}</strong></div>
          <button class="ml-auto ${css.button}" @click="${() => logout()}"> Выйти </button>
        </div>
      `
    else return ""
  } else
    return html`
      <div
        class="fixed z-50 bgimg bg-white dark:bg-black w-full flex justify-center items-center h-screen top-0 left-0">
        <div class="m-auto p-auto flex flex-col gap-3 bg-nearwhite dark:bg-black w-3/4 sm:w-1/3 ">
          <button class="${css.button} m-3" @click="${() => signInWithGoogle()}"> Войти через Google </button>
        </div>
      </div>
    `
}

//  <form
//             class="flex-col bg-mygray flex m-3"
//             id="registerForm"
//             @submit="${(e) => {
//             e.preventDefault()
//             register()
//           }}">
//             <input
//               class="bg-white dark:bg-nearblack  p-1"
//               type="text"
//               id="regUsername"
//               placeholder="Username"
//               required />
//             <input
//               class="bg-white dark:bg-nearblack p-1"
//               type="password"
//               id="regPassword"
//               placeholder="Password"
//               required />
//             <input class="${css.button}" type="submit" value="Регистрация" />
//           </form>

//           <form
//             class="flex-col flex bg-mygray m-3"
//             id="loginForm"
//             @submit="${(e) => {
//             e.preventDefault()
//             login()
//           }}">
//             <input
//               class="bg-white dark:bg-nearblack p-1"
//               type="text"
//               id="loginUsername"
//               placeholder="Username"
//               required />
//             <input
//               class="bg-white dark:bg-nearblack p-1"
//               type="password"
//               id="loginPassword"
//               placeholder="Password"
//               required />
//             <input class="${css.button}" type="submit" value="Вход" />
//           </form>
export const auth = getAuth()

export const authenticationOnLoad = () => {
  auth.languageCode = "ru"

  // Слушаем изменения состояния аутентификации:
  onAuthStateChanged(auth, (firebaseUser) => {
    if (firebaseUser) {
      user.name = firebaseUser.uid || "Unknown User"
      loadData()
    } else {
      user.name = null
    }
  })
}

export let signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({
    prompt: "select_account",
  })
  try {
    const result = await signInWithPopup(auth, provider)
    const firebaseUser = result.user
    user.name = firebaseUser.uid || "Unknown User"
  } catch (error) {
    alert("Error during Google authentication:", error)
  }
}

// Функция для выхода из аккаунта:
export let logout = async () => {
  try {
    await signOut(auth)
    user.name = null
    data.calendarSet = {}
    data.selected = false
    data.version = 0
    data.tasks = []
    data.deleted = []
    data.visibletasks = []
  } catch (error) {
    alert("Error during sign out:", error)
  }
}
