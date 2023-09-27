import { defineConfig } from "vite"
import { resolve } from 'path';
export default defineConfig({
   resolve: {
    alias: {
      '~/': resolve(__dirname, '/')
    }
  },
  server: {
    port: 3001,
    proxy: {
      "/socket.io": {
        target: "http://127.0.0.1:3000",
        ws: true,
      },
      "/api": "http://127.0.0.1:3000",
    },
  },
  css: {
    postcss: {
      plugins: [require("tailwindcss"), require("autoprefixer")],
    },
  },
})
