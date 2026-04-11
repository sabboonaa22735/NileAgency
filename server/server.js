const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

const Message = require('./models/Message');

app.use('/api/auth', require('./routes/auth'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/users', require('./routes/users'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/admin', require('./routes/admin'));

const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nileagency';
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

const userSockets = {};

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  socket.on('join', (userId) => {
    console.log('User joined:', userId);
    userSockets[userId] = socket.id;
    io.emit('userOnline', { userId });
  });

  socket.on('sendMessage', async ({ senderId, receiverId, message }) => {
    console.log('Message sent from', senderId, 'to', receiverId);
    try {
      const newMessage = new Message({
        senderId,
        receiverId,
        content: message
      });
      await newMessage.save();

      const User = require('./models/User');
      const sender = await User.findById(senderId);
      
      const Notification = require('./models/Notification');
      const notification = new Notification({
        userId: receiverId,
        type: 'message',
        title: `New message from ${sender?.email?.split('@')[0] || 'User'}`,
        message: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
        link: '/chat'
      });
      await notification.save();

      const receiverSocket = userSockets[receiverId];
      if (receiverSocket) {
        io.to(receiverSocket).emit('newMessage', { 
          senderId, 
          message, 
          timestamp: new Date(),
          _id: newMessage._id 
        });
        console.log('Message emitted to receiver');
      } else {
        console.log('Receiver not online:', receiverId);
      }
    } catch (error) {
      console.error('Error saving message:', error);
    }
  });

  socket.on('typing', ({ senderId, receiverId }) => {
    const receiverSocket = userSockets[receiverId];
    if (receiverSocket) {
      io.to(receiverSocket).emit('userTyping', { senderId });
    }
  });

  socket.on('markRead', ({ senderId, receiverId }) => {
    const receiverSocket = userSockets[receiverId];
    if (receiverSocket) {
      io.to(receiverSocket).emit('messageRead', { senderId });
    }
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
    for (const [userId, sockId] of Object.entries(userSockets)) {
      if (sockId === socket.id) {
        delete userSockets[userId];
        io.emit('userOffline', { userId });
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));