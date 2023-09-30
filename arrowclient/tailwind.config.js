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
        },
        compliment: {
          DEFAULT: "#822E81",
          dark: "#54BABA",
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
