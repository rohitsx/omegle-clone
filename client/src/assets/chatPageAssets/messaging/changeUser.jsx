export default function ChangeNewUser({ socket, setSocket, username }) {

    function getNewUser(e) {
        e.preventDefault()

        socket.disconnect()
        if (username) {
            setSocket(io('http://localhost:3000', {
                transports: ['websocket'],
                auth: {
                    username: username
                }
            }))
        }

        if (!username) {
            nav('/')
        }
    }

    return <button id="changeNewUser" onClick={getNewUser}>New</button>
}