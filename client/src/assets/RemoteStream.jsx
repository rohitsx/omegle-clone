import { useEffect, useRef, useState } from "react";

export default function RemoteStream({ peerConnection, socket }) {

    const remoteVideoElement = useRef()
    const [sdp, setSdp] = useState()

    peerConnection.addEventListener('connectionstatechange', event => {
        if (peerConnection.connectionState === 'connected') {
            console.log("connected")
        }
    });

    peerConnection.addEventListener('track', event => {
        console.log("setting remote stream")
        const [remoteStream] = event.streams;
        remoteVideoElement.current.srcObject = remoteStream;
    });

    socket.on("answer", (answer) => {
        peerConnection.setRemoteDescription(answer);
        console.log("answer recived")
    })


    const sendPeerRequest = async (e) => {
        e.preventDefault()

        peerConnection.onicecandidate = async (event) => {
            if (event.candidate) {
                socket.emit("offer", peerConnection.localDescription)
                console.log("offer send")
            }
        }

        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
    }

    useEffect(() => {
        socket.on("offer", (offer) => {
            console.log("offer recived")
            setSdp(offer)
        })
    }, [socket])

    useEffect(() => {
        const sendPeerAnswer = async () => {
            if (!sdp) return

            peerConnection.onicecandidate = async (event) => {
                if (event.candidate) {
                    socket.emit("answer", peerConnection.localDescription)
                    console.log("answer send")
                }
            };

            peerConnection.setRemoteDescription(sdp)
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
        }

        sendPeerAnswer()

    }, [sdp])


    return (
        <>
            <video id="localVideo" ref={remoteVideoElement} autoPlay playsInline ></video>
            <button onClick={sendPeerRequest}>connect</button> 
        </>
    )
}