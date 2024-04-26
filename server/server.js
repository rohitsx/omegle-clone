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

  // Return the selected pair
  return {
    user1: { userid: user1.userID, username: user1.username, to: user2.userID },
    user2: { userid: user2.userID, username: user2.username, to: user1.userID }
  };
}




io.on("connection", (socket) => {

  //stores user data
  users.push({
    userID: socket.id,
    username: socket.handshake.auth.username,
    connectionStatus: false
  });
  console.log(users);

  if (users.length === 1) {
    socket.emit("waiting", "Waiting for another user to join");
    return null;
  }

  if (users.length > 1) {
    const userPair = selectRandomUserPairFromDB(socket);

    // code to send userid in a loop

    // for (let key in userPair) {
    //   io.to(userPair[key].to).emit("exchanging pair info", {
    //     username: userPair[key].username,
    //     userID: userPair[key].userid
    //   })
    // }


    io.to(userPair.user1.to).emit("exchanging pair info", userPair.user1)

    socket.on("user1 recieved", () => {
      console.log("done user2")
      io.to(userPair.user2.to).emit("exchanging pair info", userPair.user2)
    })


    for (let i = 0; i < users.length; i++) {
      if (users[i].userID === userPair.user1.userid || users[i].userID === userPair.user2.userid) {
        users[i].connectionStatus = true;
      }

    }
  }


  //exhanging chat message

  socket.on("private message", ({ content, to }) => {
    console.log(content)
    message = [...message, content];
    io.to(to).emit("private message", {
      content,
      from: socket.id,
    });
  });

  // exchanging video call data(offer and answer)
  socket.on("offer", (v) => {
    socket.broadcast.emit("offer", v)
  })

  socket.on("answer", (v) => {
    socket.broadcast.emit("answer", v)
  })
})

httpServer.listen(port, () => console.log("port running at", port))