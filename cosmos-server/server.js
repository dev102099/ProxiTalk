// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// In-memory state to track player positions natively
const activeUsers = new Map();

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  const realUsername = socket.handshake.auth.username || "Anonymous";

  activeUsers.set(socket.id, {
    id: socket.id,
    username: realUsername,
    color: 0x3b82f6,
    x: 400,
    y: 300,
  });

  socket.emit("currentUsers", Array.from(activeUsers.values()));
  socket.broadcast.emit("newUser", activeUsers.get(socket.id));

  socket.on("playerMovement", (movementData) => {
    const user = activeUsers.get(socket.id);
    if (user) {
      user.x = movementData.x;
      user.y = movementData.y;
      socket.broadcast.emit("playerMoved", user);
    }
  });
  socket.on("sendChatMessage", (text) => {
    const user = activeUsers.get(socket.id);
    if (user) {
      io.emit("receiveChatMessage", {
        id: Date.now(),
        sender: user.username,
        text: text,
      });
    }
  });
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    activeUsers.delete(socket.id);
    io.emit("userDisconnected", socket.id);
  });
});
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
