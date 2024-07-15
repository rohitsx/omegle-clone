import { useEffect } from "react";
import setPcInstance from "../utils/pcInstance";


export default function usePeerConnection(socket, strangerUserId, setPeerConnection, peerConnection) {

    useEffect(() => {
        const pcInstance = setPcInstance()
        setPeerConnection(pcInstance)

        return () => {
            pcInstance.close()
            console.log("peerConenction closed");
            setPeerConnection(null)
        }
    }, [])

    useEffect(() => {
        if (peerConnection && socket) {
            peerConnection.addEventListener('icecandidate', event => {
                if (event.candidate) {
                    socket.emit("new-ice-candidate", {
                        icecandidate: event.candidate,
                        to: strangerUserId
                    })
                }
            })

            socket.on("new-ice-candidate", async message => {
                if (message) {
                    try {
                        await peerConnection.addIceCandidate(message)
                    } catch (e) {
                        console.error('Error adding received ice candidate', e)
                    }
                }
            })
        }
    }, [peerConnection, strangerUserId])
}