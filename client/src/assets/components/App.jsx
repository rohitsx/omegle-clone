import { useState, useEffect } from "react";
import { createBrowserRouter, RouterProvider, useBeforeUnload } from "react-router-dom";
import SingUp from "../SingUp";
import ChatPage from "../ChatPage";


function App() {

  const [username, setUsername] = useState(null)

  const router = createBrowserRouter([
    {
      path: '/',
      element: <SingUp setUsername={setUsername} />,
    },
    {
      path: '/chat',
      element: <ChatPage username ={username} />
    }
  ]);

  return <RouterProvider router={router} />;
}

export default App;
