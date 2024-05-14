import { useEffect } from "react"

export default function KillMediaStream({ localVideo, pc, setPc, socket, strangerUserId }) {

    function killMediaStream() {
        localVideo.current.srcObject.getTracks().forEach(track => track.stop())
    }

    function startCamera() {
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
    }


return <>
    <button id="killMediaStrean" onClick={killMediaStream}>Trun Off</button>
    <button onClick={startCamera }>trunOn</button>
</>
}