import { useEffect } from "react";


export default function usePeerConnection(socket, strangerUserId, setPeerConnection, peerConnection, updateUser) {

    function setPcInstance() {
        const configuration = { 'iceServers': [{ 'urls': 'stun:stun.l.google.com:19302' }] }
        const pcInstance = new RTCPeerConnection(configuration)
        setPeerConnection(pcInstance)
        return pcInstance
    }

    useEffect(() => {
        const pcInstance = setPcInstance()

        return () => {
            pcInstance.close()
            console.log("peerConenction closed");
            setPeerConnection(null)
        }
    }, [])

    useEffect(() => {
        if (updateUser > 0) {
            const pcInstance = setPcInstance()

            return () => {
                pcInstance.close()
                console.log("peerConenction closed from useEffect");
                setPeerConnection(null)
            }
        }
    }, [updateUser])

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