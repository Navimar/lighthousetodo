import { Howl } from "howler"

// Импорты файлов
import addSound from "~/assets/audio/add.wav"
import readySaveSound from "~/assets/audio/readySave.wav"
import saveSound from "~/assets/audio/save.wav"
import readySound from "~/assets/audio/ready.wav"
import unreadySound from "~/assets/audio/unready.wav"
import afterwardSound from "~/assets/audio/afterward.wav"

// Предварительная загрузка звуков
const sounds = {
  add: new Howl({
    src: [addSound],
    loop: false,
    volume: 0.5,
  }),
  readySave: new Howl({
    src: [readySaveSound],
    loop: false,
    volume: 0.4,
  }),
  save: new Howl({
    src: [saveSound],
    loop: false,
    volume: 0.5,
  }),
  ready: new Howl({
    src: [readySound],
    loop: false,
    volume: 0.5,
  }),
  unready: new Howl({
    src: [unreadySound],
    loop: false,
    volume: 0.5,
  }),
  afterward: new Howl({
    src: [afterwardSound],
    loop: false,
    volume: 0.5,
  }),
}

// Функция для генерации случайного числа в заданном диапазоне
function randomFloat(min, max) {
  return Math.random() * (max - min) + min
}

// Экспортируемый объект с методами для управления звуками
export default {
  playSound: (soundName) => {
    const sound = sounds[soundName]
    if (!sound) {
      console.error(`Sound "${soundName}" not found`)
      return
    }

    // Генерация случайных значений для параметров
    const rate = randomFloat(0.8, 1.2) // Скорость воспроизведения от 0.8 до 1.2
    const volume = randomFloat(0.8, 1.0) // Громкость от 0.8 до 1.0

    // Применение параметров и воспроизведение звука
    sound.rate(rate)
    sound.volume(volume)
    sound.play()
  },
}
