import { useEffect, useRef, useState } from "react"
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';

export default function useSocket(username, remoteVideo, setMessage, updateUser) {
    const [socket, setSocket] = useState(null)
    const [strangerUserId, setStrangerUserId] = useState('')
    const [strangerUsername, setStrangerUsername] = useState(null)
    const [sendPeerRequest, setSendPeerRequest] = useState(null)
    const [connectionStatus, setConnectionStatus] = useState(false)
    const nav = useNavigate()
    const canComponetMount = useRef(true)

    useEffect(() => {
        if (username) {
            const newSocket = io('http://localhost:3000', {   //import.meta.env.VITE_APP_WEBSOCKET_URL || 'http://localhost:3000'
                transports: ['websocket'],
                auth: { username: username }
            });
            setSocket(newSocket);
            console.log("new socket created");
        }

        if (updateUser > 0) {
            pairedUserLeftTheChat()
        }

        !username && nav('/')

    }, [username, updateUser])

    async function pairedUserLeftTheChat() {
        await socket.emit("pairedUserLeftTheChat", {
            'to': strangerUserId,
            'sendPeerRequest': sendPeerRequest
        })
        clearStates(null)
    }

    function exchangingPairInfo(v) {
        if (strangerUserId.length === 0) {
            console.log('Received Stranger (' + v.strangerUsername + ') SocketId')
            setConnectionStatus(true)
            setStrangerUserId(v.pairedUserId)
            setStrangerUsername(v.strangerUsername)
            setSendPeerRequest(v.sendPeerRequest)
        }
    }
    function clearStates(v) {
        setStrangerUsername(null)
        setStrangerUserId('')
        setMessage([])
        setSendPeerRequest(null)
        setConnectionStatus(false)
        remoteVideo.srcObject = null
        canComponetMount.current = false
        
    }
    function userLeftTheChat(v) {
        clearStates(v)
        socket.emit('connectWithStranger')
        console.log('stanger left the chat, connectwithStranger emitted')
    }

    useEffect(() => {
        if (socket) {
            console.log("useEffect for socket working");
            socket.emit('connectWithStranger')
            socket.on('exchangingPairInfo', exchangingPairInfo)
            socket.on('userLeftTheChat', userLeftTheChat)
            socket.on('waiting', v => console.log("wating for user"))
            socket.on("connect", () => console.log("connected"));

            return () => {
                socket.off('exchangingPairInfo')
                socket.off('userLeftTheChat')
                socket.off('waiting')
            }
        }
    }, [socket])

    useEffect(() => {

        if (socket && !strangerUsername) {
            window.addEventListener('beforeunload', () => {

                socket.emit("soloUserLeftTheChat")
            })
            return () => {
                socket.emit("soloUserLeftTheChat")
                console.log("soloUserLeftTheChat emitted from clean up function");
            }
        }

        if (strangerUsername) {
            window.addEventListener('beforeunload', () => {
                canComponetMount.current = false
                pairedUserLeftTheChat()
            })
            return () => {
                if (canComponetMount.current && strangerUserId.length > 2) {
                    pairedUserLeftTheChat()
                    console.log("componet is umountes");
                    console.log("pairedUserLeftTheChat emitted from clean up function");
                }
            }
        }
    }, [socket, strangerUsername])

    return { socket, strangerUserId, strangerUsername, sendPeerRequest, connectionStatus };
}












// import { useEffect, useState } from "react";
// import { io } from 'socket.io-client';
// import { useNavigate } from 'react-router-dom';

// export default function useSocket(username, remoteVideo, setMessage, updateUser) {
//     const [socket, setSocket] = useState(null);
//     const [strangerUserId, setStrangerUserId] = useState('');
//     const [strangerUsername, setStrangerUsername] = useState(null);
//     const [sendPeerRequest, setSendPeerRequest] = useState(null);
//     const [connectionStatus, setConnectionStatus] = useState(false);
//     const nav = useNavigate();

//     useEffect(() => {
//         if (username) {
//             const newSocket = io('http://localhost:3000', {   // import.meta.env.VITE_APP_WEBSOCKET_URL || 'http://localhost:3000'
//                 transports: ['websocket'],
//                 auth: { username: username }
//             });
//             setSocket(newSocket);
//             console.log("Socket set", newSocket.id);
//         } else {
//             nav('/');
//         }

//         if (updateUser > 0 && socket) {
//             socket.emit("pairedUserLeftTheChat", {
//                 'to': strangerUserId,
//                 'sendPeerRequest': sendPeerRequest
//             });
//             clearStates(null);
//         }

//         return () => {
//             if (socket) {
//                 socket.off('exchangingPairInfo', exchangingPairInfo);
//                 socket.off('userLeftTheChat', userLeftTheChat);
//                 socket.off('waiting');
//                 socket.disconnect();
//                 localStorage.removeItem('socketId');
//             }
//         };
//     }, [username, updateUser]);

//     function exchangingPairInfo(v) {
//         if (strangerUserId.length === 0) {
//             console.log('Received Stranger SocketId', v);
//             setConnectionStatus(true);
//             setStrangerUserId(v.pairedUserId);
//             setStrangerUsername(v.strangerUsername);
//             setSendPeerRequest(v.sendPeerRequest);
//         }
//     }

//     function clearStates(v) {
//         setStrangerUsername(null);
//         setStrangerUserId('');
//         setMessage([]);
//         setSendPeerRequest(null);
//         console.log(v, 'left the chat, connecting with another user');
//         setConnectionStatus(false);
//         remoteVideo.srcObject = null;
//     }

//     function userLeftTheChat(v) {
//         clearStates(v);
//         socket.emit('connectWithStranger');
//     }

//     useEffect(() => {
//         if (socket) {
//             socket.emit('connectWithStranger');
//             socket.on('exchangingPairInfo', exchangingPairInfo);
//             socket.on('userLeftTheChat', userLeftTheChat);
//             socket.on('waiting', v => console.log("Waiting for user"));
//             socket.on("connect", () => console.log("Connected"));

//             return () => {
//                 socket.off('exchangingPairInfo', exchangingPairInfo);
//                 socket.off('userLeftTheChat', userLeftTheChat);
//                 socket.off('waiting');
//                 localStorage.removeItem('socketId');
//             };
//         }
//     }, [socket]);

//     useEffect(() => {
//         console.log("Stranger username", strangerUsername);
//     }, [strangerUsername]);

//     useEffect(() => {
//         const pairedUserLeftTheChat = async () => {
//             if (socket) {
//                 await socket.emit("pairedUserLeftTheChat", {
//                     'to': strangerUserId,
//                     'sendPeerRequest': sendPeerRequest
//                 });
//                 await clearStates();
//             }
//         };

//         const handleBeforeUnload = () => {
//             if (socket) {
//                 socket.emit("soloUserLeftTheChat");
//             }
//         };

//         window.addEventListener('beforeunload', handleBeforeUnload);

//         if (strangerUsername) {
//             return () => {
//                 pairedUserLeftTheChat();
//                 console.log("Cleared states");
//                 window.removeEventListener('beforeunload', handleBeforeUnload);
//             };
//         } else {
//             return () => {
//                 if (socket) {
//                     socket.emit("soloUserLeftTheChat");
//                     window.removeEventListener('beforeunload', handleBeforeUnload);
//                 }
//             };
//         }
//     }, [socket, strangerUsername]);

//     return { socket, strangerUserId, strangerUsername, sendPeerRequest, connectionStatus };
// }

