export default function SendMessageBtn({ socket, setMessage }) {

    function sendMessage(e) {
        e.preventDefault()

        const username = localStorage.getItem("username")

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
        <div id="sendMessageBtn">
            <form onSubmit={sendMessage} id="sendMassage">
                <input
                    type="text"
                    name="sendMessage"
                    id="sendMessageBox"
                    value={messageInputValue} onChange={(e) => setMessageInputValue(e.target.value)} />
                <input type="submit" value="send" id="sendMessageBtn" />
            </form>
        </div>
    )
}