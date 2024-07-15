export default function setPcInstance() {
    const configuration = { 'iceServers': [{ 'urls': 'stun:stun.l.google.com:19302' }] }
    const pcInstance = new RTCPeerConnection(configuration)
    return pcInstance
}