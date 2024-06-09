import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createClient } from 'redis';
import 'dotenv/config'

const app = express();
const port = 3000;
const httpServer = createServer(app);
let message = [];
let users = [];
let username;
let unserId;
let pairedUserId;

const io = new Server(httpServer, {
  cors: {
    origin: "http://127.0.0.1:5173",
  }
});


io.use((socket, next) => {
  username = socket.handshake.auth.username;
  next();
})

const client = createClient({
  password: process.env.REDIS_PWD,
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
  }
});


client.connect()
  .then(() => console.log("db connected"))
  .catch(err => console.log("error connecting db", err))


io.on("connection", (socket) => {
  socket.on("connectWithStranger", (username) => {

    async function addUserTODb() {
      try {
        // add user data to db
        await client.rPush("users", JSON.stringify({
          "socketId": socket.id,
          "username": username
        }));
        console.log(`User ${username} added to Redis`);

        // get numbers of user in db
        return await client.lLen("users");
      } catch (err) {
        console.error("Error accessing db:", err);
      }
    }

    addUserTODb()
      .then(async userLen => {
        if (userLen < 2) {
          throw new Error("not enough users");
        } else {
          console.log(`Length of usersList array: ${userLen}`);
          return await selectRandomUserPairFromDB(userLen);
        }
      })
      .then(userPair => {
        console.log("selected pair", userPair);
        userPair.forEach(key => {
          io.to(key.pairedUserId).emit("exchangingPairInfo", { key });
          console.log("emitted", key.username, "userId", key.pairedUserId);
        });
        return userPair;
      })
      .then(userPair => {
        client.hSet("userpairList", userPair[0].socketId + userPair[1].socketId, JSON.stringify(userPair))
        return userPair
      })
      .then(userPair => {
        client.hSet("userIdList", userPair[1].socketId, userPair[0].socketId + userPair[1].socketId)
        client.hSet("userIdList", userPair[0].socketId, userPair[0].socketId + userPair[1].socketId)
      })
      .catch(err => {
        if (err.message === "not enough users") {
          io.to(socket.id).emit("waiting", "Waiting for another user to join");
          console.log(err.message);
        } else {
          console.error("Error in addUserToDb:", err);
        }
      });

    socket.on("disconnect", async () => {

      console.log("socket disconnected")



      try {
        await client.lRem("users", 1, JSON.stringify({ 'socketId': socket.id, 'username': username }));
        const pairUserId = await client.hGet("userIdList", socket.id);
        await Promise.all([
          client.hDel("userpairList", pairUserId),
          client.hDel("userIdList", socket.id)
        ]);
        console.log("User removed from Redis");
      } catch (err) {
        console.error("Error removing user:", err);
      }

      // for (let key in pairs) {
      //   const { user1, user2 } = pairs[key];
      //   if (user1.userid === socket.id || user2.userid === socket.id) {
      //     const userLeftTheChat = user1.userid === socket.id ? user1 : user2;
      //     io.to(userLeftTheChat.to).emit("userLeftTheChat", userLeftTheChat.username);
      //     delete pairs[key];
      //     return null;
      //   }
      // }
    })

    // users.push({
    //   userid: socket.id,
    //   username: username,
    //   connectionStatus: false,
    //   sendPeerRequest: false
    // });

    // console.log("connect with stranger got triggered", users);

    // if (users.length > 1) {
    //   let userPair = selectRandomUserPairFromDB(socket);

    //   pairs.push(userPair);
    //   console.log("selected pair", pairs)

    //   // emit object to selected pairs
    //   for (let key in userPair) {

    //     io.to(userPair[key].to).emit("exchangingPairInfo", {
    //       username: userPair[key].username,
    //       userid: userPair[key].userid,
    //       sendPeerRequest: userPair[key].sendPeerRequest
    //     })

    //     users = users.filter(v => v.userid !== userPair[key].userid)
    //   }

    //   userPair = {};
    // }
  })


  socket.on("private message", ({ content, to }) => {
    console.log(content, to)
    message = [...message, content];
    io.to(to).emit("private message", {
      content: content,
      from: socket.id,
    });

    console.log("emited message", content, "to", to);
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
})


async function selectRandomUserPairFromDB(len) {
  const getRandomIndex = () => Math.floor(Math.random() * len);

  const userXIndex = getRandomIndex();
  let userYIndex = getRandomIndex();
  if (userXIndex === userYIndex) {
    while (userXIndex === userYIndex) {
      userYIndex = getRandomIndex();
    }
  }
  const randomIndex = Math.floor(Math.random() * 2);
  console.log("select index", userXIndex, userYIndex, randomIndex);
  try {
    let userX = await client.lRange("users", userXIndex, userXIndex);
    let userY = await client.lRange("users", userYIndex, userYIndex);

    if (userX && userY) {
      userX = JSON.parse(userX[0]);
      userY = JSON.parse(userY[0]);

      userX.sendPeerRequest = randomIndex === 0;
      userY.sendPeerRequest = randomIndex !== 0;
      userX.pairedUserId = userY.socketId;
      userY.pairedUserId = userX.socketId;
      users = [userX, userY];
      return users;
    }
  } catch (err) {
    console.error("Error in addUserToDb:", err);
  }
}



// function selectRandomUserPairFromDB(socket) {
//   const availableUsers = users.filter(user => !user.connectionStatus);

//   if (availableUsers.length < 2) {
//     return null;
//   }

//   // Select random user indices
//   let user1Index = Math.floor(Math.random() * availableUsers.length);
//   let user2Index;
//   do {
//     user2Index = Math.floor(Math.random() * availableUsers.length);
//   } while (user2Index === user1Index);

//   // Select users
//   const user1 = availableUsers[user1Index];
//   const user2 = availableUsers[user2Index];

//   const pairs = [user1, user2];
//   const randomIndex = Math.floor(Math.random() * 2);
//   pairs[randomIndex].sendPeerRequest = true


//   // Return the selected pair
//   return {
//     user1: {
//       userid: user1.userid,
//       username: user1.username,
//       sendPeerRequest: user1.sendPeerRequest,
//       to: user2.userid
//     },
//     user2: {
//       userid: user2.userid,
//       username: user2.username,
//       sendPeerRequest: user2.sendPeerRequest,
//       to: user1.userid
//     }
//   };
// }


httpServer.listen(port, () => console.log("port running at", port))