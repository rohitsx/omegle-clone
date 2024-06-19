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
            await client.lRem("users", 1, user1[0]);
            await client.lRem("users", 1, user2[0]);

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
        }
    } catch (err) {
        console.error("Error access redisClient, on file ./src/userController/selectPairs:", err);
    }
}