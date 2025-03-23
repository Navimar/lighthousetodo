import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { readdir, rm, mkdir } from "fs/promises"
import html from "./html.js"
const __dirname = path.dirname(fileURLToPath(import.meta.url))

function generateHtml(templateObject, fileName) {
  let taskBg = () => "bg-neutral-100 dark:bg-neutral-950"

  const outputHtml = html`
    <!doctype html>
    <html class="bg-white min-h-screen dark:bg-black">
      <head>
        <title>Ad Astra To Do</title>
        <meta charset="UTF-8" />
        <meta name="description" content="Наведи порядок в жизни с легкостью и удовольствием" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="icon" type="image/png" sizes="32x32" href="32x32.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="180x180.png" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Oswald:wght@300&family=Roboto+Mono:wght@300&family=Open+Sans&display=swap" />
        <link rel="stylesheet" href="../../index.css" />
      </head>
      <body class="text-lg min-h-screen cursor-default select-none touch-pan-y">
        <div class="fixed w-full h-full bg-cover bgimg bg-neutral-100 dark:bg-neutral-950 -z-10"></div>

        <div id="App" class="  flex flex-col gap-6 pb-80 max-w-full min-h-screen w-40rem px-3 m-auto">
          <div class="mt-10 bg-neutral-100 dark:bg-neutral-950 flex justify-center p-2">
            <button
              class="w-2/5  top-4 left-4 fontaccent uppercase text-base text-clip overflow-hidden p-1 text-black dark:text-neutral-100 bg-neutral-150 dark:bg-neutral-700 text-center block border-white dark:border-black rounded-0 border-b-02rem peer-checked:border-b-02rem peer-checked:border-accent peer-checked:bg-neutral-150 dark:peer-checked:bg-neutral-700 dark:peer-checked:border-accent-dark active:border-b-accent dark:active:border-b-accent-dark active:border-b-accent dark:active:border-b-accent-dark transition-colors duration-100"
              onclick="window.location.href='/'">
              Вернуться к приложению
            </button></div
          >
          <div class="select-auto flex flex-col gap-3 break-words ${taskBg()} p-3 rounded-lg overflow dark:text-white">
            ${templateObject.text}</div
          >
        </div>
        <footer class="py-6 text-lg text-white dark:text-neutral-400 fontaccent">
          <div class="container mx-auto text-center">
            <p class="mb-4 fontaccent">
              <a href="https://t.me/vaulinblog" class="underline fontaccent" target="_blank" rel="noopener noreferrer">
                Система управления делами Игоря Ваулина
              </a>
            </p>
          </div>
        </footer>
      </body>
    </html>
  `
  const outputPath = path.resolve(__dirname, "../arrowclient/info", fileName, "index.html")
  fs.writeFileSync(outputPath, outputHtml)
  console.log(`Сгенерирован HTML: ${outputPath}`)
}

async function processTemplates() {
  const templatesDir = path.resolve(__dirname, "template")
  const outputDir = path.resolve(__dirname, "../arrowclient/info")

  // Удаление существующего содержимого в outputDir
  try {
    await rm(outputDir, { recursive: true, force: true })
    console.log("Existing content removed")
  } catch (err) {
    console.error(`Error removing existing content: ${err}`)
  }

  // Чтение и обработка шаблонов
  const templateFiles = await readdir(templatesDir)
  for (const fileName of templateFiles) {
    const templatePath = path.resolve(templatesDir, fileName)
    const templateModule = await import(`file://${templatePath}`)

    // Создание целевой папки для каждого шаблона
    const targetDir = path.resolve(outputDir, path.basename(fileName, ".js")) // Убедитесь, что используете правильное расширение файла
    await mkdir(targetDir, { recursive: true })

    // Генерация HTML и сохранение в целевую папку
    generateHtml(templateModule.default, targetDir) // предполагается, что generateHtml адаптирована для сохранения файла в targetDir
  }

  console.log("Templates processed")
}

processTemplates().catch(console.error)
