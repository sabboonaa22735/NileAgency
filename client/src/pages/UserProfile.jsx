import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiCamera, FiArrowLeft, FiSave, FiTrash2, FiMoon, FiSun, FiShield } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';

export default function UserProfile() {
  const [darkMode, setDarkMode] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
    profileImage: null
  });
  const [currentImage, setCurrentImage] = useState('');
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

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

  const orb1X = useTransform(mouseX, [-20, 20], [-15, 15]);
  const orb1Y = useTransform(mouseY, [-20, 20], [-15, 15]);
  const orb2X = useTransform(mouseX, [-20, 20], [20, -20]);
  const orb2Y = useTransform(mouseY, [-20, 20], [12, -12]);

  useEffect(() => {
    if (user) {
      setFormData({
        ...formData,
        email: user.email || '',
        firstName: user.firstName || '',
        lastName: user.lastName || ''
      });
      if (user.profileImage) {
        setCurrentImage(user.profileImage);
      }
    }
  }, [user]);

  const textPrimary = darkMode ? 'text-slate-100' : 'text-slate-900';
  const textSecondary = darkMode ? 'text-slate-400' : 'text-slate-600';
  const textMuted = darkMode ? 'text-slate-500' : 'text-slate-400';
  const bgMain = darkMode ? 'bg-[#0B0F19]' : 'bg-slate-50';
  const bgCard = darkMode ? 'bg-slate-800/50' : 'bg-white';
  const borderColor = darkMode ? 'border-slate-700/50' : 'border-slate-200';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }
      setFormData({ ...formData, profileImage: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password && formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append('email', formData.email);
      data.append('firstName', formData.firstName);
      data.append('lastName', formData.lastName);
      if (formData.password) {
        data.append('password', formData.password);
      }
      if (formData.profileImage) {
        data.append('profileImage', formData.profileImage);
      }

      await authApi.updateUserProfile(data);
      await refreshUser();
      setSuccess('Profile updated successfully!');
      setFormData({ ...formData, password: '', confirmPassword: '', profileImage: null });
      setPreview('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
    setLoading(false);
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }
    try {
      await authApi.deleteAccount();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete account');
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const FloatingParticles = () => (
    <div className="fixed inset-0 pointer-events-none -z-10">
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: [0.2, 0.5, 0.2], 
            scale: [1, 1.2, 1],
            y: [0, -20, 0],
            x: [0, 10, 0]
          }}
          transition={{ 
            duration: 4 + i * 0.5, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.8
          }}
          className={`absolute w-2 h-2 rounded-full ${
            i % 3 === 0 ? 'bg-indigo-400' : i % 3 === 1 ? 'bg-cyan-400' : 'bg-purple-400'
          }`}
          style={{
            left: `${10 + i * 12}%`,
            top: `${15 + (i % 4) * 20}%`,
            filter: 'blur(1px)'
          }}
        />
      ))}
    </div>
  );

  const GradientOrbs = () => (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      <motion.div 
        style={{ x: orb1X, y: orb1Y }}
        className="absolute left-[10%] top-[20%] w-72 h-72 rounded-full bg-gradient-to-br from-indigo-500/20 via-purple-500/15 to-cyan-500/10 blur-[100px]" 
      />
      <motion.div 
        style={{ x: orb2X, y: orb2Y }}
        className="absolute right-[15%] bottom-[25%] w-96 h-96 rounded-full bg-gradient-to-tl from-rose-500/15 via-pink-500/10 to-purple-500/15 blur-[120px]" 
      />
      <div className="absolute left-[60%] top-[10%] w-56 h-56 rounded-full bg-gradient-to-r from-emerald-500/12 to-teal-500/8 blur-[80px]" />
      <div className="absolute right-[5%] top-[60%] w-48 h-48 rounded-full bg-gradient-to-br from-amber-500/10 to-orange-500/8 blur-[70px]" />
    </div>
  );

  const GridPattern = () => (
    <div className="fixed inset-0 pointer-events-none -z-10 opacity-30">
      <div className="absolute inset-0" style={{
        backgroundImage: `linear-gradient(rgba(99, 102, 241, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.3) 1px, transparent 1px)`,
        backgroundSize: '60px 60px'
      }} />
    </div>
  );

  return (
    <div className={`min-h-screen ${bgMain} relative overflow-hidden transition-all duration-500`}>
      <GridPattern />
      <FloatingParticles />
      <GradientOrbs />

      <nav className={`sticky top-0 z-50 ${darkMode ? 'bg-slate-900/80' : 'bg-white/80'} backdrop-blur-xl border-b ${borderColor}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.div whileHover={{ x: -4 }} className="flex items-center gap-2">
              <button onClick={handleBack} className={`flex items-center gap-2 ${textSecondary} hover:${textPrimary} transition`}>
                <FiArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back</span>
              </button>
            </motion.div>
            <div className="flex items-center gap-2">
              <motion.div 
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.5 }}
                className={`w-10 h-10 rounded-xl ${darkMode ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : 'bg-gradient-to-br from-indigo-500 to-indigo-600'} flex items-center justify-center`}
              >
                <FiShield className="w-5 h-5 text-white" />
              </motion.div>
              <span className={`font-semibold ${textPrimary}`}>My Profile</span>
            </div>
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2.5 rounded-xl ${darkMode ? 'hover:bg-slate-700 text-amber-400' : 'hover:bg-slate-100 text-indigo-600'} transition`}
            >
              {darkMode ? <FiMoon className="w-5 h-5" /> : <FiSun className="w-5 h-5" />}
            </motion.button>
          </div>
        </div>
      </nav>
      <div className="fixed top-16 left-0 right-0 h-px z-40">
        <motion.div 
          className="h-full bg-gradient-to-r from-indigo-500 via-cyan-500 to-purple-500"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${bgCard} backdrop-blur-xl rounded-2xl border ${borderColor} p-8 overflow-hidden relative`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5" />
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-indigo-500/10 blur-3xl" />
          
          <div className="relative z-10">
            <div className="text-center mb-8">
              <h1 className={`text-3xl font-bold ${textPrimary} mb-2`}>Account Settings</h1>
              <p className={textSecondary}>Manage your account information</p>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {success && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm"
                >
                  {success}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col items-center mb-6">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="relative"
                >
                  <div className={`w-32 h-32 rounded-full flex items-center justify-center overflow-hidden border-4 ${
                    darkMode ? 'border-indigo-500/30 bg-slate-800' : 'border-indigo-200 bg-indigo-50'
                  }`}>
                    {preview ? (
                      <img src={preview} alt="Profile" className="w-full h-full object-cover" />
                    ) : currentImage ? (
                      <img src={currentImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <FiUser className="w-16 h-16 text-indigo-400/50" />
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center cursor-pointer hover:scale-110 transition shadow-lg shadow-indigo-500/30">
                    <FiCamera className="w-5 h-5 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </motion.div>
                <p className={`text-sm ${textMuted} mt-3`}>Click camera icon to upload photo</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <label className={`block text-sm font-medium ${textPrimary} mb-2`}>First Name</label>
                  <div className="relative">
                    <FiUser className={`absolute left-4 top-1/2 -translate-y-1/2 ${textMuted}`} />
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={`w-full pl-12 pr-4 py-3 rounded-xl border ${borderColor} ${
                        darkMode 
                          ? 'bg-slate-800/50 text-slate-100 placeholder:text-slate-500 focus:border-indigo-500' 
                          : 'bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500'
                      } focus:ring-2 focus:ring-indigo-500/20 outline-none transition`}
                      placeholder="Your first name"
                    />
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <label className={`block text-sm font-medium ${textPrimary} mb-2`}>Last Name</label>
                  <div className="relative">
                    <FiUser className={`absolute left-4 top-1/2 -translate-y-1/2 ${textMuted}`} />
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={`w-full pl-12 pr-4 py-3 rounded-xl border ${borderColor} ${
                        darkMode 
                          ? 'bg-slate-800/50 text-slate-100 placeholder:text-slate-500 focus:border-indigo-500' 
                          : 'bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500'
                      } focus:ring-2 focus:ring-indigo-500/20 outline-none transition`}
                      placeholder="Your last name"
                    />
                  </div>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <label className={`block text-sm font-medium ${textPrimary} mb-2`}>Email</label>
                <div className="relative">
                  <FiMail className={`absolute left-4 top-1/2 -translate-y-1/2 ${textMuted}`} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-4 py-3 rounded-xl border ${borderColor} ${
                      darkMode 
                        ? 'bg-slate-800/50 text-slate-100 placeholder:text-slate-500 focus:border-indigo-500' 
                        : 'bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500'
                    } focus:ring-2 focus:ring-indigo-500/20 outline-none transition`}
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className={`border-t ${borderColor} pt-6`}
              >
                <h3 className={`text-lg font-semibold ${textPrimary} mb-2`}>Change Password</h3>
                <p className={`text-sm ${textMuted} mb-4`}>Leave blank if you don't want to change your password</p>
                
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium ${textPrimary} mb-2`}>New Password</label>
                    <div className="relative">
                      <FiLock className={`absolute left-4 top-1/2 -translate-y-1/2 ${textMuted}`} />
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`w-full pl-12 pr-4 py-3 rounded-xl border ${borderColor} ${
                          darkMode 
                            ? 'bg-slate-800/50 text-slate-100 placeholder:text-slate-500 focus:border-indigo-500' 
                            : 'bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500'
                        } focus:ring-2 focus:ring-indigo-500/20 outline-none transition`}
                        placeholder="Leave blank to keep current"
                      />
                    </div>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${textPrimary} mb-2`}>Confirm New Password</label>
                    <div className="relative">
                      <FiLock className={`absolute left-4 top-1/2 -translate-y-1/2 ${textMuted}`} />
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`w-full pl-12 pr-4 py-3 rounded-xl border ${borderColor} ${
                          darkMode 
                            ? 'bg-slate-800/50 text-slate-100 placeholder:text-slate-500 focus:border-indigo-500' 
                            : 'bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500'
                        } focus:ring-2 focus:ring-indigo-500/20 outline-none transition`}
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 hover:from-indigo-600 hover:via-purple-600 hover:to-cyan-600 text-white font-semibold rounded-xl transition shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiSave className="w-5 h-5" />
                {loading ? 'Saving...' : 'Save Changes'}
              </motion.button>
            </form>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className={`border-t ${borderColor} mt-8 pt-8`}
            >
              <h3 className="text-lg font-semibold text-red-400 mb-2">Danger Zone</h3>
              <p className={`text-sm ${textMuted} mb-4`}>
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <motion.button
                onClick={handleDeleteAccount}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition border border-red-500/20"
              >
                <FiTrash2 className="w-5 h-5" />
                Delete My Account
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}