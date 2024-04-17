import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

export default function SingUp({ setUsername, socket }) {

  const naviagte = useNavigate()

  socket.on("connect_error", (err) => {
    if (err.message === "invalid username") {
      alert("wrong input")
    }
  });

  const usernameSubmit = (e) => {
    e.preventDefault()
    setUsername(e.target[0].value)
    socket.auth = { username: e.target[0].value }
    socket.connect()
    naviagte("/chat")
  }

  return (
    <>
      <h4>Sing Up</h4>
      <form onSubmit={usernameSubmit}>
        <input type="text" name="usename" id="username" placeholder='Create Username' /><br />
        <input type="submit" value="Submit" />
      </form>
    </>
  )
}