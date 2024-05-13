import { useEffect, useState, useRef } from "react"
import { io } from "socket.io-client";
import MessagBox from "./chatPageAssets/messaging/messageBox";
import SendMessageBtn from "./chatPageAssets/messaging/sendMessagBtn";
import { useNavigate } from "react-router-dom";


export default function ChatPage() {

    const [socket, setSocket] = useState(null)
    const [message, setMessage] = useState([null])
    const [username, setUsername] = useState(null)
    const [strangerUserId, setStrangerUserId] = useState('')
    const [strangerUsername, setStrangerUsername] = useState(null)
    const nav = useNavigate()

    useEffect(() => {
        setUsername(localStorage.getItem("username"))

        if (localStorage.getItem("username")) {
            setSocket(io("http://localhost:3000", {
                transports: ['websocket'],
                auth: {
                    username: localStorage.getItem("username")
                }
            }))
        }

        if (!localStorage.getItem("username")) {
            nav('/')
        }
    }, [])

    useEffect(() => {
        if (socket) {

            socket.emit("connect with stranger")

            socket.on("exchanging pair info", v => {
                if (strangerUserId.length === 0) {
                    console.log("Received Stranger SocketId", v)
                    setStrangerUserId(v.userid)
                    setStrangerUsername(v.username)
                }
            })

            socket.on("user left the chat", (v) => {
                setStrangerUsername("")
                setStrangerUserId("")
                setMessage([])
                console.log(v, "left the chat, conneting with other user")
                socket.emit("connect with stranger", username)
            })

            socket.on("waiting", v => console.log(v))
        }
    }, [socket])

    useEffect(() => {
        window.addEventListener("beforeunload", e => {
            localStorage.removeItem("username")
            socket.emit("disconnect")
        })
    }, [])

    // // scroll the page when new meassage added
    // useEffect(() => {
    //     scrollMessageDiv.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // }, [message])

    // function sendMessage(e) {
    //     e.preventDefault()

    //     socket.emit("private message", {
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

    //     setMessageInputValue("")
    // }

    // return (
    //     <div id="chatbox">

    //         <div id="chatConatainer">
    //             {message.map((item, index) => (
    //                 <p className={item.username === username ? "right" : "left"} key={index}>
    //                     {item.username === username ? "you" : strangerUsername}: {item.message}
    //                 </p>
    //             ))}
    //             <div ref={scrollMessageDiv}></div>
    //         </div>
    //         <form onSubmit={sendMessage} id="sendMassage">
    //             <input
    //                 type="text"
    //                 name="sendMessage"
    //                 id="sendMessageBox"
    //                 value={messageInputValue} onChange={(e) => setMessageInputValue(e.target.value)} />
    //             <input type="submit" value="send" id="sendMessageBtn" />
    //         </form>
    //     </div>
    // )

    return (
        <div id="chatPage">
            <div id="videoCall">
                <h1>{localStorage.getItem("username")}</h1>
            </div>
            <div id="messaging">

            </div>
        </div>
    )
}