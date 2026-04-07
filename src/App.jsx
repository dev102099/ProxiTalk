import { useRef, useState } from "react";
import "./App.css";
import Cosmos from "./components/Cosmos";
import Chat from "./components/Chat";

function App() {
  const [isChatConnected, setIsChatConnected] = useState(false);
  const [messages, setMessages] = useState([]); // Array to hold chat history

  // Lift the socket reference here so BOTH components can use it!
  const socketRef = useRef(null);

  return (
    <main className="flex h-screen w-screen overflow-hidden">
      <Cosmos
        isChatConnected={isChatConnected}
        setIsChatConnected={setIsChatConnected}
        socketRef={socketRef}
        setMessages={setMessages}
      />
      {isChatConnected && <Chat socketRef={socketRef} messages={messages} />}
    </main>
  );
}

export default App;
