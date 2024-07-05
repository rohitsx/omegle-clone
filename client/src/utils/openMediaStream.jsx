export default async function openMediaStream(cameraId) {
    console.log("open media stream");
    const constraints = {
        'video': {
            deviceId: cameraId || null,
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
        return stream
    } catch (err) {
        console.log("err acces local media stream", err)
    }
}