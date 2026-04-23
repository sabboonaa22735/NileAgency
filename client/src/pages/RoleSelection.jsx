import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { FiUser, FiBriefcase, FiArrowRight, FiCheck, FiMessageSquare, FiStar, FiSearch, FiFileText, FiZap, FiBookmark, FiSun, FiMoon, FiUserPlus } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

function FloatingOrb({ size, color, delay, duration, x, y }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl ${color}`}
      style={{ width: size, height: size, left: x, top: y }}
      initial={{ x: 0, y: 0, opacity: 0 }}
      animate={{ 
        x: [0, Math.random() * 100 - 50, 0], 
        y: [0, Math.random() * 100 - 50, 0],
        opacity: [0, 0.5, 0.3, 0]
      }}
      transition={{ 
        duration: duration || 15, 
        repeat: Infinity, 
        delay: delay || 0, 
        ease: 'easeInOut' 
      }}
    />
  );
}

function TiltCard({ children, onClick, isSelected, className = '' }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const springConfig = { damping: 20, stiffness: 300 };
  const rotateX = useTransform(y, [-100, 100], [15, -15]);
  const rotateY = useTransform(x, [-100, 100], [-15, 15]);
  
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    x.set(e.clientX - rect.left - centerX);
    y.set(e.clientY - rect.top - centerY);
  };
  
  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };
  
  return (
    <motion.div
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ 
        rotateX: useSpring(rotateX, springConfig),
        rotateY: useSpring(rotateY, springConfig),
        transformStyle: 'preserve-3d'
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const GridPattern = ({ isDark }) => (
  <div className="absolute inset-0 opacity-[0.04]" style={{ background: isDark ? 'transparent' : 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M60 0L0 0 0 60\' fill=\'none\' stroke=\'%236b7280\' stroke-width=\'0.5\'/%3E%3C/svg%3E")' }}>
    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="gridRoleDark" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-indigo-500"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={isDark ? "url(#gridRoleDark)" : "none"} />
    </svg>
  </div>
);

const ParticleField = ({ isDark }) => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(25)].map((_, i) => (
      <motion.div
        key={i}
        className={`absolute w-1.5 h-1.5 rounded-full ${isDark ? 'bg-indigo-400' : 'bg-indigo-600'}`}
        initial={{ 
          x: Math.random() * 1500, 
          y: Math.random() * 1000, 
          opacity: 0 
        }}
        animate={{ 
          y: [null, -1000],
          opacity: [0, isDark ? 0.8 : 1, 0]
        }}
        transition={{ 
          duration: Math.random() * 8 + 12, 
          repeat: Infinity, 
          delay: Math.random() * 8,
          ease: 'linear'
        }}
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
      isDark 
        ? 'bg-white/10 hover:bg-white/20 text-yellow-400' 
        : 'bg-slate-900/10 hover:bg-slate-900/20 text-slate-700'
    }`}
  >
    <motion.div
      animate={{ rotate: isDark ? 0 : 360 }}
      transition={{ duration: 0.5 }}
    >
      {isDark ? <FiMoon className="w-5 h-5" /> : <FiSun className="w-5 h-5" />}
    </motion.div>
  </motion.button>
);

export default function RoleSelection() {
  const [darkMode, setDarkMode] = useState(true);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { selectRole, user } = useAuth();

  const toggleTheme = () => setDarkMode(!darkMode);

  const colors = darkMode ? {
    bg: 'bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950',
    card: 'from-slate-900 to-slate-800',
    cardGlow: 'from-indigo-900/50 to-purple-900/50',
    text: {
      primary: 'text-white',
      secondary: 'text-slate-300',
      muted: 'text-slate-400',
      accent: 'text-cyan-400',
      subtle: 'text-slate-500'
    },
    border: 'border-white/10',
    glass: 'bg-white/5',
    hover: 'hover:bg-white/10',
    orbs: [
      { color: 'bg-blue-500/15', x: '10%', y: '10%' },
      { color: 'bg-purple-500/15', x: '70%', y: '60%' },
      { color: 'bg-cyan-500/15', x: '30%', y: '70%' },
      { color: 'bg-pink-500/10', x: '80%', y: '20%' }
    ]
  } : {
    bg: 'bg-gradient-to-br from-blue-50 via-white to-purple-50',
    card: 'from-white to-slate-50',
    cardGlow: 'from-blue-100 to-purple-100',
    text: {
      primary: 'text-slate-900',
      secondary: 'text-slate-700',
      muted: 'text-slate-500',
      accent: 'text-blue-600',
      subtle: 'text-slate-400'
    },
    border: 'border-slate-200',
    glass: 'bg-slate-100/50',
    hover: 'hover:bg-slate-200/50',
    orbs: [
      { color: 'bg-blue-400/20', x: '10%', y: '10%' },
      { color: 'bg-purple-400/20', x: '70%', y: '60%' },
      { color: 'bg-cyan-400/20', x: '30%', y: '70%' },
      { color: 'bg-pink-400/15', x: '80%', y: '20%' }
    ]
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selected) return;
    
    setLoading(true);
    try {
      await selectRole(selected);
      if (selected === 'employee') {
        navigate('/employee-registration');
      } else {
        navigate('/recruiter-registration');
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const roles = [
    {
      id: 'employee',
      icon: FiUser,
      title: 'Employee',
      subtitle: 'Find Your Dream Job',
      desc: 'Discover opportunities, apply to positions, and connect with top employers worldwide',
      gradient: darkMode ? 'from-blue-500 via-cyan-400 to-emerald-400' : 'from-blue-600 via-cyan-500 to-emerald-500',
      bgGradient: darkMode ? 'from-blue-500/20 via-cyan-400/10 to-emerald-500/5' : 'from-blue-500/30 via-cyan-400/20 to-emerald-500/15',
      features: [
        { icon: FiSearch, label: 'Browse Jobs' },
        { icon: FiFileText, label: 'Apply Online' },
        { icon: FiBookmark, label: 'Save Favorites' },
        { icon: FiMessageSquare, label: 'Chat with Recruiters' }
      ]
    },
    {
      id: 'recruiter',
      icon: FiBriefcase,
      title: 'Recruiter',
      subtitle: 'Hire Top Talent',
      desc: 'Post jobs, manage applications, and build your dream team',
      gradient: darkMode ? 'from-purple-500 via-pink-400 to-rose-400' : 'from-purple-600 via-pink-500 to-rose-500',
      bgGradient: darkMode ? 'from-purple-500/20 via-pink-400/10 to-rose-500/5' : 'from-purple-500/30 via-pink-400/20 to-rose-500/15',
      features: [
        { icon: FiBriefcase, label: 'Post Jobs' },
        { icon: FiUserPlus, label: 'Review Applicants' },
        { icon: FiStar, label: 'Rate Candidates' },
        { icon: FiZap, label: 'Quick Hiring' }
      ]
    }
  ];

  const c = colors.text;

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-500 ${colors.bg}`}>
      <GridPattern isDark={darkMode} />
      <ParticleField isDark={darkMode} />
      
      {colors.orbs.map((orb, i) => (
        <FloatingOrb 
          key={i}
          size={i === 0 ? '500px' : i === 1 ? '400px' : i === 2 ? '300px' : '250px'} 
          color={orb.color} 
          delay={i * 2} 
          duration={12 + i * 3} 
          x={orb.x} 
          y={orb.y} 
        />
      ))}

      <ThemeToggle isDark={darkMode} toggleTheme={toggleTheme} />
      
      <motion.div 
        className="absolute inset-0"
        animate={{ background: darkMode ? [
          'radial-gradient(ellipse at 20% 20%, rgba(59, 130, 246, 0.2) 0%, transparent 50%)',
          'radial-gradient(ellipse at 80% 80%, rgba(139, 92, 246, 0.2) 0%, transparent 50%)',
          'radial-gradient(ellipse at 50% 50%, rgba(236, 72, 153, 0.15) 0%, transparent 60%)',
          'radial-gradient(ellipse at 20% 20%, rgba(59, 130, 246, 0.2) 0%, transparent 50%)'
        ] : [
          'radial-gradient(ellipse at 20% 20%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)',
          'radial-gradient(ellipse at 80% 80%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)',
          'radial-gradient(ellipse at 50% 50%, rgba(236, 72, 153, 0.1) 0%, transparent 60%)',
          'radial-gradient(ellipse at 20% 20%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)'
        ]}}
        transition={{ duration: 15, repeat: Infinity }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="w-full max-w-5xl relative z-10"
      >
        <div className="text-center mb-12">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div 
              className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-6 ${
                darkMode 
                  ? 'bg-white/10 border-white/10' 
                  : 'bg-slate-900/10 border-slate-900/10'
              }`}
              animate={darkMode ? { 
                boxShadow: ['0 0 20px rgba(99, 102, 241, 0.3)', '0 0 40px rgba(139, 92, 246, 0.3)', '0 0 20px rgba(99, 102, 241, 0.3)'] 
              } : {}}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <motion.span 
                className={`w-2 h-2 rounded-full ${darkMode ? 'bg-green-400' : 'bg-green-500'}`}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className={`text-sm font-medium ${darkMode ? 'text-white/80' : 'text-slate-700'}`}>Nile Agency</span>
            </motion.div>
          </motion.div>

          <motion.h1 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={`text-5xl md:text-6xl font-bold mb-4 ${
              darkMode 
                ? 'bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent' 
                : 'bg-gradient-to-r from-slate-900 via-blue-700 to-slate-900 bg-clip-text text-transparent'
            }`}
          >
            Choose Your Path
          </motion.h1>
          
          <motion.p 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className={`text-xl ${c.muted} max-w-2xl mx-auto`}
          >
            Select how you want to use Nile Agency and unlock your potential
          </motion.p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-2 gap-8 mb-10">
            {roles.map((role, i) => {
              const Icon = role.icon;
              const isSelected = selected === role.id;
              
              return (
                <motion.div
                  key={role.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                >
                  <TiltCard onClick={() => setSelected(role.id)} isSelected={isSelected}>
                    <motion.div
                      className={`relative cursor-pointer rounded-3xl overflow-hidden transition-all duration-500 ${
                        darkMode
                          ? isSelected 
                              ? 'ring-2 ring-white/50 shadow-2xl shadow-white/10' 
                              : 'hover:shadow-2xl hover:shadow-indigo-500/20'
                          : isSelected
                              ? 'ring-2 ring-blue-500/50 shadow-2xl shadow-blue-500/20'
                              : 'shadow-lg hover:shadow-xl hover:shadow-blue-500/10'
                      }`}
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${role.bgGradient}`} />
                      
                      {isSelected && (
                        <motion.div 
                          className={`absolute inset-0 ${
                            darkMode 
                              ? 'bg-gradient-to-r from-white/5 to-transparent' 
                              : 'bg-gradient-to-r from-blue-500/5 to-transparent'
                          }`}
                          animate={{ x: ['0%', '100%', '0%'] }}
                          transition={{ duration: 3, repeat: Infinity }}
                        />
                      )}
                      
                      <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <motion.div 
                          className={`absolute -left-20 -top-20 w-60 h-60 rounded-full bg-gradient-to-br ${role.gradient} opacity-20 blur-3xl`}
                          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.25, 0.1] }}
                          transition={{ duration: 5, repeat: Infinity }}
                        />
                        <motion.div 
                          className={`absolute -right-20 -bottom-20 w-60 h-60 rounded-full bg-gradient-to-br ${role.gradient} opacity-15 blur-3xl`}
                          animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1] }}
                          transition={{ duration: 6, repeat: Infinity, delay: 1 }}
                        />
                      </div>
                      
                      <div className="relative p-8 md:p-10">
                        <div className="flex items-start justify-between mb-8">
                          <motion.div
                            className={`w-20 h-20 rounded-2xl flex items-center justify-center ${
                              isSelected
                                ? `bg-gradient-to-br ${role.gradient}`
                                : colors.glass
                            }`}
                            animate={isSelected ? { 
                              boxShadow: ['0 0 30px rgba(255,255,255,0.3)', '0 0 50px rgba(255,255,255,0.2)', '0 0 30px rgba(255,255,255,0.3)'] 
                            } : {}}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <Icon className={`w-10 h-10 ${isSelected ? 'text-white' : darkMode ? 'text-white/70' : 'text-slate-700'}`} />
                          </motion.div>
                          
                          <AnimatePresence>
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                  darkMode ? 'bg-white' : 'bg-slate-900'
                                }`}
                              >
                                <FiCheck className={`w-6 h-6 ${darkMode ? 'text-slate-900' : 'text-white'}`} />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                        
                        <h3 className={`text-3xl font-bold mb-2 ${isSelected ? (darkMode ? 'text-white' : 'text-slate-900') : c.primary}`}>
                          {role.title}
                        </h3>
                        <p className={`text-lg font-medium mb-4 ${isSelected ? c.accent : c.secondary}`}>
                          {role.subtitle}
                        </p>
                        <p className={`text-sm mb-8 ${isSelected ? c.secondary : c.subtle}`}>
                          {role.desc}
                        </p>
                        
                        <div className="grid grid-cols-2 gap-3">
                          {role.features.map((feature, idx) => {
                            const FeatureIcon = feature.icon;
                            return (
                              <motion.div
                                key={feature.label}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.7 + idx * 0.1 }}
                                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm ${
                                  isSelected 
                                    ? darkMode ? 'bg-white/10 text-white' : 'bg-blue-100 text-slate-800'
                                    : darkMode ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                <FeatureIcon className="w-4 h-4" />
                                {feature.label}
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                      
                      {isSelected && (
                        <motion.div
                          className={`absolute bottom-0 left-0 right-0 h-1 ${
                            darkMode 
                              ? 'bg-gradient-to-r from-transparent via-white/50 to-transparent' 
                              : 'bg-gradient-to-r from-transparent via-blue-500/50 to-transparent'
                          }`}
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                        />
                      )}
                    </motion.div>
                  </TiltCard>
                </motion.div>
              );
            })}
          </div>

          <motion.button
            type="submit"
            disabled={!selected || loading}
            className={`relative w-full py-5 rounded-2xl font-semibold text-lg overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed ${
              darkMode ? 'text-white' : 'text-white'
            }`}
          >
            <motion.div 
              className={`absolute inset-0 ${
                selected 
                  ? darkMode
                      ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600'
                      : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600'
                  : darkMode
                      ? 'bg-slate-700'
                      : 'bg-slate-400'
              }`}
              animate={selected ? { 
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] 
              } : {}}
              transition={{ 
                duration: 3, 
                repeat: Infinity,
                repeatDelay: 2
              }}
              style={{ backgroundSize: '200% 200%' }}
            />
            <motion.div 
              className={`absolute inset-0 ${
                darkMode 
                  ? 'bg-gradient-to-r from-blue-700 via-purple-700 to-blue-700' 
                  : 'bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-700'
              } opacity-0 hover:opacity-100 transition-opacity`}
            />
            <span className="relative flex items-center justify-center gap-3">
              {loading ? (
                <motion.div 
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" 
                  animate={{ rotate: 360 }} 
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} 
                />
              ) : (
                <>
                  Continue as {selected === 'employee' ? 'Employee' : selected === 'recruiter' ? 'Recruiter' : 'Guest'}
                  <motion.span initial={{ x: 0 }} whileHover={{ x: 5 }}>
                    <FiArrowRight className="w-5 h-5" />
                  </motion.span>
                </>
              )}
            </span>
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}