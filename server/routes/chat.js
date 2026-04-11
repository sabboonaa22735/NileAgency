const express = require('express');
const Message = require('../models/Message');
const User = require('../models/User');
const { auth, adminAuth } = require('../middlewares/auth');

const router = express.Router();

router.get('/admin/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find({ role: { $in: ['employee', 'recruiter'] } })
      .select('_id email role')
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
    console.log('=== /contacts endpoint called ===');
    console.log('User from auth:', req.user?._id, req.user?.email, req.user?.role);
    
    if (!req.user) {
      console.log('No user in request');
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const role = req.user.role;
    const userId = req.user._id;
    
    console.log('Looking for contacts for role:', role);
    
    const allUsers = await User.find({ 
      _id: { $ne: userId }
    }).select('_id email role firstName lastName').lean();
    
    let contacts = allUsers.filter(u => {
      if (role === 'employee') return u.role === 'admin' || u.role === 'recruiter';
      if (role === 'recruiter') return u.role === 'admin' || u.role === 'employee';
      if (role === 'admin') return u.role === 'employee' || u.role === 'recruiter';
      return false;
    });
    
    console.log('Found contacts:', contacts.length);
    res.json(contacts);
  } catch (err) {
    console.error('=== contacts error ===', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/conversations', auth, async (req, res) => {
  try {
    const users = await User.find({ role: { $in: ['employee', 'recruiter'] } })
      .select('_id email role')
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
    
    if (!role || !req.user?._id) {
      return res.json([]);
    }
    
    const allUsers = await User.find({ _id: { $ne: req.user._id } }).select('_id email role firstName lastName').lean();
    
    let contacts = allUsers.filter(u => {
      if (role === 'employee') return u.role === 'admin' || u.role === 'recruiter';
      if (role === 'recruiter') return u.role === 'admin' || u.role === 'employee';
      if (role === 'admin') return u.role === 'employee' || u.role === 'recruiter';
      return false;
    });
    
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
        
        let partnerData = { email: 'Unknown', role: 'unknown' };
        if (senderIdStr === userIdStr && msg.receiverId) {
          const partner = await User.findById(msg.receiverId).select('email role firstName lastName').lean();
          if (partner) partnerData = partner;
        } else if (msg.senderId) {
          const partner = await User.findById(msg.senderId).select('email role firstName lastName').lean();
          if (partner) partnerData = partner;
        }
        
        if (!conversations[partnerId]) {
          conversations[partnerId] = {
            _id: partnerId,
            email: partnerData.email,
            role: partnerData.role,
            firstName: partnerData.firstName,
            lastName: partnerData.lastName,
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
    const message = new Message({
      senderId: req.user._id,
      receiverId,
      content
    });
    await message.save();
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;