import React, { useEffect, useState } from "react"

export default function LocalVideo({ localVideo, peerConnection, strangerUserId, socket, sendPeerRequest }) {

    const [streamStatus, setStreamStatus] = useState(null)

    useEffect(() => {
        async function openMediaStream() {
            const constraints = {
                'video': {
                    width: { ideal: 1920 }, 
                    height: { ideal: 1080 }
                },
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

        return () => setStreamStatus(null)
    }, [peerConnection])

    useEffect(() => {

        async function handelAnswer(answer) {
            const remoteDesc = new RTCSessionDescription(answer)
            await peerConnection.setRemoteDescription(remoteDesc)
            console.log("recived answer", answer)
        }

        peerConnection && socket.on("answer", answer => handelAnswer(answer))

        return () => socket && socket.off("answer")
    }, [peerConnection])


    return (<>{
        peerConnection ? (<video id="localVideo" ref={localVideo} autoPlay playsInline controls={false}></video>) :
            (<div id="localVideoPlaceholder"></div>)
    }</>)
}