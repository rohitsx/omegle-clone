import { useEffect, useState } from "react"
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';

export default function useSocket(username, remoteVideo, setMessage, updateUser) {
    const [socket, setSocket] = useState(null)
    const [strangerUserId, setStrangerUserId] = useState('')
    const [strangerUsername, setStrangerUsername] = useState(null)
    const [sendPeerRequest, setSendPeerRequest] = useState(null)
    const [connectionStatus, setConnectionStatus] = useState(false)
    const nav = useNavigate()

    useEffect(() => {
        if (username) {
            const newSocket = io( import.meta.env.WEBSOCKET_URL || 'http://localhost:3000', {
                transports: ['websocket'],
                auth: { username: username }
            });
            setSocket(newSocket);
            console.log("socket set", newSocket.id);
        }

        if (updateUser > 0) {
            socket.emit("piredUserLeftTheChat", {
                'to': strangerUserId,
                'sendPeerRequest': sendPeerRequest
            })
            clearStates(null)
        }

        !username && nav('/')

    }, [username, updateUser])

    function exchangingPairInfo(v) {
        if (strangerUserId.length === 0) {
            console.log('Received Stranger SocketId', v)
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
        console.log(v, 'left the chat, conneting with other user')
        setConnectionStatus(false)
        remoteVideo.srcObject = null
    }
    function userLeftTheChat(v) {
        clearStates(v)
        socket.emit('connectWithStranger')
    }

    useEffect(() => {
        if (socket) {

            socket.emit('connectWithStranger')
            socket.on('exchangingPairInfo', exchangingPairInfo)
            socket.on('userLeftTheChat', userLeftTheChat)
            socket.on('waiting', v => console.log("wating for user"))
            socket.on("connect", () => console.log("connected"));

            return () => {
                socket.off('exchangingPairInfo')
                socket.off('userLeftTheChat')
                socket.off('waiting')
                socket.disconnect()
                localStorage.removeItem('socketId')
            }
        }
    }, [socket])

    useEffect(() => {
        if (socket && !strangerUsername) {
            window.addEventListener('beforeunload', () => {
                socket.emit("soloUserLeftTheChat")
            })
        }
    }, [socket])

    useEffect(() => {
        if (strangerUsername) {
            window.addEventListener('beforeunload', () => {
                socket.emit("piredUserLeftTheChat", {
                    'to': strangerUserId,
                    'sendPeerRequest': sendPeerRequest
                }
                )
            })
        }
    }, [strangerUsername])

    return { socket, strangerUserId, strangerUsername, sendPeerRequest, connectionStatus };
}
