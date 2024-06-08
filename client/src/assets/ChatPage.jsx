import { useEffect, useState, useRef } from 'react'
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import LocalVideo from './chatPageAssets/videoCall/localVideo';
import RemoteVideo from './chatPageAssets/videoCall/remoteVideo';
import MessagBox from './chatPageAssets/messaging/messageBox';
import InputBox from './chatPageAssets/messaging/inputBox';

export default function ChatPage({ username }) {

    const [socket, setSocket] = useState(null)
    const [message, setMessage] = useState([])
    const [strangerUserId, setStrangerUserId] = useState('')
    const [strangerUsername, setStrangerUsername] = useState(null)
    const [peerConnection, setPeerConnection] = useState(null)
    const [sendPeerRequest, setSendPeerRequest] = useState(null)
    const localVideo = useRef(null)
    const remoteVideo = useRef(null)
    const nav = useNavigate()

    useEffect(() => {
        if (username) {
            setSocket(io('http://localhost:3000', {
                transports: ['websocket'],
                auth: {
                    username: username
                }
            }))
        }

        if (!username) {
            nav('/')
        }
    }, [username])

    useEffect(() => {
        if (socket) {

            socket.emit('connectWithStranger', username)

            socket.on('exchangingPairInfo', v => {
                if (strangerUserId.length === 0) {
                    console.log('Received Stranger SocketId', v)
                    setStrangerUserId(v.key.userid)
                    setStrangerUsername(v.key.username)
                    setSendPeerRequest(v.key.sendPeerRequest)
                }
            })

            socket.on('userLeftTheChat', (v) => {
                setStrangerUsername('')
                setStrangerUserId('')
                setMessage([])
                console.log(v, 'left the chat, conneting with other user')
                socket.emit('connectWithStranger', username)
            })

            socket.on('waiting', v => {
                console.log("wating for user")
            })

            return () => {
                socket.off('exchangingPairInfo')
                socket.off('userLeftTheChat')
                socket.off('waiting')
                socket.disconnect()
                localStorage.removeItem('socketId')
            }
        }
    }, [socket])

    // video call setup

    useEffect(() => {
        if (sendPeerRequest !== null) {
            console.log("sendPeerRequest: ", sendPeerRequest);
            const configuration = { 'iceServers': [{ 'urls': 'stun:stun.l.google.com:19302' }] }
            setPeerConnection(new RTCPeerConnection(configuration))
        }
    }, [sendPeerRequest])

    useEffect(() => {
        if (peerConnection) {
            peerConnection.addEventListener('icecandidate', event => {
                if (event.candidate) {
                    socket.emit("new-ice-candidate", {
                        icecandidate: event.candidate,
                        to: strangerUserId
                    })
                    console.log("send ice")
                }
            })
        }

        async function handelIceCandidate(message) {
            if (message) {
                try {
                    await peerConnection.addIceCandidate(message)
                    console.log("Recived ice")
                } catch (e) {
                    console.error('Error adding received ice candidate', e)
                }
            }
        }

        socket && socket.on("new-ice-candidate", message => handelIceCandidate(message))
    }, [peerConnection])


    return (

        <div id='chatPage'>
            <div id='videoCall'>
                <LocalVideo
                    localVideo={localVideo}
                    socket={socket}
                    peerConnection={peerConnection}
                    strangerUserId={strangerUserId}
                    sendPeerRequest={sendPeerRequest}
                />
                <RemoteVideo
                    remoteVideo={remoteVideo}
                    socket={socket}
                    peerConnection={peerConnection}
                    strangerUserId={strangerUserId}
                />
            </div>
            <div id='messaging'>
                <h1>{username} connected to {strangerUsername}</h1>
                <MessagBox
                    message={message}
                    username={username}
                    socket={socket}
                    setMessage={setMessage}
                    strangerUsername={strangerUsername}
                    strangerUserId={strangerUserId}
                />
                <InputBox
                    socket={socket}
                    setMessage={setMessage}
                    strangerUserId={strangerUserId}
                    username={username}
                    strangerUsername={strangerUsername}
                />
            </div>
        </div>
    )
}
























// // scroll the page when new meassage added
// useEffect(() => {
//     scrollMessageDiv.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
// }, [message])

// function sendMessage(e) {
//     e.preventDefault()

//     socket.emit('private message', {
//         content: {
//             username: username,
//             message: e.target[0].value,
//             userid: socket.id
//         },
//         to: strangerUserId
//     })

//     setMessage(prevMessages => [...prevMessages, {
//         username: username,
//         message: e.target[0].value,
//     }]);

//     setMessageInputValue('')
// }

// return (
//     <div id='chatbox'>

//         <div id='chatConatainer'>
//             {message.map((item, index) => (
//                 <p className={item.username === username ? 'right' : 'left'} key={index}>
//                     {item.username === username ? 'you' : strangerUsername}: {item.message}
//                 </p>
//             ))}
//             <div ref={scrollMessageDiv}></div>
//         </div>
//         <form onSubmit={sendMessage} id='sendMassage'>
//             <input
//                 type='text'
//                 name='sendMessage'
//                 id='sendMessageBox'
//                 value={messageInputValue} onChange={(e) => setMessageInputValue(e.target.value)} />
//             <input type='submit' value='send' id='sendMessageBtn' />
//         </form>
//     </div>
// )