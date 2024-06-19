import { useEffect } from "react";
import { webrtcSingaling } from "../utils/webrtc-singaling";

export default function initiatePeerConnection(socket, peerConnection, sendPeerRequest, strangerUserId) {

    const { sendOffer, handelOffer, handelAnswer } = webrtcSingaling(socket, peerConnection, strangerUserId)

    useEffect(() => {
        if (peerConnection && strangerUserId !== '') {
            if (sendPeerRequest) {
                sendOffer()
                socket.on("answer", handelAnswer)
            }else {
                socket.on("offer", handelOffer)
            }
        }
    }, [strangerUserId])
}