import sort from "/logic/sort.js"
import { data } from "/logic/reactive.js"
import { isNameTaken } from "/logic/util.js"
import { clearSearch } from "/logic/manipulate"
import { makevisible } from "/logic/exe.js"
import addScribe from "/logic/addscribe"
import dayjs from "dayjs"
import { sendData } from "/logic/socket"

export default (m) => {
  let changedTasks = []
  //понять откуда вызвано сохрание
  console.log("saveTask", m)
  //если нет выделенных то выйти
  if (!data.selected) return false

  //найти див редактирования
  const eDiv = document.getElementById("edit")

  if (eDiv) {
    // if (edit)
    // найти имя и заметку
    const lines = eDiv.innerText.trim().split("\n")
    let name = lines[0]
    const note = lines.slice(1).join("\n")

    // добываем массив строк из фром и ту
    const fromEdit = document.getElementById("fromEdit")
    const fromEditLines = [
      ...new Set(
        fromEdit.innerText
          .trim()
          .split("\n")
          .filter((line) => line.trim() !== ""),
      ),
    ]
    const toEdit = document.getElementById("toEdit")
    const toEditLines = [
      ...new Set(
        toEdit.innerText
          .trim()
          .split("\n")
          .filter((line) => line.trim() !== ""),
      ),
    ]

    // создаем массив задач для создания из новых ссылок
    let newScribesFromNames = fromEditLines.slice()
    let newScribesToNames = toEditLines.slice()

    // добаываем дату и время из инпутов
    const timeInput = document.getElementById("timeInput").value
    const dateInput = document.getElementById("dateInput").value

    // добываем данные из радио
    let radios = document.getElementsByName("typeradio")
    let choosenradio = false
    for (let i = 0; i < radios.length; i++) {
      if (radios[i].checked) {
        choosenradio = radios[i].value // Выводим значение выбранного элемента
        break // Выходим из цикла, так как радио-кнопка найдена
      }
    }

    //провереяем что имя не занято
    if (isNameTaken(name)) {
      name = data.selected.name
      data.selected.error = true
    }
    //провереяем что имя не пусто
    if (name === "") {
      name = data.selected.name
      data.selected.error = true
    }

    for (let theTask of data.tasks) {
      // ищем и удаляем все ссылки на старое имя
      for (let fni in theTask.fromNames) {
        if (theTask.fromNames[fni] && theTask.fromNames[fni].toLowerCase() == data.selected.name.toLowerCase()) {
          theTask.fromNames.splice(fni, 1)
          changedTasks.push(theTask.id)
        }
      }

      for (let tni in theTask.toNames) {
        if (theTask.toNames[tni] && theTask.toNames[tni].toLowerCase() == data.selected.name.toLowerCase()) {
          theTask.toNames.splice(tni, 1)
          changedTasks.push(theTask.id)
        }
      }

      //добавляем ссылки на новое имя удаляем из массива новых задач найденные ссылки
      for (let index in fromEditLines) {
        if (theTask.name.toLowerCase() === fromEditLines[index].toLowerCase()) {
          newScribesFromNames.splice(index, 1)
          if (theTask.toNames && theTask.toNames.indexOf(name) === -1) {
            //дописываем в ссылки
            theTask.toNames.push(name)
            changedTasks.push(theTask.id)
          }
        }
      }

      for (let index in toEditLines) {
        if (theTask.name.toLowerCase() === toEditLines[index].toLowerCase()) {
          newScribesToNames.splice(index, 1)
          if (theTask.fromNames && theTask.fromNames.indexOf(name) === -1) {
            //дописываем в ссылки
            theTask.fromNames.push(name)
            changedTasks.push(theTask.id)
          }
        }
      }
    }

    changedTasks.push(data.selected.id)

    //ставим временную метку
    data.selected.timestamp = dayjs().valueOf()
    console.log("timestamp", data.selected.timestamp)

    //сохраняем новые значение
    data.selected.name = name
    data.selected.note = note

    if (choosenradio) data.selected.type = choosenradio

    data.selected.fromNames = fromEditLines
    data.selected.toNames = toEditLines

    data.selected.time = timeInput
    data.selected.date = dateInput

    // устанавливаем паузу
    let pauseCheckbox = document.getElementById("pauseCheckbox")
    if (pauseCheckbox && pauseCheckbox.checked) data.selected.pause = true
    else data.selected.pause = false

    // если выделено готово, то удалить запись
    let readyCheckbox = document.getElementById("readyCheckbox")
    if (readyCheckbox && readyCheckbox.checked) data.selected.ready = true
    else data.selected.ready = false

    //создаем новые записи
    newScribesFromNames.forEach((txt) => {
      let newTask = addScribe(txt, [], [name])
      changedTasks.push(newTask.id)
    })
    newScribesToNames.forEach((txt) => {
      let newTask = addScribe(txt, [name], [])
      changedTasks.push(newTask.id)
    })

    // data.selected = false

    // makevisible()
    // sort()
    changedTasks = [...new Set(changedTasks)]

    // Отправляем массив
    sendData(changedTasks)

    // Опустошаем строку поиска
    clearSearch()

    return true
  }
}
