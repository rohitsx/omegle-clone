import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const port = 3000;
const httpServer = createServer(app);
let message = [];

const io = new Server(httpServer, {
  cors: {
    origin: "http://127.0.0.1:5173",
  }
});

io.on("connection", (socket) => {
  socket.on("message", (v) => {
    message = [...message, v];
    io.emit("userMassage", v);
  })

  socket.on("offer", (v) => {
    socket.broadcast.emit("offer", v)
  })

  socket.on("answer", (v) =>{
    socket.broadcast.emit("answer", v)
    console.log(v)
  })
})


httpServer.listen(port, () => console.log("port running at", port))