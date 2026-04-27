import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { 
  FiHome, FiUsers, FiBriefcase, FiDollarSign, FiMessageSquare, FiSettings, 
  FiMenu, FiX, FiSearch, FiBell, FiChevronLeft, FiChevronRight, FiLogOut,
  FiShield, FiMoon, FiSun, FiMoreVertical, FiHexagon, FiUser, FiEdit
} from 'react-icons/fi';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: FiHome },
  { id: 'approvals', label: 'Approvals', icon: FiBell, badge: true },
  { id: 'users', label: 'Users', icon: FiUsers },
  { id: 'jobs', label: 'Jobs', icon: FiBriefcase },
  { id: 'payments', label: 'Payments', icon: FiDollarSign },
  { id: 'applications', label: 'Applications', icon: FiDollarSign },
  { id: 'messages', label: 'Messages', icon: FiMessageSquare },
];

export default function AdminLayout({ 
  children, 
  activeTab, 
  setActiveTab, 
  darkMode, 
  setDarkMode,
  pendingCount = 0,
  onLogout,
  user,
  hideSidebar = false,
  notifications = [],
  onMarkAsRead
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const textPrimary = darkMode ? 'text-slate-100' : 'text-slate-900';
  const textSecondary = darkMode ? 'text-slate-400' : 'text-slate-600';
  const textMuted = darkMode ? 'text-slate-500' : 'text-slate-400';
  const bgMain = darkMode ? 'bg-[#0B0F19]' : 'bg-slate-50';
  const bgCard = darkMode ? 'bg-slate-800/50' : 'bg-white';
  const bgSidebar = darkMode ? 'bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900' : 'bg-white';
  const borderColor = darkMode ? 'border-slate-700/50' : 'border-slate-200';
  const borderSubtle = darkMode ? 'border-slate-800' : 'border-slate-100';
  
  const glassEffect = darkMode ? 'backdrop-blur-xl bg-slate-800/60 border border-slate-700/50' : 'backdrop-blur-xl bg-white/80 border border-slate-200/50';

  const sidebarWidth = sidebarCollapsed ? 'w-20' : 'w-64';

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

  const FloatingOrbs = () => (
    <div className="fixed inset-0 pointer-events-none -z-10">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: [0.3, 0.6, 0.3], 
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
            left: `${15 + i * 15}%`,
            top: `${20 + (i % 3) * 25}%`,
            filter: 'blur(1px)'
          }}
        />
      ))}
    </div>
  );

  const GridPattern = () => (
    <div className={`fixed inset-0 pointer-events-none -z-10 opacity-[${darkMode ? 0.03 : 0.02}]`}>
      <div className="absolute inset-0" style={{
        backgroundImage: darkMode 
          ? `linear-gradient(rgba(99, 102, 241, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.3) 1px, transparent 1px)`
          : `linear-gradient(rgba(99, 102, 241, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.2) 1px, transparent 1px)`,
        backgroundSize: '60px 60px'
      }} />
    </div>
  );

  return (
    <div className={`min-h-screen transition-all duration-500 ${bgMain} relative overflow-hidden`}>
      <GridPattern />
      <FloatingOrbs />
      <GradientOrbs />
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-[60] h-16 ${glassEffect} border-b ${borderColor}`}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-transparent to-purple-500/5 opacity-50 pointer-events-none" />
        <div className={`absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-${darkMode ? 'indigo-500' : 'indigo-300'} to-transparent opacity-30 pointer-events-none`} />
        <div className="flex items-center justify-between h-full px-4 lg:px-6 relative z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`lg:hidden p-2 rounded-xl ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'} transition`}
            >
              {mobileMenuOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('dashboard')}
                className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 transition-all cursor-pointer"
              >
                <FiShield className="w-5 h-5 text-white" />
              </button>
              <AnimatePresence>
                {!sidebarCollapsed && (
                  <button
                    type="button"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    onClick={() => setActiveTab('dashboard')}
                    className="text-lg font-bold text-slate-100 hidden lg:block hover:opacity-70 transition-opacity cursor-pointer"
                  >
                    Admin Panel
                  </button>
                )}
              </AnimatePresence>
            </div>
          </div>

          <motion.div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className={`relative w-full ${glassEffect} rounded-2xl border ${borderColor} overflow-hidden`}>
              <FiSearch className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${textMuted}`} />
              <input 
                type="text"
                placeholder="Search..."
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className={`w-full h-10 pl-12 pr-4 bg-transparent outline-none ${textPrimary} placeholder:${textMuted}`}
              />
            </div>
          </motion.div>

          <div className="flex items-center gap-2">
<button 
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            style={{ position: 'relative', zIndex: 999, background: 'transparent', border: 'none', cursor: 'pointer', padding: '10px', borderRadius: '12px' }}
            className={darkMode ? 'hover:bg-slate-700 text-amber-400' : 'hover:bg-slate-100 text-indigo-600'}
          >
            {darkMode ? <FiMoon className="w-5 h-5" /> : <FiSun className="w-5 h-5" />}
          </button>

<div className="relative z-[70]">
<button 
              type="button"
              onClick={() => { setNotificationsOpen(!notificationsOpen); setProfileOpen(false); }}
              style={{ position: 'relative', zIndex: 999, background: 'transparent', border: 'none', cursor: 'pointer', padding: '10px', borderRadius: '12px', display: 'flex', alignItems: 'center' }}
              className={darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}
            >
              <FiBell className={`w-5 h-5 ${textSecondary}`} />
              {(pendingCount > 0 || (notifications && notifications.length > 0)) && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full" />
              )}
            </button>
            </div>

            <motion.button
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { setActiveTab('messages'); setProfileOpen(false); }}
              style={{ position: 'relative', zIndex: 999, background: 'transparent', border: 'none', cursor: 'pointer', padding: '10px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              className={activeTab === 'messages' ? (darkMode ? 'bg-slate-700' : 'bg-slate-100') : (darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100')}
            >
              <motion.div
                animate={activeTab === 'messages' ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                <svg className={`w-5 h-5 ${activeTab === 'messages' ? 'text-cyan-400' : textSecondary}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
              </motion.div>
            </motion.button>

            <div className="relative">
              <button 
                type="button"
                onClick={() => setProfileOpen(!profileOpen)}
                className={`flex items-center gap-2 p-1.5 pr-3 rounded-xl ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'} transition`}
              >
                <div className={`w-8 h-8 rounded-xl ${darkMode ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : 'bg-gradient-to-br from-indigo-500 to-indigo-600'} flex items-center justify-center`}>
                  <span className="text-sm font-semibold text-white">A</span>
                </div>
                <span className={`text-sm font-medium ${textPrimary} hidden lg:block`}>Admin</span>
                <FiMoreVertical className={`w-4 h-4 ${textMuted} hidden lg:block`} />
              </button>
            </div>
          </div>
        </div>
      </motion.nav>
      <div className="fixed top-16 left-0 right-0 h-px z-[40]">
        <motion.div 
          className="h-full bg-gradient-to-r from-indigo-500 via-cyan-500 to-purple-500"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
      </div>

      <motion.aside 
        initial={{ x: -100 }}
        animate={{ x: hideSidebar ? -300 : 0 }}
        className={`fixed left-0 top-16 bottom-0 z-[30] ${sidebarWidth} ${bgSidebar} border-r ${borderColor} transition-all duration-300 hidden lg:flex flex-col overflow-hidden`}
      >
        {darkMode && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-indigo-500/5 to-transparent" />
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-purple-500/5 to-transparent" />
            <motion.div 
              className="absolute left-4 top-1/4 w-8 h-8 rounded-full bg-indigo-500/20 blur-xl"
              animate={{ 
                scale: [1, 1.3, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <motion.div 
              className="absolute right-2 bottom-1/3 w-12 h-12 rounded-full bg-purple-500/15 blur-2xl"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.4, 0.2]
              }}
              transition={{ duration: 4, repeat: Infinity, delay: 1 }}
            />
          </div>
        )}
        <div className="flex-1 p-3 overflow-y-auto relative z-10">
          <nav className="space-y-1">
            {navItems.map((item, index) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setActiveTab(item.id)}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
                  activeTab === item.id
                    ? darkMode 
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25' 
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20'
                    : darkMode 
                      ? 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200' 
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                </motion.div>
                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm font-medium">
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {item.badge && pendingCount > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`ml-auto px-2 py-0.5 text-xs font-semibold rounded-full ${
                      activeTab === item.id ? 'bg-white/20 text-white' : 'bg-red-500 text-white'
                    }`}>
                    {pendingCount > 99 ? '99+' : pendingCount}
                  </motion.span>
                )}
              </motion.button>
            ))}
          </nav>
        </div>

        <div className={`p-3 border-t ${borderColor}`}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl ${darkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-600'} transition`}
          >
            {sidebarCollapsed ? <FiChevronRight className="w-5 h-5" /> : <FiChevronLeft className="w-5 h-5" />}
            {!sidebarCollapsed && <span className="text-sm">Collapse</span>}
          </motion.button>
        </div>
      </motion.aside>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[50] bg-black/50 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className={`absolute left-0 top-0 bottom-0 w-72 ${bgSidebar} border-r ${borderColor}`}
            >
              <div className="flex-1 p-4 overflow-y-auto h-full">
                <nav className="space-y-1">
                  {navItems.map((item) => (
                    <motion.button
                      key={item.id}
                      onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                        activeTab === item.id
                          ? darkMode ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                          : darkMode ? 'text-slate-400 hover:bg-slate-700/50' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{item.label}</span>
                      {item.badge && pendingCount > 0 && (
                        <span className="ml-auto px-2 py-0.5 text-xs font-semibold rounded-full bg-red-500 text-white">
                          {pendingCount}
                        </span>
                      )}
                    </motion.button>
                  ))}
                </nav>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(notificationsOpen || profileOpen) && (
          <div className="fixed inset-0 z-[50]" onClick={() => { setNotificationsOpen(false); setProfileOpen(false); }} />
        )}
      </AnimatePresence>
      
      {profileOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          className={`absolute right-4 top-14 w-56 ${glassEffect} rounded-2xl border ${borderColor} shadow-2xl overflow-hidden z-[100]`}
          style={{ position: 'fixed', right: 16, top: 64, zIndex: 100 }}
        >
          <div className={`p-4 border-b ${borderColor}`}>
            <p className={`font-medium ${textPrimary}`}>{user?.email || 'Admin User'}</p>
            <p className={`text-sm ${textMuted}`}>{user?.role || 'admin'}</p>
          </div>
          <div className="p-2">
            <button 
              onClick={() => { setActiveTab('profile'); setProfileOpen(false); }}
              className={`w-full flex items-center gap-3 p-3 rounded-xl ${darkMode ? 'hover:bg-indigo-500/10 text-indigo-400' : 'hover:bg-indigo-50 text-indigo-600'} transition`}
            >
              <FiUser className="w-4 h-4" />
              <span className="text-sm font-medium">Profile</span>
            </button>
            <button 
              onClick={() => { setActiveTab('settings'); setProfileOpen(false); }}
              className={`w-full flex items-center gap-3 p-3 rounded-xl ${darkMode ? 'hover:bg-indigo-500/10 text-indigo-400' : 'hover:bg-indigo-50 text-indigo-600'} transition`}
            >
              <FiSettings className="w-4 h-4" />
              <span className="text-sm font-medium">Settings</span>
            </button>
            <button onClick={onLogout} className={`w-full flex items-center gap-3 p-3 rounded-xl ${darkMode ? 'hover:bg-red-500/10 text-red-400' : 'hover:bg-red-50 text-red-600'} transition`}>
              <FiLogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </motion.div>
      )}

      {notificationsOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          className={`absolute right-4 top-14 w-80 ${glassEffect} rounded-2xl border ${borderColor} shadow-2xl overflow-hidden z-[100]`}
          style={{ position: 'fixed', right: 16, top: 64, zIndex: 100 }}
        >
          <div className={`p-4 border-b ${borderColor} flex items-center justify-between`}>
            <p className={`font-semibold ${textPrimary}`}>Notifications</p>
            {notifications && notifications.length > 0 && (
              <span className="text-xs text-red-500">{notifications.length} new</span>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications && notifications.length > 0 ? (
              notifications.map((notif, index) => (
                <div 
                  key={notif._id || index}
                  onClick={() => { onMarkAsRead && onMarkAsRead(notif._id); setNotificationsOpen(false); setActiveTab('approvals'); }}
                  className={`p-4 border-b ${borderColor} hover:${darkMode ? 'bg-slate-700' : 'bg-slate-50'} cursor-pointer transition`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${notif.read === false ? 'bg-red-500' : 'bg-slate-400'}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${textPrimary}`}>{notif.title || 'New Notification'}</p>
                      <p className={`text-xs ${textSecondary} truncate`}>{notif.message || ''}</p>
                      <p className={`text-xs ${textMuted} mt-1`}>
                        {notif.createdAt ? new Date(notif.createdAt).toLocaleString() : 'Just now'}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <FiBell className={`w-8 h-8 mx-auto mb-2 ${textMuted}`} />
                <p className={`text-sm ${textSecondary}`}>No notifications</p>
              </div>
            )}
          </div>
          {notifications && notifications.length > 0 && (
            <div className={`p-3 border-t ${borderColor}`}>
              <button 
                onClick={() => { setActiveTab('approvals'); setNotificationsOpen(false); }}
                className={`w-full text-center text-sm ${darkMode ? 'text-cyan-400 hover:text-cyan-300' : 'text-cyan-600 hover:text-cyan-500'}`}
              >
                View All Notifications
              </button>
            </div>
          )}
        </motion.div>
      )}

      <AnimatePresence>
        {activeTab === 'profile' && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed left-0 top-16 bottom-0 w-80 ${bgSidebar} border-r ${borderColor} z-[70] overflow-y-auto`}
          >
            <div className={`p-4 border-b ${borderColor}`}>
              <div className="flex items-center justify-between">
                <h3 className={`text-lg font-semibold ${textPrimary}`}>Profile</h3>
                <button 
                  onClick={() => setActiveTab('dashboard')}
                  className={`p-2 rounded-lg ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}
                >
                  <FiX className={`w-5 h-5 ${textSecondary}`} />
                </button>
              </div>
            </div>
            
            <div className="p-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className={`${bgCard} rounded-2xl border ${borderColor} p-6`}>
                  <div className="flex flex-col items-center">
                    <div className={`w-24 h-24 rounded-full ${darkMode ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : 'bg-gradient-to-br from-indigo-500 to-indigo-600'} flex items-center justify-center`}>
                      <span className="text-3xl font-bold text-white">A</span>
                    </div>
                    <h3 className={`text-xl font-semibold mt-4 ${textPrimary}`}>Admin User</h3>
                    <p className={`text-sm ${textSecondary}`}>{user?.email || 'admin@nileagency.com'}</p>
                    <span className={`mt-2 px-3 py-1 rounded-full text-xs font-medium ${darkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-600'}`}>
                      Administrator
                    </span>
                  </div>
                  
                  <div className={`mt-6 space-y-4`}>
                    <div>
                      <label className={`text-sm font-medium ${textMuted}`}>First Name</label>
                      <p className={`mt-1 ${textPrimary}`}>Admin</p>
                    </div>
                    <div>
                      <label className={`text-sm font-medium ${textMuted}`}>Last Name</label>
                      <p className={`mt-1 ${textPrimary}`}>User</p>
                    </div>
                    <div>
                      <label className={`text-sm font-medium ${textMuted}`}>Email</label>
                      <p className={`mt-1 ${textPrimary}`}>{user?.email || 'admin@nileagency.com'}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.aside>
        )}

        {activeTab === 'settings' && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed left-0 top-16 bottom-0 w-80 ${bgSidebar} border-r ${borderColor} z-[70] overflow-y-auto`}
          >
            <div className={`p-4 border-b ${borderColor}`}>
              <div className="flex items-center justify-between">
                <h3 className={`text-lg font-semibold ${textPrimary}`}>Settings</h3>
                <button 
                  onClick={() => setActiveTab('dashboard')}
                  className={`p-2 rounded-lg ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}
                >
                  <FiX className={`w-5 h-5 ${textSecondary}`} />
                </button>
              </div>
            </div>
            
            <div className="p-4 space-y-4">
              <div className={`${bgCard} rounded-2xl border ${borderColor} p-4`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-medium ${textPrimary}`}>Dark Mode</p>
                    <p className={`text-sm ${textSecondary}`}>Toggle dark/light theme</p>
                  </div>
                  <button 
                    onClick={() => setDarkMode(!darkMode)}
                    className={`p-2 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}
                  >
                    {darkMode ? <FiMoon className="w-5 h-5 text-amber-400" /> : <FiSun className="w-5 h-5 text-amber-500" />}
                  </button>
                </div>
              </div>
              
              <div className={`${bgCard} rounded-2xl border ${borderColor} p-4`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-medium ${textPrimary}`}>Email Notifications</p>
                    <p className={`text-sm ${textSecondary}`}>Receive email updates</p>
                  </div>
                  <div className={`w-12 h-6 rounded-full ${darkMode ? 'bg-indigo-600' : 'bg-indigo-500'} relative cursor-pointer`}>
                    <div className={`absolute top-1 right-1 w-4 h-4 bg-white rounded-full transition-transform`} />
                  </div>
                </div>
              </div>
              
              <div className={`${bgCard} rounded-2xl border ${borderColor} p-4`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-medium ${textPrimary}`}>Two-Factor Auth</p>
                    <p className={`text-sm ${textSecondary}`}>Add extra security</p>
                  </div>
                  <div className={`w-12 h-6 rounded-full ${darkMode ? 'bg-slate-600' : 'bg-slate-300'} relative cursor-pointer`}>
                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform`} />
                  </div>
                </div>
              </div>
              
              <button 
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition"
              >
                <FiLogOut className="w-5 h-5" />
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          </motion.aside>
        )}

        {activeTab === 'editprofile' && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed left-0 top-16 bottom-0 w-80 ${bgSidebar} border-r ${borderColor} z-[70] overflow-y-auto`}
          >
            <div className={`p-4 border-b ${borderColor}`}>
              <div className="flex items-center justify-between">
                <h3 className={`text-lg font-semibold ${textPrimary}`}>Edit Profile</h3>
                <button 
                  onClick={() => setActiveTab('profile')}
                  className={`p-2 rounded-lg ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}
                >
                  <FiX className={`w-5 h-5 ${textSecondary}`} />
                </button>
              </div>
            </div>
            
            <div className="p-4 space-y-4">
              <div className={`${bgCard} rounded-2xl border ${borderColor} p-4`}>
                <p className={`font-medium ${textPrimary} mb-2`}>Profile Picture</p>
                <div className="flex items-center gap-4">
                  <div className={`w-20 h-20 rounded-full ${darkMode ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : 'bg-gradient-to-br from-indigo-500 to-indigo-600'} flex items-center justify-center`}>
                    <FiUser className="w-8 h-8 text-white" />
                  </div>
                  <button className={`px-4 py-2 rounded-xl text-sm font-medium ${darkMode ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}>
                    Change
                  </button>
                </div>
              </div>
              
              <div className={`${bgCard} rounded-2xl border ${borderColor} p-4`}>
                <p className={`font-medium ${textPrimary} mb-2`}>First Name</p>
                <input 
                  type="text" 
                  defaultValue={user?.firstName || ''}
                  className={`w-full px-4 py-3 rounded-xl border ${borderColor} ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200'}`}
                />
              </div>
              
              <div className={`${bgCard} rounded-2xl border ${borderColor} p-4`}>
                <p className={`font-medium ${textPrimary} mb-2`}>Last Name</p>
                <input 
                  type="text" 
                  defaultValue={user?.lastName || ''}
                  className={`w-full px-4 py-3 rounded-xl border ${borderColor} ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200'}`}
                />
              </div>
              
              <div className={`${bgCard} rounded-2xl border ${borderColor} p-4`}>
                <p className={`font-medium ${textPrimary} mb-2`}>Email</p>
                <input 
                  type="email" 
                  defaultValue={user?.email || ''}
                  disabled
                  className={`w-full px-4 py-3 rounded-xl border ${borderColor} ${darkMode ? 'bg-slate-700/50 border-slate-600 text-white/50' : 'bg-slate-100 border-slate-200 text-slate-500'} cursor-not-allowed`}
                />
              </div>
              
              <div className={`${bgCard} rounded-2xl border ${borderColor} p-4`}>
                <p className={`font-medium ${textPrimary} mb-2`}>Phone Number</p>
                <input 
                  type="tel" 
                  defaultValue={user?.phone || ''}
                  placeholder="+251..."
                  className={`w-full px-4 py-3 rounded-xl border ${borderColor} ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200'}`}
                />
              </div>
              
              <button 
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition"
              >
                <FiEdit className="w-5 h-5" />
                <span className="font-medium">Save Changes</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`pt-16 transition-all duration-300 ${hideSidebar ? 'pl-4' : 'lg:pl-64'} ${hideSidebar ? 'max-w-5xl mx-auto' : ''}`} style={{ zIndex: 10 }}>
        <div className="p-4 lg:p-6 relative z-10">
          {children}
        </div>
      </motion.main>
    </div>
  );
}