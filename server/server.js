import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const port = 3000;
const httpServer = createServer(app);
let message = [];
const users = [];

const io = new Server(httpServer, {
  cors: {
    origin: "http://127.0.0.1:5173",
  }
});


io.on("connection", (socket) => {


  //user login

 
  for (let [id, socket] of io.of("/").sockets) {
    users.push({
      userID: id,
      username: socket.username,
    });
    console.log(users)
  }
  


































  //exhanging chat message
  socket.on("message", (v) => {
    message = [...message, v];
    io.emit("userMassage", v);
  })

  // exchanging video call data(offer and answer)
  socket.on("offer", (v) => {
    socket.broadcast.emit("offer", v)
  })

  socket.on("answer", (v) => {
    socket.broadcast.emit("answer", v)
  })
})


httpServer.listen(port, () => console.log("port running at", port))