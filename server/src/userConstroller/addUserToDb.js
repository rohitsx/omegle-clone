import {redisClient as client} from "../redisClient.js";

export  async function addUserTODb(socket) {
    try {
        // add user data to db
        const check = await client.rPush("users", JSON.stringify({
            "socketId": socket.id,
            "username": socket.username
        }));

        if (check === 1) console.log(socket.username, "added", "userId:", socket.id);
        return await client.lLen("users");
    } catch (err) {
        console.error("Error accessing db:", err);
    }
}
