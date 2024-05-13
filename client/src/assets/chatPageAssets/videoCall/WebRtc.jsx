import React, { useEffect, useRef, useState } from "react"
import CreateOffetBtn from "./createOfferBtn"
import LocalVideo from "./localVideo"
import RemoteVideo from "./remoteVideo"

export default function VideoCall({ socket }) {

    const localVideo = useRef(null)
    const remoteVideo = useRef(null)

    const [peerConnection, setPeerConnection] = useState(null)

    useEffect(() => {
        const configuration = { 'iceServers': [{ 'urls': 'stun:stun.l.google.com:19302' }] }
        setPeerConnection(new RTCPeerConnection(configuration))
    }, [])

    useEffect(() => {
        if (peerConnection) {
            peerConnection.addEventListener('connectionstatechange', event => {
                if (peerConnection.connectionState === 'connected') {
                    console.log("peer connected")
                }
            })
        }
    }, [peerConnection])

    useEffect(() => {

        async function handelIce(ice) {
            try {
                await peerConnection.addIceCandidate(ice)
            } catch (e) {
                console.error('Error adding received ice candidate', e)
            }
        }

        if (socket) {
            socket.on("new-ice-candidate", handelIce)
        }

        if (peerConnection) {
            peerConnection.addEventListener('icecandidate', event => {
                if (event.candidate) {
                    socket.emit("new-ice-candidate", event.candidate)
                }
            })
        }

    }, [peerConnection])


    return (
        <div id="videoCall">
            <LocalVideo localVideo={localVideo} pc={peerConnection} />
            <RemoteVideo remoteVideo={remoteVideo} socket={socket} pc={peerConnection} />
            <br />
            <CreateOffetBtn socket={socket} pc={peerConnection} />
        </div>
    )
}

