import { useRef, useEffect } from "react";


export default function MessagBox({ message, username, socket, setMessage, strangerUsername, strangerUserId }) {

    const scrollMessageDiv = useRef(null)

    useEffect(() => {
        scrollMessageDiv.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, [message])

    useEffect(() => {
        if (socket) {
            socket.on("private message", ({ content, from }) => {
                if (strangerUserId === from) {
                    setMessage(prevMessages => [...prevMessages, content]);
                }
            })
        }
    }, [strangerUserId])

    return (
        <div id="messageBox">
            {message.map((item, index) => (
                item ? (
                    <p className={item.username === username ? 'right' : 'left'} key={index}>
                        {item.username === username ? 'you' : strangerUsername}: {item.message}
                    </p>
                ) : null
            ))}
            <div ref={scrollMessageDiv}></div>
        </div>
    )
}