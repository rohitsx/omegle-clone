import { processUserPairing, soloUserLeftTheChat } from "./userConstroller/userController.js"

export function handelSocketConnection(io, socket) {
    // pairing
    socket.on("startConnection", () => processUserPairing(io, socket))
    socket.on("pairedUserLeftTheChat", to => io.to(to).emit("strangerLeftTheChat"))
    socket.on("pairedUserLeftTheChat", to => console.log("pairedUserLeftTheChat, by",socket.username, "to", to))
    socket.on("soloUserLeftTheChat", () => soloUserLeftTheChat(socket))

    // exchanging video call data(offer and answer)
    socket.on("offer", ({ offer, to }) => io.to(to).emit("offer", offer))
    socket.on("answer", ({ answer, to }) => io.to(to).emit("answer", answer))
    socket.on("new-ice-candidate", ({ icecandidate, to }) => io.to(to).emit("new-ice-candidate", icecandidate))

    // private message
    socket.on("private message", ({ content, to }) => io.to(to).emit("private message", {
        content: content,
        from: socket.id,
    }))
}
