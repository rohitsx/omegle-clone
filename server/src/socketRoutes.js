import { processUserPairing, soloUserLeftTheChat, pairedUserLeftTheChat } from "./userConstroller/userController.js";

export function handelSocketConnection(io, socket) {
    socket.on("connectWithStranger", () => processUserPairing(io, socket));
    socket.on("pairedUserLeftTheChat", (v) => pairedUserLeftTheChat(v, socket, io));
    socket.on("soloUserLeftTheChat", () => soloUserLeftTheChat(socket));

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
}
