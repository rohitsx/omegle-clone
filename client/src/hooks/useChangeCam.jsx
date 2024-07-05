import { useEffect, useRef, useState } from "react"
import openMediaStream from "../utils/openMediaStream";

export default function ChangeCam({ peerConnection, localVideo, ChangeCamOverly, setChangeCamOverly }) {
    const [devices, setDevices] = useState([null])
    const [selectedDeviceId, setSelectedDeviceId] = useState(null);
    const videoPreview = useRef(null)

    async function changeCam(e) {
        if (selectedDeviceId && localVideo) {
            openMediaStream(selectedDeviceId)
                .then(stream => {
                    localVideo.srcObject = stream
                    try {
                        const newVideoTrack = stream.getVideoTracks()[0]
                        const sender = peerConnection.getSenders().find(s => s.track.kind === 'video')
                        sender.replaceTrack(newVideoTrack);
                    } catch (error) {
                        console.log("not working")
                    }
                })
        }
        setChangeCamOverly(false)
    }

    useEffect(() => {
        console.log("chaneCamOverly", ChangeCamOverly);
    }, [ChangeCamOverly])

    async function changePrivewCam(deviceId) {
        openMediaStream(deviceId)
            .then(stream => videoPreview.current.srcObject = stream)
        setSelectedDeviceId(deviceId)
    }

    async function getConnectedDevices(type) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        return devices.filter(device => device.kind === type)
    }

    useEffect(() => {
        getConnectedDevices('videoinput')
            .then(devices => setDevices(devices))
            .then(openMediaStream)
            .then(stream => videoPreview.current.srcObject = stream)
    }, [])

    return (
        ChangeCamOverly && (
            <div id="changeCamContainer">
                <video id="videoPreview" ref={videoPreview} autoPlay playsInline controls={false} muted></video>
                <div id="dropdown">
                    <button className="dropbtn">Select Camera</button>
                    <div id="dropdown-content">
                        {devices.map((device, index) =>
                            device && (
                                <div className="dropdown-item" key={index} onClick={() => changePrivewCam(device.deviceId)}>
                                    {device.label}
                                </div>
                            )
                        )}
                    </div>
                </div>
                <input type="button" value="Submit" onClick={changeCam} id="chnageCamBtn" />
            </div>
        )
    )
}