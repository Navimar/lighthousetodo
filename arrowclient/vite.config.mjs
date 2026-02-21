import { defineConfig } from "vite"
import { readdirSync, readFileSync } from "fs"
import { resolve } from "path"
import tailwindcss from "tailwindcss"
import autoprefixer from "autoprefixer"

const pkg = JSON.parse(readFileSync(resolve(__dirname, "../package.json"), "utf-8"))

function getBlogEntries() {
  const blogDir = resolve(__dirname, "info")
  const entries = {}

  readdirSync(blogDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .forEach((dirent) => {
      const dirName = dirent.name
      // Предполагаем, что в каждой папке есть файл index.html
      const entryPath = resolve(blogDir, dirName, "index.html")
      entries[dirName] = entryPath
    })

  return entries
}

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        ...getBlogEntries(),
      },
    },
  },
  resolve: {
    alias: {
      "~/": resolve(__dirname, "/"),
    },
  },
  envDir: resolve(__dirname, "../"),
  publicDir: "public",
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
      plugins: [tailwindcss, autoprefixer],
    },
  },
})
