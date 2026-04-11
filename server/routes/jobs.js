const express = require('express');
const Job = require('../models/Job');
const { auth, requireRole } = require('../middlewares/auth');
const { notifyJobMatchingUsers } = require('../utils/notifications');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const { search, location, jobType, experienceLevel, skills, myJobs, page = 1, limit = 20, educationLevel, gender, state, city } = req.query;
    const query = { status: 'active' };
    
    if (myJobs === 'true' && req.user) {
      const RecruiterProfile = require('../models/RecruiterProfile');
      const recruiterProfile = await RecruiterProfile.findOne({ userId: req.user._id });
      if (recruiterProfile) {
        query.recruiterId = recruiterProfile._id;
        query.isAdminPost = { $ne: true };
      }
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (location) query.location = { $regex: location, $options: 'i' };
    if (jobType) query.jobType = jobType;
    if (experienceLevel) query.experienceLevel = { $regex: experienceLevel, $options: 'i' };
    if (educationLevel) query.educationLevel = { $regex: educationLevel, $options: 'i' };
    if (gender) query.gender = gender;
    if (state) query.state = { $regex: state, $options: 'i' };
    if (city) query.city = { $regex: city, $options: 'i' };
    if (skills) {
      const skillArray = skills.split(',').map(s => s.trim());
      query.skills = { $in: skillArray };
    }
    
    const jobs = await Job.find(query)
      .populate('recruiterId', 'companyName companyLogo location')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await Job.countDocuments(query);
    
    res.json({ jobs, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('recruiterId', 'companyName companyLogo companyDescription industry companySize location website rating');
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    job.views += 1;
    await job.save();
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/', auth, requireRole('recruiter'), async (req, res) => {
  try {
    const job = new Job({ ...req.body, recruiterId: req.user._id });
    await job.save();
    
    notifyJobMatchingUsers(job);
    
    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/:id', auth, requireRole('recruiter'), async (req, res) => {
  try {
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, recruiterId: req.user._id },
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/:id', auth, requireRole('recruiter'), async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({ _id: req.params.id, recruiterId: req.user._id });
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json({ message: 'Job deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;