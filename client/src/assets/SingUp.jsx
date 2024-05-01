import { useNavigate } from "react-router-dom"

export default function SingUp({ setUsername, socket }) {

  const naviagte = useNavigate()

  const usernameSubmit = (e) => {
    e.preventDefault()
    if (e.target[0].value) {
      setUsername(e.target[0].value)
      socket.emit("connect with stranger", e.target[0].value)
      naviagte("/chat")
    } else {
      alert("You Forgot To Add Your Name")
    }
  }

  return (
    <>
      <h1>Omegle Clone</h1>
      <form onSubmit={usernameSubmit}>
        <input type="text" name="usename" id="username" placeholder='Enter Your Name' /><br />
        <input type="submit" value="Start a Chat" />
      </form>
    </>
  )
}