import React, { useEffect } from "react"

export default function LocalVideo({ localVideo, pc }) {

    useEffect(() => {
        if (pc) {
            const constraints = {
                'video': true,
                'audio': true
            }
            navigator.mediaDevices.getUserMedia(constraints)
                .then(stream => {
                    localVideo.current.srcObject = stream
                    stream.getTracks().forEach(track => {
                        pc.addTrack(track, stream)
                    })    
                })
                .catch(err => console.log('Error accessing media devices.', err))
    
            return () => {
                const stream = localVideo.current.srcObject;
                if (stream) {
                    stream.getTracks().forEach(track => track.stop());
                }
            }
        }
    }, [pc])

    return <video ref={localVideo} autoPlay playsInline controls={false}></video>
}