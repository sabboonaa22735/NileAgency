const express = require('express');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const passport = require('passport');
const User = require('../models/User');
const EmployeeProfile = require('../models/EmployeeProfile');
const RecruiterProfile = require('../models/RecruiterProfile');
const Payment = require('../models/Payment');
const { auth, JWT_SECRET } = require('../middlewares/auth');
const { sendOtpEmail } = require('../utils/email');

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const router = express.Router();

router.get('/google', passport.authenticate('google', { 
  scope: ['profile', 'email'],
  prompt: 'select_account'
}));

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login?error=google', failureFlash: true }),
  async (req, res) => {
    try {
      console.log('Google callback - user:', req.user);
      const token = jwt.sign({ userId: req.user._id }, JWT_SECRET, { expiresIn: '7d' });
      const redirectUrl = req.user.role 
        ? `http://localhost:5173/dashboard?token=${token}` 
        : `http://localhost:5173/role-selection?token=${token}`;
      console.log('Redirecting to:', redirectUrl);
      res.redirect(redirectUrl);
    } catch (err) {
      console.error('Google callback error:', err);
      res.redirect('http://localhost:5173/login?error=auth');
    }
  }
);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    const otp = generateOtp();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    
    const user = new User({ email, password, otp, otpExpires });
    await user.save();
    
    await sendOtpEmail(email, otp);
    
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { 
      id: user._id, 
      email: user.email, 
      firstName: user.firstName,
      lastName: user.lastName,
      profileImage: user.profileImage,
      role: user.role, 
      registrationStatus: user.registrationStatus 
    }});
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { 
      id: user._id, 
      email: user.email, 
      firstName: user.firstName,
      lastName: user.lastName,
      profileImage: user.profileImage,
      role: user.role, 
      registrationStatus: user.registrationStatus 
    }});
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }
    
    if (!user.otpExpires || user.otpExpires < new Date()) {
      return res.status(400).json({ message: 'OTP expired' });
    }
    
    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();
    
    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const otp = generateOtp();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    
    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();
    
    await sendOtpEmail(email, otp);
    
    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/select-role', auth, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['employee', 'recruiter'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    console.log('select-role - user:', req.user?._id, 'role:', role);
    const user = await User.findById(req.user._id);
    console.log('select-role - found user:', user?._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.role = role;
    user.registrationStatus = 'basic_info';
    await user.save();
    console.log('select-role - user saved');
    
    const ProfileModel = role === 'employee' ? EmployeeProfile : RecruiterProfile;
    const existingProfile = await ProfileModel.findOne({ userId: user._id });
    console.log('select-role - existing profile:', existingProfile?._id);
    if (existingProfile) {
      return res.json({ message: 'Role selected successfully', user: { id: user._id, email: user.email, role: user.role, registrationStatus: user.registrationStatus } });
    }
    
    const profile = new ProfileModel({ userId: user._id });
    await profile.save();
    console.log('select-role - profile created:', profile._id);
    
    res.json({ message: 'Role selected successfully', user: { id: user._id, email: user.email, role: user.role, registrationStatus: user.registrationStatus } });
  } catch (error) {
    console.error('select-role error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/profile', auth, upload.single('profileImage'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (req.body.email && req.body.email !== user.email) {
      const existingUser = await User.findOne({ email: req.body.email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      user.email = req.body.email;
    }
    
    if (req.body.firstName) user.firstName = req.body.firstName;
    if (req.body.lastName) user.lastName = req.body.lastName;
    if (req.body.phone) user.phone = req.body.phone;
    if (req.body.password) user.password = req.body.password;
    if (req.file) user.profileImage = `/uploads/${req.file.filename}`;
    
    await user.save();
    
    res.json({
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      registrationStatus: user.registrationStatus,
      profileImage: user.profileImage
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/account', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (user.role === 'employee') {
      await EmployeeProfile.deleteOne({ userId: user._id });
    } else if (user.role === 'recruiter') {
      await RecruiterProfile.deleteOne({ userId: user._id });
    }
    
    await user.deleteOne();
    
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/employee/step1', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user.role !== 'employee') {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    const profile = await EmployeeProfile.findOne({ userId: user._id });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    
    const { firstName, middleName, lastName, phone, country, region, city, dateOfBirth, gender, bio, skills, experienceLevel, educationLevel, typeOfJob, typeOfJobOther, languages, languageOther, expectedSalary, availability } = req.body;
    
    profile.firstName = firstName || profile.firstName;
    profile.middleName = middleName || profile.middleName;
    profile.lastName = lastName || profile.lastName;
    profile.phone = phone || profile.phone;
    profile.country = country || profile.country;
    profile.region = region || profile.region;
    profile.city = city || profile.city;
    profile.dateOfBirth = dateOfBirth || profile.dateOfBirth;
    profile.gender = gender || profile.gender;
    profile.bio = bio || profile.bio;
    profile.skills = skills ? skills.split(',').map(s => s.trim()) : profile.skills;
    profile.experienceLevel = experienceLevel || profile.experienceLevel;
    profile.educationLevel = educationLevel || profile.educationLevel;
    profile.typeOfJob = typeOfJob || profile.typeOfJob;
    profile.typeOfJobOther = typeOfJobOther || profile.typeOfJobOther;
    profile.languages = languages || profile.languages;
    profile.languageOther = languageOther || profile.languageOther;
    profile.expectedSalary = expectedSalary || profile.expectedSalary;
    profile.availability = availability || profile.availability;
    profile.updatedAt = new Date();
    
    await profile.save();
    
    user.registrationStatus = 'document';
    await user.save();
    
    res.json({ message: 'Basic information saved', registrationStatus: user.registrationStatus });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/employee/step2', auth, upload.fields([
  { name: 'resume', maxCount: 1 },
  { name: 'idCard', maxCount: 1 },
  { name: 'certificate', maxCount: 1 }
]), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user.role !== 'employee') {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    const profile = await EmployeeProfile.findOne({ userId: user._id });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    if (profile.educationLevel !== 'none' && !req.files?.resume) {
      return res.status(400).json({ message: 'Resume is required' });
    }
    if (!req.files?.idCard) {
      return res.status(400).json({ message: 'ID Card is required' });
    }
    
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    if (req.files?.resume) {
      profile.resume = `${baseUrl}/uploads/${req.files.resume[0].filename}`;
    }
    if (req.files?.idCard) {
      profile.idCard = `${baseUrl}/uploads/${req.files.idCard[0].filename}`;
    }
    if (req.files?.certificate) {
      profile.certificate = `${baseUrl}/uploads/${req.files.certificate[0].filename}`;
    }
    
    await profile.save();
    
    user.registrationStatus = 'payment';
    await user.save();
    
    res.json({ message: 'Documents uploaded', registrationStatus: user.registrationStatus });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/employee/step3', auth, upload.fields([
  { name: 'paymentProof', maxCount: 1 }
]), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user.role !== 'employee') {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    const { paymentMethod, bankReference } = req.body;
    
    if (!['bank', 'chapa', 'telebirr'].includes(paymentMethod)) {
      return res.status(400).json({ message: 'Invalid payment method' });
    }
    
    const profile = await EmployeeProfile.findOne({ userId: user._id });
    
    const PaymentSetting = require('../models/PaymentSetting');
    const feeSetting = await PaymentSetting.findOne({ key: 'employee_fee' });
    const applicationFee = feeSetting ? parseInt(feeSetting.value) : 5000;
    
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    let paymentProofPath = '';
    if (req.files?.paymentProof) {
      paymentProofPath = `${baseUrl}/uploads/${req.files.paymentProof[0].filename}`;
    }
    
    const payment = new Payment({
      userId: user._id,
      type: 'application_fee',
      planType: 'employee',
      amount: applicationFee,
      status: 'completed',
      paymentMethod: paymentMethod,
      bankReference: bankReference || '',
      paymentProof: paymentProofPath,
      description: `Employee registration application fee - ${paymentMethod}`
    });
    await payment.save();
    
    user.registrationStatus = 'pending_approval';
    await user.save();
    
    const { createNotification } = require('../utils/notifications');
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await createNotification({ 
        userId: admin._id, 
        type: 'registration', 
        title: 'New Registration Pending', 
        message: `${user.role === 'employee' ? user.firstName + ' ' + user.lastName : user.companyName || user.email} registration is pending approval` 
      });
    }
    
    res.json({ message: 'Registration submitted for approval', registrationStatus: user.registrationStatus });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/recruiter/step1', auth, async (req, res) => {
  try {
    console.log('recruiter step1 called, user:', req.user._id);
    const user = await User.findById(req.user._id);
    if (user.role !== 'recruiter') {
      console.log('User role is not recruiter:', user.role);
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    const profile = await RecruiterProfile.findOne({ userId: user._id });
    if (!profile) {
      console.log('Profile not found for user:', user._id);
      return res.status(404).json({ message: 'Profile not found' });
    }
    
    const { companyName, industry, numberOfEmployees, companyDescription, website, foundedYear, managerName, city, kebele, contactEmail, contactPhone } = req.body;
    console.log('Step1 data received:', { companyName, industry, managerName, city });
    
    profile.companyName = companyName || profile.companyName;
    profile.industry = industry || profile.industry;
    if (industry === 'other') {
      profile.industryOther = industry === 'other' ? req.body.industryOther || '' : '';
    }
    profile.numberOfEmployees = numberOfEmployees || profile.numberOfEmployees;
    profile.companyDescription = companyDescription || profile.companyDescription;
    profile.website = website || profile.website;
    profile.foundedYear = foundedYear || profile.foundedYear;
    profile.managerName = managerName || profile.managerName;
    profile.city = city || profile.city;
    profile.kebele = kebele || profile.kebele;
    profile.contactEmail = contactEmail || profile.contactEmail;
    profile.contactPhone = contactPhone || profile.contactPhone;
    profile.updatedAt = new Date();
    
    await profile.save();
    console.log('Profile saved successfully');
    
    user.registrationStatus = 'document';
    await user.save();
    
res.json({ message: 'Company information saved', registrationStatus: user.registrationStatus });
  } catch (error) {
    console.error('recruiter step1 error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/recruiter/step2', auth, upload.fields([
  { name: 'businessLicense', maxCount: 1 },
  { name: 'companyLogo', maxCount: 1 },
  { name: 'taxDocument', maxCount: 1 }
]), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user.role !== 'recruiter') {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    const profile = await RecruiterProfile.findOne({ userId: user._id });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    if (req.files?.businessLicense) {
      profile.businessLicense = `${baseUrl}/uploads/${req.files.businessLicense[0].filename}`;
    }
    if (req.files?.companyLogo) {
      profile.companyLogo = `${baseUrl}/uploads/${req.files.companyLogo[0].filename}`;
    }
    if (req.files?.taxDocument) {
      profile.taxDocument = `${baseUrl}/uploads/${req.files.taxDocument[0].filename}`;
    }
    
    await profile.save();
    
    user.registrationStatus = 'payment';
    await user.save();
    
    res.json({ message: 'Documents uploaded', registrationStatus: user.registrationStatus });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/recruiter/step3', auth, upload.fields([
  { name: 'paymentProof', maxCount: 1 }
]), async (req, res) => {
  try {
    console.log('recruiter step3 body:', req.body);
    console.log('recruiter step3 files:', req.files);
    
    const user = await User.findById(req.user._id);
    if (user.role !== 'recruiter') {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    const { paymentMethod, bankReference } = req.body;
    console.log('paymentMethod received:', paymentMethod);
    
    if (!['bank', 'chapa', 'telebirr'].includes(paymentMethod)) {
      return res.status(400).json({ message: 'Invalid payment method' });
    }
    
    const profile = await RecruiterProfile.findOne({ userId: user._id });
    if (!profile) {
      return res.status(400).json({ message: 'Please complete step 2 first' });
    }
    
    const PaymentSetting = require('../models/PaymentSetting');
    const feeSetting = await PaymentSetting.findOne({ key: 'recruiter_fee' });
    const applicationFee = feeSetting ? parseInt(feeSetting.value) : 10000;
    
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    let paymentProofPath = '';
    if (req.files?.paymentProof) {
      paymentProofPath = `${baseUrl}/uploads/${req.files.paymentProof[0].filename}`;
    }
    
    const payment = new Payment({
      userId: user._id,
      type: 'application_fee',
      planType: 'recruiter',
      amount: applicationFee,
      status: 'completed',
      paymentMethod: paymentMethod,
      bankReference: bankReference || '',
      paymentProof: paymentProofPath,
      description: `Recruiter registration application fee - ${paymentMethod}`
    });
    await payment.save();
    
    profile.paymentMethod = paymentMethod;
    profile.bankReference = bankReference || '';
    profile.paymentProof = paymentProofPath;
    await profile.save();
    
user.registrationStatus = 'pending_approval';
    await user.save();
    
    const { createNotification } = require('../utils/notifications');
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await createNotification({ 
        userId: admin._id, 
        type: 'registration', 
        title: 'New Recruiter Registration', 
        message: `${user.companyName || user.email} registration is pending approval` 
      });
    }
    
    res.json({ message: 'Registration submitted for approval', registrationStatus: user.registrationStatus });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/logout', auth, async (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;