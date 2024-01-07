import { inputSocket } from "./server/socket.js"
import dotenv from "dotenv"
dotenv.config()
import express from "express"
import http from "http"
import { Server as SocketIOServer } from "socket.io"
import { fileURLToPath } from "url"
import path from "path"

const app = express()
const server = http.createServer(app)
const io = new SocketIOServer(server)

const currentFilePath = fileURLToPath(import.meta.url)
const currentDir = path.dirname(currentFilePath)
const staticDir = path.join(currentDir, "arrowclient/dist")
app.use(express.static(staticDir, {}))

app.get("*", function (req, res) {
  res.status(404).send("nothing there")
})

inputSocket(io)

server.listen(process.env.PORT, process.env.IP, function () {
  console.log(`lighthouse server listening on ${process.env.IP}:${process.env.PORT}`)
})
