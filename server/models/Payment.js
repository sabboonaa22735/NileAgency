const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['job_posting', 'hiring', 'subscription', 'application_fee'], required: true },
  planType: { type: String, enum: ['employee', 'recruiter'], default: 'employee' },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
  paymentMethod: { type: String, enum: ['bank', 'chapa', 'stripe', 'telebirr'], default: 'bank' },
  bankReference: { type: String, default: '' },
  paymentProof: { type: String, default: '' },
  stripePaymentId: { type: String, default: '' },
  chapaTransactionId: { type: String, default: '' },
  description: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payment', paymentSchema);