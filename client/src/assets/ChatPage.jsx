import { useEffect, useState, useRef } from 'react'
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import MessagBox from './chatPageAssets/messaging/messageBox';
import SendMessageBtn from './chatPageAssets/messaging/sendMessagBtn';
import LocalVideo from './chatPageAssets/videoCall/localVideo';
import RemoteVideo from './chatPageAssets/videoCall/remoteVideo';
import CreateOffetBtn from './chatPageAssets/videoCall/startCamBtn';
import KillMediaStream from './chatPageAssets/videoCall/turnoffCamBtn';

export default function ChatPage({ username }) {

    const [socket, setSocket] = useState(null)
    const [message, setMessage] = useState([null])
    const [strangerUserId, setStrangerUserId] = useState('')
    const [strangerUsername, setStrangerUsername] = useState(null)
    const [peerConnection, setPeerConnection] = useState(null)
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
                    setStrangerUserId(v.userid)
                    setStrangerUsername(v.username)
                }
            })

            socket.on('userLeftTheChat', (v) => {
                setStrangerUsername('')
                setStrangerUserId('')
                setMessage([])
                console.log(v, 'left the chat, conneting with other user')
                socket.emit('connectWithStranger', username)
            })

            socket.on('waiting', v => console.log(v))

            return () => {
                socket.off('exchangingPairInfo')
                socket.off('userLeftTheChat')
                socket.off('waiting')
                socket.disconnect()

            }
        }
    }, [socket])

    // video call setup

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
        if (peerConnection && strangerUserId) {
            peerConnection.addEventListener('icecandidate', event => {
                if (event.candidate) {
                    socket.emit("new-ice-candidate", {
                        icecandidate: event.candidate,
                        to: strangerUserId
                    })
                }
            })
        }

    }, [strangerUserId])

    useEffect(() => {
        if (peerConnection) {
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
        }
    }, [strangerUserId])

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

    return (

        <div id='chatPage'>
            <div id='videoCall'>
                <h1>{username} connected to {strangerUsername}</h1>
                <LocalVideo localVideo={localVideo} pc={peerConnection} />
                <RemoteVideo
                    remoteVideo={remoteVideo}
                    socket={socket}
                    pc={peerConnection}
                    strangerUserId={strangerUserId}
                />
                <CreateOffetBtn
                    socket={socket}
                    pc={peerConnection}
                    strangerUserId={strangerUserId}
                />
                <KillMediaStream localVideo={localVideo} />
            </div>
            <div id='messaging'>

            </div>
        </div>
    )
}