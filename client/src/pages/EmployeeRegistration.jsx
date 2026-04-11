import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiFileText, FiCreditCard, FiArrowLeft, FiArrowRight, FiUpload, FiCheck, FiClock, FiFile, FiPhone, FiSearch } from 'react-icons/fi';
import { authApi, jobsApi } from '../services/api';

const STEPS = [
  { id: 1, title: 'Personal Information', icon: FiUser },
  { id: 2, title: 'Documents', icon: FiFileText },
  { id: 3, title: 'Payment', icon: FiCreditCard }
];

const APPLICATION_FEE = 50;

const ETHIOPIAN_REGIONS = [
  'Addis Ababa',
  'Afar',
  'Amhara',
  'Benishangul-Gumuz',
  'Dire Dawa',
  'Gambela',
  'Harari',
  'Oromia',
  'Sidama',
  'Somali',
  'Tigray',
  'South West Ethiopia'
];

const EXPERIENCE_LEVELS = [
  { value: 'none', label: 'No Experience' },
  { value: '1_year', label: '1 Year' },
  { value: '2_years', label: '2 Years' },
  { value: '3_years', label: '3 Years' },
  { value: '4_years', label: '4 Years' },
  { value: '5_years', label: '5 Years' },
  { value: 'above_5_years', label: 'Above 5 Years' },
  { value: 'above_10_years', label: 'Above 10 Years' }
];

const EDUCATION_LEVELS = [
  { value: 'phd', label: 'PHD' },
  { value: 'masters', label: 'Masters' },
  { value: 'degree', label: 'Degree' },
  { value: 'diploma', label: 'Diploma' },
  { value: 'level_1', label: 'Level I' },
  { value: 'level_2', label: 'Level II' },
  { value: 'level_3', label: 'Level III' },
  { value: 'level_4', label: 'Level IV' },
  { value: 'above_level_4', label: 'Above Level IV' },
  { value: 'above_grade_8', label: 'Above Grade 8' },
  { value: 'above_grade_10', label: 'Above Grade 10' },
  { value: 'above_grade_12', label: 'Above Grade 12' },
  { value: 'none', label: 'None of them' }
];

export default function EmployeeRegistration() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [jobs, setJobs] = useState([]);
  const [jobSearch, setJobSearch] = useState('');
  const [showJobDropdown, setShowJobDropdown] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    phone: '+251',
    country: 'Ethiopia',
    region: '',
    city: '',
    dateOfBirth: '',
    gender: '',
    bio: '',
    skills: '',
    experienceLevel: 'none',
    educationLevel: 'none',
    expectedSalary: '',
    availability: 'available',
    resume: null,
    idCard: null,
    certificate: null,
    paymentMethod: '',
    paymentProof: null,
    bankReference: ''
  });

  const resumeRef = useRef(null);
  const idCardRef = useRef(null);
  const certificateRef = useRef(null);
  const paymentProofRef = useRef(null);
  const jobDropdownRef = useRef(null);

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (jobDropdownRef.current && !jobDropdownRef.current.contains(event.target)) {
        setShowJobDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadJobs = async () => {
    try {
      const res = await jobsApi.getAll({ limit: 100 });
      setJobs(res.data.jobs || []);
    } catch (err) {
      console.error('Error loading jobs:', err);
    }
  };

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(jobSearch.toLowerCase())
  );

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

  const handleJobSelect = (job) => {
    setSelectedJob(job);
    setFormData(prev => ({ ...prev, desiredJob: job._id }));
    setJobSearch(job.title);
    setShowJobDropdown(false);
  };

  const isEducationNone = formData.educationLevel === 'none';

  const handleSubmitStep = async () => {
    setLoading(true);
    setError('');
    
    try {
      if (currentStep === 1) {
        const data = {
          firstName: formData.firstName,
          middleName: formData.middleName,
          lastName: formData.lastName,
          phone: formData.phone,
          country: formData.country,
          region: formData.region,
          city: formData.city,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          bio: formData.bio,
          skills: formData.skills,
          experienceLevel: formData.experienceLevel,
          educationLevel: formData.educationLevel,
          desiredJob: formData.desiredJob,
          expectedSalary: formData.expectedSalary,
          availability: formData.availability
        };
        
        if (!formData.firstName || !formData.lastName || !formData.phone || !formData.region || !formData.city) {
          setError('Please fill in all required fields');
          setLoading(false);
          return;
        }
        
        await authApi.completeEmployeeStep1(data);
        setCurrentStep(2);
      } else if (currentStep === 2) {
        const formDataToSend = new FormData();
        if (formData.resume) formDataToSend.append('resume', formData.resume);
        if (formData.idCard) formDataToSend.append('idCard', formData.idCard);
        if (formData.certificate) formDataToSend.append('certificate', formData.certificate);
        await authApi.completeEmployeeStep2(formDataToSend);
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
        
        await authApi.completeEmployeeStep3(formDataToSend);
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
              Your employee registration has been submitted successfully. Our admin team will review your application and documents.
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
          <h1 className="text-3xl font-bold text-brand-dark mb-2">Employee Registration</h1>
          <p className="text-brand-gray">Complete all steps to register as an employee</p>
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
              <h2 className="text-xl font-semibold text-brand-dark mb-4">Personal Information</h2>
              
              <div className="grid md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-2">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="input-glass w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-2">Middle Name</label>
                  <input
                    type="text"
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleChange}
                    className="input-glass w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-2">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="input-glass w-full"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input-glass w-full"
                    placeholder="+251..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-2">Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="input-glass w-full"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-2">Country</label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="input-glass w-full"
                  >
                    <option value="Ethiopia">Ethiopia</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-2">Region / State *</label>
                  <select
                    name="region"
                    value={formData.region}
                    onChange={handleChange}
                    className="input-glass w-full"
                    required
                  >
                    <option value="">Select Region</option>
                    {ETHIOPIAN_REGIONS.map(region => (
                      <option key={region} value={region}>{region}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-2">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="input-glass w-full"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-2">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="input-glass w-full"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-2">Availability</label>
                  <select
                    name="availability"
                    value={formData.availability}
                    onChange={handleChange}
                    className="input-glass w-full"
                  >
                    <option value="available">Available</option>
                    <option value="not_available">Not Available</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-2">Work Experience</label>
                  <select
                    name="experienceLevel"
                    value={formData.experienceLevel}
                    onChange={handleChange}
                    className="input-glass w-full"
                  >
                    {EXPERIENCE_LEVELS.map(level => (
                      <option key={level.value} value={level.value}>{level.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-2">Education Level</label>
                  <select
                    name="educationLevel"
                    value={formData.educationLevel}
                    onChange={handleChange}
                    className="input-glass w-full"
                  >
                    {EDUCATION_LEVELS.map(level => (
                      <option key={level.value} value={level.value}>{level.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="relative" ref={jobDropdownRef}>
                <label className="block text-sm font-medium text-brand-dark mb-2">Desired Job Position</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <FiSearch className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={jobSearch}
                    onChange={(e) => {
                      setJobSearch(e.target.value);
                      setShowJobDropdown(true);
                      if (!e.target.value) {
                        setSelectedJob(null);
                        setFormData(prev => ({ ...prev, desiredJob: null }));
                      }
                    }}
                    onFocus={() => setShowJobDropdown(true)}
                    className="input-glass w-full pl-10"
                    placeholder="Search for a job..."
                  />
                </div>
                {showJobDropdown && (
                  <div className="absolute z-50 w-full mt-1 bg-white rounded-xl shadow-lg border border-gray-100 max-h-60 overflow-y-auto">
                    {filteredJobs.length > 0 ? (
                      filteredJobs.map(job => (
                        <button
                          key={job._id}
                          onClick={() => handleJobSelect(job)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 transition border-b border-gray-50 last:border-0"
                        >
                          <p className="font-medium text-brand-dark">{job.title}</p>
                          <p className="text-sm text-brand-gray">{job.location} - {job.jobType}</p>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-center text-brand-gray">
                        No jobs found
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-dark mb-2">Skills (Optional)</label>
                <input
                  type="text"
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  className="input-glass w-full"
                  placeholder="JavaScript, React, Node.js..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-dark mb-2">Bio / Summary</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  className="input-glass w-full h-24"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-2">Expected Salary ($)</label>
                  <input
                    type="number"
                    name="expectedSalary"
                    value={formData.expectedSalary}
                    onChange={handleChange}
                    className="input-glass w-full"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-brand-dark mb-4">Upload Documents</h2>
              
              {isEducationNone && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                  <p className="text-blue-800 text-sm">
                    Since you selected "None of them" for education level, <strong>Resume/CV upload is optional</strong>. You can still upload if you have one.
                  </p>
                </div>
              )}
              
              <div className="space-y-6">
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-brand-indigo transition cursor-pointer"
                     onClick={() => resumeRef.current?.click()}>
                  <FiUpload className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                  <p className="text-brand-dark font-medium">Upload Resume / CV {isEducationNone ? '(Optional)' : '*'}</p>
                  <p className="text-sm text-brand-gray mt-1">PDF, DOC, or DOCX (max 5MB)</p>
                  <input
                    ref={resumeRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleFileChange(e, 'resume')}
                    className="hidden"
                  />
                  {formData.resume && (
                    <p className="mt-2 text-green-600 text-sm flex items-center justify-center gap-2">
                      <FiCheck className="w-4 h-4" /> {formData.resume.name}
                    </p>
                  )}
                </div>

                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-brand-indigo transition cursor-pointer"
                     onClick={() => idCardRef.current?.click()}>
                  <FiUpload className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                  <p className="text-brand-dark font-medium">Upload ID Card / Passport (Fayda) *</p>
                  <p className="text-sm text-brand-gray mt-1">PDF or Image (max 5MB)</p>
                  <input
                    ref={idCardRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(e, 'idCard')}
                    className="hidden"
                  />
                  {formData.idCard && (
                    <p className="mt-2 text-green-600 text-sm flex items-center justify-center gap-2">
                      <FiCheck className="w-4 h-4" /> {formData.idCard.name}
                    </p>
                  )}
                </div>
              </div>

              <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-brand-indigo transition cursor-pointer"
                   onClick={() => certificateRef.current?.click()}>
                <FiUpload className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                <p className="text-brand-dark font-medium">Upload Certificates (Optional)</p>
                <p className="text-sm text-brand-gray mt-1">PDF or Image (max 5MB)</p>
                <input
                  ref={certificateRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange(e, 'certificate')}
                  className="hidden"
                />
                {formData.certificate && (
                  <p className="mt-2 text-green-600 text-sm flex items-center justify-center gap-2">
                    <FiCheck className="w-4 h-4" /> {formData.certificate.name}
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
