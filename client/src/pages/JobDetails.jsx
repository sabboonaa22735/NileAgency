import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { FiMapPin, FiDollarSign, FiClock, FiBriefcase, FiArrowLeft, FiBookmark, FiUser, FiPhone, FiMail, FiGlobe, FiUsers, FiStar, FiCheck, FiAward, FiTrendingUp, FiExternalLink, FiEdit, FiTrash2, FiSun, FiMoon } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { jobsApi, usersApi } from '../services/api';

export default function JobDetails() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [hoveredSkill, setHoveredSkill] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

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
    loadJob();
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      setDarkMode(false);
    }
  }, [id]);

  const loadJob = async () => {
    try {
      const res = await jobsApi.getById(id);
      setJob(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    try {
      await usersApi.bookmarkJob(id);
      setSaved(!saved);
    } catch (err) {
      console.error(err);
    }
  };

  const textPrimary = darkMode ? 'text-slate-100' : 'text-slate-900';
  const textSecondary = darkMode ? 'text-slate-400' : 'text-slate-600';
  const textMuted = darkMode ? 'text-slate-500' : 'text-slate-400';
  const bgMain = darkMode ? 'bg-[#0F172A]' : 'bg-slate-50';
  const bgCard = darkMode ? 'bg-slate-800' : 'bg-white';
  const bgSidebar = darkMode ? 'bg-slate-900' : 'bg-white';
  const borderColor = darkMode ? 'border-slate-700' : 'border-slate-200';
  const glassEffect = darkMode ? 'backdrop-blur-xl bg-slate-800/95 border border-slate-700' : 'backdrop-blur-xl bg-white/95 border border-slate-200';

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.6, type: 'spring', stiffness: 100 }
    })
  };

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
          <Link to="/dashboard" className={`inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-600 transition-all shadow-lg shadow-indigo-500/25`}>
            <FiArrowLeft className="w-5 h-5" />Back to Dashboard
          </Link>
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

      <nav className={`sticky top-0 z-50 ${glassEffect} border-b ${borderColor}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.button
              onClick={() => navigate('/dashboard')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl ${darkMode ? 'bg-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'} transition-all`}
            >
              <FiArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </motion.button>
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-xl ${darkMode ? 'bg-slate-700/50 text-slate-300 hover:text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'} transition-all`}
              >
                {darkMode ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
              </motion.button>
              <span className={textMuted}>Job Details</span>
            </motion.div>
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: 'spring' }}
          className={`${glassEffect} rounded-3xl p-8 mb-6`}
        >
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="flex-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-3 mb-4"
              >
                <span className={`px-3 py-1 rounded-full ${darkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'} text-sm font-medium flex items-center gap-1`}>
                  <span className={`w-2 h-2 rounded-full ${darkMode ? 'bg-emerald-400' : 'bg-emerald-600'} animate-pulse`} />
                  Active
                </span>
                <span className={`px-3 py-1 rounded-full ${darkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-700'} text-sm font-medium`}>
                  {job.jobType}
                </span>
              </motion.div>

              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className={`text-4xl md:text-5xl font-bold ${textPrimary} mb-3`}>
                {job.title}
              </motion.h1>

              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className={`text-xl ${textSecondary} mb-6`}>
                {job.companyName || job.recruiterId?.companyName}
              </motion.p>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex flex-wrap gap-4">
                <div className={`flex items-center gap-2 ${textPrimary} ${darkMode ? 'bg-slate-700/50' : 'bg-slate-100'} px-4 py-2 rounded-xl`}>
                  <FiMapPin className={`w-5 h-5 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                  {job.location || 'Remote'}
                </div>
                <div className={`flex items-center gap-2 ${textPrimary} ${darkMode ? 'bg-slate-700/50' : 'bg-slate-100'} px-4 py-2 rounded-xl`}>
                  <FiClock className={`w-5 h-5 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                  {job.jobType}
                </div>
                <div className={`flex items-center gap-2 ${textPrimary} ${darkMode ? 'bg-slate-700/50' : 'bg-slate-100'} px-4 py-2 rounded-xl`}>
                  <FiBriefcase className={`w-5 h-5 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                  {job.experienceLevel}
                </div>
                <div className={`flex items-center gap-2 ${textPrimary} ${darkMode ? 'bg-slate-700/50' : 'bg-slate-100'} px-4 py-2 rounded-xl`}>
                  <FiDollarSign className={`w-5 h-5 ${darkMode ? 'text-amber-400' : 'text-amber-600'}`} />
                  {job.salary?.negotiable ? 'Negotiable' : 'Competitive'}
                </div>
              </motion.div>
            </div>

            {user?.role === 'employee' && (
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }} className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSave}
                  className={`p-4 rounded-2xl transition-all ${
                    saved 
                      ? `bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25` 
                      : `${darkMode ? 'bg-slate-700/50 text-slate-300 hover:text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`
                  }`}
                >
                  <FiBookmark className={`w-6 h-6 ${saved ? 'fill-current' : ''}`} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(`/apply/${id}`)}
                  className="px-8 py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-2xl font-bold text-lg shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all"
                >
                  Apply Now
                </motion.button>
              </motion.div>
            )}
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.6 }} className="lg:col-span-2 space-y-6">
            <motion.div custom={0} variants={cardVariants} initial="hidden" animate="visible" className={`${glassEffect} rounded-3xl p-8`}>
              <h2 className={`text-2xl font-bold ${textPrimary} mb-6 flex items-center gap-3`}>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                  <FiBriefcase className="w-5 h-5 text-white" />
                </div>
                Job Description
              </h2>
              <p className={`${textSecondary} leading-relaxed text-lg whitespace-pre-line`}>{job.description}</p>
            </motion.div>

            {job.skills?.length > 0 && (
              <motion.div custom={1} variants={cardVariants} initial="hidden" animate="visible" className={`${glassEffect} rounded-3xl p-8`}>
                <h2 className={`text-2xl font-bold ${textPrimary} mb-6 flex items-center gap-3`}>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
                    <FiStar className="w-5 h-5 text-white" />
                  </div>
                  Required Skills
                </h2>
                <div className="flex flex-wrap gap-3">
                  {job.skills.map((skill, i) => (
                    <motion.span
                      key={i}
                      whileHover={{ scale: 1.05, rotate: 3 }}
                      onHoverStart={() => setHoveredSkill(i)}
                      onHoverEnd={() => setHoveredSkill(null)}
                      className={`px-5 py-2 rounded-xl ${darkMode ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-indigo-50 text-indigo-700 border-indigo-200'} text-lg font-medium border cursor-pointer`}
                    >
                      {skill}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            )}

            {job.requirements?.length > 0 && (
              <motion.div custom={2} variants={cardVariants} initial="hidden" animate="visible" className={`${glassEffect} rounded-3xl p-8`}>
                <h2 className={`text-2xl font-bold ${textPrimary} mb-6 flex items-center gap-3`}>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center">
                    <FiCheck className="w-5 h-5 text-white" />
                  </div>
                  Requirements
                </h2>
                <ul className="space-y-4">
                  {job.requirements.map((req, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * i }}
                      className={`flex items-start gap-3 ${textSecondary}`}
                    >
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                        className={`w-6 h-6 rounded-full ${darkMode ? 'bg-emerald-500/20' : 'bg-emerald-100'} flex items-center justify-center mt-1 flex-shrink-0`}
                      >
                        <FiCheck className={`w-3 h-3 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                      </motion.div>
                      <span className="text-lg">{req}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.6 }} className="space-y-6">
            <div className={`${glassEffect} rounded-3xl p-6`}>
              <h3 className={`text-xl font-bold ${textPrimary} mb-4 flex items-center gap-2`}>
                <FiMapPin className={`w-5 h-5 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                Location
              </h3>
              <div className={`space-y-3 ${textSecondary}`}>
                {job.country && <div className="flex items-center gap-2"><FiGlobe className="w-4 h-4" />{job.country}</div>}
                {job.state && <div className="flex items-center gap-2"><FiMapPin className="w-4 h-4" />{job.state}</div>}
                {job.city && <div className="flex items-center gap-2"><FiMapPin className="w-4 h-4" />{job.city}</div>}
              </div>
            </div>

            <div className={`${glassEffect} rounded-3xl p-6`}>
              <h3 className={`text-xl font-bold ${textPrimary} mb-4 flex items-center gap-2`}>
                <FiUser className={`w-5 h-5 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                Details
              </h3>
              <div className={`space-y-3 ${textSecondary}`}>
                {job.experienceLevel && (
                  <div className="flex items-center justify-between">
                    <span className={textMuted}>Experience</span>
                    <span>{job.experienceLevel}</span>
                  </div>
                )}
                {job.educationLevel && (
                  <div className="flex items-center justify-between">
                    <span className={textMuted}>Education</span>
                    <span>{job.educationLevel}</span>
                  </div>
                )}
                {job.gender && job.gender !== 'both' && (
                  <div className="flex items-center justify-between">
                    <span className={textMuted}>Gender</span>
                    <span>{job.gender === 'male' ? 'Male Only' : 'Female Only'}</span>
                  </div>
                )}
                {job.gender === 'both' && (
                  <div className="flex items-center justify-between">
                    <span className={textMuted}>Gender</span>
                    <span>Male & Female</span>
                  </div>
                )}
              </div>
            </div>

            {(job.phone || job.email) && (
              <div className={`${glassEffect} rounded-3xl p-6`}>
                <h3 className={`text-xl font-bold ${textPrimary} mb-4 flex items-center gap-2`}>
                  <FiPhone className={`w-5 h-5 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                  Contact
                </h3>
                <div className={`space-y-3 ${textSecondary}`}>
                  {job.phone && <div className="flex items-center gap-2"><FiPhone className="w-4 h-4" />{job.phone}</div>}
                  {job.email && <div className="flex items-center gap-2"><FiMail className="w-4 h-4" /><span className="text-sm truncate">{job.email}</span></div>}
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {user?.role === 'recruiter' && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className={`mt-6 ${glassEffect} rounded-3xl p-8`}>
            <h2 className={`text-2xl font-bold ${textPrimary} mb-6 flex items-center gap-3`}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center">
                <FiAward className="w-5 h-5 text-white" />
              </div>
              Company Information
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div whileHover={{ scale: 1.02 }} className={`${darkMode ? 'bg-slate-700/50' : 'bg-slate-100'} rounded-2xl p-5`}>
                <p className={`text-sm mb-1 ${textMuted}`}>Company</p>
                <p className={`font-medium ${textPrimary}`}>{job.recruiterId?.companyName}</p>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} className={`${darkMode ? 'bg-slate-700/50' : 'bg-slate-100'} rounded-2xl p-5`}>
                <p className={`text-sm mb-1 ${textMuted}`}>Industry</p>
                <p className={`font-medium ${textPrimary}`}>{job.recruiterId?.industry}</p>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} className={`${darkMode ? 'bg-slate-700/50' : 'bg-slate-100'} rounded-2xl p-5`}>
                <p className={`text-sm mb-1 ${textMuted}`}>Company Size</p>
                <p className={`font-medium ${textPrimary}`}>{job.recruiterId?.companySize}</p>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} className={`${darkMode ? 'bg-slate-700/50' : 'bg-slate-100'} rounded-2xl p-5`}>
                <p className={`text-sm mb-1 ${textMuted}`}>Location</p>
                <p className={`font-medium ${textPrimary}`}>{job.recruiterId?.location}</p>
              </motion.div>
            </div>
            {job.recruiterId?.companyDescription && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className={`mt-4 pt-4 ${darkMode ? 'border-t border-slate-700' : 'border-t border-slate-200'}`}>
                <p className={textSecondary}>{job.recruiterId.companyDescription}</p>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}