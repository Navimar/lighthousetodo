import Navigo from "navigo"
import reData from "~/logic/reactive.js"
import { isPWA } from "~/logic/util.js"

// Инициализация роутера
const router = new Navigo("/")

// Функция для получения текущего маршрута как массива
export function getCurrentRouteAsArray() {}

// Функция для обновления маршрута
export default function navigate(path) {
  if (isPWA()) {
    router.resolve(path) // В PWA используем resolve, чтобы не менять URL
  } else {
    router.navigate(path) // В браузере изменяем URL
  }
}

// Настройка маршрутов
router
  .on("*", (match) => {
    let route = match?.url.split("/").filter(Boolean)
    if (route[0]) reData.route = route
    else navigate("intentions")
  })
  .resolve()
