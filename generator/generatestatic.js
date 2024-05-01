import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { readdir, rm, mkdir } from "fs/promises"
import html from "./html.js"
const __dirname = path.dirname(fileURLToPath(import.meta.url))

function generateHtml(templateObject, fileName) {
  let taskBg = () => "bg-neutral-100 dark:bg-neutral-900"

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
        <div class="fixed w-full h-full bg-cover bgimg bg-neutral-100 dark:bg-neutral-900 -z-10"></div>
        <div id="App" class="flex flex-col gap-6 pb-80 max-w-full min-h-screen w-40rem px-3 m-auto">
          <!-- Содержимое в качестве примера -->
          <div
            class="select-auto flex flex-col gap-3 break-words ${taskBg()} p-3 mt-10 rounded-lg overflow dark:text-white"
            >${templateObject.text}</div
          >
        </div>
        <footer class="py-6 text-lg text-white dark:text-neutral-400 fontaccent">
          <div class="container mx-auto text-center">
            <p class="mb-4">
              <a
                href="https://t.me/adastratodoclub"
                class="underline fontaccent"
                target="_blank"
                rel="noopener noreferrer">
                <strong class="fontaccent">Ad Astra To Do</strong>
              </a>
            </p>
            <p class="mt-4 mb-12 fontaccent">v.0.3.2</p>
          </div>
        </footer>
      </body>
    </html>
  `

  const outputPath = path.resolve(__dirname, "../arrowclient/blog", fileName, "index.html")
  fs.writeFileSync(outputPath, outputHtml)
  console.log(`Сгенерирован HTML: ${outputPath}`)
}

async function processTemplates() {
  const templatesDir = path.resolve(__dirname, "template")
  const outputDir = path.resolve(__dirname, "../arrowclient/blog")

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
