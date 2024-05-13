import { useState, useEffect } from "react";
import { createBrowserRouter, RouterProvider, useBeforeUnload } from "react-router-dom";
import SingUp from "./assets/SingUp";
import ChatPage from "./assets/ChatPage";


function App() {

  const router = createBrowserRouter([
    {
      path: '/',
      element: <SingUp />,
    },
    {
      path: '/chat',
      element: <ChatPage username={localStorage.getItem("username")} />
    }
  ]);

  return <RouterProvider router={router} />;
}

export default App;
