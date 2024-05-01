import { useEffect, useState, useRef } from "react"
import WebRTC from "./videoCall/WebRTC"

export default function ChatPage({ username, socket }) {

    const [message, setMessage] = useState([])
    const [strangerUserId, setStrangerUserId] = useState("")
    const [strangerUsername, setStrangerUsername] = useState("")
    const [messageInputValue, setMessageInputValue] = useState("");
    const scrollMessageDiv = useRef()


    //handel exchanging pair info and private messages
    useEffect(() => {

        socket.on("waiting", v => console.log(v))

        socket.on("exchanging pair info", v => {
            if (strangerUserId.length === 0) {
                console.log("Received Stranger SocketId", v)
                setStrangerUserId(v.userid)
                setStrangerUsername(v.username)
            }
        })

        socket.on("private message", ({ content, from }) => {
            if (strangerUserId === from) {
                setMessage(prevMessages => [...prevMessages, content]);
            }
        });

        socket.on("user left the chat", (v) => {
            setStrangerUsername("")
            setStrangerUserId("")
            setMessage([])
            setMessageInputValue("")
            console.log(v, "left the chat, conneting with other user")
            socket.emit("connect with stranger", username)
        })

        return () => {
            socket.off("waiting")
            socket.off("exchanging pair info")
            socket.off("private message")
            socket.off("user left the chat")
        };

    }, [socket, strangerUserId])


    // scroll the page when new meassage added
    useEffect(() => {
        scrollMessageDiv.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, [message])


    function sendMessage(e) {
        e.preventDefault()

        socket.emit("private message", {
            content: {
                username: username,
                message: e.target[0].value,
                userid: socket.id
            },
            to: strangerUserId
        })

        setMessage(prevMessages => [...prevMessages, {
            username: username,
            message: e.target[0].value,
        }]);

        setMessageInputValue("")
    }

    return (
        <>
            <div id="videoAndCatContainer">
                <WebRTC socket={socket} />
                <div id="chatbox">
                    <h3 id="sendMessageHeading">Send Message</h3>
                    <div id="chatConatainer">
                        {message.map((item, index) => (
                            <p className={item.username === username ? "right" : "left"} key={index}>
                                {item.username === username ? "you" : strangerUsername}: {item.message}
                            </p>
                        ))}
                        <div ref={scrollMessageDiv}></div>
                    </div>
                    <form onSubmit={sendMessage} id="sendMassage">
                        <input
                            type="text"
                            name="sendMessage"
                            id="sendMessageBox"
                            value={messageInputValue} onChange={(e) => setMessageInputValue(e.target.value)} />
                        <input type="submit" value="send" id="sendMessageBtn" />
                    </form>
                </div>
            </div>
        </>
    )
}