import React, { useEffect } from "react"
import openMediaStream from "../../utils/openMediaStream"

export default function LocalVideo({ localVideo, peerConnection, setChangeCamOverly, setStream, stream, selectedDeviceId }) {


    useEffect(() => {
        if (peerConnection) {
            let streamInstance = null
            async function handelMediaStream() {
                streamInstance = await openMediaStream(selectedDeviceId)
                localVideo.current.srcObject = streamInstance
                setStream(streamInstance)
            }
            try {
                if (localVideo.current) handelMediaStream()
            } catch (err) {
                console.log("err in handelMediaStream", err)
            }

            return () => {
                if (streamInstance) {
                    streamInstance.getVideoTracks()[0].stop()
                    console.log("stop stream");
                }
            }
        }
    }, [peerConnection])

    useEffect(() => {
        if (stream) {
            return () => {
                stream.getVideoTracks()[0].stop()
            }
        }
    }, [stream])

    return <video id="localVideo"
        ref={localVideo} onClick={() => setChangeCamOverly(true)} autoPlay playsInline controls={false} muted
    ></video>
}