const express = require('express');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const Job = require('../models/Job');
const Payment = require('../models/Payment');
const Application = require('../models/Application');
const EmployeeProfile = require('../models/EmployeeProfile');
const RecruiterProfile = require('../models/RecruiterProfile');
const { adminAuth, auth, JWT_SECRET } = require('../middlewares/auth');

const router = express.Router();

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@nileagency.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    if (email === adminEmail && password === adminPassword) {
      const user = await User.findOne({ email });
      let adminUser;
      if (!user) {
        adminUser = new User({ email, password, role: 'admin', isVerified: true });
        await adminUser.save();
      } else {
        adminUser = user;
        adminUser.role = 'admin';
        await adminUser.save();
      }
      const token = jwt.sign({ userId: adminUser._id }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({ token, user: { id: adminUser._id, email: adminUser.email, role: 'admin' } });
    }
    res.status(400).json({ message: 'Invalid admin credentials' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalEmployees = await EmployeeProfile.countDocuments();
    const totalRecruiters = await RecruiterProfile.countDocuments();
    const totalJobs = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({ status: 'active' });
    const totalPayments = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalApplications = await Application.countDocuments();
    const pendingApplications = await Application.countDocuments({ status: 'pending' });
    
    res.json({
      totalUsers,
      totalEmployees,
      totalRecruiters,
      totalJobs,
      activeJobs,
      totalRevenue: totalPayments[0]?.total || 0,
      totalApplications,
      pendingApplications
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/users/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    let profile = null;
    if (user.role === 'employee') {
      profile = await EmployeeProfile.findOne({ userId: user._id });
    } else if (user.role === 'recruiter') {
      profile = await RecruiterProfile.findOne({ userId: user._id });
    }
    
    const payment = await Payment.findOne({ userId: user._id, type: 'application_fee' }).sort({ createdAt: -1 });
    
    res.json({ user, profile, payment });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/users/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    if (user.role === 'employee') {
      await EmployeeProfile.deleteMany({ userId: user._id });
    } else if (user.role === 'recruiter') {
      await RecruiterProfile.deleteMany({ userId: user._id });
    }
    
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/users', adminAuth, async (req, res) => {
  try {
    const { email, password, role, firstName, lastName, companyName, industry, companySize, location, contactPerson, phone, address, bio, skills, photo, resume, idCard, certificate, companyLogo, businessLicense, taxDocument } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    
    const user = new User({
      email,
      password,
      role,
      isVerified: true,
      registrationStatus: 'approved'
    });
    await user.save();
    
    if (role === 'employee') {
      const employeeProfile = new EmployeeProfile({
        userId: user._id,
        firstName: firstName || '',
        lastName: lastName || '',
        phone: phone || '',
        address: address || '',
        bio: bio || '',
        skills: skills || [],
        photo: photo || '',
        resume: resume || '',
        idCard: idCard || '',
        certificate: certificate || ''
      });
      await employeeProfile.save();
    } else if (role === 'recruiter') {
      const recruiterProfile = new RecruiterProfile({
        userId: user._id,
        companyName: companyName || '',
        industry: industry || '',
        companySize: companySize || '',
        location: location || '',
        contactPerson: contactPerson || '',
        phone: phone || '',
        companyLogo: companyLogo || '',
        businessLicense: businessLicense || '',
        taxDocument: taxDocument || ''
      });
      await recruiterProfile.save();
    }
    
    res.status(201).json({ 
      message: 'User created successfully',
      user: { id: user._id, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/users/:id', adminAuth, async (req, res) => {
  try {
    const { firstName, lastName, companyName, industry, companySize, location, contactPerson, phone, address, bio, skills, registrationStatus, isVerified, photo, resume, idCard, certificate, companyLogo, businessLicense, taxDocument } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    if (registrationStatus !== undefined) user.registrationStatus = registrationStatus;
    if (isVerified !== undefined) user.isVerified = isVerified;
    await user.save();
    
    if (user.role === 'employee') {
      await EmployeeProfile.findOneAndUpdate(
        { userId: user._id },
        { 
          firstName: firstName || '',
          lastName: lastName || '',
          phone: phone || '',
          address: address || '',
          bio: bio || '',
          skills: skills || [],
          photo: photo || '',
          resume: resume || '',
          idCard: idCard || '',
          certificate: certificate || ''
        },
        { upsert: true, new: true }
      );
    } else if (user.role === 'recruiter') {
      await RecruiterProfile.findOneAndUpdate(
        { userId: user._id },
        { 
          companyName: companyName || '',
          industry: industry || '',
          companySize: companySize || '',
          location: location || '',
          contactPerson: contactPerson || '',
          phone: phone || '',
          companyLogo: companyLogo || '',
          businessLicense: businessLicense || '',
          taxDocument: taxDocument || ''
        },
        { upsert: true, new: true }
      );
    }
    
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/jobs', adminAuth, async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate('recruiterId', 'companyName')
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/jobs/:id', adminAuth, async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json({ message: 'Job deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/jobs', auth, async (req, res) => {
  try {
    console.log('User role:', req.user?.role);
    console.log('User id:', req.user?._id);
    
    if (!['admin', 'recruiter'].includes(req.user?.role)) {
      return res.status(403).json({ message: 'Admin or recruiter access required' });
    }
    
    const { title, description, requirements, skills, location, jobType, experienceLevel, salary, benefits, applicationDeadline, status, gender, country, state, city, kebele, phone, email, companyName, educationLevel, experience, language, languageOther } = req.body;
    
    let recruiterId;
    const firstRecruiter = await RecruiterProfile.findOne();
    if (firstRecruiter) {
      recruiterId = firstRecruiter._id;
    } else if (req.user?.role === 'recruiter') {
      const recruiterProfile = await RecruiterProfile.findOne({ userId: req.user._id });
      if (recruiterProfile) {
        recruiterId = recruiterProfile._id;
      }
    }
    
    if (!recruiterId) {
      return res.status(400).json({ message: 'No recruiter profile found' });
    }
    
    const job = new Job({
      recruiterId: recruiterId,
      title,
      description,
      requirements: requirements || [],
      skills: skills || [],
      location: location || '',
      city: city || '',
      kebele: kebele || '',
      country: country || '',
      state: state || '',
      gender: gender || 'both',
      phone: phone || '',
      email: email || '',
      companyName: companyName || '',
      educationLevel: educationLevel || '',
      jobType: jobType || 'full-time',
      experienceLevel: experience || experienceLevel || 'mid',
      salary: salary || { min: 0, max: 0, currency: 'USD' },
      benefits: benefits || [],
      applicationDeadline: applicationDeadline || null,
      status: status || 'active',
      isAdminPost: true,
      language: language || [],
      languageOther: languageOther || ''
    });
    
    await job.save();
    res.status(201).json({ message: 'Job created successfully', job });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/jobs/:id', adminAuth, async (req, res) => {
  try {
    const { title, description, requirements, skills, location, jobType, experienceLevel, salary, benefits, applicationDeadline, status } = req.body;
    
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    
    job.title = title || job.title;
    job.description = description || job.description;
    job.requirements = requirements || job.requirements;
    job.skills = skills || job.skills;
    job.location = location || job.location;
    job.jobType = jobType || job.jobType;
    job.experienceLevel = experienceLevel || job.experienceLevel;
    job.salary = salary || job.salary;
    job.benefits = benefits || job.benefits;
    job.applicationDeadline = applicationDeadline || job.applicationDeadline;
    job.status = status || job.status;
    
    await job.save();
    res.json({ message: 'Job updated successfully', job });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/payments', adminAuth, async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('userId', 'email')
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/applications', adminAuth, async (req, res) => {
  try {
    const applications = await Application.find()
      .populate('jobId', 'title')
      .populate('employeeId', 'firstName lastName')
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/pending-approvals', adminAuth, async (req, res) => {
  try {
    const pendingUsers = await User.find({ 
      registrationStatus: 'pending_approval',
      role: { $in: ['employee', 'recruiter'] }
    }).select('-password').sort({ createdAt: -1 });
    res.json(pendingUsers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/approve/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.registrationStatus = 'approved';
    user.isVerified = true;
    await user.save();
    
    res.json({ message: 'User approved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/reject/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.registrationStatus = 'rejected';
    await user.save();
    
    res.json({ message: 'User rejected' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/upload', adminAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ url });
  } catch (error) {
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
});

module.exports = router;