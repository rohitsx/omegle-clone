import React, { useEffect } from "react"
import openMediaStream from "../../utils/openMediaStream"

export default function LocalVideo({ localVideo, peerConnection }) {

    async function handelMediaStream() {
        try {
            await openMediaStream(localVideo.current, peerConnection)
        } catch (err) {
            console.log(err)
            alert("There was an error setting up the video call. Please try again.");
        }
    }

    useEffect(() => {

        peerConnection && handelMediaStream()

    }, [peerConnection])


    return <video id="localVideo" ref={localVideo} autoPlay playsInline controls={false}></video>
}