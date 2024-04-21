import { useEffect, useState, useRef } from "react";
import RemoteStream from "./RemoteStream";

export default function ({ socket }) {

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
        const constraints = {
            video: {
                deviceId: { exact: deviceId },
                width: { ideal: 1920 },
                height: { ideal: 1080 }
            }, audio: true
        };
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
        <div id="webRTC_container">
            <form id="selectCamera" >
                <label htmlFor="devices" id="selectCameraLabel">Select Camera</label>
                <select name="devices" id="decices" onChange={selectOption}>
                    <option value="roh">No Camera</option>
                    {videoDevices.map((data, index) => (
                        <option value={data.deviceId} key={index}>{data.label}</option>
                    ))}
                </select>
            </form>
            {stream ? (
                <video id="localVideo" ref={localVideoElement} autoPlay playsInline ></video>
            ) : (
                <div id="localVideoPlaceholder">Camera</div>
            )}
            <RemoteStream peerConnection={peerConnection} socket={socket} />
        </div>
    </>)
}