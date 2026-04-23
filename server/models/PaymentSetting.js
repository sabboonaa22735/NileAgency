const mongoose = require('mongoose');

const paymentSettingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: String, default: '' },
  type: { type: String, enum: ['text', 'number', 'textarea'], default: 'text' },
  label: { type: String, default: '' },
  category: { type: String, enum: ['bank', 'payment', 'general', 'telebirr'], default: 'general' },
  isActive: { type: Boolean, default: true },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PaymentSetting', paymentSettingSchema);