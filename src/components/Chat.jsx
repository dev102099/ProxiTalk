import React, { useState } from "react";

function Chat({ socketRef, messages }) {
  const [inputText, setInputText] = useState("");

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputText.trim() !== "" && socketRef.current) {
      socketRef.current.emit("sendChatMessage", inputText);
      setInputText("");
    }
  };

  return (
    <section className="flex flex-col justify-between bg-black w-[30%] p-4 h-full border-l border-gray-800 transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-700">
        <span className="text-white text-2xl font-bold">Chat</span>
        <img
          src="/cancel.png"
          alt="cancel"
          className="h-6 w-6 cursor-pointer opacity-70 hover:opacity-100 transition"
        />
      </div>

      {/* Messages Window */}
      <div className="flex-1 py-4 overflow-y-auto flex flex-col gap-3">
        <div className="text-gray-500 text-sm text-center mb-4 uppercase tracking-widest font-semibold">
          Connection Established
        </div>

        {/* Render all messages */}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className="bg-gray-800 rounded p-3 text-white w-fit max-w-[80%]"
          >
            <span className="text-xs text-blue-400 font-bold block mb-1">
              {msg.sender}
            </span>
            <span className="text-sm">{msg.text}</span>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <form
        onSubmit={handleSendMessage}
        className="flex items-center w-full border border-gray-600 rounded bg-gray-900 mt-2 p-1"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Send Your Messages"
          className="text-white w-full p-2 bg-transparent hover:outline-none focus:outline-none"
        />
        <button
          type="submit"
          className="p-2 hover:bg-gray-700 rounded transition"
        >
          <img src="/send.png" alt="send" className="h-6 w-6 cursor-pointer" />
        </button>
      </form>
    </section>
  );
}

export default Chat;
