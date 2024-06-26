import { redisClient as client } from "../redisClient.js";
import { selectPairsFromDb } from "./selectPairs.js";
import { addUserTODb } from "./addUserToDb.js";

export async function processUserPairing(io, socket) {
    try {
        const userLen = await addUserTODb(socket);
        if (userLen < 2) {
            throw new Error(`not enough users to pair ${socket.username}`);
        }

        const userPair = await selectPairsFromDb(userLen);

        console.log("selected pair", userPair[0].username, "with", userPair[1].username);
        userPair.forEach(key => {
            io.to(key.socketId).emit("exchangingPairInfo", key);    
        });

        await client.hSet("userpairList", userPair[0].socketId + userPair[1].socketId, JSON.stringify(userPair));
    } catch (err) {
        if (err.message === `not enough users to pair ${socket.username}`) {
            io.to(socket.id).emit("waiting", "Waiting for another user to join");
            console.log(err.message);
        } else {
            console.error("Error accessing db:", err);
        }
    }
}

export async function pairedUserLeftTheChat(v, socket, io) {
    const pairId = v.sendPeerRequest ? socket.id+v.to : v.to+socket.id;
    console.log("pairedUserLeftTheChat", pairId);
    io.to(v.to).emit("userLeftTheChat", v);
    try {
        await client.hDel("userpairList", pairId); 
        console.log(`pair ${pairId} removed from Redis`);
    } catch (err) {
        console.log("err removing pair", err);
    }

}

export async function soloUserLeftTheChat(socket) {
    try {
        await client.lRem("users", 1, JSON.stringify({ 'socketId': socket.id, 'username': socket.username }));
        console.log(`User ${socket.username} removed from Redis`);
    } catch (err) {
        console.log("user don't exits in redis", err);
    }
}