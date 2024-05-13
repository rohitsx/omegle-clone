import { useRef, useEffect } from "react";


export default function MessagBox({message}) {

    const scrollMessageDiv = useRef(null)

    useEffect(() => {
        scrollMessageDiv.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, [message])

    return (
        <div id="messageBox">
            {message.map((item, index) => (
                <p className={item.username === localStorage.getItem("username") ? "right" : "left"} key={index}>
                    {item.username === localStorage.getItem("username") ? "you" : strangerUsername}: {item.message}
                </p>
            ))}
            <div ref={scrollMessageDiv}></div>
        </div>
    )
}