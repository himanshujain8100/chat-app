require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const Message = require('./models/Message');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Serve static files from "public" folder
app.use(express.static('public'));

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('A user connected');

  // Emit previous chat messages
  Message.find().then((messages) => {
    socket.emit('previousMessages', messages);
  });

  // Listen for "chat message" event
  socket.on('chat message', async (data) => {
    console.log(`Message from ${data.username}: ${data.message}`);

    // Save message to MongoDB
    const message = new Message(data);
    await message.save();

    // Broadcast message to all clients
    io.emit('chat message', data);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
