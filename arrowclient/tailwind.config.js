/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./**/*.{html,js}",
    "!./node_modules/**/*", // исключает все в каталоге node_modules
  ],
  theme: {
    extend: {
      borderWidth: {
        "02rem": "0.2rem",
      },
      colors: {
        neutral: {
          150: "#ededed",
          350: "#bcbcbc",
        },
        accent: {
          DEFAULT: "#d57575",
          dark: "#ba5454",
          darker: "#732424",
          light: "#e89292", // Это приближенный светлый оттенок
          lighter: "#f5a7a7", // Еще более светлый оттенок
        },
        compliment: {
          DEFAULT: "#822E81",
          dark: "#54BABA",
          darker: "#247373",
          light: "#92e8e8", // Это приближенный светлый оттенок
          lighter: "#a7f5f5", // Еще более светлый оттенок
        },
      },
      spacing: {
        "40rem": "40rem",
      },
    },
  },
  "editor.quickSuggestions": {
    strings: "on",
  },
  plugins: [],
}
