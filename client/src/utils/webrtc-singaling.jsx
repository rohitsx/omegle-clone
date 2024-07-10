import { useEffect, useState } from "react";

export function webrtcSingaling(socket, peerConnection, strangerUserId,) {
    const [peerAnswer, setpeerAnswer] = useState(null)

    async function sendOffer() {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer)
        socket.emit("offer", {
            offer: offer,
            to: strangerUserId
        })

        console.log("offer send to", strangerUserId)
    }

    async function handelOffer(offer) {
        const remoteDesc = new RTCSessionDescription(offer)
        peerConnection.setRemoteDescription(remoteDesc)
        const answerInstance = await peerConnection.createAnswer()
        setpeerAnswer(answerInstance)
    }

    async function sendAnswer() {
        await peerConnection.setLocalDescription(peerAnswer)
        socket.emit("answer", {
            answer: peerAnswer,
            to: strangerUserId
        })
        console.log("answer send")
    }

    async function handelAnswer(answer) {
        try {
            console.log("recived answer", '\n', "signaling state", peerConnection.signalingState);
            const remoteDesc = new RTCSessionDescription(answer)
            await peerConnection.setRemoteDescription(remoteDesc);
        } catch (err) {
            console.log("answer error", err, "\n", "signaling state", peerConnection.signalingState);
        }
    }

    useEffect(() => {
        peerAnswer && sendAnswer()
    }, [peerAnswer])

    return {
        sendOffer,
        handelOffer,
        handelAnswer
    }

}