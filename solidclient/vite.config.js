import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'

export default defineConfig({
  plugins: [solid()],
  server: {
    port: 3001, // Vite будет работать на порту 3001
    proxy: {
      // при обращении к /api запросы будут проксироваться на Express сервер
      '/api': 'http://localhost:3000'
    }
  }
});
