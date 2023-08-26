/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./**/*.{html,js}"],
  darkMode: 'media',
  theme: {
    extend: {
      borderWidth: {
        '02rem': '0.2rem',
      },
      colors: {
        'old': '#d57575',
        'darkold': '#995151',
        'nearwhite': '#f5f5f5',
        'lightgray': '#eee',
        'mygray': '#a9a9a9',
        'darkgray': '#555',
        'nearblack': '#222',
      },
      spacing: {
        '40rem': '40rem',
      }
    },
  },
  plugins: [],
}