import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiBriefcase, FiFileText, FiCreditCard, FiArrowLeft, FiArrowRight, FiUpload, FiCheck, FiClock, FiGlobe, FiMapPin, FiFile, FiPhone } from 'react-icons/fi';
import { authApi } from '../services/api';

const STEPS = [
  { id: 1, title: 'Basic Information', icon: FiBriefcase },
  { id: 2, title: 'Documents', icon: FiFileText },
  { id: 3, title: 'Payment', icon: FiCreditCard }
];

const APPLICATION_FEE = 100;

export default function RecruiterRegistration() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    companyName: '',
    industry: '',
    companySize: '1-10',
    companyDescription: '',
    website: '',
    location: '',
    foundedYear: '',
    taxId: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    businessLicense: null,
    companyLogo: null,
    taxDocument: null,
    paymentMethod: '',
    paymentProof: null,
    bankReference: ''
  });

  const businessLicenseRef = useRef(null);
  const companyLogoRef = useRef(null);
  const taxDocumentRef = useRef(null);
  const paymentProofRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, [field]: file }));
    }
  };

  const handlePaymentMethodSelect = (method) => {
    setFormData(prev => ({ ...prev, paymentMethod: method }));
  };

  const handleSubmitStep = async () => {
    setLoading(true);
    setError('');
    
    try {
      if (currentStep === 1) {
        const data = {
          companyName: formData.companyName,
          industry: formData.industry,
          companySize: formData.companySize,
          companyDescription: formData.companyDescription,
          website: formData.website,
          location: formData.location,
          foundedYear: formData.foundedYear,
          taxId: formData.taxId,
          contactPerson: formData.contactPerson,
          contactEmail: formData.contactEmail,
          contactPhone: formData.contactPhone
        };
        await authApi.completeRecruiterStep1(data);
        setCurrentStep(2);
      } else if (currentStep === 2) {
        const formDataToSend = new FormData();
        if (formData.businessLicense) formDataToSend.append('businessLicense', formData.businessLicense);
        if (formData.companyLogo) formDataToSend.append('companyLogo', formData.companyLogo);
        if (formData.taxDocument) formDataToSend.append('taxDocument', formData.taxDocument);
        await authApi.completeRecruiterStep2(formDataToSend);
        setCurrentStep(3);
      } else if (currentStep === 3) {
        if (!formData.paymentMethod) {
          setError('Please select a payment method');
          setLoading(false);
          return;
        }
        if (!formData.paymentProof) {
          setError('Please upload payment proof');
          setLoading(false);
          return;
        }
        
        const formDataToSend = new FormData();
        formDataToSend.append('paymentMethod', formData.paymentMethod);
        formDataToSend.append('paymentProof', formData.paymentProof);
        if (formData.bankReference) {
          formDataToSend.append('bankReference', formData.bankReference);
        }
        
        await authApi.completeRecruiterStep3(formDataToSend);
        setCurrentStep(4);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    }
    setLoading(false);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    } else {
      navigate('/role-selection');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (currentStep === 4) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/30" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg relative text-center"
        >
          <div className="glass rounded-2xl p-8">
            <div className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-6">
              <FiClock className="w-10 h-10 text-yellow-600" />
            </div>
            <h1 className="text-3xl font-bold text-brand-dark mb-4">Registration Submitted!</h1>
            <p className="text-brand-gray mb-6">
              Your recruiter registration has been submitted successfully. Our admin team will review your company details and documents.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-left">
              <p className="text-blue-800 text-sm">
                <strong>Important:</strong> We will let you know by email within <strong>10 minutes</strong> if your application is approved.
              </p>
              <p className="text-blue-800 text-sm mt-2">
                If you haven't received approval within 10 minutes, please call us at: <br />
                <span className="font-bold flex items-center gap-2 mt-1">
                  <FiPhone className="w-4 h-4" /> 0998765432
                </span>
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="btn-primary w-full"
            >
              Return to Login
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-20">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/30" />
      <div className="absolute top-1/3 -left-20 w-80 h-80 bg-brand-indigo/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 -right-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl relative"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-brand-dark mb-2">Recruiter Registration</h1>
          <p className="text-brand-gray">Complete all steps to register as a recruiter</p>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  currentStep > step.id ? 'bg-green-500' :
                  currentStep === step.id ? 'bg-brand-indigo' :
                  'bg-gray-200'
                }`}>
                  {currentStep > step.id ? (
                    <FiCheck className="w-5 h-5 text-white" />
                  ) : (
                    <step.icon className={`w-5 h-5 ${
                      currentStep >= step.id ? 'text-white' : 'text-gray-400'
                    }`} />
                  )}
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 rounded ${
                    currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {STEPS.map(step => (
              <span key={step.id} className={`text-xs ${
                currentStep >= step.id ? 'text-brand-indigo' : 'text-gray-400'
              }`}>
                {step.title}
              </span>
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl p-8">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-5">
              <h2 className="text-xl font-semibold text-brand-dark mb-4">Company Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-brand-dark mb-2">Company Name *</label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  className="input-glass w-full"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-2">Industry</label>
                  <select
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    className="input-glass w-full"
                  >
                    <option value="">Select Industry</option>
                    <option value="technology">Technology</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="finance">Finance</option>
                    <option value="education">Education</option>
                    <option value="retail">Retail</option>
                    <option value="manufacturing">Manufacturing</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-2">Company Size</label>
                  <select
                    name="companySize"
                    value={formData.companySize}
                    onChange={handleChange}
                    className="input-glass w-full"
                  >
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-500">201-500 employees</option>
                    <option value="500+">500+ employees</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-2">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="input-glass w-full"
                    placeholder="City, Country"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-2">Founded Year</label>
                  <input
                    type="number"
                    name="foundedYear"
                    value={formData.foundedYear}
                    onChange={handleChange}
                    className="input-glass w-full"
                    placeholder="e.g., 2015"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-dark mb-2">Company Website</label>
                <div className="relative">
                  <FiGlobe className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gray" />
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className="input-glass w-full pl-12"
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-dark mb-2">Company Description</label>
                <textarea
                  name="companyDescription"
                  value={formData.companyDescription}
                  onChange={handleChange}
                  className="input-glass w-full h-24"
                  placeholder="Tell us about your company..."
                />
              </div>

              <div className="border-t border-gray-200 pt-5 mt-5">
                <h3 className="text-lg font-semibold text-brand-dark mb-4">Contact Information</h3>
                
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-brand-dark mb-2">Contact Person Name *</label>
                    <input
                      type="text"
                      name="contactPerson"
                      value={formData.contactPerson}
                      onChange={handleChange}
                      className="input-glass w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-dark mb-2">Tax ID / Business Number *</label>
                    <input
                      type="text"
                      name="taxId"
                      value={formData.taxId}
                      onChange={handleChange}
                      className="input-glass w-full"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5 mt-5">
                  <div>
                    <label className="block text-sm font-medium text-brand-dark mb-2">Contact Email</label>
                    <input
                      type="email"
                      name="contactEmail"
                      value={formData.contactEmail}
                      onChange={handleChange}
                      className="input-glass w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-dark mb-2">Contact Phone</label>
                    <input
                      type="tel"
                      name="contactPhone"
                      value={formData.contactPhone}
                      onChange={handleChange}
                      className="input-glass w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-brand-dark mb-4">Upload Company Documents</h2>
              
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-brand-indigo transition cursor-pointer"
                   onClick={() => businessLicenseRef.current?.click()}>
                <FiUpload className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                <p className="text-brand-dark font-medium">Business License / Trade License *</p>
                <p className="text-sm text-brand-gray mt-1">PDF or Image (max 5MB)</p>
                <input
                  ref={businessLicenseRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange(e, 'businessLicense')}
                  className="hidden"
                />
                {formData.businessLicense && (
                  <p className="mt-2 text-green-600 text-sm flex items-center justify-center gap-2">
                    <FiCheck className="w-4 h-4" /> {formData.businessLicense.name}
                  </p>
                )}
              </div>

              <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-brand-indigo transition cursor-pointer"
                   onClick={() => companyLogoRef.current?.click()}>
                <FiUpload className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                <p className="text-brand-dark font-medium">Company Logo (Optional)</p>
                <p className="text-sm text-brand-gray mt-1">PNG, JPG, or SVG (max 2MB)</p>
                <input
                  ref={companyLogoRef}
                  type="file"
                  accept=".png,.jpg,.jpeg,.svg"
                  onChange={(e) => handleFileChange(e, 'companyLogo')}
                  className="hidden"
                />
                {formData.companyLogo && (
                  <p className="mt-2 text-green-600 text-sm flex items-center justify-center gap-2">
                    <FiCheck className="w-4 h-4" /> {formData.companyLogo.name}
                  </p>
                )}
              </div>

              <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-brand-indigo transition cursor-pointer"
                   onClick={() => taxDocumentRef.current?.click()}>
                <FiUpload className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                <p className="text-brand-dark font-medium">Tax Registration Document (Optional)</p>
                <p className="text-sm text-brand-gray mt-1">PDF or Image (max 5MB)</p>
                <input
                  ref={taxDocumentRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange(e, 'taxDocument')}
                  className="hidden"
                />
                {formData.taxDocument && (
                  <p className="mt-2 text-green-600 text-sm flex items-center justify-center gap-2">
                    <FiCheck className="w-4 h-4" /> {formData.taxDocument.name}
                  </p>
                )}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-brand-dark mb-4">Application Fee Payment</h2>
              
              <div className="bg-gradient-to-r from-brand-indigo to-purple-600 rounded-xl p-6 text-center text-white mb-6">
                <p className="text-sm opacity-80 mb-1">Application Fee</p>
                <p className="text-4xl font-bold">${APPLICATION_FEE}</p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-brand-dark mb-3">Select Payment Method</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div
                    onClick={() => handlePaymentMethodSelect('bank')}
                    className={`p-5 rounded-xl border-2 cursor-pointer transition ${
                      formData.paymentMethod === 'bank'
                        ? 'border-brand-indigo bg-brand-indigo/5'
                        : 'border-gray-200 hover:border-brand-indigo/50'
                    }`}
                  >
                    <div className="text-center">
                      <div className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center ${
                        formData.paymentMethod === 'bank' ? 'bg-brand-indigo' : 'bg-gray-100'
                      }`}>
                        <FiFile className={`w-6 h-6 ${formData.paymentMethod === 'bank' ? 'text-white' : 'text-gray-400'}`} />
                      </div>
                      <h4 className="font-semibold text-brand-dark">Bank Transfer</h4>
                      <p className="text-xs text-brand-gray mt-1">Pay via bank account</p>
                    </div>
                  </div>
                  
                  <div
                    onClick={() => handlePaymentMethodSelect('chapa')}
                    className={`p-5 rounded-xl border-2 cursor-pointer transition ${
                      formData.paymentMethod === 'chapa'
                        ? 'border-brand-indigo bg-brand-indigo/5'
                        : 'border-gray-200 hover:border-brand-indigo/50'
                    }`}
                  >
                    <div className="text-center">
                      <div className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center ${
                        formData.paymentMethod === 'chapa' ? 'bg-brand-indigo' : 'bg-gray-100'
                      }`}>
                        <FiCreditCard className={`w-6 h-6 ${formData.paymentMethod === 'chapa' ? 'text-white' : 'text-gray-400'}`} />
                      </div>
                      <h4 className="font-semibold text-brand-dark">Chapa</h4>
                      <p className="text-xs text-brand-gray mt-1">Pay with Chapa</p>
                    </div>
                  </div>
                </div>
              </div>

              {formData.paymentMethod === 'bank' && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                  <h4 className="font-semibold text-blue-800 mb-2">Bank Transfer Details</h4>
                  <div className="text-sm text-blue-700 space-y-1">
                    <p><strong>Bank Name:</strong> Commercial Bank of Ethiopia</p>
                    <p><strong>Account Name:</strong> Nile Agency</p>
                    <p><strong>Account Number:</strong> 1000123456789</p>
                  </div>
                </div>
              )}

              {formData.paymentMethod === 'chapa' && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                  <h4 className="font-semibold text-green-800 mb-2">Chapa Payment</h4>
                  <p className="text-sm text-green-700">
                    You will be redirected to Chapa payment gateway after clicking Submit.
                  </p>
                </div>
              )}

              {formData.paymentMethod && (
                <div className="space-y-4">
                  {formData.paymentMethod === 'bank' && (
                    <div>
                      <label className="block text-sm font-medium text-brand-dark mb-2">Bank Reference / Transaction ID *</label>
                      <input
                        type="text"
                        name="bankReference"
                        value={formData.bankReference}
                        onChange={handleChange}
                        className="input-glass w-full"
                        placeholder="Enter your bank transaction reference"
                        required
                      />
                    </div>
                  )}

                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-brand-indigo transition cursor-pointer"
                       onClick={() => paymentProofRef.current?.click()}>
                    <FiUpload className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                    <p className="text-brand-dark font-medium">Upload Payment Proof *</p>
                    <p className="text-sm text-brand-gray mt-1">Screenshot or photo of payment receipt (max 5MB)</p>
                    <input
                      ref={paymentProofRef}
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={(e) => handleFileChange(e, 'paymentProof')}
                      className="hidden"
                    />
                    {formData.paymentProof && (
                      <p className="mt-2 text-green-600 text-sm flex items-center justify-center gap-2">
                        <FiCheck className="w-4 h-4" /> {formData.paymentProof.name}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between mt-8">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-gray-200 text-brand-dark hover:bg-gray-50 transition"
            >
              <FiArrowLeft /> Back
            </button>
            <button
              onClick={handleSubmitStep}
              disabled={loading}
              className="btn-primary flex items-center gap-2"
            >
              {loading ? 'Processing...' : currentStep === 3 ? 'Submit' : 'Continue'} 
              {currentStep < 3 && <FiArrowRight />}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
