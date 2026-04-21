import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { FiBookmark, FiSettings, FiLogOut, FiChevronRight, FiStar, FiBriefcase, FiImage, FiMoon, FiSun } from 'react-icons/fi';

const ProfileDropdown = ({
  isOpen,
  onClose,
  user,
  savedJobsCount = 0,
  onNavigate,
  onLogout,
  role = 'employee'
}) => {
  const [darkMode, setDarkMode] = useState(true);

  const textPrimary = darkMode ? 'text-slate-100' : 'text-slate-900';
  const textSecondary = darkMode ? 'text-slate-400' : 'text-slate-600';
  const bgCard = darkMode ? 'bg-slate-800/90' : 'bg-white';
  const borderColor = darkMode ? 'border-slate-700/50' : 'border-slate-200';

  const menuItems = role === 'recruiter' 
    ? [
        { label: 'Company Profile', icon: FiBriefcase, action: () => { onNavigate('profile'); onClose(); }, color: 'indigo' },
        { label: 'Sign Out', icon: FiLogOut, action: () => { onLogout(); onClose(); }, color: 'red', divider: false }
      ]
    : [
        { label: 'Saved Jobs', icon: FiBookmark, badge: savedJobsCount, action: () => { onNavigate('saved'); onClose(); }, color: 'indigo' },
        { label: 'Settings', icon: FiSettings, action: () => { onNavigate('settings'); onClose(); }, color: 'indigo' },
        { label: 'Sign Out', icon: FiLogOut, action: () => { onLogout(); onClose(); }, color: 'red', divider: false }
      ];

  const getRoleLabel = (role) => {
    switch(role) {
      case 'recruiter': return 'Recruiter';
      case 'admin': return 'Administrator';
      case 'employee': return 'Job Seeker';
      default: return role;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40"
          />
          
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="absolute right-0 mt-2 w-72 z-50"
          >
            <div className={`${bgCard} backdrop-blur-xl rounded-2xl shadow-2xl border ${borderColor} overflow-hidden relative`}>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-cyan-500/10" />
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-indigo-500/20 blur-3xl" />
              
              <div className="relative z-10 p-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500">
                <div className="flex items-center gap-3">
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm"
                  >
                    {user?.email?.[0]?.toUpperCase() || 'U'}
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-white text-sm truncate">
                      {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.email}
                    </h4>
                    <p className="text-white/70 text-xs truncate">{user?.email}</p>
                  </div>
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-1 px-2 py-0.5 bg-white/20 rounded-full text-[10px] font-semibold text-white"
                  >
                    <FiStar className="w-3 h-3" />
                    {getRoleLabel(role)}
                  </motion.span>
                </div>
              </div>

              <div className="p-2 relative z-10">
                {menuItems.map((item, index) => (
                  <motion.button
                    key={item.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + index * 0.03 }}
                    whileHover={{ x: 4, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={item.action}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                      item.color === 'red' 
                        ? darkMode ? 'hover:bg-red-500/10 text-red-400' : 'hover:bg-red-50 text-red-600'
                        : darkMode ? 'hover:bg-indigo-500/10 text-indigo-400' : 'hover:bg-indigo-50 text-indigo-600'
                    }`}
                  >
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                      className={`w-8 h-8 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110 ${
                        item.color === 'red' 
                          ? darkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-50 text-red-500'
                          : darkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'
                      }`}>
                      <item.icon className="w-4 h-4" />
                    </motion.div>
                    
                    <span className="flex-1 text-sm font-semibold text-left">{item.label}</span>
                    
                    {item.badge && item.badge > 0 && (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        darkMode ? 'bg-indigo-500/30 text-indigo-300' : 'bg-indigo-100 text-indigo-600'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                    
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      whileHover={{ opacity: 1, x: 0 }}
                    >
                      <FiChevronRight className={`w-4 h-4 ${
                        item.color === 'red' ? 'text-red-400' : 'text-indigo-400'
                      }`} />
                    </motion.div>
                  </motion.button>
                ))}
              </div>

              <div className={`border-t ${borderColor} p-2 relative z-10`}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { onNavigate('profile'); onClose(); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    darkMode 
                      ? 'hover:bg-indigo-500/10 text-slate-300' 
                      : 'hover:bg-indigo-50 text-slate-600'
                  }`}
                >
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      darkMode 
                        ? 'bg-indigo-500/20 text-indigo-400 group-hover:bg-indigo-500/30' 
                        : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100'
                    } transition-colors`}
                  >
                    <FiImage className="w-4 h-4" />
                  </motion.div>
                  <span className="text-sm font-medium">View Full Profile</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProfileDropdown;