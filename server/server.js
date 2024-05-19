import express, { json } from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const port = 3000;
const httpServer = createServer(app);

let message = [];
let users = [];
let pairs = [];
let username;

const io = new Server(httpServer, {
  cors: {
    origin: "http://127.0.0.1:5173",
  }
});


io.use((socket, next) => {
  username = socket.handshake.auth.username;
  next();
})



io.on("connection", (socket) => {

  socket.on("connectWithStranger", (username) => {

    users.push({
      userid: socket.id,
      username: username,
      connectionStatus: false,
      sendPeerRequest: false
    });

    console.log("connect with stranger got triggered", users);
    for (let key in users) {
      if (!users[key].connectionStatus) {
        socket.emit("waiting", "Waiting for another user to join");
      }
    }

    if (users.length > 1) {
      let userPair = selectRandomUserPairFromDB(socket);

      pairs.push(userPair);
      console.log("selected pair", pairs)

      // emit object to selected pairs
      for (let key in userPair) {

        io.to(userPair[key].to).emit("exchangingPairInfo", {
          username: userPair[key].username,
          userid: userPair[key].userid,
          sendPeerRequest: userPair[key].sendPeerRequest
        })

        users = users.filter(v => v.userid !== userPair[key].userid)
      }

      userPair = {};
    }
  })


  socket.on("private message", ({ content, to }) => {
    console.log(content, to)
    message = [...message, content];
    console.log(message)
    io.to(to).emit("private message", {
      content: content,
      from: socket.id,
    });
  });

  // exchanging video call data(offer and answer)
  socket.on("offer", ({ offer, to }) => {
    io.to(to).emit("offer", offer)
  })

  socket.on("answer", ({ answer, to }) => {
    io.to(to).emit("answer", answer)
  })

  socket.on("new-ice-candidate", ({ icecandidate, to }) => {
    io.to(to).emit("new-ice-candidate", icecandidate)
  })
  socket.on("disconnect", () => {

    console.log("disconnected")

    for (let key in pairs) {
      const { user1, user2 } = pairs[key];
      if (user1.userid === socket.id || user2.userid === socket.id) {
        const userLeftTheChat = user1.userid === socket.id ? user1 : user2;
        io.to(userLeftTheChat.to).emit("userLeftTheChat", userLeftTheChat.username);
        console.log("pairs before dlete", pairs);
        delete pairs[key];
        console.log("userLeftTheChat", userLeftTheChat);
        console.log("pairs after delete", pairs);
        return null;
      }
    }
  })
})


function selectRandomUserPairFromDB(socket) {
  const availableUsers = users.filter(user => !user.connectionStatus);

  if (availableUsers.length < 2) {
    return null;
  }

  // Select random user indices
  let user1Index = Math.floor(Math.random() * availableUsers.length);
  let user2Index;
  do {
    user2Index = Math.floor(Math.random() * availableUsers.length);
  } while (user2Index === user1Index);

  // Select users
  const user1 = availableUsers[user1Index];
  const user2 = availableUsers[user2Index];

  const pairs = [user1, user2];
  const randomIndex = Math.floor(Math.random() * 2);
  pairs[randomIndex].sendPeerRequest = true


  // Return the selected pair
  return {
    user1: {
      userid: user1.userid,
      username: user1.username,
      sendPeerRequest: user1.sendPeerRequest,
      to: user2.userid
    },
    user2: {
      userid: user2.userid,
      username: user2.username,
      sendPeerRequest: user2.sendPeerRequest,
      to: user1.userid
    }
  };
}


httpServer.listen(port, () => console.log("port running at", port))