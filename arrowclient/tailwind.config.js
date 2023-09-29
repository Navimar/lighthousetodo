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
        old: "#d57575",
        darkold: "#995151",
        nearwhite: "#f5f5f5",
        lightgray: "#eee",
        mygray: "#a9a9a9",
        darkgray: "#555",
        nearblack: "#151515",
      },
      spacing: {
        "40rem": "40rem",
      },
    },
  },
  plugins: [],
}
