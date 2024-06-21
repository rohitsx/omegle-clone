import { useState, useRef } from 'react'
import LocalVideo from '../assets/videoCall/localVideo';
import RemoteVideo from '../assets/videoCall/remoteVideo';
import MessagBox from '../assets/messaging/messageBox';
import InputBox from '../assets/messaging/inputBox';
import useSocket from '../hooks/useSocket';
import usePeerConnection from '../hooks/usePeerConnection';
import initiatePeerConnection from '../hooks/initiatePeerConnection';
import ConnectionStatusBar from '../assets/messaging/connectionStatusBar';

export default function ChatPage({ username, setUsername, updateUser, setUpdateUser }) {

    const [message, setMessage] = useState([])
    const localVideo = useRef(null)
    const remoteVideo = useRef(null)

    const { socket, strangerUserId, strangerUsername, sendPeerRequest, connectionStatus } = useSocket(username, remoteVideo.current, setMessage, updateUser)
    const peerConnection = usePeerConnection(socket, strangerUserId)

    initiatePeerConnection(socket, peerConnection, sendPeerRequest, strangerUserId)

    return (

        <div id='chatPage'>
            <div id='videoCall'>
                <LocalVideo
                    localVideo={localVideo}
                    peerConnection={peerConnection}
                />
                <RemoteVideo
                    remoteVideo={remoteVideo}
                    peerConnection={peerConnection}
                />
            </div>
            <div id='messaging'>
                <ConnectionStatusBar strangerUsername={strangerUsername} />
                <MessagBox
                    message={message}
                    username={username}
                    socket={socket}
                    setMessage={setMessage}
                    strangerUsername={strangerUsername}
                    strangerUserId={strangerUserId}
                    connectionStatus={connectionStatus}
                />
                <InputBox
                    socket={socket}
                    setMessage={setMessage}
                    setUsername={setUsername}
                    setUpdateUser={setUpdateUser}
                    strangerUserId={strangerUserId}
                    username={username}
                    strangerUsername={strangerUsername}
                />
            </div>
        </div>
    )
}