import { Howl, Howler } from "howler"

export const add = new Howl({
  src: ["../audio/add.wav"],
  loop: false,
  volume: 0.5,
})

export default {
  playSound: (sound) => {
    // Генерация случайных значений для параметров
    let rate = randomFloat(0.8, 1.2) // Скорость воспроизведения от 0.8 до 1.2
    let volume = randomFloat(0.5, 1.0) // Громкость от 0.5 до 1.0

    // Применение параметров и воспроизведение звука
    sound.rate(rate)
    sound.volume(volume)
    sound.play()
  },
  add,
}
function randomFloat(min, max) {
  return Math.random() * (max - min) + min
}
