import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { FiUser, FiFileText, FiCreditCard, FiArrowLeft, FiArrowRight, FiUpload, FiCheck, FiClock, FiPhone, FiSearch, FiSun, FiMoon, FiMapPin, FiCalendar, FiAward, FiDollarSign, FiSend, FiFile, FiShield, FiUserCheck } from 'react-icons/fi';
import { authApi, jobsApi } from '../services/api';

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
        <pattern id="gridEmp" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="0.5" className={isDark ? "text-indigo-500" : "text-blue-500"}/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={isDark ? "url(#gridEmp)" : "transparent"} />
    </svg>
  </div>
);

const ParticleField = ({ isDark }) => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(15)].map((_, i) => (
      <motion.div
        key={i}
        className={`absolute w-1.5 h-1.5 rounded-full ${isDark ? 'bg-cyan-400' : 'bg-blue-500'}`}
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
        className="absolute top-5 left-0 h-0.5 bg-gradient-to-r from-cyan-500 to-purple-500"
        initial={{ width: '0%' }}
        animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        transition={{ duration: 0.5 }}
      />
      {steps.map((step, index) => {
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
                  ? '0 0 30px rgba(6, 182, 212, 0.5)' 
                  : isCompleted 
                    ? '0 0 20px rgba(16, 185, 129, 0.4)'
                    : 'none'
              }}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                isCompleted 
                  ? 'bg-gradient-to-br from-green-500 to-emerald-500' 
                  : isActive 
                    ? 'bg-gradient-to-br from-cyan-500 to-purple-500' 
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

const InputField = ({ label, type = 'text', name, value, onChange, placeholder, required, isDark, options, icon: Icon, multiline }) => (
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
              ? 'bg-slate-800/50 border border-slate-700 focus:border-cyan-500 text-white placeholder-slate-500' 
              : 'bg-white border border-slate-200 focus:border-blue-500 text-slate-900 placeholder-slate-400'
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
              ? 'bg-slate-800/50 border border-slate-700 focus:border-cyan-500 text-white placeholder-slate-500' 
              : 'bg-white border border-slate-200 focus:border-blue-500 text-slate-900 placeholder-slate-400'
          } ${Icon ? 'pl-12' : ''}`}
        />
      )}
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
          ? 'border-cyan-500 bg-cyan-500/10' 
          : 'border-blue-500 bg-blue-50'
        : isDark 
          ? 'border-slate-700 hover:border-slate-600 bg-slate-800/30' 
          : 'border-slate-300 hover:border-slate-400 bg-slate-50'
    }`}
  >
    <div className="flex flex-col items-center text-center">
      <motion.div 
        className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${
          file 
            ? 'bg-gradient-to-br from-cyan-500 to-purple-500' 
            : isDark ? 'bg-slate-700' : 'bg-slate-200'
        }`}
        animate={file ? { boxShadow: ['0 0 20px rgba(6, 182, 212, 0.4)', '0 0 40px rgba(6, 182, 212, 0.2)', '0 0 20px rgba(6, 182, 212, 0.4)'] } : {}}
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
          ? 'ring-2 ring-cyan-500 bg-gradient-to-br from-cyan-500/20 to-purple-500/20' 
          : 'ring-2 ring-blue-500 bg-blue-50'
        : isDark 
          ? 'bg-slate-800/50 border border-slate-700 hover:border-slate-600' 
          : 'bg-white border border-slate-200 hover:border-slate-300'
    }`}
  >
    {isSelected && (
      <motion.div 
        className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10"
        animate={{ x: ['0%', '100%', '0%'] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
    )}
    <div className="relative flex flex-col items-center text-center">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 ${
        isSelected 
          ? 'bg-gradient-to-br from-cyan-500 to-purple-500' 
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
  { id: 1, title: 'Personal Info', icon: FiUser },
  { id: 2, title: 'Documents', icon: FiFileText },
  { id: 3, title: 'Payment', icon: FiCreditCard }
];

const ETHIOPIAN_REGIONS = [
  'Addis Ababa', 'Afar', 'Amhara', 'Benishangul-Gumuz', 'Dire Dawa',
  'Gambela', 'Harari', 'Oromia', 'Sidama', 'Somali', 'Tigray', 'South West Ethiopia'
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
  { value: 'phd', label: 'PHD' }, { value: 'masters', label: 'Masters' },
  { value: 'degree', label: 'Degree' }, { value: 'diploma', label: 'Diploma' },
  { value: 'level_1', label: 'Level I' }, { value: 'level_2', label: 'Level II' },
  { value: 'level_3', label: 'Level III' }, { value: 'level_4', label: 'Level IV' },
  { value: 'above_level_4', label: 'Above Level IV' }, { value: 'above_grade_8', label: 'Above Grade 8' },
  { value: 'above_grade_10', label: 'Above Grade 10' }, { value: 'above_grade_12', label: 'Above Grade 12' },
  { value: 'none', label: 'None of them' }
];

const TECH_KEYWORDS = ['javascript', 'java', 'python', 'react', 'angular', 'vue', 'node', 'php', 'ruby', 'swift', 'kotlin', 'sql', 'mysql', 'mongodb', 'database', 'web', 'developer', 'software', 'code', 'programming', 'html', 'css', 'json', 'api', 'cloud', 'aws', 'azure', 'docker', 'kubernetes', 'linux', 'server', 'network', 'security', 'cyber', 'it', 'information technology', 'computer', 'data', 'ai', 'machine learning', 'ml', 'artificial intelligence', 'deep learning', 'blockchain', 'crypto', 'mobile', 'ios', 'android', 'app', 'game', 'testing', 'qa', 'automation', 'devops', 'ci/cd', 'git', 'github', 'gitlab'];

const LANGUAGES = [
  { value: 'oromic', label: 'Oromic' },
  { value: 'english', label: 'English' },
  { value: 'amahric', label: 'Amahric' },
  { value: 'other', label: 'Other' }
];

const ETHIOPIAN_JOBS = [
  { value: 'driver', label: 'Driver' },
  { value: 'secretary', label: 'Secretary' },
  { value: 'receptionist', label: 'Receptionist' },
  { value: 'security_guard', label: 'Security Guard' },
  { value: 'cleaner', label: 'Cleaner' },
  { value: 'cook', label: 'Cook' },
  { value: 'waiter', label: 'Waiter' },
  { value: 'cashier', label: 'Cashier' },
  { value: 'accountant', label: 'Accountant' },
  { value: 'bookkeeper', label: 'Bookkeeper' },
  { value: 'salesperson', label: 'Salesperson' },
  { value: 'storekeeper', label: 'Storekeeper' },
  { value: 'electrician', label: 'Electrician' },
  { value: 'plumber', label: 'Plumber' },
  { value: 'mechanic', label: 'Mechanic' },
  { value: 'carpenter', label: 'Carpenter' },
  { value: 'mason', label: 'Mason' },
  { value: 'painter', label: 'Painter' },
  { value: 'gardener', label: 'Gardener' },
  { value: 'nurse', label: 'Nurse' },
  { value: 'pharmacist', label: 'Pharmacist' },
  { value: 'lab_technician', label: 'Lab Technician' },
  { value: 'teacher', label: 'Teacher' },
  { value: 'instructor', label: 'Instructor' },
  { value: 'tailor', label: 'Tailor' },
  { value: 'seamstress', label: 'Seamstress' },
  { value: 'photographer', label: 'Photographer' },
  { value: 'video_editor', label: 'Video Editor' },
  { value: 'graphic_designer', label: 'Graphic Designer' },
  { value: 'web_developer', label: 'Web Developer' },
  { value: 'software_developer', label: 'Software Developer' },
  { value: 'data_entry', label: 'Data Entry' },
  { value: 'customer_service', label: 'Customer Service' },
  { value: 'call_center', label: 'Call Center Agent' },
  { value: 'courier', label: 'Courier' },
  { value: 'delivery_person', label: 'Delivery Person' },
  { value: 'construction_worker', label: 'Construction Worker' },
  { value: 'factory_worker', label: 'Factory Worker' },
  { value: 'warehouse_worker', label: 'Warehouse Worker' },
  { value: 'hotel_manager', label: 'Hotel Manager' },
  { value: 'restaurant_manager', label: 'Restaurant Manager' },
  { value: 'shop_manager', label: 'Shop Manager' },
  { value: 'office_assistant', label: 'Office Assistant' },
  { value: 'hr_assistant', label: 'HR Assistant' },
  { value: 'logistics', label: 'Logistics' },
  { value: 'procurement', label: 'Procurement' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'social_media', label: 'Social Media Manager' },
  { value: 'content_creator', label: 'Content Creator' },
  { value: 'journalist', label: 'Journalist' },
  { value: 'translator', label: 'Translator' },
  { value: 'interpreter', label: 'Interpreter' },
  { value: 'barista', label: 'Barista' },
  { value: 'bouncer', label: 'Bouncer' },
  { value: 'fitness_trainer', label: 'Fitness Trainer' },
  { value: 'beautician', label: 'Beautician' },
  { value: 'hairdresser', label: 'Hairdresser' },
  { value: 'massage_therapist', label: 'Massage Therapist' },
  { value: 'other', label: 'Other' }
];

export default function EmployeeRegistration() {
  const [darkMode, setDarkMode] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [jobs, setJobs] = useState([]);
  const [jobSearch, setJobSearch] = useState('');
  const [showJobDropdown, setShowJobDropdown] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [paymentSettings, setPaymentSettings] = useState([]);
  const [telebirrSettings, setTelebirrSettings] = useState({});
  const [applicationFee, setApplicationFee] = useState(0);
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstName: '', middleName: '', lastName: '', phone: '+251', country: 'Ethiopia',
    region: '', city: '', dateOfBirth: '', gender: '', bio: '', skills: '',
    experienceLevel: 'none', educationLevel: 'none', expectedSalary: '', availability: 'available',
    resume: null, idCard: null, certificate: null, paymentMethod: '', paymentProof: null, bankReference: '',
    typeOfJob: '', typeOfJobOther: '', languages: [], languageOther: ''
  });

  const resumeRef = useRef(null);
  const idCardRef = useRef(null);
  const certificateRef = useRef(null);
  const paymentProofRef = useRef(null);
  const jobDropdownRef = useRef(null);

  const colors = darkMode ? {
    bg: 'bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950',
    card: 'from-slate-900 to-slate-800',
    cardBorder: 'border-slate-700',
    text: { primary: 'text-white', secondary: 'text-slate-300', muted: 'text-slate-400' },
    orbs: ['bg-cyan-500/15', 'bg-purple-500/15', 'bg-pink-500/10']
  } : {
    bg: 'bg-gradient-to-br from-blue-50 via-white to-purple-50',
    card: 'from-white to-slate-50',
    cardBorder: 'border-slate-200',
    text: { primary: 'text-slate-900', secondary: 'text-slate-700', muted: 'text-slate-500' },
    orbs: ['bg-blue-400/20', 'bg-purple-400/20', 'bg-pink-400/15']
  };

  useEffect(() => { loadJobs(); loadPaymentSettings(); }, []);
  
  useEffect(() => {
    if (currentStep === 4 && !companyPhone) {
      loadPaymentSettings();
    }
  }, [currentStep]);
  
  const loadPaymentSettings = async () => {
    try {
      const payRes = await fetch('/api/admin/public-payment-settings');
      if (payRes.ok) {
        const data = await payRes.json();
        setPaymentSettings(data);
        const feeSetting = data.find(s => s.key === 'employee_fee');
        if (feeSetting) {
          setApplicationFee(parseInt(feeSetting.value) || 0);
        }
        const phoneSetting = data.find(s => s.key === 'company_phone');
        if (phoneSetting && phoneSetting.value) {
          setCompanyPhone(phoneSetting.value);
        } else {
          setCompanyPhone('+251912345678');
        }
        const emailSetting = data.find(s => s.key === 'company_email');
        if (emailSetting && emailSetting.value) {
          setCompanyEmail(emailSetting.value);
        } else {
          setCompanyEmail('info@nileagency.com');
        }
      }
    } catch (err) {
      console.error('Error loading payment settings:', err);
      setCompanyPhone('+251912345678');
      setCompanyEmail('info@nileagency.com');
    }
  };
  
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
    } catch (err) { console.error('Error loading jobs:', err); }
  };

  const filteredJobs = jobs.filter(job => job.title.toLowerCase().includes(jobSearch.toLowerCase()));

  const isResumeRequired = () => {
    const eduLevel = formData.educationLevel;
    const skills = formData.skills?.toLowerCase() || '';
    
    const aboveDiplomaLevels = ['phd', 'masters', 'degree'];
    const isAboveDiploma = aboveDiplomaLevels.includes(eduLevel);
    
    const hasTechSkills = TECH_KEYWORDS.some(keyword => skills.includes(keyword));
    
    return isAboveDiploma || hasTechSkills;
  };

  const resumeRequired = isResumeRequired();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) setFormData(prev => ({ ...prev, [field]: file }));
  };

  const handlePaymentMethodSelect = (method) => setFormData(prev => ({ ...prev, paymentMethod: method }));

  const handleJobSelect = (job) => {
    setSelectedJob(job);
    setFormData(prev => ({ ...prev, typeOfJob: job._id, typeOfJobOther: '' }));
    setJobSearch(job.title);
    setShowJobDropdown(false);
  };

  const handleLanguageToggle = (lang) => {
    setFormData(prev => {
      const currentLangs = prev.languages || [];
      const newLangs = currentLangs.includes(lang)
        ? currentLangs.filter(l => l !== lang)
        : [...currentLangs, lang];
      return {
        ...prev,
        languages: newLangs,
        languageOther: lang !== 'other' ? prev.languageOther : prev.languageOther
      };
    });
  };

  const handleSubmitStep = async () => {
    setLoading(true);
    setError('');
    try {
      if (currentStep === 1) {
        if (!formData.firstName || !formData.lastName || !formData.phone || !formData.region || !formData.city) {
          setError('Please fill in all required fields');
          setLoading(false);
          return;
        }
        if (!formData.typeOfJob) {
          setError('Please select a Type of Job');
          setLoading(false);
          return;
        }
        if (!formData.languages || formData.languages.length === 0) {
          setError('Please select at least one language');
          setLoading(false);
          return;
        }
        const data = {
          firstName: formData.firstName, middleName: formData.middleName, lastName: formData.lastName,
          phone: formData.phone, country: formData.country, region: formData.region, city: formData.city,
          dateOfBirth: formData.dateOfBirth, gender: formData.gender, bio: formData.bio, skills: formData.skills,
          experienceLevel: formData.experienceLevel, educationLevel: formData.educationLevel,
          typeOfJob: formData.typeOfJob, typeOfJobOther: formData.typeOfJobOther,
          languages: formData.languages, languageOther: formData.languageOther,
          expectedSalary: formData.expectedSalary, availability: formData.availability
        };
        await authApi.completeEmployeeStep1(data);
        setCurrentStep(2);
      } else if (currentStep === 2) {
        if (isResumeRequired() && !formData.resume) {
          setError('Resume/CV is required for your education level or technology-related skills');
          setLoading(false);
          return;
        }
        if (!formData.idCard) {
          setError('ID Card / Passport (Fayda) is required');
          setLoading(false);
          return;
        }
        const formDataToSend = new FormData();
        if (formData.resume) formDataToSend.append('resume', formData.resume);
        if (formData.idCard) formDataToSend.append('idCard', formData.idCard);
        if (formData.certificate) formDataToSend.append('certificate', formData.certificate);
        await authApi.completeEmployeeStep2(formDataToSend);
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
        await authApi.completeEmployeeStep3(formDataToSend);
        setCurrentStep(4);
      }
    } catch (err) { setError(err.response?.data?.message || 'An error occurred'); }
    setLoading(false);
  };

  const handleBack = () => currentStep > 1 ? setCurrentStep(prev => prev - 1) : navigate('/role-selection');
  const handleLogout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/login'); };

  useEffect(() => { loadJobs(); loadPaymentSettings(); }, []);
  
  useEffect(() => {
    if (currentStep === 4 && !companyPhone) {
      console.log('Loading settings for step 4');
      loadPaymentSettings();
    }
  }, [currentStep]);

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
            <p className={`mb-6 ${colors.text.muted}`}>Your employee registration has been submitted successfully. Our admin team will review your application.</p>
            <div className={`rounded-2xl p-5 mb-6 text-left ${darkMode ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-200'}`}>
              <p className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                <strong>Important:</strong> We will let you know by email within <strong>10 minutes</strong> if approved.
              </p>
              {companyPhone && (
                <p className={`text-sm mt-3 ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                  Or call us at: <span className="font-bold flex items-center gap-2 mt-1"><FiPhone className="w-4 h-4" /> {companyPhone}</span>
                </p>
              )}
              {companyEmail && (
                <p className={`text-sm mt-2 ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                  Or email: <span className="font-bold">{companyEmail}</span>
                </p>
              )}
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleLogout} className="w-full py-4 rounded-2xl font-semibold text-white bg-gradient-to-r from-cyan-500 to-purple-500 shadow-lg shadow-cyan-500/25">
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
            <motion.div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-4" animate={darkMode ? { boxShadow: ['0 0 20px rgba(6, 182, 212, 0.3)', '0 0 40px rgba(139, 92, 246, 0.3)', '0 0 20px rgba(6, 182, 212, 0.3)'] } : {}}>
              <span className={`w-2 h-2 rounded-full ${darkMode ? 'bg-green-400' : 'bg-green-500'}`} />
              <span className={`text-sm font-medium ${darkMode ? 'text-white/80' : 'text-slate-700'}`}>Employee Registration</span>
            </motion.div>
          </motion.div>
          <motion.h1 initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className={`text-4xl font-bold mb-2 ${darkMode ? 'bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent' : 'text-slate-900'}`}>
            Complete Your Profile
          </motion.h1>
          <motion.p initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className={colors.text.muted}>
            Follow the steps to complete your employee registration
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
                <h2 className={`text-xl font-semibold mb-6 ${colors.text.primary}`}>Personal Information</h2>
                <div className="grid md:grid-cols-3 gap-5">
                  <InputField label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="John" required isDark={darkMode} icon={FiUser} />
                  <InputField label="Middle Name" name="middleName" value={formData.middleName} onChange={handleChange} placeholder="Doe" isDark={darkMode} />
                  <InputField label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Smith" required isDark={darkMode} />
                </div>
                <div className="grid md:grid-cols-2 gap-5">
                  <InputField label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} placeholder="+251..." required isDark={darkMode} icon={FiPhone} />
                  <InputField label="Date of Birth" type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} isDark={darkMode} icon={FiCalendar} />
                </div>
                <div className="grid md:grid-cols-3 gap-5">
                  <div className="space-y-2">
                    <label className={`block text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Region *</label>
                    <select name="region" value={formData.region} onChange={handleChange} className={`w-full px-4 py-3.5 rounded-2xl transition-all duration-300 outline-none ${darkMode ? 'bg-slate-800/50 border border-slate-700 focus:border-cyan-500 text-white' : 'bg-white border border-slate-200 focus:border-blue-500 text-slate-900'}`}>
                      <option value="">Select Region</option>
                      {ETHIOPIAN_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <InputField label="City" name="city" value={formData.city} onChange={handleChange} placeholder="Addis Ababa" required isDark={darkMode} icon={FiMapPin} />
                  <div className="space-y-2">
                    <label className={`block text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Gender</label>
                    <select name="gender" value={formData.gender} onChange={handleChange} className={`w-full px-4 py-3.5 rounded-2xl transition-all duration-300 outline-none ${darkMode ? 'bg-slate-800/50 border border-slate-700 focus:border-cyan-500 text-white' : 'bg-white border border-slate-200 focus:border-blue-500 text-slate-900'}`}>
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className={`block text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Work Experience</label>
                    <select name="experienceLevel" value={formData.experienceLevel} onChange={handleChange} className={`w-full px-4 py-3.5 rounded-2xl transition-all duration-300 outline-none ${darkMode ? 'bg-slate-800/50 border border-slate-700 focus:border-cyan-500 text-white' : 'bg-white border border-slate-200 focus:border-blue-500 text-slate-900'}`}>
                      {EXPERIENCE_LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className={`block text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Education Level</label>
                    <select name="educationLevel" value={formData.educationLevel} onChange={handleChange} className={`w-full px-4 py-3.5 rounded-2xl transition-all duration-300 outline-none ${darkMode ? 'bg-slate-800/50 border border-slate-700 focus:border-cyan-500 text-white' : 'bg-white border border-slate-200 focus:border-blue-500 text-slate-900'}`}>
                      {EDUCATION_LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Type of Jobs <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <div onClick={() => setShowJobDropdown(!showJobDropdown)} className={`w-full px-4 py-3.5 rounded-2xl transition-all duration-300 outline-none cursor-pointer flex justify-between items-center ${darkMode ? 'bg-slate-800/50 border border-slate-700 focus:border-cyan-500 text-white' : 'bg-white border border-slate-200 focus:border-blue-500 text-slate-900'}`}>
                      <span>{formData.typeOfJob ? ETHIOPIAN_JOBS.find(j => j.value === formData.typeOfJob)?.label || jobs.find(j => j._id === formData.typeOfJob)?.title || formData.typeOfJobOther || formData.typeOfJob : 'Select a job type'}</span>
                      <svg className={`w-5 h-5 transition-transform ${showJobDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                    {showJobDropdown && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`absolute z-50 w-full mt-2 rounded-2xl overflow-hidden shadow-xl max-h-64 overflow-y-auto ${darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'}`}>
                        <div className="p-2">
                          <input type="text" value={jobSearch} onChange={(e) => setJobSearch(e.target.value)} placeholder="Search jobs..." className={`w-full px-3 py-2 rounded-lg mb-2 ${darkMode ? 'bg-slate-700 text-white placeholder-slate-400' : 'bg-slate-100 text-slate-900 placeholder-slate-500'}`} />
                        </div>
                        <div className="space-y-1 px-2 pb-2">
                          {ETHIOPIAN_JOBS.filter(j => j.label.toLowerCase().includes(jobSearch.toLowerCase())).map(job => (
                            <button key={job.value} onClick={() => { setFormData(prev => ({ ...prev, typeOfJob: job.value, typeOfJobOther: job.value === 'other' ? '' : prev.typeOfJobOther })); setShowJobDropdown(false); setJobSearch(''); }} className={`w-full px-3 py-2 text-left rounded-lg transition ${darkMode ? 'hover:bg-slate-700 text-white' : 'hover:bg-slate-100 text-slate-900'}`}>
                              {job.label}
                            </button>
                          ))}
                          {jobs.length > 0 && jobSearch === '' && (
                            <>
                              <div className={`text-xs px-3 py-1 mt-2 ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>--- Database Jobs ---</div>
                              {jobs.map(job => (
                                <button key={job._id} onClick={() => { setFormData(prev => ({ ...prev, typeOfJob: job._id })); setShowJobDropdown(false); setJobSearch(''); }} className={`w-full px-3 py-2 text-left rounded-lg transition ${darkMode ? 'hover:bg-slate-700 text-white' : 'hover:bg-slate-100 text-slate-900'}`}>
                                  {job.title} - {job.location}
                                </button>
                              ))}
                            </>
                          )}
                          <button onClick={() => { setFormData(prev => ({ ...prev, typeOfJob: 'other', typeOfJobOther: '' })); setShowJobDropdown(false); setJobSearch(''); }} className={`w-full px-3 py-2 text-left rounded-lg transition border-t ${darkMode ? 'hover:bg-slate-700 text-cyan-400 border-slate-700' : 'hover:bg-slate-100 text-blue-600 border-slate-200'}`}>
                            + Other (specify below)
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
                {formData.typeOfJob === 'other' && (
                  <InputField label="Please specify other job type" name="typeOfJobOther" value={formData.typeOfJobOther} onChange={handleChange} placeholder="Enter specific job type" required isDark={darkMode} icon={FiAward} />
                )}
                <div className="space-y-2">
                  <label className={`block text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Languages <span className="text-red-500">*</span></label>
                  <div className={`relative rounded-2xl border-2 overflow-hidden ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}>
                    <div className={`p-3 space-y-2 max-h-40 overflow-y-auto ${darkMode ? 'bg-slate-800/30' : 'bg-slate-50'}`}>
                      {LANGUAGES.map(lang => (
                        <label key={lang.value} className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}>
                          <input type="checkbox" checked={formData.languages?.includes(lang.value) || false} onChange={() => handleLanguageToggle(lang.value)} className="w-5 h-5 rounded border-2 accent-cyan-500" />
                          <span className={`font-medium ${darkMode ? 'text-white' : 'text-slate-900'}`}>{lang.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  {formData.languages?.includes('other') && (
                    <InputField label="Please specify other language" name="languageOther" value={formData.languageOther} onChange={handleChange} placeholder="Enter specific language" required isDark={darkMode} icon={FiAward} />
                  )}
                </div>
                <InputField label="Skills (Optional)" name="skills" value={formData.skills} onChange={handleChange} placeholder="JavaScript, React, Node.js..." isDark={darkMode} icon={FiAward} />
                <InputField label="Bio / Summary" name="bio" value={formData.bio} onChange={handleChange} placeholder="Tell us about yourself..." multiline isDark={darkMode} />
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <h2 className={`text-xl font-semibold mb-6 ${colors.text.primary}`}>Upload Documents</h2>
                {!isResumeRequired() && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`p-4 rounded-xl ${darkMode ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-200'}`}>
                    <p className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>Since you selected education level below Diploma or your skills are not technology-related, <strong>Resume/CV upload is optional</strong>.</p>
                  </motion.div>
                )}
                <div className="grid gap-5">
                  <FileUpload label="Resume / CV" file={formData.resume} onClick={() => resumeRef.current?.click()} isDark={darkMode} required={resumeRequired} hint={resumeRequired ? "PDF, DOC, or DOCX (max 5MB) - Required" : "PDF, DOC, or DOCX (max 5MB) - Optional"} />
                  <input ref={resumeRef} type="file" accept=".pdf,.doc,.docx" onChange={(e) => handleFileChange(e, 'resume')} className="hidden" />
                  <FileUpload label="ID Card / Passport (Fayda)" file={formData.idCard} onClick={() => idCardRef.current?.click()} isDark={darkMode} required hint="PDF or Image (max 5MB)" />
                  <input ref={idCardRef} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileChange(e, 'idCard')} className="hidden" />
                  <FileUpload label="Certificates (Optional)" file={formData.certificate} onClick={() => certificateRef.current?.click()} isDark={darkMode} hint="PDF or Image (max 5MB)" />
                  <input ref={certificateRef} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileChange(e, 'certificate')} className="hidden" />
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <h2 className={`text-xl font-semibold mb-6 ${colors.text.primary}`}>Application Fee Payment</h2>
                <motion.div 
                  className="relative overflow-hidden rounded-2xl p-8 text-center"
                  animate={{ boxShadow: ['0 0 30px rgba(6, 182, 212, 0.3)', '0 0 50px rgba(139, 92, 246, 0.3)', '0 0 30px rgba(6, 182, 212, 0.3)'] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500 opacity-90" />
                  <div className="relative">
                    <p className="text-white/80 mb-1">Application Fee</p>
                    <p className="text-5xl font-bold text-white">{applicationFee.toLocaleString()} ETB</p>
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
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className={`p-5 rounded-2xl ${darkMode ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-200'}`}>
                    <h4 className={`font-semibold mb-3 ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>Bank Transfer Details</h4>
                    <div className={`text-sm space-y-1 ${darkMode ? 'text-blue-200' : 'text-blue-700'}`}>
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
            <motion.button whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.98 }} onClick={handleSubmitStep} disabled={loading} className="flex items-center gap-2 px-8 py-3 rounded-2xl font-semibold text-white bg-gradient-to-r from-cyan-500 to-purple-500 shadow-lg shadow-cyan-500/25 disabled:opacity-50">
              {loading ? <motion.div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} /> : <>{currentStep === 3 ? 'Submit' : 'Continue'} <FiArrowRight /></>}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}