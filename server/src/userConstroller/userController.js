import { redisClient as client } from "../redisClient.js";
import { selectPairsFromDb } from "./selectPairs.js";
import { addUserTODb } from "./addUserToDb.js";

export async function processUserPairing(io, socket) {
    console.log("connected with strager emitted for", socket.username);
    try {
        const userLen = await addUserTODb(socket);
        if (userLen < 2) {
            throw new Error(`not enough users to pair ${socket.username}`);
        }

        const userPair = await selectPairsFromDb(userLen);

        if (userPair[0].username === userPair[1].username) {
            throw new Error(`user ${userPair[0].username} and ${userPair[1].username} are same`);
        }

        console.log("selected pair", userPair[0].username, "with", userPair[1].username);
        userPair.forEach(key =>  io.to(key.socketId).emit("exchangingPairInfo", key));
        
        await client.hSet("userpairList", userPair[0].socketId + userPair[1].socketId, JSON.stringify(userPair));
    } catch (err) {
        if (err.message === `not enough users to pair ${socket.username}`) {
            io.to(socket.id).emit("waiting", "Waiting for another user to join");
            console.log(err.message);
        } else {
            socket.emit("userLeftTheChat")
            console.error("err selecting pairs in userCOntroller.js");
        }
    }
}

export async function pairedUserLeftTheChat(v, socket, io) {
    const pairId = v.sendPeerRequest ? socket.id + v.to : v.to + socket.id;
    console.log(socket.username, "left from the", "pairid:", pairId);
    io.to(v.to).emit("userLeftTheChat", v);
    try {
        await client.hDel("userpairList", pairId);
    } catch (err) {
        console.log("err removing pair", err);
    }

}

export async function soloUserLeftTheChat(socket) {
    try {
        const check = await client.lRem("users", 1, JSON.stringify({ 'socketId': socket.id, 'username': socket.username }));
        if (check === 1) console.log(socket.username, "removed from redis by soloUserLeftTheChat");
    } catch (err) {
        console.log("user don't exits in redis", err);
    }
}