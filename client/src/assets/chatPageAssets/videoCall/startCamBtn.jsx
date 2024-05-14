import React, { useEffect } from "react"

export default function CreateOffetBtn({ socket, pc, strangerUserId }) {


    async function makeCall() {
        try {
            const offer = await pc.createOffer()
            await pc.setLocalDescription(offer)

            console.log("local desc set")

            socket.emit("offer", {
                offer: offer,
                to: strangerUserId
            })
            console.log("offer send.", offer)
        } catch (err) {
            console.log("err creating offer.", err)
        }
    }

    return <button onClick={makeCall}>Call</button>
}