import { useEffect, useState, useRef } from "react"
import WebRTC from "./videoCall/WebRTC"

export default function ChatPage({ username, socket }) {

    const [message, setMessage] = useState([])
    const [curentUsername, setCurrentUername] = useState([])
    const scrollMessageDiv = useRef()

    useEffect(() => {
        socket.on("userMassage", (v) => {
            console.log("v is ", message)
            setMessage(prevMessages => [...prevMessages, v])
            console.log("f is ", message)
        })


    }, [socket])

    useEffect(() =>{
        scrollMessageDiv.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, [message])



    const sendMessage = (e) => {
        e.preventDefault()
        socket.emit("message", {
            username: username,
            message: e.target[0].value,
            time: new Date(),
        })
    }

    return (
        <>
            <div id="videoAndCatContainer">
                <WebRTC socket={socket} />
                <div id="chatbox">
                    <h3 id="sendMessageHeading">Send Message</h3>
                    <div id="chatConatainer">
                        {message.map((item, index) => (
                            <p className={item.username === username ? "right" : "left"} key={index}>{item.username === username ? "you" : "stranger"}: {item.message}</p>
                        ))}
                        <div ref={scrollMessageDiv}></div>
                    </div>
                    <form onSubmit={sendMessage} id="sendMassage">
                        <input type="text" name="sendMessage" id="sendMessageBox" />
                        <input type="submit" value="send" id="sendMessageBtn" />
                    </form>
                </div>
            </div>
        </>
    )
}