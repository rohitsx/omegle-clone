import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { redisClient } from "./src/redisClient.js";
import { handelSocketConnection } from "./src/socketRoutes.js";
import 'dotenv/config'

const app = express();
const port = 3000;
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.PUBLIC_WEBSOCKET_URL || "http://127.0.0.1:5173"
  }
});

io.use((socket, next) => {
  const username = socket.handshake.auth.username;
  if (!username) {
    return next(new Error("invalid username"));
  }
  socket.username = username;
  next();
})

redisClient.connect()
  .then(() => console.log("database connected"))
  .catch(err => console.log("error connecting db", err))

io.on("connection", (socket) => {
  handelSocketConnection(io, socket)
})

httpServer.listen(port, () => console.log("port running at", port))