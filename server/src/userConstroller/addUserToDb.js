import client from "../redisClient.js";

export default async function addUserTODb(socket) {
    try {
        const result = await client.rPush("users", JSON.stringify({
            socketId: socket.id,
            username: socket.username
        }));
        console.log("added", socket.username, "to redis", result);
    } catch (err) {
        console.log("err adding user to redis", err);
        socket.emit("errSelectingPair");
    }
}
