import React, { useEffect, useState } from "react"

export default function RemoteVideo({ remoteVideo, peerConnection}) {

    useEffect(() => {
        if (peerConnection) {
            peerConnection.addEventListener('track', async (event) => {
                const [remoteStream] = event.streams
                remoteVideo.current.srcObject = remoteStream
                console.log("added remote stream")
            })
        }
    }, [peerConnection])

    return <video id="remoteVideo" ref={remoteVideo} autoPlay playsInline controls={false}></video>

}