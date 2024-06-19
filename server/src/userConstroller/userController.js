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
            console.log("emitted", key.username, "userId", key.socketId);
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

export async function piredUserLeftTheChat(v, socket, io) {
    const pairId = v.sendPeerRequest ? socket.id+v.to : v.to+socket.id;
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

// export async function handelDisconnect(io, socket) {
//     console.log("socket disconnected");
//     try {
//         const pairsStr = await client.hGet("userpairList", pairUserId);
//         const pairs = JSON.parse(pairsStr);
//         await Promise.all([
//             client.hDel("userpairList", pairUserId),
//             client.hDel("userIdList", socket.id),
//         ]);

//         client.lRem("users", 1, JSON.stringify({ 'socketId': socket.id, 'username': socket.username }))
//         console.log(`User ${socket.username} removed from Redis`);
//         let to;
//         pairs[0].socketId === socket.id ? to = pairs[1].socketId : to = pairs[0].socketId;
//         io.to(to).emit("userLeftTheChat", socket.username);
//     } catch (err) {
//         console.error("Error removing user:", err);
//     }
// }