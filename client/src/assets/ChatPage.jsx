import { useEffect, useState } from "react"

export default function ChatPage({ username, socket }) {

    const [message, setMessage] = useState([])
    const [curentUsername, setCurrentUername] = useState([])

    useEffect(() => {
        socket.on("userMassage", (v) => {
            console.log("v is ", message)
            setMessage(prevMessages => [...prevMessages, v])
            console.log("f is ", message)
        })


    }, [socket])

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
            <h4>Send Message</h4>
            <div id="chatConatainer">
                {message.map((item, index) => (
                    <p className={item.username === username ? "right" : "left"} key={index}>{item.username === username ? "you" : "stranger"}: {item.message}</p>
                ))}
            </div>
            <form onSubmit={sendMessage}>
                <input type="text" name="sendMessage" id="sendMessage" />
                <input type="submit" value="send" />
            </form>
        </>
    )
}