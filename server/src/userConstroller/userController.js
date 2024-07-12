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
        if (userPair) {
            if (userPair[0].username === userPair[1].username) {
                console.log(`user ${userPair[0].username} and ${userPair[1].username} are same`);
                await client.lRem("users", 1, `{"socketId":"${userPair[0].socketId}","username":"${userPair[0].username}}`);
            }
        } else {
            throw new Error(`not enough users to pair ${socket.username}`);
        }
        userPair.forEach(key => io.to(key.socketId).emit("exchangingPairInfo", key));

        await client.hSet("userpairList", userPair[0].socketId + userPair[1].socketId, JSON.stringify(userPair));
    } catch (err) {
        if (err.message === `not enough users to pair ${socket.username}`) {
            io.to(socket.id).emit("waiting", "Waiting for another user to join");
            console.log(err.message);
        } else {
            socket.emit("userLeftTheChat")
            console.error("err selecting pairs in userCOntroller.js", err);
        }
    }
}

export async function pairedUserLeftTheChat(v, socket, io) {
    const pairId = v.sendPeerRequest ? socket.id + v.to : v.to + socket.id;
    io.to(v.to).emit("userLeftTheChat", v);
    try {
        const ckeck = await client.hDel("userpairList", pairId);
        if (ckeck === 1) console.log(socket.username, "left from the", "pairid:", pairId);
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