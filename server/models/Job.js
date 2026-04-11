const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: 'RecruiterProfile', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  techStack: [{ type: String }],
  location: { type: String, default: '' },
  city: { type: String, default: '' },
  country: { type: String, default: '' },
  state: { type: String, default: '' },
  kebele: { type: String, default: '' },
  gender: { type: String, enum: ['male', 'female', 'both'], default: 'both' },
  companyName: { type: String, default: '' },
  jobType: { type: String, enum: ['full-time', 'part-time', 'contract', 'internship'], default: 'full-time' },
  experienceLevel: { type: String, default: '' },
  educationLevel: { type: String, default: '' },
  salary: {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' }
  },
  salaryNegotiable: { type: Boolean, default: false },
  benefits: [{ type: String }],
  applicationDeadline: { type: Date },
  status: { type: String, enum: ['active', 'closed', 'draft'], default: 'active' },
  views: { type: Number, default: 0 },
  applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Application' }],
  isAdminPost: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Job', jobSchema);