const express = require('express');
const multer = require('multer');
const path = require('path');
const Application = require('../models/Application');
const Job = require('../models/Job');
const EmployeeProfile = require('../models/EmployeeProfile');
const { auth, requireRole } = require('../middlewares/auth');
const { notifyApplicationStatusChange } = require('../utils/notifications');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /pdf|doc|docx/;
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.test(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, and DOCX files are allowed'));
    }
  }
});

router.post('/', auth, requireRole('employee'), upload.single('resume'), async (req, res) => {
  try {
    const { jobId, coverLetter, firstName, middleName, lastName, email, phone, city } = req.body;
    const existingApp = await Application.findOne({ jobId, employeeId: req.user._id });
    if (existingApp) {
      return res.status(400).json({ message: 'Already applied' });
    }
    let resumeUrl = '';
    if (req.file) {
      const baseUrl = req.protocol + '://' + req.get('host');
      resumeUrl = `${baseUrl}/uploads/${req.file.filename}`;
    }
    const application = new Application({
      jobId,
      employeeId: req.user._id,
      firstName,
      middleName,
      lastName,
      email,
      phone,
      city,
      coverLetter,
      resume: resumeUrl
    });
    await application.save();
    const job = await Job.findById(jobId);
    if (job) {
      job.applicants.push(application._id);
      await job.save();
    }
    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/my', auth, requireRole('employee'), async (req, res) => {
  try {
    const applications = await Application.find({ employeeId: req.user._id })
      .populate('jobId', 'title location jobType salary')
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/job/:jobId', auth, requireRole('recruiter'), async (req, res) => {
  try {
    const applications = await Application.find({ jobId: req.params.jobId })
      .populate('employeeId', 'firstName lastName skills experience')
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/:id/status', auth, requireRole('recruiter'), async (req, res) => {
  try {
    const { status, notes } = req.body;
    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ message: 'Application not found' });
    application.status = status;
    if (notes) application.notes = notes;
    application.timeline.push({ status, note: notes });
    await application.save();
    
    notifyApplicationStatusChange(application, status);
    
    res.json(application);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;