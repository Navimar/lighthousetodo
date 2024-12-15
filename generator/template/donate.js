import html from "../html.js"

export default {
  text: html`
    <div class="donation-page text-center m-auto">
      <h1 class="text-4xl font-bold mb-4">Поддержите нас</h1>
      <p class="text-lg mb-6">Если вам нравится наша работа, вы можете нас поддержать!</p>
      <div class="mb-4">
        <a
          href="https://boosty.to/adastratodo"
          target="_blank"
          class="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 block mb-2">
          Поддержать на Boosty
        </a>
        <a
          href="https://www.patreon.com/c/adastratodo"
          target="_blank"
          class="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 block">
          Поддержать на Patreon
        </a>
      </div>
      <p class="text-lg mb-6">
        Также вы можете подписаться на наш канал в Telegram!<br />
        Нам это тоже очень поможет!</p
      >
      <a
        href="https://t.me/vaulinblog"
        target="_blank"
        class="bg-gray-700 text-white py-2 px-4 rounded hover:bg-gray-800">
        Подписаться на Telegram-канал
      </a>
    </div>
    <br />
  `,
}
