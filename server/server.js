import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import client from "./src/redisClient.js";
import { handelSocketConnection } from "./src/socketRoutes.js";
import 'dotenv/config'

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.PUBLIC_WEBSOCKET_URL || "http://localhost:5173"
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

client.connect()
  .then(() => console.log("database connected"))
  .catch(err => console.log("error connecting db", err))

io.on("connection", (socket) => {
  handelSocketConnection(io, socket)
})

httpServer.listen(process.env.PORT, () => console.log("port running at", process.env.PORT))