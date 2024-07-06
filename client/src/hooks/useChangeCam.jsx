import React, { useEffect, useRef, useState } from "react";
import openMediaStream from "../utils/openMediaStream";

export default function ChangeCam({ peerConnection, localVideo, ChangeCamOverly, setChangeCamOverly }) {
    const [devices, setDevices] = useState([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const videoPreview = useRef(null);
    const dropdownRef = useRef(null);

    async function changeCam() {
        if (selectedDeviceId && localVideo) {
            try {
                const stream = await openMediaStream(selectedDeviceId);
                localVideo.srcObject = stream;
                const newVideoTrack = stream.getVideoTracks()[0];
                const sender = peerConnection.getSenders().find(s => s.track.kind === 'video');
                if (sender) {
                    await sender.replaceTrack(newVideoTrack);
                }
            } catch (error) {
                console.error("Error changing camera:", error);
            }
        }
        setChangeCamOverly(false);
    }

    async function changePreviewCam(deviceId) {
        try {
            const stream = await openMediaStream(deviceId);
            if (videoPreview.current) {
                videoPreview.current.srcObject = stream;
            }
            setSelectedDeviceId(deviceId);
        } catch (error) {
            console.error("Error changing preview camera:", error);
        }
    }

    async function getConnectedDevices(type) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        return devices.filter(device => device.kind === type);
    }

    useEffect(() => {
        getConnectedDevices('videoinput')
            .then(devices => setDevices(devices))
            .then(() => openMediaStream())
            .then(stream => {
                if (videoPreview.current) {
                    videoPreview.current.srcObject = stream;
                }
            })
            .catch(error => console.error("Error setting up devices:", error));
    }, []);

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

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    if (!ChangeCamOverly) return null;

    return (
        <div id="changeCamOverlay">
            <div id="changeCamContainer">
                <video id="videoPreview" ref={videoPreview} autoPlay playsInline controls={false} muted></video>
                
                <div id="dropdown" ref={dropdownRef} className={dropdownOpen ? "active" : ""}>
                    <button className="dropbtn" onClick={toggleDropdown}>Select Camera</button>
                    <div id="dropdown-content">
                        {devices.map((device, index) => (
                            <div 
                                className="dropdown-item" 
                                key={index} 
                                onClick={() => {
                                    changePreviewCam(device.deviceId);
                                    setDropdownOpen(false);
                                }}
                            >
                                {device.label}
                            </div>
                        ))}
                    </div>
                </div>
                
                <button id="changeCamBtn" onClick={changeCam}>Apply Changes</button>
            </div>
        </div>
    );
}