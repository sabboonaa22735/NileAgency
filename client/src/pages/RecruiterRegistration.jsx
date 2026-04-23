import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBriefcase, FiFileText, FiCreditCard, FiArrowLeft, FiArrowRight, FiUpload, FiCheck, FiClock, FiGlobe, FiMapPin, FiFile, FiPhone, FiSun, FiMoon, FiShield, FiUsers, FiHome, FiCalendar, FiHash, FiUser } from 'react-icons/fi';
import { authApi } from '../services/api';

function FloatingOrb({ size, color, delay, duration, x, y }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl ${color}`}
      style={{ width: size, height: size, left: x, top: y }}
      initial={{ x: 0, y: 0, opacity: 0 }}
      animate={{ 
        x: [0, Math.random() * 80 - 40, 0], 
        y: [0, Math.random() * 80 - 40, 0],
        opacity: [0, 0.4, 0.25, 0]
      }}
      transition={{ 
        duration: duration || 18, 
        repeat: Infinity, 
        delay: delay || 0, 
        ease: 'easeInOut' 
      }}
    />
  );
}

const GridPattern = ({ isDark }) => (
  <div className="absolute inset-0 opacity-[0.03]">
    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="gridRec" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="0.5" className={isDark ? "text-purple-500" : "text-violet-500"}/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={isDark ? "url(#gridRec)" : "transparent"} />
    </svg>
  </div>
);

const ParticleField = ({ isDark }) => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(15)].map((_, i) => (
      <motion.div
        key={i}
        className={`absolute w-1.5 h-1.5 rounded-full ${isDark ? 'bg-purple-400' : 'bg-violet-500'}`}
        initial={{ x: Math.random() * 1200, y: Math.random() * 900, opacity: 0 }}
        animate={{ y: [null, -900], opacity: [0, isDark ? 0.7 : 0.9, 0] }}
        transition={{ duration: Math.random() * 8 + 14, repeat: Infinity, delay: Math.random() * 6, ease: 'linear' }}
      />
    ))}
  </div>
);

const ThemeToggle = ({ isDark, toggleTheme }) => (
  <motion.button
    onClick={toggleTheme}
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    className={`fixed top-6 right-6 z-50 p-3 rounded-2xl backdrop-blur-xl transition-all duration-300 ${
      isDark ? 'bg-white/10 hover:bg-white/20 text-yellow-400' : 'bg-slate-900/10 hover:bg-slate-900/20 text-slate-700'
    }`}
  >
    <motion.div animate={{ rotate: isDark ? 0 : 360 }} transition={{ duration: 0.5 }}>
      {isDark ? <FiMoon className="w-5 h-5" /> : <FiSun className="w-5 h-5" />}
    </motion.div>
  </motion.button>
);

const StepIndicator = ({ steps, currentStep, isDark }) => (
  <div className="mb-10">
    <div className="flex justify-between items-center relative">
      <div className={`absolute top-5 left-0 right-0 h-0.5 ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
      <motion.div 
        className="absolute top-5 left-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500"
        initial={{ width: '0%' }}
        animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        transition={{ duration: 0.5 }}
      />
      {steps.map((step) => {
        const isCompleted = currentStep > step.id;
        const isActive = currentStep === step.id;
        const Icon = step.icon;
        
        return (
          <div key={step.id} className="relative flex flex-col items-center z-10">
            <motion.div
              initial={false}
              animate={{ 
                scale: isActive ? 1.1 : 1,
                boxShadow: isActive 
                  ? '0 0 30px rgba(168, 85, 247, 0.5)' 
                  : isCompleted 
                    ? '0 0 20px rgba(16, 185, 129, 0.4)'
                    : 'none'
              }}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                isCompleted 
                  ? 'bg-gradient-to-br from-green-500 to-emerald-500' 
                  : isActive 
                    ? 'bg-gradient-to-br from-purple-500 to-pink-500' 
                    : isDark ? 'bg-slate-800' : 'bg-slate-200'
              }`}
            >
              {isCompleted ? (
                <FiCheck className="w-5 h-5 text-white" />
              ) : (
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : isDark ? 'text-slate-500' : 'text-slate-400'}`} />
              )}
            </motion.div>
            <motion.span 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`absolute top-14 text-xs font-medium whitespace-nowrap ${
                isActive 
                  ? isDark ? 'text-white' : 'text-slate-900'
                  : isDark ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              {step.title}
            </motion.span>
          </div>
        );
      })}
    </div>
  </div>
);

const InputField = ({ label, type = 'text', name, value, onChange, placeholder, required, isDark, icon: Icon, multiline }) => (
  <div className="space-y-2">
    <label className={`block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {Icon && (
        <div className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          <Icon className="w-5 h-5" />
        </div>
      )}
      {multiline ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={4}
          className={`w-full px-4 py-3.5 rounded-2xl transition-all duration-300 outline-none resize-none ${
            isDark 
              ? 'bg-slate-800/50 border border-slate-700 focus:border-purple-500 text-white placeholder-slate-500' 
              : 'bg-white border border-slate-200 focus:border-violet-500 text-slate-900 placeholder-slate-400'
          } ${Icon ? 'pl-12' : ''}`}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full px-4 py-3.5 rounded-2xl transition-all duration-300 outline-none ${
            isDark 
              ? 'bg-slate-800/50 border border-slate-700 focus:border-purple-500 text-white placeholder-slate-500' 
              : 'bg-white border border-slate-200 focus:border-violet-500 text-slate-900 placeholder-slate-400'
          } ${Icon ? 'pl-12' : ''}`}
        />
      )}
    </div>
  </div>
);

const SelectField = ({ label, name, value, onChange, options, required, isDark, icon: Icon }) => (
  <div className="space-y-2">
    <label className={`block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {Icon && (
        <div className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          <Icon className="w-5 h-5" />
        </div>
      )}
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-3.5 rounded-2xl transition-all duration-300 outline-none appearance-none cursor-pointer ${
          isDark 
            ? 'bg-slate-800/50 border border-slate-700 focus:border-purple-500 text-white' 
            : 'bg-white border border-slate-200 focus:border-violet-500 text-slate-900'
        } ${Icon ? 'pl-12' : ''}`}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <div className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
        <FiCalendar className="w-4 h-4" />
      </div>
    </div>
  </div>
);

const FileUpload = ({ label, file, onClick, isDark, required, hint }) => (
  <motion.div
    whileHover={{ scale: 1.01 }}
    whileTap={{ scale: 0.99 }}
    onClick={onClick}
    className={`relative p-8 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-300 ${
      file 
        ? isDark 
          ? 'border-purple-500 bg-purple-500/10' 
          : 'border-violet-500 bg-violet-50'
        : isDark 
          ? 'border-slate-700 hover:border-slate-600 bg-slate-800/30' 
          : 'border-slate-300 hover:border-slate-400 bg-slate-50'
    }`}
  >
    <div className="flex flex-col items-center text-center">
      <motion.div 
        className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${
          file 
            ? 'bg-gradient-to-br from-purple-500 to-pink-500' 
            : isDark ? 'bg-slate-700' : 'bg-slate-200'
        }`}
        animate={file ? { boxShadow: ['0 0 20px rgba(168, 85, 247, 0.4)', '0 0 40px rgba(168, 85, 247, 0.2)', '0 0 20px rgba(168, 85, 247, 0.4)'] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {file ? (
          <FiCheck className="w-8 h-8 text-white" />
        ) : (
          <FiUpload className={`w-8 h-8 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
        )}
      </motion.div>
      <p className={`font-medium mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
        {label} {required && <span className="text-red-500">*</span>}
      </p>
      <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
        {file ? file.name : hint}
      </p>
    </div>
  </motion.div>
);

const PaymentCard = ({ method, icon: Icon, title, subtitle, isSelected, onClick, isDark }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`relative p-6 rounded-2xl cursor-pointer transition-all duration-300 overflow-hidden ${
      isSelected 
        ? isDark 
          ? 'ring-2 ring-purple-500 bg-gradient-to-br from-purple-500/20 to-pink-500/20' 
          : 'ring-2 ring-violet-500 bg-violet-50'
        : isDark 
          ? 'bg-slate-800/50 border border-slate-700 hover:border-slate-600' 
          : 'bg-white border border-slate-200 hover:border-slate-300'
    }`}
  >
    {isSelected && (
      <motion.div 
        className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10"
        animate={{ x: ['0%', '100%', '0%'] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
    )}
    <div className="relative flex flex-col items-center text-center">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 ${
        isSelected 
          ? 'bg-gradient-to-br from-purple-500 to-pink-500' 
          : isDark ? 'bg-slate-700' : 'bg-slate-100'
      }`}>
        <Icon className={`w-7 h-7 ${isSelected ? 'text-white' : isDark ? 'text-slate-400' : 'text-slate-500'}`} />
      </div>
      <h4 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{title}</h4>
      <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{subtitle}</p>
    </div>
  </motion.div>
);

const STEPS = [
  { id: 1, title: 'Company Info', icon: FiBriefcase },
  { id: 2, title: 'Documents', icon: FiFileText },
  { id: 3, title: 'Payment', icon: FiCreditCard }
];

const APPLICATION_FEE = 10000;

const INDUSTRIES = [
  { value: '', label: 'Select Industry' },
  { value: 'technology', label: 'Technology' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'finance', label: 'Finance' },
  { value: 'education', label: 'Education' },
  { value: 'retail', label: 'Retail' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'other', label: 'Other' }
];

export default function RecruiterRegistration() {
  const [darkMode, setDarkMode] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentSettings, setPaymentSettings] = useState([]);
  const [telebirrSettings, setTelebirrSettings] = useState({});
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    companyName: '', industry: '', industryOther: '', numberOfEmployees: '', companyDescription: '',
    website: '', foundedYear: '',
    managerName: '', city: '', kebele: '',
    contactEmail: '', contactPhone: '',
    businessLicense: null, companyLogo: null, taxDocument: null,
    paymentMethod: '', paymentProof: null, bankReference: ''
  });

  const businessLicenseRef = useRef(null);
  const companyLogoRef = useRef(null);
  const taxDocumentRef = useRef(null);
  const paymentProofRef = useRef(null);

  useEffect(() => { loadPaymentSettings(); }, []);

  const loadPaymentSettings = async () => {
    try {
      const payRes = await fetch('/api/admin/public-payment-settings');
      if (payRes.ok) {
        const data = await payRes.json();
        setPaymentSettings(data);
        const telebirrData = data.filter(s => s.category === 'telebirr');
        if (telebirrData.length > 0) {
          const telebirrObj = {};
          telebirrData.forEach(s => { telebirrObj[s.key] = s.value; });
          setTelebirrSettings(telebirrObj);
        }
      }
    } catch (err) { console.error('Error loading payment settings:', err); }
  };

  const colors = darkMode ? {
    bg: 'bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950',
    text: { primary: 'text-white', secondary: 'text-slate-300', muted: 'text-slate-400' },
    orbs: ['bg-purple-500/15', 'bg-pink-500/15', 'bg-violet-500/10']
  } : {
    bg: 'bg-gradient-to-br from-violet-50 via-white to-purple-50',
    text: { primary: 'text-slate-900', secondary: 'text-slate-700', muted: 'text-slate-500' },
    orbs: ['bg-violet-400/20', 'bg-purple-400/20', 'bg-pink-400/15']
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) setFormData(prev => ({ ...prev, [field]: file }));
  };

  const handlePaymentMethodSelect = (method) => setFormData(prev => ({ ...prev, paymentMethod: method }));

  const handleSubmitStep = async () => {
    setLoading(true);
    setError('');
    try {
      if (currentStep === 1) {
        if (!formData.companyName || !formData.managerName || !formData.city || !formData.kebele) {
          setError('Please fill in all required fields');
          setLoading(false);
          return;
        }
        if (formData.industry === 'other' && !formData.industryOther) {
          setError('Please specify your industry');
          setLoading(false);
          return;
        }
        const data = {
          companyName: formData.companyName, industry: formData.industry === 'other' ? formData.industryOther : formData.industry, numberOfEmployees: formData.numberOfEmployees,
          companyDescription: formData.companyDescription, website: formData.website,
          foundedYear: formData.foundedYear, managerName: formData.managerName, city: formData.city, kebele: formData.kebele,
          contactEmail: formData.contactEmail, contactPhone: formData.contactPhone
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
        if (!formData.paymentMethod || !formData.paymentProof) {
          setError('Please select payment method and upload proof');
          setLoading(false);
          return;
        }
        const formDataToSend = new FormData();
        formDataToSend.append('paymentMethod', formData.paymentMethod);
        formDataToSend.append('paymentProof', formData.paymentProof);
        if (formData.bankReference) formDataToSend.append('bankReference', formData.bankReference);
        await authApi.completeRecruiterStep3(formDataToSend);
        setCurrentStep(4);
      }
    } catch (err) { setError(err.response?.data?.message || 'An error occurred'); }
    setLoading(false);
  };

  const handleBack = () => currentStep > 1 ? setCurrentStep(prev => prev - 1) : navigate('/role-selection');
  const handleLogout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/login'); };

  if (currentStep === 4) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden ${colors.bg}`}>
        <GridPattern isDark={darkMode} />
        {[0, 1, 2].map(i => (
          <FloatingOrb key={i} size={['500px', '400px', '300px'][i]} color={colors.orbs[i]} delay={i * 2} duration={15} x={['10%', '70%', '30%'][i]} y={['10%', '60%', '70%'][i]} />
        ))}
        
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 max-w-lg w-full">
          <div className={`backdrop-blur-xl rounded-3xl p-10 text-center border ${darkMode ? 'bg-slate-900/80 border-slate-700' : 'bg-white/80 border-slate-200'} shadow-2xl`}>
            <motion.div 
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 15 }}
              className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mx-auto mb-6 shadow-lg"
            >
              <FiClock className="w-12 h-12 text-white" />
            </motion.div>
            <h1 className={`text-3xl font-bold mb-4 ${colors.text.primary}`}>Registration Submitted!</h1>
            <p className={`mb-6 ${colors.text.muted}`}>Your recruiter registration has been submitted successfully. Our admin team will review your company details.</p>
            <div className={`rounded-2xl p-5 mb-6 text-left ${darkMode ? 'bg-violet-500/10 border border-violet-500/20' : 'bg-violet-50 border border-violet-200'}`}>
              <p className={`text-sm ${darkMode ? 'text-violet-300' : 'text-violet-800'}`}>
                <strong>Important:</strong> We will let you know by email within <strong>10 minutes</strong> if approved.
              </p>
              <p className={`text-sm mt-3 ${darkMode ? 'text-violet-300' : 'text-violet-800'}`}>
                Or call us at: <span className="font-bold flex items-center gap-2 mt-1"><FiPhone className="w-4 h-4" /> 0998765432</span>
              </p>
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleLogout} className="w-full py-4 rounded-2xl font-semibold text-white bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg shadow-purple-500/25">
              Return to Login
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 py-20 relative overflow-hidden ${colors.bg}`}>
      <GridPattern isDark={darkMode} />
      <ParticleField isDark={darkMode} />
      {[0, 1, 2].map(i => (
        <FloatingOrb key={i} size={['500px', '400px', '300px'][i]} color={colors.orbs[i]} delay={i * 2} duration={15} x={['10%', '70%', '30%'][i]} y={['10%', '60%', '70%'][i]} />
      ))}
      
      <ThemeToggle isDark={darkMode} toggleTheme={() => setDarkMode(!darkMode)} />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-3xl">
        <div className="text-center mb-8">
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
            <motion.div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-4" animate={darkMode ? { boxShadow: ['0 0 20px rgba(168, 85, 247, 0.3)', '0 0 40px rgba(236, 72, 153, 0.3)', '0 0 20px rgba(168, 85, 247, 0.3)'] } : {}}>
              <span className={`w-2 h-2 rounded-full ${darkMode ? 'bg-green-400' : 'bg-green-500'}`} />
              <span className={`text-sm font-medium ${darkMode ? 'text-white/80' : 'text-slate-700'}`}>Recruiter Registration</span>
            </motion.div>
          </motion.div>
          <motion.h1 initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className={`text-4xl font-bold mb-2 ${darkMode ? 'bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent' : 'text-slate-900'}`}>
            Company Details
          </motion.h1>
          <motion.p initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className={colors.text.muted}>
            Complete your company registration to start hiring
          </motion.p>
        </div>

        <StepIndicator steps={STEPS} currentStep={currentStep} isDark={darkMode} />

        <motion.div 
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className={`backdrop-blur-xl rounded-3xl p-8 border shadow-2xl ${darkMode ? 'bg-slate-900/80 border-slate-700' : 'bg-white/80 border-slate-200'}`}
        >
          <AnimatePresence mode="wait">
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </motion.div>
            )}

            {currentStep === 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <h2 className={`text-xl font-semibold mb-6 ${colors.text.primary}`}>Company Information</h2>
                <InputField label="Company Name" name="companyName" value={formData.companyName} onChange={handleChange} placeholder="Enter company name" required isDark={darkMode} icon={FiHome} />
                
                <div className="grid md:grid-cols-2 gap-5">
                  <SelectField label="Industry" name="industry" value={formData.industry} onChange={handleChange} options={INDUSTRIES} isDark={darkMode} icon={FiBriefcase} />
                  <InputField label="Founded Year" name="foundedYear" value={formData.foundedYear} onChange={handleChange} placeholder="e.g., 2015" isDark={darkMode} icon={FiCalendar} />
                </div>
                
                {formData.industry === 'other' && (
                  <InputField label="Please Specify Industry" name="industryOther" value={formData.industryOther} onChange={handleChange} placeholder="Enter industry name" required isDark={darkMode} icon={FiBriefcase} />
                )}
                
                <InputField label="Company Website" name="website" value={formData.website} onChange={handleChange} placeholder="https://example.com (optional)" isDark={darkMode} icon={FiGlobe} />
                
                <div className={`border-t pt-6 mt-6 ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                  <h3 className={`text-lg font-semibold mb-5 ${colors.text.primary}`}>Contact Information</h3>
                  <div className="grid md:grid-cols-2 gap-5">
                    <InputField label="Manager/CEO Name" name="managerName" value={formData.managerName} onChange={handleChange} placeholder="Full name of Manager or CEO" required isDark={darkMode} icon={FiUser} />
                    <InputField label="Contact Phone" name="contactPhone" value={formData.contactPhone} onChange={handleChange} placeholder="+251..." required isDark={darkMode} icon={FiPhone} />
                  </div>
                  <div className="grid md:grid-cols-2 gap-5 mt-5">
                    <InputField label="City" name="city" value={formData.city} onChange={handleChange} placeholder="City" required isDark={darkMode} icon={FiMapPin} />
                    <InputField label="Kebele" name="kebele" value={formData.kebele} onChange={handleChange} placeholder="Kebele" required isDark={darkMode} icon={FiMapPin} />
                  </div>
                  <div className="grid md:grid-cols-2 gap-5 mt-5">
                    <InputField label="Contact Email" type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange} placeholder="contact@company.com" required isDark={darkMode} icon={FiGlobe} />
                    <InputField label="Number of Employees" name="numberOfEmployees" value={formData.numberOfEmployees} onChange={handleChange} placeholder="Total employees" required isDark={darkMode} icon={FiUsers} />
                  </div>
                </div>

                <div className={`border-t pt-6 mt-6 ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                  <h3 className={`text-lg font-semibold mb-3 ${colors.text.primary}`}>Company Description</h3>
                  <p className={`text-sm mb-4 ${colors.text.muted}`}>Write specifically what service your company is providing and other information you want to provide.</p>
                  <InputField label="Company Description" name="companyDescription" value={formData.companyDescription} onChange={handleChange} placeholder="Tell us about your company, services provided, etc..." multiline isDark={darkMode} />
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <h2 className={`text-xl font-semibold mb-6 ${colors.text.primary}`}>Upload Company Documents</h2>
                <div className="grid gap-5">
                  <FileUpload label="Business License / Trade License" file={formData.businessLicense} onClick={() => businessLicenseRef.current?.click()} isDark={darkMode} required hint="PDF or Image (max 5MB)" />
                  <input ref={businessLicenseRef} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileChange(e, 'businessLicense')} className="hidden" />
                  
                  <FileUpload label="Company Logo (Optional)" file={formData.companyLogo} onClick={() => companyLogoRef.current?.click()} isDark={darkMode} hint="PNG, JPG, or SVG (max 2MB)" />
                  <input ref={companyLogoRef} type="file" accept=".png,.jpg,.jpeg,.svg" onChange={(e) => handleFileChange(e, 'companyLogo')} className="hidden" />
                  
                  <FileUpload label="Tax Registration Document (Optional)" file={formData.taxDocument} onClick={() => taxDocumentRef.current?.click()} isDark={darkMode} hint="PDF or Image (max 5MB)" />
                  <input ref={taxDocumentRef} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileChange(e, 'taxDocument')} className="hidden" />
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <h2 className={`text-xl font-semibold mb-6 ${colors.text.primary}`}>Application Fee Payment</h2>
                <motion.div 
                  className="relative overflow-hidden rounded-2xl p-8 text-center"
                  animate={{ boxShadow: ['0 0 30px rgba(168, 85, 247, 0.3)', '0 0 50px rgba(236, 72, 153, 0.3)', '0 0 30px rgba(168, 85, 247, 0.3)'] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 opacity-90" />
                  <div className="relative">
                    <p className="text-white/80 mb-1">Application Fee</p>
                    <p className="text-5xl font-bold text-white">{APPLICATION_FEE.toLocaleString()} ETB</p>
                  </div>
                </motion.div>

                <div>
                  <h3 className={`text-lg font-medium mb-4 ${colors.text.secondary}`}>Select Payment Method</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <PaymentCard method="bank" icon={FiFile} title="Bank Transfer" subtitle="Pay via bank account" isSelected={formData.paymentMethod === 'bank'} onClick={() => handlePaymentMethodSelect('bank')} isDark={darkMode} />
                    <PaymentCard method="telebirr" icon={FiPhone} title="Telebirr" subtitle="Pay via Telebirr" isSelected={formData.paymentMethod === 'telebirr'} onClick={() => handlePaymentMethodSelect('telebirr')} isDark={darkMode} />
                  </div>
                </div>

                {formData.paymentMethod === 'bank' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className={`p-5 rounded-2xl ${darkMode ? 'bg-violet-500/10 border border-violet-500/20' : 'bg-violet-50 border border-violet-200'}`}>
                    <h4 className={`font-semibold mb-3 ${darkMode ? 'text-violet-300' : 'text-violet-800'}`}>Bank Transfer Details</h4>
                    <div className={`text-sm space-y-1 ${darkMode ? 'text-violet-200' : 'text-violet-700'}`}>
                      {paymentSettings.filter(s => s.category === 'bank').map(s => (
                        <p key={s.key}><strong>{s.label}:</strong> {s.value}</p>
                      ))}
                    </div>
                  </motion.div>
                )}

                {formData.paymentMethod === 'telebirr' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className={`p-5 rounded-2xl ${darkMode ? 'bg-green-500/10 border border-green-500/20' : 'bg-green-50 border border-green-200'}`}>
                    <h4 className={`font-semibold mb-3 ${darkMode ? 'text-green-300' : 'text-green-800'}`}>Telebirr Payment</h4>
                    <div className={`text-sm space-y-2 ${darkMode ? 'text-green-200' : 'text-green-700'}`}>
                      {telebirrSettings.telebirr_fullname && (
                        <p><strong>Full Name:</strong> {telebirrSettings.telebirr_fullname}</p>
                      )}
                      {telebirrSettings.telebirr_phone && (
                        <p><strong>Phone Number:</strong> {telebirrSettings.telebirr_phone}</p>
                      )}
                      {telebirrSettings.telebirr_instructions && (
                        <p className="mt-2"><strong>Instructions:</strong> {telebirrSettings.telebirr_instructions}</p>
                      )}
                    </div>
                  </motion.div>
                )}

                {formData.paymentMethod && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                    {formData.paymentMethod === 'bank' && (
                      <InputField label="Bank Reference / Transaction ID" name="bankReference" value={formData.bankReference} onChange={handleChange} placeholder="Enter transaction reference" required isDark={darkMode} icon={FiShield} />
                    )}
                    <FileUpload label="Payment Proof" file={formData.paymentProof} onClick={() => paymentProofRef.current?.click()} isDark={darkMode} required hint="Screenshot or photo (max 5MB)" />
                    <input ref={paymentProofRef} type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => handleFileChange(e, 'paymentProof')} className="hidden" />
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-between mt-10">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleBack} className={`flex items-center gap-2 px-6 py-3 rounded-2xl border transition ${darkMode ? 'border-slate-700 hover:bg-slate-800 text-slate-300' : 'border-slate-200 hover:bg-slate-50 text-slate-700'}`}>
              <FiArrowLeft /> Back
            </motion.button>
            <motion.button whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.98 }} onClick={handleSubmitStep} disabled={loading} className="flex items-center gap-2 px-8 py-3 rounded-2xl font-semibold text-white bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg shadow-purple-500/25 disabled:opacity-50">
              {loading ? <motion.div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} /> : <>{currentStep === 3 ? 'Submit' : 'Continue'} <FiArrowRight /></>}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}