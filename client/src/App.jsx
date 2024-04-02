import { useState } from "react"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import SingUp from "./assets/SingUp"
import ChatPage from "./assets/ChatPage"
import { io } from "socket.io-client";
import WebRTC from "./assets/WebRTC";

const socket = io("http://localhost:3000", { transports : ['websocket'] });

function App() {
  const [username, setUsername] = useState('')

  const router = createBrowserRouter([{
    path: '/',
    element: <SingUp setUsername={setUsername}/>,
  }, {
    path: '/chat',
    element: <ChatPage username={username} socket={socket}/>
  },{
    path: '/call',
    element: <WebRTC socket={socket} />
  }

])

  return  <RouterProvider router={router} />
}

export default App
