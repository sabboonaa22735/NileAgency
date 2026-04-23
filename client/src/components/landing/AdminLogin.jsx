import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiLock, FiBox, FiArrowRight, FiEye, FiEyeOff, FiMonitor } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';
import { adminApi } from '../../services/api';

const FloatingOrb = ({ size, color, delay, duration }) => (
  <motion.div
    className={`absolute rounded-full blur-3xl ${color}`}
    style={{ width: size, height: size }}
    initial={{ x: Math.random() * 1000, y: Math.random() * 800, opacity: 0 }}
    animate={{ x: [null, Math.random() * 200 - 100, Math.random() * -200 + 100], y: [null, -200, -100, -200], opacity: [0, 0.3, 0.2, 0] }}
    transition={{ duration: duration || 15, repeat: Infinity, delay: delay || 0, ease: 'easeInOut' }}
  />
);

const GridPattern = () => (
  <div className="absolute inset-0 opacity-[0.03]">
    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="gridAdmin" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-violet-500"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#gridAdmin)" />
    </svg>
  </div>
);

const MorphingShape = () => (
  <motion.svg className="absolute w-96 h-96 opacity-10" viewBox="0 0 200 200" animate={{ rotate: [0, 360], scale: [1, 1.1, 1] }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}>
    <motion.path d="M100,20 L180,60 L180,140 L100,180 L20,140 L20,60 Z" fill="none" stroke="url(#gradientAdmin)" strokeWidth="2" animate={{ d: ['M100,20 L180,60 L180,140 L100,180 L20,140 L20,60 Z', 'M100,40 L160,80 L160,120 L100,160 L40,120 L40,80 Z', 'M100,20 L180,60 L180,140 L100,180 L20,140 L20,60 Z'] }} transition={{ duration: 10, repeat: Infinity }} />
    <defs>
      <linearGradient id="gradientAdmin" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#8b5cf6" />
        <stop offset="100%" stopColor="#06b6d4" />
      </linearGradient>
    </defs>
  </motion.svg>
);

const ParticleField = () => (
  <div className="absolute inset-0 overflow-hidden">
    {[...Array(30)].map((_, i) => (
      <motion.div key={i} className="absolute w-1 h-1 bg-violet-500 rounded-full" initial={{ x: Math.random() * 1000, y: Math.random() * 800, opacity: 0 }} animate={{ y: [null, -500], opacity: [0, 0.6, 0], scale: [0.5, 1, 0.5] }} transition={{ duration: Math.random() * 10 + 10, repeat: Infinity, delay: Math.random() * 10, ease: 'linear' }} />
    ))}
  </div>
);

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <motion.button onClick={toggleTheme} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className={`p-2 rounded-xl ${isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-black/5 hover:bg-black/10'}`}>
      {isDark ? '☀️' : '🌙'}
    </motion.button>
  );
};

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await adminApi.login({ email, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      window.location.href = '/admin';
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid admin credentials');
      setLoading(false);
    }
  };

  const features = [
    { icon: FiMonitor, text: 'Admin Access' },
    { icon: FiMonitor, text: 'Dashboard' },
    { icon: FiMonitor, text: 'Real-time' }
  ];

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden transition-all duration-500 ${isDark ? 'bg-gradient-to-br from-gray-950 via-violet-950/50 to-purple-950' : 'bg-gradient-to-br from-gray-100 via-violet-50 to-purple-50'}`}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <GridPattern />
        <ParticleField />
        <MorphingShape />
        <motion.div animate={{ background: ['radial-gradient(ellipse at 20% 20%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)', 'radial-gradient(ellipse at 80% 80%, rgba(6, 182, 212, 0.15) 0%, transparent 50%)', 'radial-gradient(ellipse at 50% 50%, rgba(139, 92, 246, 0.1) 0%, transparent 60%)', 'radial-gradient(ellipse at 20% 20%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)'] }} transition={{ duration: 15, repeat: Infinity }} className="absolute inset-0" />
        <FloatingOrb size="400px" color="bg-violet-500/10" delay={0} duration={20} className="hidden sm:block" />
        <FloatingOrb size="300px" color="bg-cyan-500/10" delay={5} duration={18} className="hidden lg:block" />
        <FloatingOrb size="200px" color="bg-fuchsia-500/10" delay={10} duration={22} className="hidden md:block" />
      </div>

      <div className="absolute top-4 sm:top-6 right-4 sm:right-6 z-50">
        <ThemeToggle />
      </div>

      <motion.div initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.8, ease: 'easeOut' }} className="relative z-10 w-full max-w-md sm:max-w-lg">
        <motion.div className="absolute -inset-1 rounded-[2rem] opacity-50 blur-xl" style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.4), rgba(6, 182, 212, 0.4))' }} animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 4, repeat: Infinity }} />

        <div className={`relative rounded-[2rem] overflow-hidden ${isDark ? 'bg-gray-900/80 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/50' : 'bg-white/90 backdrop-blur-2xl border border-black/5 shadow-2xl shadow-violet-500/10'}`}>
          <div className="absolute top-0 left-0 right-0 h-24 sm:h-28 md:h-32 overflow-hidden">
            <motion.div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(6, 182, 212, 0.2))' }} />
            <motion.div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%]" style={{ background: 'conic-gradient(from 0deg, transparent, rgba(139, 92, 246, 0.15), transparent, rgba(6, 182, 212, 0.15), transparent)' }} animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} />
          </div>

          <div className="relative p-6 sm:p-8 pt-20 sm:pt-24">
            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="text-center mb-6 sm:mb-8">
              <motion.div whileHover={{ scale: 1.05, rotate: 5 }} className="inline-flex items-center gap-3 mb-4">
                <div className="relative">
                  <motion.div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-violet-500 via-indigo-500 to-cyan-500 flex items-center justify-center shadow-xl shadow-violet-500/30" animate={{ boxShadow: ['0 10px 40px rgba(139, 92, 246, 0.4)', '0 10px 40px rgba(6, 182, 212, 0.4)', '0 10px 40px rgba(139, 92, 246, 0.4)'] }} transition={{ duration: 4, repeat: Infinity }}>
                    <FiBox className="w-7 h-7 sm:w-8 h-8 md:w-9 md:h-9 text-white" />
                  </motion.div>
                  <motion.div className="absolute -inset-2 rounded-2xl border-2 border-violet-500/30" animate={{ rotate: 360, scale: [1, 1.05, 1] }} transition={{ duration: 8, repeat: Infinity }} />
                </div>
              </motion.div>
              <h1 className={`text-2xl sm:text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Admin Access</h1>
              <p className={`text-sm sm:text-base ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Sign in to admin dashboard</p>
            </motion.div>

            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="flex justify-center gap-6 mb-8">
              {features.map((feature, i) => (
                <motion.div key={i} whileHover={{ scale: 1.05 }} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${isDark ? 'bg-white/5 text-gray-400 border border-white/10' : 'bg-violet-50 text-violet-600 border border-violet-200'}`}>
                  <feature.icon className="w-3.5 h-3.5 text-violet-500" />
                  {feature.text}
                </motion.div>
              ))}
            </motion.div>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, height: 0, y: -10 }} animate={{ opacity: 1, height: 'auto', y: 0 }} exit={{ opacity: 0, height: 0 }} className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                  <p className="text-red-400 text-sm text-center">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
              <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
                <label className={`block text-sm font-medium mb-2 sm:mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Email Address</label>
                <div className="relative">
                  <motion.div className={`absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 ${focusedField === 'email' ? 'text-violet-500' : isDark ? 'text-gray-500' : 'text-gray-400'}`} animate={{ scale: focusedField === 'email' ? 1.1 : 1 }}>
                    <FiMail className="w-4 h-4 sm:w-5 sm:h-5" />
                  </motion.div>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)} placeholder="admin@nileagency.com" required className={`w-full pl-12 sm:pl-14 pr-4 sm:pr-5 py-3 sm:py-4 md:py-5 rounded-xl sm:rounded-2xl text-sm sm:text-base transition-all outline-none backdrop-blur-md ${isDark ? 'bg-white/5 border border-white/15 focus:border-violet-500/50 text-white placeholder:text-gray-500' : 'bg-white/60 border border-gray-200/50 focus:border-violet-500/50 text-gray-900 placeholder:text-gray-400'} ${focusedField === 'email' ? 'ring-2 ring-violet-500/20 shadow-lg shadow-violet-500/10' : ''}`} />
                </div>
              </motion.div>

              <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
                <label className={`block text-sm font-medium mb-2 sm:mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Password</label>
                <div className="relative">
                  <motion.div className={`absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 ${focusedField === 'password' ? 'text-violet-500' : isDark ? 'text-gray-500' : 'text-gray-400'}`} animate={{ scale: focusedField === 'password' ? 1.1 : 1 }}>
                    <FiLock className="w-4 h-4 sm:w-5 sm:h-5" />
                  </motion.div>
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)} placeholder="••••••••" required className={`w-full pl-12 sm:pl-14 pr-12 sm:pr-14 py-3 sm:py-4 md:py-5 rounded-xl sm:rounded-2xl text-sm sm:text-base transition-all outline-none backdrop-blur-md ${isDark ? 'bg-white/5 border border-white/15 focus:border-violet-500/50 text-white placeholder:text-gray-500' : 'bg-white/60 border border-gray-200/50 focus:border-violet-500/50 text-gray-900 placeholder:text-gray-400'} ${focusedField === 'password' ? 'ring-2 ring-violet-500/20 shadow-lg shadow-violet-500/10' : ''}`} />
                  <motion.button type="button" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setShowPassword(!showPassword)} className={`absolute right-4 sm:right-5 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}>
                    {showPassword ? <FiEyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <FiEye className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </motion.button>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="flex items-center justify-end text-sm">
                <Link to="/forgot-password" className="text-sm text-violet-500 hover:text-violet-400 transition-colors">Forgot password?</Link>
              </motion.div>

<motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02, boxShadow: '0 20px 40px rgba(139, 92, 246, 0.4)' }} whileTap={{ scale: 0.98 }} className="relative w-full py-3 sm:py-4 md:py-5 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base md:text-lg text-white overflow-hidden disabled:opacity-50 backdrop-blur-md">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-500" />
                <motion.div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 opacity-0 hover:opacity-100" />
                <span className="relative flex items-center justify-center gap-2">
                  {loading ? (
                    <motion.div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
                  ) : (
                    <>
                      Sign In to Admin
                      <motion.span initial={{ x: 0 }} whileHover={{ x: 5 }}><FiArrowRight className="w-4 h-4 sm:w-5 sm:h-5" /></motion.span>
                    </>
                  )}
                </span>
              </motion.button>
            </form>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className={`text-center text-sm mt-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <Link to="/" className="text-violet-500 hover:text-violet-400 font-medium transition-colors relative group">← Back to Home</Link>
            </motion.p>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className={`absolute bottom-6 left-1/2 -translate-x-1/2 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>© 2026 Nile Agency Admin. All rights reserved.</motion.div>
    </div>
  );
}