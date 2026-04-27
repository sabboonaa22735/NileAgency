import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { FiArrowLeft, FiMapPin, FiClock, FiDollarSign, FiUpload, FiFile, FiCheck, FiUser, FiMail, FiPhone, FiHome, FiSend, FiBriefcase, FiAward, FiZap, FiSun, FiMoon } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { jobsApi, usersApi, applicationsApi } from '../services/api';

export default function ApplyJob() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [job, setJob] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    coverLetter: '',
    resume: null
  });

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      mouseX.set(x);
      mouseY.set(y);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  useEffect(() => {
    loadData();
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      setDarkMode(false);
    }
  }, [jobId]);

  const loadData = async () => {
    try {
      const [jobRes, profileRes] = await Promise.all([
        jobsApi.getById(jobId),
        usersApi.getProfile()
      ]);
      setJob(jobRes.data);
      setProfile(profileRes.data);
      
      if (profileRes.data) {
        setFormData(prev => ({
          ...prev,
          firstName: profileRes.data.firstName || '',
          middleName: profileRes.data.middleName || '',
          lastName: profileRes.data.lastName || '',
          email: user?.email || '',
          phone: profileRes.data.phone || '',
          city: profileRes.data.city || ''
        }));
      }
    } catch (err) {
      console.error('Error loading job:', err);
    }
    setLoading(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    processFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    processFile(file);
  };

  const processFile = (file) => {
    if (file) {
      if (file.type !== 'application/pdf' && !file.name.endsWith('.doc') && !file.name.endsWith('.docx')) {
        alert('Please upload a PDF, DOC, or DOCX file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      setFormData({ ...formData, resume: file });
    }
  };

  const isResumeRequired = () => {
    if (!job?.educationLevel) return false;
    const eduLevel = job.educationLevel?.toLowerCase() || '';
    const aboveDiplomaLevels = ['phd', 'doctorate', 'masters', 'master', 'degree', 'bachelor'];
    return aboveDiplomaLevels.some(level => eduLevel.includes(level));
  };

  const resumeRequired = isResumeRequired();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (resumeRequired && !formData.resume) {
      alert('Please upload your CV/Resume - it is required for this job position');
      return;
    }
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.city) {
      alert('Please fill in all required fields');
      return;
    }
    setSubmitting(true);
    try {
      await applicationsApi.applyWithResume({
        jobId,
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        city: formData.city,
        coverLetter: formData.coverLetter,
        resume: formData.resume
      });
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Application failed');
    }
    setSubmitting(false);
  };

  const textPrimary = darkMode ? 'text-slate-100' : 'text-slate-900';
  const textSecondary = darkMode ? 'text-slate-400' : 'text-slate-600';
  const textMuted = darkMode ? 'text-slate-500' : 'text-slate-400';
  const bgMain = darkMode ? 'bg-[#0F172A]' : 'bg-slate-50';
  const bgCard = darkMode ? 'bg-slate-800' : 'bg-white';
  const borderColor = darkMode ? 'border-slate-700' : 'border-slate-200';
  const glassEffect = darkMode ? 'backdrop-blur-xl bg-slate-800/95 border border-slate-700' : 'backdrop-blur-xl bg-white/95 border border-slate-200';

  const inputBg = darkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-50 border-slate-200';

  if (loading) {
    return (
      <div className={`min-h-screen ${bgMain} flex items-center justify-center overflow-hidden`}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className={`w-16 h-16 border-4 ${darkMode ? 'border-indigo-500/30 border-t-indigo-400' : 'border-indigo-200 border-t-indigo-600'} rounded-full`}
        />
      </div>
    );
  }

  if (!job) {
    return (
      <div className={`min-h-screen ${bgMain} flex items-center justify-center`}>
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <div className={`w-24 h-24 mx-auto mb-6 rounded-full ${darkMode ? 'bg-red-500/20' : 'bg-red-100'} flex items-center justify-center`}>
            <FiBriefcase className={`w-12 h-12 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
          </div>
          <h2 className={`text-3xl font-bold ${textPrimary} mb-4`}>Job Not Found</h2>
          <Link to="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium">
            <FiArrowLeft className="w-5 h-5" />Go to Dashboard
          </Link>
        </motion.div>
      </div>
    );
  }

  if (success) {
    return (
      <div className={`min-h-screen ${bgMain} flex items-center justify-center overflow-hidden`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30"
          >
            <FiCheck className="w-16 h-16 text-white" />
          </motion.div>
          <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className={`text-4xl font-bold ${textPrimary} mb-4`}>
            Application Submitted!
          </motion.h2>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className={`${textSecondary} text-xl`}>
            Good luck! The employer will contact you soon.
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgMain} overflow-hidden`}>
      <motion.div 
        className="fixed inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div 
          className={`absolute top-20 left-10 w-72 h-72 ${darkMode ? 'bg-indigo-500/10' : 'bg-indigo-100'} rounded-full blur-3xl`}
          style={{ x: mouseX, y: mouseY }}
        />
        <motion.div 
          className={`absolute bottom-20 right-10 w-96 h-96 ${darkMode ? 'bg-purple-500/10' : 'bg-purple-100'} rounded-full blur-3xl`}
          style={{ x: mouseX, y: mouseY }}
        />
      </motion.div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-center justify-between">
          <Link to={`/jobs/${jobId}`} className={`inline-flex items-center gap-2 ${textSecondary} hover:${textPrimary} transition`}>
            <FiArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Job Details</span>
          </Link>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-xl ${darkMode ? 'bg-slate-700/50 text-slate-300 hover:text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'} transition-all`}
          >
            {darkMode ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${glassEffect} rounded-3xl p-8 mb-6`}
        >
          <div className="flex items-center gap-4 mb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center"
            >
              <FiBriefcase className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <h1 className={`text-3xl font-bold ${textPrimary}`}>{job.title}</h1>
              <p className={`${textSecondary} text-lg`}>{job.recruiterId?.companyName}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className={`flex items-center gap-2 ${textPrimary} ${darkMode ? 'bg-slate-700/50' : 'bg-slate-100'} px-4 py-2 rounded-xl`}>
              <FiMapPin className={`w-5 h-5 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
              {job.location || 'Remote'}
            </div>
            <div className={`flex items-center gap-2 ${textPrimary} ${darkMode ? 'bg-slate-700/50' : 'bg-slate-100'} px-4 py-2 rounded-xl`}>
              <FiClock className={`w-5 h-5 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
              {job.jobType}
            </div>
            <div className={`flex items-center gap-2 ${textPrimary} ${darkMode ? 'bg-slate-700/50' : 'bg-slate-100'} px-4 py-2 rounded-xl`}>
              <FiDollarSign className={`w-5 h-5 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
              {job.salary?.negotiable ? 'Negotiable' : 'Competitive'}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`${glassEffect} rounded-3xl p-8`}
        >
          <div className="flex items-center gap-3 mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center"
            >
              <FiZap className="w-6 h-6 text-white" />
            </motion.div>
            <h2 className={`text-2xl font-bold ${textPrimary}`}>Job Application</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="grid md:grid-cols-3 gap-4">
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-2`}>First Name <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className={`w-full px-4 py-3 ${inputBg} rounded-xl ${textPrimary} ${darkMode ? 'placeholder-slate-500' : 'placeholder-slate-400'} focus:outline-none focus:border-indigo-500 transition-all`}
                  placeholder="John"
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-2`}>Middle Name</label>
                <input
                  type="text"
                  value={formData.middleName}
                  onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                  className={`w-full px-4 py-3 ${inputBg} rounded-xl ${textPrimary} ${darkMode ? 'placeholder-slate-500' : 'placeholder-slate-400'} focus:outline-none focus:border-indigo-500 transition-all`}
                  placeholder="Doe"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-2`}>Last Name <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className={`w-full px-4 py-3 ${inputBg} rounded-xl ${textPrimary} ${darkMode ? 'placeholder-slate-500' : 'placeholder-slate-400'} focus:outline-none focus:border-indigo-500 transition-all`}
                  placeholder="Smith"
                  required
                />
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="grid md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-2`}>Email <span className="text-red-400">*</span></label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-4 py-3 ${inputBg} rounded-xl ${textPrimary} ${darkMode ? 'placeholder-slate-500' : 'placeholder-slate-400'} focus:outline-none focus:border-indigo-500 transition-all`}
                  placeholder="john@example.com"
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-2`}>Phone Number <span className="text-red-400">*</span></label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={`w-full px-4 py-3 ${inputBg} rounded-xl ${textPrimary} ${darkMode ? 'placeholder-slate-500' : 'placeholder-slate-400'} focus:outline-none focus:border-indigo-500 transition-all`}
                  placeholder="+251 912 345 678"
                  required
                />
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
              <label className={`block text-sm font-medium ${textSecondary} mb-2`}>City <span className="text-red-400">*</span></label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className={`w-full px-4 py-3 ${inputBg} rounded-xl ${textPrimary} ${darkMode ? 'placeholder-slate-500' : 'placeholder-slate-400'} focus:outline-none focus:border-indigo-500 transition-all`}
                placeholder="Addis Ababa"
                required
              />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                CV/Resume {resumeRequired ? <span className="text-red-400">*</span> : <span className={`${textMuted} text-xs`}>(Required for this position)</span>}
              </label>
              <motion.div
                onDragEnter={() => setDragActive(true)}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                animate={{
                  borderColor: dragActive ? '#818cf8' : darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                  scale: dragActive ? 1.02 : 1,
                  backgroundColor: dragActive ? (darkMode ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)') : 'transparent'
                }}
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer`}
              >
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                  id="resume-upload"
                />
                <label htmlFor="resume-upload" className="cursor-pointer">
                  <AnimatePresence mode="wait">
                    {formData.resume ? (
                      <motion.div
                        key="file-selected"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex flex-col items-center"
                      >
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="w-16 h-16 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center mb-3"
                        >
                          <FiFile className="w-8 h-8 text-white" />
                        </motion.div>
                        <span className={`${darkMode ? 'text-emerald-400' : 'text-emerald-600'} font-medium text-lg`}>{formData.resume.name}</span>
                        <span className={textMuted}>Click to change</span>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="file-empty"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex flex-col items-center"
                      >
                        <div className={`w-16 h-16 rounded-2xl ${darkMode ? 'bg-slate-700' : 'bg-slate-100'} flex items-center justify-center mb-3`}>
                          <FiUpload className={`w-8 h-8 ${textMuted}`} />
                        </div>
                        <p className={`${textPrimary} font-medium text-lg mb-1`}>Drop your CV/Resume here</p>
                        <p className={textMuted}>or click to browse</p>
                        <p className={`${textMuted} text-sm mt-2`}>PDF, DOC, or DOCX (max 5MB)</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </label>
              </motion.div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
              <label className={`block text-sm font-medium ${textSecondary} mb-2`}>Cover Letter <span className={textMuted}>(Optional)</span></label>
              <textarea
                value={formData.coverLetter}
                onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
                className={`w-full px-4 py-3 ${inputBg} rounded-xl ${textPrimary} ${darkMode ? 'placeholder-slate-500' : 'placeholder-slate-400'} focus:outline-none focus:border-indigo-500 transition-all h-32 resize-none`}
                placeholder="Tell the employer why you're the perfect fit for this position..."
              />
            </motion.div>

            <motion.button
              type="submit"
              disabled={submitting || (resumeRequired && !formData.resume)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-2xl font-bold text-lg shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                  Submitting...
                </>
              ) : (
                <>
                  <FiSend className="w-5 h-5" />
                  Submit Application
                </>
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}