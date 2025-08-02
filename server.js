const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const Message = require('./models/Message');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://chat-app-frontend-seven-blond.vercel.app"
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});


app.use(cors({
  origin: [
    "http://localhost:5173", // for development
    "https://chat-app-frontend-seven-blond.vercel.app" // Vercel frontend
  ],
  methods: ["GET", "POST"],
  credentials: true
}));

app.use(express.json());

// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/chatapp')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error(err));

// API: Get chat history
app.get('/messages', async (req, res) => {
  const messages = await Message.find().sort({ timestamp: 1 });
  res.json(messages);
});

// WebSocket: Listen for messages
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('chat message', async (msg) => {
    const message = new Message(msg);
    await message.save();
    io.emit('chat message', msg);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Start server
server.listen(5000, () => console.log('Server running on http://localhost:5000'));
