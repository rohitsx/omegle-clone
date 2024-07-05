import React, { useEffect } from "react"
import openMediaStream from "../../utils/openMediaStream"

export default function LocalVideo({ localVideo, peerConnection, setChangeCamOverly }) {

    async function handelMediaStream() {
        try {
            const stream = await openMediaStream(null)
            if (stream) {
                localVideo.current.srcObject = stream
                console.log("local video srcObject", localVideo.current.srcObject);
                console.log("local video ", localVideo.current);
                stream.getTracks().forEach(track => {
                    peerConnection.addTrack(track, stream)
                    console.log("added local stream")
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


    return <video id="localVideo" ref={localVideo} onClick={handelCam} autoPlay playsInline controls={false} muted></video>
}