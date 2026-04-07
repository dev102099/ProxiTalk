import React, { useState, useEffect, useRef } from "react";
import * as pixi from "pixi.js";
import { io } from "socket.io-client";
import { createAvatar } from "./Avatar";

function Cosmos({
  isChatConnected,
  setIsChatConnected,
  socketRef,
  setMessages,
}) {
  // --- UI STATE ---
  const [hasJoined, setHasJoined] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const chatStateRef = useRef(false);
  // Refs for Pixi and Socket
  const pixiContainerRef = useRef(null);
  const [activeUsersList, setActiveUsersList] = useState([]);

  // --- THE LOGIN HANDLER ---
  const handleJoin = (e) => {
    e.preventDefault();
    if (usernameInput.trim() !== "") {
      setHasJoined(true);
    }
  };

  // --- THE GAME & NETWORK LOGIC ---
  useEffect(() => {
    if (!hasJoined) return;

    let app;
    let localPlayer;
    const networkPlayers = {};

    const keys = {
      w: false,
      a: false,
      s: false,
      d: false,
      ArrowUp: false,
      ArrowLeft: false,
      ArrowDown: false,
      ArrowRight: false,
    };
    const onKeyDown = (e) => {
      if (keys.hasOwnProperty(e.key)) keys[e.key] = true;
    };
    const onKeyUp = (e) => {
      if (keys.hasOwnProperty(e.key)) keys[e.key] = false;
    };

    const initPixi = async () => {
      app = new pixi.Application();
      await app.init({
        background: "#FFC8BD",
        resizeTo: pixiContainerRef.current,
      });

      if (pixiContainerRef.current) {
        pixiContainerRef.current.appendChild(app.canvas);
      }

      // 1. Build the local player first
      localPlayer = createAvatar(
        usernameInput,
        0x3b82f6,
        app.screen.width / 2,
        app.screen.height / 2,
      );
      app.stage.addChild(localPlayer);

      window.addEventListener("keydown", onKeyDown);
      window.addEventListener("keyup", onKeyUp);

      // 🌟 2. THE FIX: Connect to the server ONLY AFTER the canvas is ready
      socketRef.current = io("http://localhost:3000", {
        auth: { username: usernameInput },
      });

      // 3. Now we are safely listening and won't miss the server's first message
      // 3. Now we are safely listening
      socketRef.current.on("currentUsers", (users) => {
        console.log("📡 CURRENT USERS DATA:", users);
        setActiveUsersList(users); // <--- Add to React State

        users.forEach((user) => {
          if (user.id !== socketRef.current.id) {
            const avatar = createAvatar(
              user.username,
              user.color,
              user.x,
              user.y,
            );
            networkPlayers[user.id] = avatar;
            app.stage.addChild(avatar);
          }
        });
      });

      socketRef.current.on("newUser", (user) => {
        console.log("🚨 NEW USER ARRIVED:", user);
        setActiveUsersList((prev) => [...prev, user]); // <--- Add to React State

        const avatar = createAvatar(user.username, user.color, user.x, user.y);
        networkPlayers[user.id] = avatar;
        app.stage.addChild(avatar);
      });
      socketRef.current.on("receiveChatMessage", (newMessage) => {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      });
      socketRef.current.on("playerMoved", (user) => {
        if (networkPlayers[user.id]) {
          networkPlayers[user.id].x = user.x;
          networkPlayers[user.id].y = user.y;
        }
      });
      socketRef.current.off("receiveChatMessage");

      // 2. Add the fresh listener
      socketRef.current.on("receiveChatMessage", (newMessage) => {
        setMessages((prevMessages) => {
          // 3. The Ultimate Safeguard:
          // Since the backend assigns a unique Date.now() ID to every message,
          // we check if a message with this exact ID is already in our array.
          if (prevMessages.some((msg) => msg.id === newMessage.id)) {
            return prevMessages; // If it is, ignore the duplicate!
          }
          return [...prevMessages, newMessage]; // Otherwise, add it safely.
        });
      });
      socketRef.current.on("userDisconnected", (userId) => {
        setActiveUsersList((prev) => prev.filter((u) => u.id !== userId)); // <--- Remove from React State

        if (networkPlayers[userId]) {
          app.stage.removeChild(networkPlayers[userId]);
          networkPlayers[userId].destroy();
          delete networkPlayers[userId];
        }
      });
      // --- MOVEMENT LOOP ---
      // --- MOVEMENT & BROADCAST LOOP ---
      const speed = 5;
      const CHAT_RADIUS = 150; // How close they need to be (in pixels)

      app.ticker.add(() => {
        let dx = 0;
        let dy = 0;

        if (keys.ArrowUp) dy -= speed;
        if (keys.ArrowDown) dy += speed;
        if (keys.ArrowLeft) dx -= speed;
        if (keys.ArrowRight) dx += speed;

        if (dx !== 0 || dy !== 0) {
          localPlayer.x += dx;
          localPlayer.y += dy;

          socketRef.current.emit("playerMovement", {
            x: localPlayer.x,
            y: localPlayer.y,
          });
        }

        // --- NEW: PROXIMITY DETECTION ---
        let anyoneClose = false;

        // Loop through all the other players currently on the screen
        for (const id in networkPlayers) {
          const otherPlayer = networkPlayers[id];

          // The Distance Formula
          const diffX = localPlayer.x - otherPlayer.x;
          const diffY = localPlayer.y - otherPlayer.y;
          const distance = Math.sqrt(diffX * diffX + diffY * diffY);

          if (distance < CHAT_RADIUS) {
            anyoneClose = true;
            break; // We found someone, no need to check the rest!
          }
        }

        // Only trigger a React update if the state actually changed!
        if (anyoneClose !== chatStateRef.current) {
          chatStateRef.current = anyoneClose; // Update our buffer
          setIsChatConnected(anyoneClose); // Update the actual React UI
        }
      });
    };

    initPixi();

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      if (socketRef.current) socketRef.current.disconnect();
      if (app) app.destroy(true, { children: true });
      if (pixiContainerRef.current) pixiContainerRef.current.innerHTML = "";
    };
  }, [hasJoined, usernameInput]); // Triggers only when they join

  // --- RENDER UI ---

  if (!hasJoined) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-900">
        <form
          onSubmit={handleJoin}
          className="bg-white p-8 rounded-lg shadow-xl flex flex-col gap-4 text-center"
        >
          <h1 className="text-2xl font-bold text-gray-800">
            Welcome to Cosmos
          </h1>
          <p className="text-gray-500">Enter your name to join the room</p>
          <input
            type="text"
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value)}
            placeholder="Your name..."
            className="border-2 border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-blue-500"
            autoFocus
          />
          <button
            type="submit"
            className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600 transition"
          >
            Enter Cosmos
          </button>
        </form>
      </div>
    );
  }

  return (
    <section
      ref={pixiContainerRef}
      className={`h-screen border-r-2 border-gray-700 transition-all duration-300 ease-in-out ${
        isChatConnected ? "w-[70%]" : "w-full"
      }`}
    >
      {/* Pixi Canvas injects here */}
      {/* --- NEW: FLOATING ACTIVE USERS PANEL --- */}
      <div className="absolute top-4 left-4 bg-gray-900/90 border border-gray-700 rounded-lg p-4 z-10 shadow-2xl min-w-[200px]">
        <h3 className="text-white text-sm font-bold border-b border-gray-700 pb-2 mb-3 flex items-center justify-between">
          Active Cosmos
          <span className="bg-blue-500 text-white px-2 py-0.5 rounded-full text-xs">
            {activeUsersList.length}
          </span>
        </h3>

        <ul className="space-y-2 max-h-60 overflow-y-auto">
          {activeUsersList.map((user) => (
            <li
              key={user.id}
              className="text-gray-300 text-sm flex items-center gap-3"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              {user.username} {user.username === usernameInput ? "(You)" : ""}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default Cosmos;
