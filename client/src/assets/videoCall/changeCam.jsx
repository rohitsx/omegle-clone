import React, { useEffect, useRef, useState } from "react";
import { changeCam, getConnectedDevices, changePreviewCam } from "../../utils/changeCamUtils";
import openMediaStream from "../../utils/openMediaStream";

export default function ChangeLocalMediaStream({ peerConnection, localVideo, ChangeCamOverly, setChangeCamOverly, selectedDeviceId, setSelectedDeviceId, setStream }) {
    const [devices, setDevices] = useState([]);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const videoPreview = useRef(null);
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (ChangeCamOverly) {
            let streamInstance = null
            const setupDevicesAndStream = async () => {
                const deviceInstance = await getConnectedDevices()
                setDevices(deviceInstance)

                streamInstance = await openMediaStream()
                if (videoPreview.current) videoPreview.current.srcObject = streamInstance
                setStream(streamInstance)
            }

            try {
                setupDevicesAndStream()
            } catch (error) {
                console.log("error setting upp devices and stream", error);
            }

            return () => {
                if (streamInstance.getVideoTracks()[0]) {
                    streamInstance.getVideoTracks()[0].stop()
                }
            }
        }
    }, [ChangeCamOverly]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    if (!ChangeCamOverly) return null;

    return (
        <div id="changeCamOverlay">
            <div id="changeCamContainer">
                <video id="videoPreview" ref={videoPreview} autoPlay playsInline controls={false} muted></video>
                <div id="dropdown" ref={dropdownRef} className={dropdownOpen ? "active" : ""}>
                    <button className="dropbtn" onClick={() => setDropdownOpen(!dropdownOpen)}>Select Camera</button>
                    <div id="dropdown-content">
                        {devices.map((device, index) => (
                            <div
                                className="dropdown-item"
                                key={index}
                                onClick={() => {
                                    changePreviewCam(device.deviceId, videoPreview, setStream);
                                    setSelectedDeviceId(device.deviceId);
                                    setDropdownOpen(false);
                                }}
                            >
                                {device.label}
                            </div>
                        ))}
                    </div>
                </div>

                <button id="changeCamBtn" onClick={() => changeCam(
                    setChangeCamOverly, selectedDeviceId, localVideo, setStream, peerConnection
                )}>Apply Changes</button>
            </div>
        </div>
    );
}