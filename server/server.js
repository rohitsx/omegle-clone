import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createClient } from 'redis';
import 'dotenv/config'

const app = express();
const port = 3000;
const httpServer = createServer(app);
let users = [];

const io = new Server(httpServer, {
  cors: {
    origin: "http://127.0.0.1:5173",
  }
});

io.use((socket, next) => {
  const username = socket.handshake.auth.username;
  if (!username) {
    return next(new Error("invalid username"));
  }
  socket.username = username;
  console.log(` username: ${username}`)
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
  .then(() => console.log("database connected"))
  .catch(err => console.log("error connecting db", err))

io.on("connection", (socket) => {
  socket.on("connectWithStranger", () => {

    async function addUserTODb() {
      try {
        // add user data to db
        await client.rPush("users", JSON.stringify({
          "socketId": socket.id,
          "username": socket.username
        }));
        console.log(`User ${socket.username} added to Redis`);

        // get numbers of user in db
        return await client.lLen("users");
      } catch (err) {
        console.error("Error accessing db:", err);
      }
    }

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

    async function processUserPairing() {
      try {
        const userLen = await addUserTODb();
        if (userLen < 2) {
          throw new Error(`not enough users to pair ${socket.username}`);
        }

        console.log(`Length of usersList array: ${userLen}`);
        const userPair = await selectRandomUserPairFromDB(userLen);

        console.log("selected pair", userPair);
        userPair.forEach(key => {
          io.to(key.pairedUserId).emit("exchangingPairInfo", { key });
          console.log("emitted", key.username, "userId", key.pairedUserId);
        });

        await client.hSet("userpairList", userPair[0].socketId + userPair[1].socketId, JSON.stringify(userPair));
        await client.hSet("userIdList", userPair[1].socketId, userPair[0].socketId + userPair[1].socketId);
        await client.hSet("userIdList", userPair[0].socketId, userPair[0].socketId + userPair[1].socketId);

        await client.lRem("users", 1, JSON.stringify({ 'socketId': userPair[0].socketId, 'username': userPair[0].username }));
        await client.lRem("users", 1, JSON.stringify({ 'socketId': userPair[1].socketId, 'username': userPair[1].username }));
      } catch (err) {
        if (err.message === `not enough users to pair ${socket.username}`) {
          io.to(socket.id).emit("waiting", "Waiting for another user to join");
          console.log(err.message);
        } else {
          console.error("Error accessing db:", err);
        }
      }
    }

    processUserPairing();

    socket.on("disconnect", async () => {
      console.log("socket disconnected");
      try {
        const pairUserId = await client.hGet("userIdList", socket.id);
        const pairsStr = await client.hGet("userpairList", pairUserId);
        const pairs = JSON.parse(pairsStr);
        await Promise.all([
          client.hDel("userpairList", pairUserId),
          client.hDel("userIdList", socket.id)
        ]);
        console.log(`User ${socket.username} removed from Redis`);
        let to;
        pairs[0].socketId === socket.id ? to = pairs[1].socketId : to = pairs[0].socketId;
        io.to(to).emit("userLeftTheChat", socket.username);
      } catch (err) {
        console.error("Error removing user:", err);
      }
    })
  })


  socket.on("private message", ({ content, to }) => {
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

httpServer.listen(port, () => console.log("port running at", port))