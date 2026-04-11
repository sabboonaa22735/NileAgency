const mongoose = require('mongoose');

const employeeProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  firstName: { type: String, default: '' },
  middleName: { type: String, default: '' },
  lastName: { type: String, default: '' },
  phone: { type: String, default: '' },
  country: { type: String, default: 'Ethiopia' },
  region: { type: String, default: '' },
  city: { type: String, default: '' },
  dateOfBirth: { type: String, default: '' },
  gender: { type: String, default: '' },
  photo: { type: String, default: '' },
  bio: { type: String, default: '' },
  skills: [{ type: String }],
  experienceLevel: { 
    type: String, 
    enum: ['none', '1_year', '2_years', '3_years', '4_years', '5_years', 'above_5_years', 'above_10_years'],
    default: 'none'
  },
  educationLevel: { 
    type: String, 
    enum: ['phd', 'masters', 'degree', 'diploma', 'level_1', 'level_2', 'level_3', 'level_4', 'above_level_4', 'above_grade_8', 'above_grade_10', 'above_grade_12', 'none'],
    default: 'none'
  },
  desiredJob: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', default: null },
  resume: { type: String, default: '' },
  idCard: { type: String, default: '' },
  certificate: { type: String, default: '' },
  expectedSalary: { type: Number, default: 0 },
  availability: { type: String, enum: ['available', 'not_available', 'internship'], default: 'available' },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('EmployeeProfile', employeeProfileSchema);