import { useState } from "react";
import ChangeNewUser from "./changeUser";

export default function InputBox({ socket, setMessage, strangerUserId, username }) {

    const [messageInputValue, setMessageInputValue] = useState('')

    function sendMessage(e) {
        e.preventDefault()
        socket.emit("private message", {
            content: {
                username: username,
                message: messageInputValue,
                userid: socket.id
            },
            to: strangerUserId
        })

        setMessage(prevMessages => [...prevMessages, {
            username: username,
            message: messageInputValue,
        }]);

        setMessageInputValue("")
    }

    return (
        <div id="sendMessageBtn">
            <ChangeNewUser />
            <form onSubmit={sendMessage} id="sendMassage">
                <input
                    type="text"
                    name="sendMessage"
                    id="sendMessageBox"
                    value={messageInputValue}
                    onChange={(e) => setMessageInputValue(e.target.value)} />
                <input type="submit" value="Send" id="sendMessageBtn" />
            </form>
        </div>
    )
}