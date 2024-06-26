export default async function openMediaStream(localVideo, peerConnection) {
    console.log("open media stream");
    const constraints = {
        'video': {
            width: { max: 1920 },
            height: { max: 1080 }
        },
        'audio': {
            echoCancellation: true, 
            noiseSuppression: true,
            autoGainControl: true
        }
    }
    try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        localVideo.srcObject = stream
        if (peerConnection) {
            stream.getTracks().forEach(track => {
                peerConnection.addTrack(track, stream)
                console.log("added local stream")
            })
        }
    } catch (err) {
        console.log("err acces local media stream", err)
    }
}