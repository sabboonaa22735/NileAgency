const express = require('express');
const Job = require('../models/Job');
const Application = require('../models/Application');
const EmployeeProfile = require('../models/EmployeeProfile');
const Notification = require('../models/Notification');
const Message = require('../models/Message');
const { auth, requireRole } = require('../middlewares/auth');

const router = express.Router();

router.get('/employee', auth, requireRole('employee'), async (req, res) => {
  try {
    const userId = req.user._id;

    const applications = await Application.find({ employeeId: userId });
    const totalApplications = applications.length;
    const acceptedApplications = applications.filter(a => a.status === 'accepted').length;
    const pendingApplications = applications.filter(a => a.status === 'pending').length;
    const rejectedApplications = applications.filter(a => a.status === 'rejected').length;

    const profile = await EmployeeProfile.findOne({ userId });
    const savedJobs = profile?.savedJobs?.length || 0;
    const profileViews = profile?.profileViews || 0;

    const jobs = await Job.find({ status: 'active' })
      .populate('recruiterId', 'companyName companyLogo')
      .sort({ createdAt: -1 })
      .limit(10);

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10);

    const recentMessages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }]
    })
      .populate('senderId', 'firstName lastName email role')
      .populate('receiverId', 'firstName lastName email role')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      stats: {
        totalApplications,
        acceptedApplications,
        pendingApplications,
        rejectedApplications,
        savedJobs,
        profileViews,
        interviews: pendingApplications
      },
      recommendedJobs: jobs,
      notifications,
      recentMessages
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/employee/stats', auth, requireRole('employee'), async (req, res) => {
  try {
    const userId = req.user._id;

    const applications = await Application.find({ employeeId: userId });
    const totalApplications = applications.length;
    const acceptedApplications = applications.filter(a => a.status === 'accepted').length;
    const pendingApplications = applications.filter(a => a.status === 'pending').length;
    const rejectedApplications = applications.filter(a => a.status === 'rejected').length;

    const profile = await EmployeeProfile.findOne({ userId });
    const savedJobs = profile?.savedJobs?.length || 0;
    const profileViews = profile?.profileViews || 0;

    res.json({
      totalApplications,
      acceptedApplications,
      pendingApplications,
      rejectedApplications,
      savedJobs,
      profileViews,
      interviews: pendingApplications
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
