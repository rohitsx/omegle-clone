import React, { useEffect } from "react"

export default function RemoteVideo({ remoteVideo, socket, peerConnection, strangerUserId }) {

    useEffect(() => {

        async function acceptOffer(offer) {
            const remoteDesc = new RTCSessionDescription(offer)
            peerConnection.setRemoteDescription(remoteDesc)
            const answer = await peerConnection.createAnswer()
            await peerConnection.setLocalDescription(answer)

            socket.emit("answer", {
                answer: answer,
                to: strangerUserId
            })

            console.log("answer Send", answer)
        }

        peerConnection && socket.on("offer", offer => acceptOffer(offer))
    }, [peerConnection])

    useEffect(() => {
        if (peerConnection) {
            peerConnection.addEventListener('track', async (event) => {
                console.log("added remote stream")
                const [remoteStream] = event.streams;
                remoteVideo.current.srcObject = remoteStream;
                console.log("added remote stream");
            })
        }
    }, [peerConnection])

    return <video id="remoteVideo" ref={remoteVideo} autoPlay playsInline controls={false}></video>
}