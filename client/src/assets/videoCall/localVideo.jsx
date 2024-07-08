import React, { useEffect, useState } from "react"
import openMediaStream from "../../utils/openMediaStream"

export default function LocalVideo({ localVideo, peerConnection, setChangeCamOverly }) {

    const [localStream, setLocalStream] = useState(null)

    async function handelMediaStream() {
        try {
            const stream = await openMediaStream(null)
            if (stream) {
                localVideo.current.srcObject = stream
                setLocalStream(stream)
                stream.getTracks().forEach(track => {
                    peerConnection.addTrack(track, stream)
                })
            }
        } catch (err) {
            console.log(err)
            alert("There was an error setting up the video call. Please try again.");
        }
    }

    function handelCam() {
        setChangeCamOverly(true)
    }

    useEffect(() => {

        peerConnection && handelMediaStream()
        
    }, [peerConnection])

    useEffect(() => {
        if (localStream) {
            return () => {
                localStream.getVideoTracks()[0].stop()
            }
        }
    }, [localStream])

    return <video id="localVideo" ref={localVideo} onClick={handelCam} autoPlay playsInline controls={false} muted></video>
}