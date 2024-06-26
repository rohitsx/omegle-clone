import { useEffect, useState } from "react";


export default function usePeerConnection(socket, strangerUserId) {
    const [peerConnection, setPeerConnection] = useState(null)
    useEffect(() => {
        const configuration = { 'iceServers': [{ 'urls': 'stun:stun.l.google.com:19302' }] }
        setPeerConnection(new RTCPeerConnection(configuration))
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

    return peerConnection
}