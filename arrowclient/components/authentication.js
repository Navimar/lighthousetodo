import { html } from "@arrow-js/core"
import { initializeApp } from "firebase/app"
import { GoogleAuthProvider, signInWithPopup, getAuth, onAuthStateChanged, signOut } from "firebase/auth"
import { loadData } from "~/logic/send.js"
import reData from "~/logic/reactive.js"
import { copyToClipboard } from "~/logic/util.js"
import { addCollaborationRequest } from "~/logic/collaborator.js"
import data from "~/logic/data.js"
import css from "/css.js"

const firebaseConfig = {
  apiKey: "AIzaSyCkM0TYkdv3XK4WxlEaZ36JJisO0N55Qoo",
  authDomain: "adastratodo.firebaseapp.com",
  databaseURL: "https://adastratodo-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "adastratodo",
  storageBucket: "adastratodo.appspot.com",
  messagingSenderId: "472351514743",
  appId: "1:472351514743:web:9d7c8892cc216443e06672",
}
initializeApp(firebaseConfig)

let collaboratorLink = () => {
  return `${window.location.protocol}//${window.location.hostname}${
    window.location.port ? `:${window.location.port}` : ""
  }/${reData.user.id}`
}
let collobaratorComponent = () => {
  if (reData.collabState) {
    return html`
      <span class="underline text-xs copy-link mr-2" @click="${() => copyToClipboard(collaboratorLink())}"
        >${collaboratorLink()}</span
      >
    `
  } else {
    return html`
      <button
        class="inline-block border-b-neutral-100 mr-2 ${css.button}"
        @click="${() => (reData.collabState = true)}">
        Добавить соисполнителя
      </button>
    `
  }
}

export let authentication = () => {
  if (reData.user?.name) {
    if (reData.searchString === "")
      return html`
        <div class="flex bg-neutral-100 fontmono dark:bg-neutral-900 dark:text-white p-2 text-sm ">
          <div class="self-center">👤 <span class="select-text">${() => reData.user.name}</span></div>
          <div class="ml-auto">
            ${() => collobaratorComponent()}
            <button class="inline-block border-b-neutral-100 ${css.button}" @click="${() => logout()}"> Выйти </button>
          </div>
        </div>
      `
    else return ""
  } else
    return html`
      <div
        class="fixed z-50 bgimg bg-white dark:bg-black w-full flex justify-center items-center h-screen top-0 left-0">
        <div class="m-auto p-auto flex flex-col gap-3 bg-neutral-100 dark:bg-neutral-900 w-3/4 sm:w-1/3 ">
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
//               class="bg-white dark:bg-near-dark  p-1"
//               type="text"
//               id="regUsername"
//               placeholder="Username"
//               required />
//             <input
//               class="bg-white dark:bg-near-dark p-1"
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
//               class="bg-white dark:bg-near-dark p-1"
//               type="text"
//               id="loginUsername"
//               placeholder="Username"
//               required />
//             <input
//               class="bg-white dark:bg-near-dark p-1"
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
      reData.user.id = firebaseUser.uid || "Unknown User"
      reData.user.name = firebaseUser.displayName || "Noname"
      const pathSegments = window.location.pathname.split("/")
      const collaboratorId = pathSegments[pathSegments.length - 1]
      if (collaboratorId == reData.user.id)
        alert("Нельзя добавить самого себя в соисполнители. Отправьте ссылку другому пользователю!")
      else addCollaborationRequest(collaboratorId)
      loadData()
    } else {
      reData.user.id = null
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
    reData.user.id = firebaseUser.uid || "Unknown User"
    reData.user.name = firebaseUser.displayName || "Noname"
  } catch (error) {
    alert("Error during Google authentication:", error)
  }
}

// Функция для выхода из аккаунта:
export let logout = async () => {
  try {
    await signOut(auth)
    reData.user.id = null
    reData.user.name = ""
    reData.calendarSet = {}
    reData.selectedScribe = false
    data.tasks = []
    localStorage.clear()
    reData.visibleTasks = []
  } catch (error) {
    alert("Error during sign out:", error)
  }
}
