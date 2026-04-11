const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'EmployeeProfile', required: true },
  firstName: { type: String, default: '' },
  middleName: { type: String, default: '' },
  lastName: { type: String, default: '' },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  city: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'interview'], default: 'pending' },
  coverLetter: { type: String, default: '' },
  resume: { type: String, default: '' },
  notes: { type: String, default: '' },
  timeline: [{
    status: String,
    date: { type: Date, default: Date.now },
    note: String
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Application', applicationSchema);