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
        },
        compliment: {
          DEFAULT: "#6ED3D1",
        },
        alternative: {
          900: "#201020",
          700: "#503250",
          200: "#f6e6fc",
          100: "#f7f0fa",
          DEFAULT: "#150515",
        },
        blocked: {
          DEFAULT: "#fdf5f5", // светлая тема
          dark: "#2b1a1a", // тёмный с красноватым оттенком
        },
        moreimportant: {
          DEFAULT: "#f0fafb",
          dark: "#142324", // тёмный голубовато-зелёный
        },
        opens: {
          DEFAULT: "#f7fdf0",
          dark: "#1d2414", // тёмный зелёно-жёлтый
        },
        lessimportant: {
          DEFAULT: "#f5fdf9",
          dark: "#13211b", // тёмный зелёно-бирюзовый
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
