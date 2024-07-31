import { useRef, useEffect } from "react";


export default function MessagBox({ message, username, socket, setMessage, strangerUsername, strangerUserId, connectionStatus }) {

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

            return () => {
                socket.removeAllListeners("private message")
            }
        }
    }, [strangerUserId])

    return (
        <div id="messageBox">
            {(connectionStatus !== null && message.length === 0) && (
                <div id="overlayStatus">
                    {connectionStatus ? (
                        <p>{username} is connected with {strangerUsername}</p>
                    ) : (
                        <p>Looking For Stranger...</p>
                    )}
                </div>
            )}
            {message.map((item, index) => (
                item ? (
                    <div className={item.username === username ? 'right' : 'left'} key={index}>
                        {item.message}
                    </div>
                ) : null
            ))}
            <div ref={scrollMessageDiv}></div>
        </div>
    )
}