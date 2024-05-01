import { useState } from "react"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import SingUp from "./assets/SingUp"
import ChatPage from "./assets/chatArea/ChatPage"
import { io } from "socket.io-client";

const socket = io("http://localhost:3000", { transports: ['websocket'] });

function App() {
  const [username, setUsername] = useState('')

  const router = createBrowserRouter([{
    path: '/',
    element: <SingUp setUsername={setUsername} socket={socket} />,
  }, {
    path: '/chat',
    element: <ChatPage username={username} socket={socket} />
  }])

  return <RouterProvider router={router} />
}

export default App
