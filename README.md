# Cosmos - Spatial Chat Application

Cosmos is a 2D spatial chat application where users can interact in a virtual environment. Users can drive an avatar around a physical map, and a real-time chat interface dynamically opens only when they are physically close to another user in the virtual space.

## Features

- **Custom 2D Game Engine:** Built with PixiJS to render avatars, handle 60FPS movement loops, and draw the virtual environment.
- **Real-Time Networking:** WebSockets handle high-frequency X/Y coordinate broadcasts for seamless multiplayer movement.
- **Proximity Chat Math:** Runs real-time Pythagorean theorem calculations to detect when players cross a 150-pixel radius, dynamically triggering the UI.
- **Responsive Layouts:** The UI smoothly transitions between a full-screen canvas and a 70/30 split-screen when the chat panel activates.

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, PixiJS, Socket.IO-Client
- **Backend:** Node.js, Express, Socket.IO

## Architecture Note: Why No MongoDB?

For this specific assignment, the primary technical challenges were implementing the WebGL rendering loop, high-frequency socket broadcasting, and the real-time proximity mathematics.

Because player coordinates update 60 times a second, saving state to a persistent database like MongoDB would introduce unnecessary latency and database overhead. Therefore, player sessions, coordinates, and chat history are deliberately handled using a high-speed, in-memory Node.js `Map()`. This keeps the architecture lightweight and focuses the project strictly on the core spatial logic and real-time WebSocket features.

## How to Run Locally

Because this project uses a custom WebSocket server, you need to run both the frontend and the backend simultaneously.

### 1. Start the Backend Server

Open a terminal and navigate to the backend folder:

```bash
cd cosmos-server
npm install
node server.js
```

### 2. Start the Frontend Client

Open a second terminal window and navigate to your React folder:

```bash
cd [your-frontend-folder-name]
npm install
npm run dev
```

Vite will start the client, usually on http://localhost:5173.

### 3. Test the Spatial Features

To see the real-time proximity logic in action:

Open two separate browser windows side-by-side.

Navigate both to the local Vite URL.

Enter a different username in each window and click "Join".

Click on the canvas and use the Arrow Keys to move.

Drive the two avatars toward each other. Once they are within 150 pixels, the chat panel will automatically slide open, allowing you to send messages between the two browsers!
