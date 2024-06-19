export default function PageHeading({username, stragerUsername, connectionStatus}) {
    return (
        connectionStatus ? (
            <div id="hadingContainer">
                <h1 id="pageHeading">
                {username} Link established with {stragerUsername}
                </h1>
            </div>
        ) : (
            <div id="hadingContainer">
                <div id="loader"></div>
                <h1 id="pageHeading">
                    Looking For Stranger
                </h1>
            </div>
        )
    )
}