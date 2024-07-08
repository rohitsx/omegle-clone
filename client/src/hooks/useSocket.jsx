import { useEffect, useRef, useState } from "react"
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import usePeerConnection from "./usePeerConnection";

export default function useSocket(username, remoteVideo, setMessage, updateUser, peerConnection, setPeerConnection) {
    const [socket, setSocket] = useState(null)
    const [strangerUserId, setStrangerUserId] = useState('')
    const [strangerUsername, setStrangerUsername] = useState(null)
    const [sendPeerRequest, setSendPeerRequest] = useState(null)
    const [connectionStatus, setConnectionStatus] = useState(false)
    const nav = useNavigate()
    const canComponetMount = useRef(true)

    useEffect(() => {
        if (username) {
            const newSocket = io('http://localhost:3000', {
                transports: ['websocket'],
                auth: { username: username }
            });
            setSocket(newSocket);
        }

        !username && nav('/')

    }, [username])

    async function pairedUserLeftTheChat() {
        await socket.emit("pairedUserLeftTheChat", {
            'to': strangerUserId,
            'sendPeerRequest': sendPeerRequest
        })
        clearStates()
    }

    function exchangingPairInfo(v) {
        if (strangerUserId.length === 0) {
            console.log(v.strangerUsername, 'connected')
            setConnectionStatus(true)
            setStrangerUserId(v.pairedUserId)
            setStrangerUsername(v.strangerUsername)
            setSendPeerRequest(v.sendPeerRequest)
        }
    }
    function clearStates() {
        setStrangerUsername(null)
        setStrangerUserId('')
        setMessage([])
        setSendPeerRequest(null)
        setConnectionStatus(false)
        remoteVideo.srcObject = null
        canComponetMount.current = false
        console.log('clearing states');

        if (peerConnection) return
        setPeerConnection(null)
        usePeerConnection(socket, strangerUserId, setPeerConnection, peerConnection)


    }
    function userLeftTheChat() {
        clearStates()
        socket.emit('connectWithStranger')
        console.log('stanger left the chat, connectwithStranger emitted')
    }

    useEffect(() => {
        if (socket) {
            socket.emit('connectWithStranger')
            socket.on('exchangingPairInfo', exchangingPairInfo)
            socket.on('userLeftTheChat', userLeftTheChat)
            socket.on('waiting', v => console.log("wating for user"))

            return () => {
                socket.off('exchangingPairInfo')
                socket.off('userLeftTheChat')
                socket.off('waiting')
            }
        }
    }, [socket])

    useEffect(() => {
        if (updateUser > 0) {
            if (strangerUsername) {
                socket.emit('connectWithStranger')
                pairedUserLeftTheChat()
            }
        }
    }, [updateUser])



    useEffect(() => {

        if (socket && !strangerUsername) {
            window.addEventListener('beforeunload', () => {

                !strangerUsername && socket.emit("soloUserLeftTheChat")

            })
            return () => {
                if (strangerUsername) {
                    socket.emit("soloUserLeftTheChat")
                    console.log("soloUserLeftTheChat emitted from clean up function");
                }
            }
        }

        if (strangerUsername) {
            window.addEventListener('beforeunload', () => {
                canComponetMount.current = false
                pairedUserLeftTheChat()
            })
            return () => {
                if (canComponetMount.current && strangerUsername) {
                    pairedUserLeftTheChat()
                    console.log("pairedUserLeftTheChat emitted from clean up function");
                }
            }
        }
    }, [socket, strangerUsername])

    return { socket, strangerUserId, strangerUsername, sendPeerRequest, connectionStatus };
}








