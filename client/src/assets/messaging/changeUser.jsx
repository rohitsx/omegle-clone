export default function ChangeNewUser({ setUpdateUser }) {
    function getNewUser(e) {
        e.preventDefault()
        setUpdateUser(prev => prev + 1)
    }

    return <button id="changeNewUser" onClick={getNewUser}>New</button>
}