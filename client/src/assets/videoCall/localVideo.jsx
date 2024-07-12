import React, { useEffect, useState } from "react"
import openMediaStream from "../../utils/openMediaStream"

export default function LocalVideo({ localVideo, peerConnection, setChangeCamOverly, setStream, stream, selectedDeviceId }) {



    useEffect(() => {

        if (peerConnection) {
            let streamInstance = null
            const handelMediaStream = async () => {
                try {
                    streamInstance = await openMediaStream(selectedDeviceId)
                    if (streamInstance) {
                        localVideo.current.srcObject = streamInstance
                        streamInstance.getTracks().forEach(track => {
                            peerConnection.addTrack(track, streamInstance)
                        })
                        setStream(streamInstance)
                    }
                } catch (err) {
                    console.log("err in handelMediaStream",err)
                }
            }

            handelMediaStream()
            return () => {
                if (streamInstance.getVideoTracks()[0]) {
                    streamInstance.getVideoTracks()[0].stop()
                    console.log("stop stream");
                }
            }
        }

    }, [peerConnection])

    useEffect(() =>{
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