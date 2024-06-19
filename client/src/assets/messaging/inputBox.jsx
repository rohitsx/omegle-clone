import { useState } from "react";
import ChangeNewUser from "./changeUser";

export default function InputBox({ socket, setMessage, strangerUserId, username, setUpdateUser }) {

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
            <ChangeNewUser setUpdateUser={setUpdateUser} />
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