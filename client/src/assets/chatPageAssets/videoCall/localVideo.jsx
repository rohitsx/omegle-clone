import React, { useEffect, useState } from "react"

export default function LocalVideo({ localVideo, peerConnection, strangerUserId, socket, sendPeerRequest }) {

    const [stremAddedToPC, setStremAddedToPC] = useState(null)

    useEffect(() => {
        // if (peerConnection) {
        //     const constraints = {
        //         'video': true,
        //         'audio': true
        //     }
        //     navigator.mediaDevices.getUserMedia(constraints)
        //         .then(stream => {
        //             localVideo.current.srcObject = stream
        //              return stream.getTracks().forEach(track => {
        //                 peerConnection.addTrack(track, stream)
        //             })
        //         }).then(offer => {})
        //         .catch(error => {
        //             console.error('Error accessing media devices.', error);
        //         })
        // }

        async function openMediaStream() {
            const constraints = {
                'video': true,
                'audio': true
            }
            try {
                const stream = await navigator.mediaDevices.getUserMedia(constraints)
                localVideo.current.srcObject = stream
                stream.getTracks().forEach(track => {
                    peerConnection.addTrack(track, stream)
                    console.log("added stream")
                })
            } catch (err) {
                console.log("err acces local media stream", err)
            }
        }

        async function sendOffer() {
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer)
            socket.emit("offer", {
                offer: offer,
                to: strangerUserId
            })

            console.log("offer send", offer)
        }

        async function setupConnection() {
            try {
                peerConnection && await openMediaStream()
                sendPeerRequest && await sendOffer()
            } catch (err) {
                console.log("err stuping connection", err)
            }
        }

        setupConnection()
    }, [peerConnection])

    useEffect(() => {

        async function handelAnswer(answer) {
            const remoteDesc = new RTCSessionDescription(answer)
            await peerConnection.setRemoteDescription(remoteDesc)
            console.log("recived answer", answer)
        }

        peerConnection && socket.on("answer", answer => handelAnswer(answer))
    }, [peerConnection])


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