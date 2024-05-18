import React, { useEffect, useState } from "react"

export default function LocalVideo({ localVideo, peerConnection, strangerUserId, socket, sendPeerRequest }) {

    const [isStreamAdded, setIsStreamAdded] = useState(null)

    useEffect(() => {
        function getStream() {
            const constraints = {
                'video': true,
                'audio': true
            }
            navigator.mediaDevices.getUserMedia(constraints)
                .then(stream => {
                    localVideo.current.srcObject = stream
                    stream.getTracks().forEach(track => {
                        peerConnection.addTrack(track, stream)
                    })
                })
                .catch(error => {
                    console.error('Error accessing media devices.', error);
                })
        }



        peerConnection && getStream()
        setIsStreamAdded(true)

    }, [peerConnection])

    useEffect(() => {
        if (isStreamAdded !== null) {
            async function sendOffer() {
                const offer = await peerConnection.createOffer()
                await peerConnection.setLocalDescription(offer)
                socket.emit("offer", {
                    offer: offer,
                    to: strangerUserId
                })

                console.log("offer send", offer);
            }

            async function handelAnswer(answer) {
                const remoteDesc = new RTCSessionDescription(answer)
                await peerConnection.setRemoteDescription(remoteDesc)
                console.log("recived answer", answer)
            }

            sendPeerRequest && sendOffer()
            peerConnection && socket.on("answer", answer => handelAnswer(answer))
        }

        return() => setIsStreamAdded(null)
    }, [isStreamAdded])


    // useEffect(() => {
    //     async function listenIceCandidate() {
    //         peerConnection.addEventListener('icecandidate', event => {
    //             if (event.candidate) {
    //                 socket.emit("new-ice-candidate", {
    //                     icecandidate: event.candidate,
    //                     to: strangerUserId
    //                 })
    //                 console.log("send ice", event.candidate)
    //             }
    //         })
    //     }

    //     async function handelIceCandidate(message) {
    //         if (message.iceCandidate) {
    //             try {
    //                 await peerConnection.addIceCandidate(message.iceCandidate)
    //                 console.log("Recived ice", message.iceCandidate);
    //             } catch (e) {
    //                 console.error('Error adding received ice candidate', e)
    //             }
    //         }
    //     }

    //     peerConnection && listenIceCandidate()
    //     peerConnection && socket.on("new-ice-candidate", message => handelIceCandidate(message))
    // }, [peerConnection])


    return <video id="localVideo" ref={localVideo} autoPlay playsInline controls={false}></video>
}