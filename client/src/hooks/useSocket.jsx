import { useEffect, useState } from "react"
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import setPcInstance from "../utils/pcInstance";

export default function useSocket(
    username, remoteVideo, setMessage, updateUser, peerConnection, setPeerConnection) {
    const [socket, setSocket] = useState(null)
    const [strangerUserId, setStrangerUserId] = useState('')
    const [strangerUsername, setStrangerUsername] = useState(null)
    const [sendPeerRequest, setSendPeerRequest] = useState(null)
    const [connectionStatus, setConnectionStatus] = useState(false)
    const [dummyStrangerUserId, setDummyStrangerUserId] = useState(null)
    const [removePair, setRemovePair] = useState(false)
    const nav = useNavigate()

    useEffect(() => {
        if (username) {
            const newSocket = io(import.meta.env.VITE_APP_WEBSOCKET_URL, {
                transports: ['websocket'],
                auth: { username: username }
            });
            setSocket(newSocket);

            return () => {
                newSocket.disconnect()
                setSocket(null)
            }
        }

        !username && nav('/')

    }, [username])

    useEffect(() => {
        if (socket && !strangerUsername) {
            socket.emit('startConnection')
            setRemovePair(true)
        }
    }, [socket, strangerUsername])


    useEffect(() => {
        if (socket) {
            socket.on('getStragerData', (data) => {
                setStrangerUserId(data.pairedUserId)
                setStrangerUsername(data.strangerUsername)
                setSendPeerRequest(data.sendPeerRequest)
                setConnectionStatus(true)
            })
            socket.on('strangerLeftTheChat', clearState)
            socket.on('errMakingPair', () => socket.emit('startConnection'))

            return () => {
                socket.off('getStragerData')
                socket.off('strangerLeftTheChat')
                if (strangerUsername === null) {
                    socket.emit("soloUserLeftTheChat")
                } else {
                    socket.emit("pairedUserLeftTheChat", strangerUserId)
                }
            }
        }
    }, [socket])

    function clearState() {
        setStrangerUserId('')
        setStrangerUsername(null)
        setConnectionStatus(false)
        remoteVideo.srcObject = null
        setMessage([])
    }

    useEffect(() => {
        if (updateUser > 0) {
            setDummyStrangerUserId(strangerUserId)
            clearState()
            if (peerConnection) peerConnection.close()
            const pcInstance = setPcInstance()
            setPeerConnection(pcInstance)

            return () => {
                setDummyStrangerUserId(null)
                pcInstance.close()
            }
        }
    }, [updateUser])

    useEffect(() => {
        if (removePair && dummyStrangerUserId) {
            socket.emit('pairedUserLeftTheChat', dummyStrangerUserId)
        }
    }, [removePair, dummyStrangerUserId])

    useEffect(() => {
        if (socket && !strangerUsername) {
            window.addEventListener('beforeunload', () => socket.emit("soloUserLeftTheChat"))
        } else {
            window.addEventListener('beforeunload', () => socket.emit("pairedUserLeftTheChat", strangerUserId))
        }
    }, [socket, strangerUsername])

    return { socket, strangerUserId, strangerUsername, sendPeerRequest, connectionStatus };
}








