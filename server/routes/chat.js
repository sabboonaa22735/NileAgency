const express = require('express');
const Message = require('../models/Message');
const User = require('../models/User');
const { auth, adminAuth } = require('../middlewares/auth');

const router = express.Router();

router.get('/admin/users', adminAuth, async (req, res) => {
  try {
    let query = { 
      role: { $in: ['employee', 'recruiter'] },
      email: { $exists: true, $ne: '' },
      registrationStatus: { $in: ['approved', 'pending_approval'] }
    };
    
    const users = await User.find(query)
      .select('_id email role firstName lastName')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/admin', auth, async (req, res) => {
  try {
    const admin = await User.findOne({ role: 'admin' }).select('_id email');
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    res.json(admin);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/contacts', auth, async (req, res) => {
  try {
    const role = req.user?.role;
    const userId = req.user?._id;
    
    if (!role || !userId) {
      return res.json([]);
    }
    
    let query = { 
      _id: { $ne: userId }
    };
    
    const allUsers = await User.find(query).select('_id email role firstName lastName registrationStatus').lean();
    
    let contacts = allUsers.filter(u => {
      if (role === 'admin') return u.role === 'employee' || u.role === 'recruiter';
      if (role === 'recruiter') return u.role === 'admin';
      if (role === 'employee') return u.role === 'admin' || u.role === 'recruiter';
      return false;
    });
    
    console.log('Contacts for role', role, ':', contacts.map(c => c.role));
    res.json(contacts);
  } catch (err) {
    console.error('contacts endpoint error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/conversations', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const userIdStr = userId.toString();
    const userRole = req.user.role;
    
    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }]
    }).sort({ createdAt: -1 });
    
    const conversations = {};
    for (const msg of messages) {
      try {
        const senderIdStr = msg.senderId?.toString();
        const receiverIdStr = msg.receiverId?.toString();
        
        if (!senderIdStr || !receiverIdStr || senderIdStr === receiverIdStr) continue;
        
        const partnerId = senderIdStr === userIdStr ? receiverIdStr : senderIdStr;
        
        const partner = await User.findById(partnerId).select('email role firstName lastName registrationStatus').lean();
        
        if (!partner || !partner.email) continue;
        if (userRole !== 'admin' && partner.role !== 'admin' && (partner.registrationStatus || '') === 'rejected') continue;
        
        const partnerData = partner;
        
        if (!conversations[partnerId]) {
          conversations[partnerId] = {
            _id: partnerId,
            email: partnerData.email,
            role: partnerData.role,
            firstName: partnerData.firstName,
            lastName: partnerData.lastName,
            registrationStatus: partnerData.registrationStatus,
            lastMessage: msg.content,
            timestamp: msg.createdAt,
            unread: receiverIdStr === userIdStr && !msg.read ? 1 : 0
          };
        } else {
          conversations[partnerId].unread += receiverIdStr === userIdStr && !msg.read ? 1 : 0;
        }
      } catch (msgErr) {
        console.error('Skipping invalid message:', msgErr);
        continue;
      }
    }
    res.json(conversations);
  } catch (error) {
    console.error('Conversations error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/:partnerId', auth, async (req, res) => {
  try {
    const { partnerId } = req.params;
    if (!partnerId || partnerId === 'undefined' || partnerId === 'null') {
      return res.json([]);
    }
    
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(partnerId)) {
      return res.json([]);
    }
    
    const partner = await User.findById(partnerId).select('email role registrationStatus').lean();
    if (!partner || !partner.email) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const sender = await User.findById(req.user._id).select('role registrationStatus').lean();
    if (sender.role !== 'admin' && (sender.registrationStatus || '') === 'rejected') {
      return res.status(403).json({ message: 'You are not authorized to chat' });
    }
    
    const messages = await Message.find({
      $or: [
        { senderId: req.user._id, receiverId: partnerId },
        { senderId: partnerId, receiverId: req.user._id }
      ]
    }).sort({ createdAt: 1 });
    
    await Message.updateMany(
      { senderId: partnerId, receiverId: req.user._id },
      { read: true }
    );
    
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    console.log('POST /chat received:', { senderId: req.user._id, receiverId, content });
    
    const receiver = await User.findById(receiverId).select('email role registrationStatus').lean();
    console.log('Receiver:', receiver);
    
    if (!receiver || !receiver.email) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const sender = await User.findById(req.user._id).select('role registrationStatus').lean();
    console.log('Sender:', sender);
    
    if (sender.role !== 'admin' && (sender.registrationStatus || '') === 'rejected') {
      return res.status(403).json({ message: 'You are not authorized to send messages' });
    }
    
    const message = new Message({
      senderId: req.user._id,
      receiverId,
      content
    });
    await message.save();
    console.log('Message saved:', message._id);
    
    if (global.io && global.userSockets) {
      const receiverSocket = global.userSockets[receiverId?.toString()];
      if (receiverSocket) {
        global.io.to(receiverSocket).emit('newMessage', { 
          senderId: req.user._id, 
          content, 
          timestamp: message.createdAt,
          _id: message._id 
        });
        console.log('Real-time message emitted to receiver');
      } else {
        console.log('Receiver not online');
      }
    }
    
    res.status(201).json(message);
  } catch (error) {
    console.error('Error in POST /chat:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;