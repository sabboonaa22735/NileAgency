const express = require('express');
const EmployeeProfile = require('../models/EmployeeProfile');
const RecruiterProfile = require('../models/RecruiterProfile');
const { auth } = require('../middlewares/auth');

const router = express.Router();

router.get('/profile', auth, async (req, res) => {
  try {
    let profile;
    if (req.user.role === 'employee') {
      profile = await EmployeeProfile.findOne({ userId: req.user._id });
    } else if (req.user.role === 'recruiter') {
      profile = await RecruiterProfile.findOne({ userId: req.user._id });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/profile', auth, async (req, res) => {
  try {
    let profile;
    if (req.user.role === 'employee') {
      profile = await EmployeeProfile.findOneAndUpdate(
        { userId: req.user._id },
        { ...req.body, updatedAt: Date.now() },
        { new: true, upsert: true }
      );
    } else if (req.user.role === 'recruiter') {
      profile = await RecruiterProfile.findOneAndUpdate(
        { userId: req.user._id },
        { ...req.body, updatedAt: Date.now() },
        { new: true, upsert: true }
      );
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/employee/:id', async (req, res) => {
  try {
    const profile = await EmployeeProfile.findById(req.params.id);
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/recruiter/:id', async (req, res) => {
  try {
    const profile = await RecruiterProfile.findById(req.params.id);
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/bookmark/:jobId', auth, async (req, res) => {
  try {
    const profile = await EmployeeProfile.findOne({ userId: req.user._id });
    if (!profile.savedJobs.includes(req.params.jobId)) {
      profile.savedJobs.push(req.params.jobId);
      await profile.save();
    }
    res.json({ message: 'Job saved' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/bookmark/:jobId', auth, async (req, res) => {
  try {
    const profile = await EmployeeProfile.findOne({ userId: req.user._id });
    profile.savedJobs = profile.savedJobs.filter(id => id.toString() !== req.params.jobId);
    await profile.save();
    res.json({ message: 'Job removed from saved' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;