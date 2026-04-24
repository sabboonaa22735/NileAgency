const mongoose = require('mongoose');

const recruiterProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  companyName: { type: String, default: '' },
  companyLogo: { type: String, default: '' },
  companyDescription: { type: String, default: '' },
  industry: { type: String, default: '' },
  industryOther: { type: String, default: '' },
  numberOfEmployees: { type: String, default: '' },
  website: { type: String, default: '' },
  foundedYear: { type: Number },
  managerName: { type: String, default: '' },
  city: { type: String, default: '' },
  kebele: { type: String, default: '' },
  contactEmail: { type: String, default: '' },
  contactPhone: { type: String, default: '' },
  businessLicense: { type: String, default: '' },
  taxDocument: { type: String, default: '' },
  paymentProof: { type: String, default: '' },
  paymentMethod: { type: String, enum: ['bank', 'telebirr'], default: null },
  bankReference: { type: String, default: '' },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  paymentBalance: { type: Number, default: 0 },
  jobsPosted: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('RecruiterProfile', recruiterProfileSchema);