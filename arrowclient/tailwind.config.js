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
          DEFAULT: "#d36e70",
          dark: "#d36e70",
          darker: "#732424",
          light: "#e89292", // Это приближенный светлый оттенок
          lighter: "#f5a7a7", // Еще более светлый оттенок
        },
        compliment: {
          DEFAULT: "#6ED3D1",
          dark: "#6ED3D1",
          darker: "#247373",
          light: "#92e8e8", // Это приближенный светлый оттенок
          lighter: "#a7f5f5", // Еще более светлый оттенок
        },
        alternative: {
          900: "#201020",
          200: "#f6e6fc",
          100: "#f7f0fa",
          DEFAULT: "#150515",
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
