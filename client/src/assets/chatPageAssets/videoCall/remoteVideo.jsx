import React, { useEffect, useState } from "react"

export default function RemoteVideo({ remoteVideo, socket, peerConnection, strangerUserId }) {

    const [answer, setAnswer] = useState(null)

    // useEffect(() => {

    //     async function handelOffer(offer) {
    //         const remoteDesc = new RTCSessionDescription(offer)
    //         peerConnection.setRemoteDescription(remoteDesc)
    //         const answer = await peerConnection.createAnswer()
    //         await peerConnection.setLocalDescription(answer)
    //     }

    //     peerConnection && socket.on("offer", offer => handelOffer(offer))
    // }, [peerConnection])

    useEffect(() => {
        async function handelOffer(offer) {
            const remoteDesc = new RTCSessionDescription(offer)
            peerConnection.setRemoteDescription(remoteDesc)
            const answerInstance = await peerConnection.createAnswer()
            setAnswer(answerInstance)
        }

        peerConnection && socket.on("offer", offer => handelOffer(offer))
    }, [peerConnection])

    useEffect(() => {
        async function handelAnswer() {
            await peerConnection.setLocalDescription(answer)
            socket.emit("answer", {
                answer: answer,
                to: strangerUserId
            })

            console.log("answer Send", answer)
        }

        answer && handelAnswer()
    }, [answer])

    useEffect(() => {
        if (peerConnection) {
            peerConnection.addEventListener('track', async (event) => {
                const [remoteStream] = event.streams;
                remoteVideo.current.srcObject = remoteStream;
                console.log("added remote stream");
            })
        }
    }, [peerConnection])

    return ({remoteVideo.current.srcObject ? (
        <video id="remoteVideo" ref={remoteVideo} autoPlay playsInline controls={false}></video>
    ) : ()})
}