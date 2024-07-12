import openMediaStream from "../utils/openMediaStream";

export async function getConnectedDevices() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter(device => device.kind === 'videoinput');
}

export async function changeCam(setChangeCamOverly, selectedDeviceId, localVideo, setStream, peerConnection) {
    setChangeCamOverly(false)
    if (selectedDeviceId && localVideo) {
        try {
            const stream = await openMediaStream(selectedDeviceId);
            localVideo.srcObject = stream;
            setStream(stream);
            const newVideoTrack = stream.getVideoTracks()[0];
            const sender = peerConnection.getSenders().find(s => s.track.kind === 'video');
            if (sender) {
                await sender.replaceTrack(newVideoTrack);
            }
        } catch (error) {
            console.error("Error changing camera:", error);
        }
    }
}

export async function changePreviewCam(deviceId, videoPreview, setStream) {
    try {
        const stream = await openMediaStream(deviceId, videoPreview);
        stream && setStream(stream);
        if (videoPreview.current) {
            videoPreview.current.srcObject = stream;

        }
    } catch (error) {
        console.error("Error changing preview camera:", error);
    }
}
