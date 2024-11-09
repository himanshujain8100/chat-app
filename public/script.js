// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/chatDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// Message schema and model
const messageSchema = new mongoose.Schema({
  username: String,
  message: String,
  timestamp: { type: Date, default: Date.now },
});

const Message = mongoose.model('Message', messageSchema);

// Serve the static files (HTML, CSS, JS)
app.use(express.static('public'));

// Root route
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('A user connected');

  // Load message history from MongoDB
  Message.find().sort({ timestamp: 1 }).then(messages => {
    socket.emit('messageHistory', messages);
  });

  // Listen for new messages
  socket.on('chatMessage', (msgData) => {
    const newMessage = new Message(msgData);
    newMessage.save().then(() => {
      io.emit('chatMessage', msgData);
    }).catch(err => {
      console.error('Error saving message:', err);
    });
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
