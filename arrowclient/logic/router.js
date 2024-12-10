import Navigo from "navigo"
import reData from "~/logic/reactive.js"

// Инициализация роутера
const router = new Navigo("/")

// Функция для получения текущего маршрута как массива
export function getCurrentRouteAsArray() {}

// Функция для обновления маршрута
export default function navigate(path) {
  router.navigate(path)
}

// Настройка маршрутов
router
  .on("*", (match) => {
    let route = match?.url.split("/").filter(Boolean)
    if (route[0]) reData.route = route
    else navigate("intentions")
  })
  .resolve()
