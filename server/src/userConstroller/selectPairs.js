import { redisClient as client } from "../redisClient.js";

export async function selectPairsFromDb(len) {
    const getRandomIndex = () => Math.floor(Math.random() * len);

    const user1Index = getRandomIndex();
    let user2Index = getRandomIndex();
    if (user1Index === user2Index) {
        while (user1Index === user2Index) {
            user2Index = getRandomIndex();
        }
    }
    try {
        let user1 = await client.lRange("users", user1Index, user1Index);
        let user2 = await client.lRange("users", user2Index, user2Index);

        if (user1 && user2) {
            try {
                const x = await client.lRem("users", 1, user1[0]);
                const y = await client.lRem("users", 1, user2[0]);
                return x && y;
            } catch (error) {
                console.log("err removing user from redis", error);
            }
            console.log("user1", JSON.parse(user1[0]).username, "user2", JSON.parse(user2[0]).username);
            if (x === 1 && y === 1) {
                console.log("removed", JSON.parse(user1[0]).username, "and", JSON.parse(user2[0]).username, "from redis");

                user1 = JSON.parse(user1[0]);
                user2 = JSON.parse(user2[0]);

                const user1WithUpdates = {
                    ...user1,
                    sendPeerRequest: true,
                    pairedUserId: user2.socketId,
                    strangerUsername: user2.username,
                };
                const user2WithUpdates = {
                    ...user2,
                    sendPeerRequest: false,
                    pairedUserId: user1.socketId,
                    strangerUsername: user1.username,
                };
                const users = [user1WithUpdates, user2WithUpdates];
                return users;
            } else {
                console.log(console.log("unable to remove user1", JSON.parse(user1[0]).username, "user2", JSON.parse(user2[0]).username));
            }
        }
    } catch (err) {
        console.error("Error access redisClient, on file ./src/userController/selectPairs.js", err);
    }
}