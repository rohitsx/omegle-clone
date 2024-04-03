import { useNavigate } from "react-router-dom"

export default function SingUp({setUsername}) {

  const naviagte = useNavigate()

  const usernameSubmit = (e) => {
    e.preventDefault()
    setUsername(e.target[0].value)
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