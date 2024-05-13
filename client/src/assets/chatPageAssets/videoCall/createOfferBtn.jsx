import React, { useEffect } from "react"

export default function CreateOffetBtn({ socket, pc }) {
    async function makeCall() {
        try {
            const offer = await pc.createOffer()
            await pc.setLocalDescription(offer)

            socket.emit("offer", offer)
            console.log("offer send.", offer)
        } catch (err) {
            console.log("err creating offer.", err)
        }
    }

    return <button onClick={makeCall}>Call</button>
}