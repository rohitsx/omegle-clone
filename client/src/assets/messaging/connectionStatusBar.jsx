export default function ConnectionStatusBar({ strangerUsername }) {

    return <div id="connectionSatusBar">
        {strangerUsername ? strangerUsername : (<div id="loader"></div>)}
    </div>
}