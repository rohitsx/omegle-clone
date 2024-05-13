import React, { useEffect } from "react";

export default function ConnectToStranger({ socket, setStrangerUserId, strangerUserId }) {

    // const [message, setMessage] = useState([])
    // const [strangerUserId, setStrangerUserId] = useState("")
    // const [strangerUsername, setStrangerUsername] = useState("")
    // const [messageInputValue, setMessageInputValue] = useState("")
    // const scrollMessageDiv = useRef()


    useEffect(() => {
        if (socket) {
            socket.on("exchanging pair info", v => {
                        if (strangerUserId.length === 0) {
                            console.log("Received Stranger SocketId", v)
                            setStrangerUserId(v.userid)
                            setStrangerUsername(v.username)
                        }
                    })
            }
    }, [socket])

    // //handel exchanging pair info and private messages
    // useEffect(() => {

    //     socket.on("waiting", v => console.log(v))

    //     socket.on("exchanging pair info", v => {
    //         if (strangerUserId.length === 0) {
    //             console.log("Received Stranger SocketId", v)
    //             setStrangerUserId(v.userid)
    //             setStrangerUsername(v.username)
    //         }
    //     })

    //     socket.on("private message", ({ content, from }) => {
    //         if (strangerUserId === from) {
    //             setMessage(prevMessages => [...prevMessages, content]);
    //         }
    //     });

    //     socket.on("user left the chat", (v) => {
    //         setStrangerUsername("")
    //         setStrangerUserId("")
    //         setMessage([])
    //         setMessageInputValue("")
    //         console.log(v, "left the chat, conneting with other user")
    //         socket.emit("connect with stranger", username)
    //     })

    //     return () => {
    //         socket.off("waiting")
    //         socket.off("exchanging pair info")
    //         socket.off("private message")
    //         socket.off("user left the chat")
    //     };

    // }, [socket])
}