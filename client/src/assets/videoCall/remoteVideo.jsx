import React, { useEffect } from "react"

export default function RemoteVideo({ remoteVideo, peerConnection, setChangeCamOverly }) {

    useEffect(() => {
        if (peerConnection) {
            peerConnection.addEventListener('track', async (event) => {
                const [remoteStream] = event.streams
                remoteVideo.current.srcObject = remoteStream
            })
        }
    }, [peerConnection])

    function handelCam() {
        setChangeCamOverly(true)
    }

    return <video id="remoteVideo" ref={remoteVideo}  onClick={handelCam} autoPlay playsInline controls={false}></video>

}