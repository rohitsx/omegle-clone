import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { io } from "socket.io-client";

export default function SingUp({ setSocket }) {
  const naviagte = useNavigate()

  function usernameSubmit(e) {
    e.preventDefault()
    if (e.target[0].value) {
      localStorage.setItem("username", e.target[0].value)
      naviagte("/chat")
    } else {
      alert("You Forgot To Add Your Name")
    }
  }

  return (
    <div id="signupPage">
      <h1 id="OmegelCloneHeading">Omegel Clone</h1>
      <form onSubmit={usernameSubmit}>
        <input type="text" className="singupInputBox" placeholder='Enter Your Name' />
        <input type="submit" className="singupInputBox" id="signupSubmitBtn" value="Start Chat" />
      </form>
    </div>
  )
}