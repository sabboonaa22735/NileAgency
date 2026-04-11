const mongoose = require('mongoose');

const recruiterProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  companyName: { type: String, default: '' },
  companyLogo: { type: String, default: '' },
  companyDescription: { type: String, default: '' },
  industry: { type: String, default: '' },
  companySize: { type: String, enum: ['1-10', '11-50', '51-200', '201-500', '500+'], default: '1-10' },
  location: { type: String, default: '' },
  website: { type: String, default: '' },
  foundedYear: { type: Number },
  taxId: { type: String, default: '' },
  contactPerson: { type: String, default: '' },
  contactEmail: { type: String, default: '' },
  contactPhone: { type: String, default: '' },
  businessLicense: { type: String, default: '' },
  taxDocument: { type: String, default: '' },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  paymentBalance: { type: Number, default: 0 },
  jobsPosted: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('RecruiterProfile', recruiterProfileSchema);