import { useEffect, useState, useRef } from "react";
import RemoteStream from "./RemoteStream";

export default function ({socket}) {

    const [stream, setStream] = useState()
    const [videoDevices, setVideoDevices] = useState([])
    const localVideoElement = useRef()

    const configuration = { 'iceServers': [{ 'urls': 'stun:stun.l.google.com:19302' }] }
    const peerConnection = new RTCPeerConnection(configuration);
    
    useEffect(() => {

        async function getConnectedDevices(type) {
            await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            const devices = await navigator.mediaDevices.enumerateDevices();
            return devices.filter(device => device.kind === type);
        }

        getConnectedDevices("videoinput").then(devices => setVideoDevices(devices));
    }, []);

    const selectOption = async (e) => {
        let deviceId = e.target.value;
        const constraints = { video: { deviceId: deviceId }, audio: true };
        try {
            setStream(await navigator.mediaDevices.getUserMedia(constraints));
        } catch (error) {
            console.error('Error accessing media devices:', error);
        }
    }

    useEffect(() => {
        if (stream && localVideoElement) {
            localVideoElement.current.srcObject = stream

            stream.getTracks().forEach(track => {
                peerConnection.addTrack(track, stream)
            });
        }
    }, [stream])


    return (<>
        <form>
            <label htmlFor="devices">Select camera</label>
            <select name="devices" id="decices" onChange={selectOption}>
                {videoDevices.map((data, index) => (
                    <option value={data.deviceId} key={index}>{data.label}</option>
                ))}
            </select>
        </form>
        <video id="localVideo" ref={localVideoElement} autoPlay playsInline ></video>
        <RemoteStream peerConnection={peerConnection} socket={socket}/>
    </>)
}