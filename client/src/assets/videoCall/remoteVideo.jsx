import React, { useEffect } from "react"

export default function RemoteVideo({ remoteVideo, peerConnection, setChangeCamOverly }) {

    useEffect(() => {
        if (peerConnection) {
            peerConnection.addEventListener('track', async (event) => {
                const [remoteStream] = event.streams
                remoteVideo.current.srcObject = remoteStream
            })

            return () => {
                if(remoteVideo.current) remoteVideo.current.srcObject = null
            }
        }
    }, [peerConnection])

    return <video id="remoteVideo"
        ref={remoteVideo} onClick={() => setChangeCamOverly(true)} autoPlay playsInline controls={false}
    ></video>

}