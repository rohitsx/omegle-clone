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

        console.log("offer send", offer, "to", strangerUserId)
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
        console.log("answer send", peerAnswer)
    }

    async function handelAnswer(answer) {
        console.log("recived answer", answer)
        const remoteDesc = new RTCSessionDescription(answer)
        await peerConnection.setRemoteDescription(remoteDesc)
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