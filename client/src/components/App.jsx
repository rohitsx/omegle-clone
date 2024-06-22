import { useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import SingUp from "./SingUp";
import ChatPage from "./ChatPage";


function App() {

  const [username, setUsername] = useState(null)
  const [updateUser, setUpdateUser] = useState(0)

  const router = createBrowserRouter([
    {
      path: '/',
      element: <SingUp setUsername={setUsername} />,
    },
    {
      path: '/chat',
      element: <ChatPage 
      username ={username} 
      setUsername={setUsername}  
      updateUser={updateUser}
      setUpdateUser={setUpdateUser}
      />
    }
  ]);

  return <createBrowserRouter router={router} />;
}

export default App;
