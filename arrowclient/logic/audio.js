import { Howl } from "howler";

// Предварительная загрузка звуков
const sounds = {
  add: new Howl({
    src: ["../add.wav"],
    loop: false,
    volume: 0.5,
  }),
  readySave: new Howl({
    src: ["../readySave.wav"],
    loop: false,
    volume: 0.4,
  }),
  save: new Howl({
    src: ["../save.wav"],
    loop: false,
    volume: 0.5,
  }),
  ready: new Howl({
    src: ["../ready.wav"],
    loop: false,
    volume: 0.5,
  }),
  unready: new Howl({
    src: ["../unready.wav"],
    loop: false,
    volume: 0.5,
  }),
  afterward: new Howl({
    src: ["../afterward.wav"],
    loop: false,
    volume: 0.5,
  }),
};

// Функция для генерации случайного числа в заданном диапазоне
function randomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

// Экспортируемый объект с методами для управления звуками
export default {
  playSound: (soundName) => {
    const sound = sounds[soundName];
    if (!sound) {
      console.error(`Sound "${soundName}" not found`);
      return;
    }

    // Генерация случайных значений для параметров
    const rate = randomFloat(0.8, 1.2); // Скорость воспроизведения от 0.8 до 1.2
    const volume = randomFloat(0.8, 1.0); // Громкость от 0.8 до 1.0

    // Применение параметров и воспроизведение звука
    sound.rate(rate);
    sound.volume(volume);
    sound.play();
  },
  sounds,
};
