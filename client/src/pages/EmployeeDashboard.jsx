import { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { 
  FiSearch, FiBriefcase, FiBookmark, FiMessageSquare, FiBell, FiUser, FiLogOut, 
  FiMapPin, FiDollarSign, FiClock, FiMenu, FiSend, FiArrowLeft, FiFileText, 
  FiGlobe, FiSun, FiMoon, FiChevronLeft, FiChevronRight, FiPlus, FiX, FiCheck,
  FiCalendar, FiTrendingUp, FiActivity, FiTarget, FiAward, FiUsers, FiHome,
  FiSettings, FiFolder, FiStar, FiMoreVertical, FiFilter, FiGrid, FiList,
  FiCommand, FiZap, FiLayers, FiBarChart2, FiEdit2, FiFile, FiCheckCircle,
  FiAlertCircle, FiXCircle, FiPhone, FiVideo, FiPaperclip, FiShield,
  FiArrowRight, FiTrendingDown, FiEye, FiMenu as FiMenuIcon
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { jobsApi, applicationsApi, chatApi, notificationsApi, usersApi, dashboardApi } from '../services/api';

const sidebarItems = [
  { id: 'dashboard', icon: FiHome, label: 'Dashboard', path: '/dashboard' },
  { id: 'jobs', icon: FiBriefcase, label: 'Find Jobs', path: '/jobs' },
  { id: 'applications', icon: FiFileText, label: 'Applications', path: '/applications' },
  { id: 'messages', icon: FiMessageSquare, label: 'Messages', path: '/chat' },
  { id: 'saved-jobs', icon: FiBookmark, label: 'Saved Jobs', path: '/saved-jobs' },
];

const TiltCard = ({ children, className = '' }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [5, -5]);
  const rotateY = useTransform(x, [-100, 100], [-5, 5]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const AnimatedCounter = ({ value, suffix = '' }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const duration = 1000;
    const steps = 30;
    const increment = value / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(interval);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(interval);
  }, [value]);

  return <span>{count}{suffix}</span>;
};

export default function EmployeeDashboard() {
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [messageSearch, setMessageSearch] = useState('');
  const [chatMessage, setChatMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({ totalApplications: 0, interviews: 0, profileViews: 0, savedJobs: 0 });
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const searchInputRef = useRef(null);

  const textPrimary = darkMode ? 'text-slate-100' : 'text-slate-900';
  const textSecondary = darkMode ? 'text-slate-400' : 'text-slate-600';
  const textMuted = darkMode ? 'text-slate-500' : 'text-slate-400';
  const bgMain = darkMode ? 'bg-[#0B0F19]' : 'bg-slate-50';
  const bgCard = darkMode ? 'bg-slate-800/50' : 'bg-white';
  const bgSidebar = darkMode ? 'bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900' : 'bg-white';
  const borderColor = darkMode ? 'border-slate-700/50' : 'border-slate-200';
  const glassEffect = darkMode ? 'backdrop-blur-xl bg-slate-800/60 border border-slate-700/50' : 'backdrop-blur-xl bg-white/80 border border-slate-200/50';

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(true);
      }
      if (e.key === 'Escape') {
        setShowCommandPalette(false);
        setShowNotifications(false);
        setShowProfileMenu(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (showCommandPalette && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showCommandPalette]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [jobsRes, applicationsRes, statsRes] = await Promise.all([
          jobsApi.getAll({ limit: 10 }),
          applicationsApi.myApplications(),
          dashboardApi.getEmployeeStats()
        ]);
        
        setJobs(jobsRes.data.jobs || []);
        setApplications(applicationsRes.data || []);
        setStats(statsRes.data || { totalApplications: 0, interviews: 0, profileViews: 0, savedJobs: 0 });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  useEffect(() => {
    const fetchMessagesAndNotifications = async () => {
      try {
        const [messagesRes, notificationsRes] = await Promise.all([
          chatApi.getConversations(),
          notificationsApi.getAll()
        ]);
        
        const conversationList = Object.values(messagesRes.data || {});
        setMessages(conversationList.slice(0, 5));
        setNotifications(notificationsRes.data?.slice(0, 5) || []);
      } catch (error) {
        console.error('Error fetching messages/notifications:', error);
      }
    };

    fetchMessagesAndNotifications();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const userInitials = user?.email?.[0]?.toUpperCase() || 'U';
  const userName = user?.email?.split('@')[0] || 'User';

  const statCards = [
    { label: 'Applications', value: stats.totalApplications, change: '', icon: FiFileText, gradient: 'from-blue-500 to-cyan-500', bg: 'bg-blue-500/20' },
    { label: 'Interviews', value: stats.interviews, change: '', icon: FiCalendar, gradient: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-500/20' },
    { label: 'Profile Views', value: stats.profileViews, change: '', icon: FiEye, gradient: 'from-purple-500 to-pink-500', bg: 'bg-purple-500/20' },
    { label: 'Saved Jobs', value: stats.savedJobs, change: '', icon: FiBookmark, gradient: 'from-amber-500 to-orange-500', bg: 'bg-amber-500/20' },
  ];

  const filteredJobs = jobs.filter(job => 
    job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.recruiterId?.companyName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    setIsTyping(true);
    setTimeout(() => setIsTyping(false), 1500);
    setChatMessage('');
  };

  const getTimeAgo = (date) => {
    if (!date) return '';
    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return past.toLocaleDateString();
  };

  const FloatingParticles = () => (
    <div className="fixed inset-0 pointer-events-none -z-10">
      {[...Array(6)].map((_, i) => (
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
            left: `${15 + i * 15}%`,
            top: `${20 + (i % 3) * 25}%`,
            filter: 'blur(1px)'
          }}
        />
      ))}
    </div>
  );

  const GradientOrbs = () => (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      <motion.div 
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 15, repeat: Infinity }}
        className="absolute left-[10%] top-[20%] w-72 h-72 rounded-full bg-gradient-to-br from-indigo-500/20 via-purple-500/15 to-cyan-500/10 blur-[100px]" 
      />
      <motion.div 
        animate={{ x: [0, -20, 0], y: [0, 20, 0] }}
        transition={{ duration: 12, repeat: Infinity, delay: 2 }}
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

      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 h-16 ${glassEffect} border-b ${borderColor}`}
      >
        <div className="flex items-center justify-between h-full px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className={`lg:hidden p-2 rounded-xl ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'} transition`}
            >
              {showMobileMenu ? <FiX className="w-5 h-5" /> : <FiMenuIcon className="w-5 h-5" />}
            </button>

            <motion.div className="flex items-center gap-3">
              <motion.div whileHover={{ rotate: 360, scale: 1.1 }} transition={{ duration: 0.5 }} className={`w-10 h-10 rounded-xl ${darkMode ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : 'bg-gradient-to-br from-indigo-500 to-indigo-600'} flex items-center justify-center`}>
                <FiShield className="w-5 h-5 text-white" />
              </motion.div>
              <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className={`text-xl font-bold ${textPrimary} hidden lg:block`}>
                Nile
              </motion.span>
            </motion.div>
          </div>

          <motion.div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className={`relative w-full ${glassEffect} rounded-2xl border ${borderColor} overflow-hidden`}>
              <FiSearch className={`absolute left-4 top-1/2 -translate-y-1/2 ${textMuted}`} />
              <input 
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full h-10 pl-12 pr-4 bg-transparent outline-none ${textPrimary} placeholder:${textMuted}`}
              />
            </div>
          </motion.div>

          <div className="flex items-center gap-2">
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2.5 rounded-xl ${darkMode ? 'hover:bg-slate-700 text-amber-400' : 'hover:bg-slate-100 text-indigo-600'} transition`}
            >
              {darkMode ? <FiMoon className="w-5 h-5" /> : <FiSun className="w-5 h-5" />}
            </motion.button>

            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowNotifications(!showNotifications)}
              className={`relative p-2.5 rounded-xl ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'} transition`}
            >
              <FiBell className={`w-5 h-5 ${textSecondary}`} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
            </motion.button>

            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className={`flex items-center gap-2 p-1.5 pr-3 rounded-xl ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'} transition`}
            >
              <div className={`w-8 h-8 rounded-xl ${darkMode ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : 'bg-gradient-to-br from-indigo-500 to-indigo-600'} flex items-center justify-center`}>
                <span className="text-sm font-semibold text-white">{userInitials}</span>
              </div>
              <span className={`text-sm font-medium ${textPrimary} hidden lg:block`}>Profile</span>
            </motion.button>
          </div>
        </div>
      </motion.nav>

      <div className="fixed top-16 left-0 right-0 h-px z-40">
        <motion.div 
          className="h-full bg-gradient-to-r from-indigo-500 via-cyan-500 to-purple-500"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
      </div>

      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className={`absolute right-4 top-14 w-80 ${glassEffect} rounded-2xl overflow-hidden z-[60] shadow-2xl`}
          >
            <div className={`p-4 border-b ${borderColor}`}>
              <h3 className={`font-semibold ${textPrimary}`}>Notifications</h3>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-slate-500 text-sm">No notifications</div>
              ) : notifications.map((notif) => (
                <div key={notif._id || notif.id} className={`p-3 hover:bg-slate-700/30 transition-colors cursor-pointer ${darkMode ? '' : 'hover:bg-slate-50'}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      notif.type === 'application' ? darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600' :
                      notif.type === 'interview' ? darkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600' :
                      notif.type === 'job' ? darkMode ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600' :
                      notif.type === 'message' ? darkMode ? 'bg-cyan-500/20 text-cyan-400' : 'bg-cyan-100 text-cyan-600' :
                      darkMode ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-600'
                    }`}>
                      {notif.type === 'application' ? <FiFileText className="w-4 h-4" /> :
                       notif.type === 'interview' ? <FiCalendar className="w-4 h-4" /> :
                       notif.type === 'job' ? <FiBriefcase className="w-4 h-4" /> :
                       notif.type === 'message' ? <FiMessageSquare className="w-4 h-4" /> :
                       <FiUser className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${textPrimary} truncate`}>{notif.message || notif.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{getTimeAgo(notif.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showProfileMenu && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className={`absolute right-4 top-14 w-56 ${glassEffect} rounded-2xl overflow-hidden z-[60] shadow-2xl`}
          >
            <div className={`p-4 border-b ${borderColor}`}>
              <p className={`font-medium ${textPrimary} truncate`}>{user?.email}</p>
              <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
            </div>
            <div className="p-2">
              <Link to="/profile" className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-100 text-slate-700'}`}>
                <FiUser className="w-4 h-4" />
                <span className="text-sm">My Profile</span>
              </Link>
              <Link to="/saved-jobs" className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-100 text-slate-700'}`}>
                <FiBookmark className="w-4 h-4" />
                <span className="text-sm">Saved Jobs</span>
              </Link>
              <Link to="/settings" className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-100 text-slate-700'}`}>
                <FiSettings className="w-4 h-4" />
                <span className="text-sm">Settings</span>
              </Link>
              <button 
                onClick={() => { logout(); navigate('/login'); }}
                className={`w-full flex items-center gap-3 p-2 rounded-lg ${darkMode ? 'hover:bg-red-500/10 text-red-400' : 'hover:bg-red-50 text-red-600'} transition-colors`}
              >
                <FiLogOut className="w-4 h-4" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(showNotifications || showProfileMenu) && (
          <div className="fixed inset-0 z-[50]" onClick={() => { setShowNotifications(false); setShowProfileMenu(false); }} />
        )}
      </AnimatePresence>

      <motion.aside 
        initial={{ x: -100 }}
        animate={{ x: 0 }}
        className={`fixed left-0 top-16 bottom-0 z-30 ${sidebarCollapsed ? 'w-20' : 'w-64'} ${bgSidebar} border-r ${borderColor} transition-all duration-300 hidden lg:flex flex-col overflow-hidden`}
      >
        {darkMode && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-indigo-500/5 to-transparent" />
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-purple-500/5 to-transparent" />
            <motion.div 
              className="absolute left-4 top-1/4 w-8 h-8 rounded-full bg-indigo-500/20 blur-xl"
              animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </div>
        )}
        <div className="flex-1 p-3 overflow-y-auto relative z-10">
          <nav className="space-y-1">
            {sidebarItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => navigate(item.path)}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? darkMode 
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25' 
                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20'
                      : darkMode 
                        ? 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200' 
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.6 }}>
                    <Icon className="w-5 h-5 flex-shrink-0" />
                  </motion.div>
                  <AnimatePresence>
                    {!sidebarCollapsed && (
                      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm font-medium">
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}
          </nav>
        </div>

        <div className={`p-3 ${borderColor} border-t relative z-10`}>
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
        {showMobileMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/50 lg:hidden"
            onClick={() => setShowMobileMenu(false)}
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
                  {sidebarItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <motion.button
                        key={item.id}
                        onClick={() => { navigate(item.path); setShowMobileMenu(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                          activeTab === item.id
                            ? darkMode ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                            : darkMode ? 'text-slate-400 hover:bg-slate-700/50' : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-sm font-medium">{item.label}</span>
                      </motion.button>
                    );
                  })}
                </nav>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.main 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="pt-16 lg:pl-64 transition-all duration-300"
      >
        <div className="p-4 lg:p-6 relative z-10">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <h1 className={`text-2xl md:text-3xl font-bold ${textPrimary} mb-2`}>
              {greeting}, {userName} 👋
            </h1>
            <p className={textSecondary}>Here's your job search overview for today.</p>
          </motion.div>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6"
          >
            {statCards.map((card, index) => (
              <motion.div
                key={card.label}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 * index + 0.3 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className={`group relative p-4 md:p-5 rounded-2xl cursor-pointer transition-all duration-500 overflow-hidden ${
                  darkMode 
                    ? 'bg-gradient-to-br from-slate-800/80 via-slate-800/60 to-slate-900/80 border-slate-700/50 hover:border-slate-600/50 shadow-xl shadow-black/20' 
                    : 'bg-gradient-to-br from-white via-white to-slate-50 border-slate-200/50 hover:border-slate-300/50 shadow-lg'
                } backdrop-blur-xl`}
              >
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-3 md:mb-4">
                    <div className={`w-10 md:w-12 h-10 md:h-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg`}>
                      <card.icon className="w-5 md:w-6 h-5 md:h-6 text-white" />
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      card.change.startsWith('+') 
                        ? darkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600'
                        : darkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600'
                    }`}>
                      {card.change}
                    </span>
                  </div>
                  <h3 className={`text-xl md:text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'} mb-1`}>
                    <AnimatedCounter value={card.value} />
                  </h3>
                  <p className={`text-xs md:text-sm ${textSecondary}`}>{card.label}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-2"
            >
              <div className={`${bgCard} backdrop-blur-xl rounded-2xl p-4 md:p-6 border ${borderColor}`}>
                <div className="flex items-center justify-between mb-4 md:mb-6">
                  <h2 className={`text-lg md:text-xl font-semibold ${textPrimary}`}>Recommended Jobs</h2>
                  <div className="flex items-center gap-2">
                    <button className={`p-2 rounded-lg ${darkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`}>
                      <FiFilter className="w-4 h-4" />
                    </button>
                    <button className={`p-2 rounded-lg ${darkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`}>
                      <FiGrid className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-3 md:space-y-4">
                  {loading ? (
                    <div className="text-center py-8 text-slate-500">Loading jobs...</div>
                  ) : filteredJobs.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">No jobs found</div>
                  ) : filteredJobs.slice(0, 4).map((job, index) => (
                    <TiltCard key={job._id} className="w-full">
                      <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className={`p-4 rounded-xl transition-all hover:scale-[1.02] cursor-pointer ${
                          darkMode ? 'bg-slate-800/40 hover:bg-slate-700/50' : 'bg-slate-50 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-medium text-sm">{job.recruiterId?.companyName?.[0] || 'C'}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h3 className={`font-semibold ${textPrimary} mb-1`}>{job.title}</h3>
                                <p className="text-sm text-slate-500">{job.recruiterId?.companyName || 'Company'} • {job.location || 'Remote'}</p>
                              </div>
                              {job.featured && (
                                <span className="px-2 py-1 text-xs bg-amber-500/20 text-amber-400 rounded-full flex-shrink-0">
                                  Featured
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-3 flex-wrap">
                              <span className="text-sm font-medium text-indigo-400">{job.salary || 'Competitive'}</span>
                              <span className="text-xs text-slate-500">•</span>
                              <span className="text-sm text-slate-500">{job.jobType || 'Full-time'}</span>
                              <span className="text-xs text-slate-500">•</span>
                              <span className="text-sm text-slate-500">{getTimeAgo(job.createdAt)}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              {job.skills?.slice(0, 3).map(tag => (
                                <span key={tag} className={`text-xs px-2 py-1 rounded-full ${
                                  darkMode ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-100 text-indigo-700'
                                }`}>
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-colors">
                              <FiBookmark className="w-4 h-4" />
                            </motion.button>
                            <Link 
                              to={`/jobs/${job._id}`}
                              className="p-2 rounded-lg bg-indigo-500 text-white hover:opacity-90 transition-opacity text-center text-sm"
                            >
                              View
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    </TiltCard>
                  ))}
                </div>
                <Link to="/jobs" className={`flex items-center justify-center gap-2 mt-4 p-3 rounded-xl ${darkMode ? 'text-indigo-400 hover:bg-indigo-500/10' : 'text-indigo-600 hover:bg-indigo-50'} transition-colors`}>
                  <span className="text-sm font-medium">View All Jobs</span>
                  <FiArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>

            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="lg:col-span-1"
            >
              <div className={`${bgCard} backdrop-blur-xl rounded-2xl p-4 md:p-6 border ${borderColor} h-full`}>
                <h2 className={`text-lg md:text-xl font-semibold ${textPrimary} mb-4 md:mb-6`}>Applications</h2>
                <div className="space-y-3 md:space-y-4">
                  {loading ? (
                    <div className="text-center py-4 text-slate-500">Loading...</div>
                  ) : applications.length === 0 ? (
                    <div className="text-center py-4 text-slate-500">No applications yet</div>
                  ) : applications.slice(0, 5).map((app, index) => (
                    <motion.div
                      key={app._id || app.id}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-medium">{app.jobId?.title?.[0] || 'J'}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${textPrimary} truncate`}>{app.jobId?.title || 'Job'}</p>
                        <p className="text-xs text-slate-500">{app.jobId?.location || ''}</p>
                      </div>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full flex-shrink-0 ${
                        app.status === 'accepted' 
                          ? darkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700' 
                          : app.status === 'rejected'
                            ? darkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700'
                            : darkMode ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {app.status}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="lg:col-span-2"
            >
              <div className={`${bgCard} backdrop-blur-xl rounded-2xl p-4 md:p-6 border ${borderColor}`}>
                <div className="flex items-center justify-between mb-4 md:mb-6">
                  <h2 className={`text-lg md:text-xl font-semibold ${textPrimary}`}>Messages</h2>
                  <Link to="/chat" className="text-sm text-indigo-400 hover:underline">See All</Link>
                </div>
                <div className="space-y-3 md:space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-4 text-slate-500">No messages yet</div>
                  ) : messages.map((msg, index) => (
                    <Link
                      key={msg._id || index}
                      to={`/chat/${msg._id}`}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${darkMode ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'}`}
                    >
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                          <span className="text-white font-medium text-sm">{(msg.firstName || msg.email?.[0] || 'U').toUpperCase()}</span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`font-medium ${textPrimary}`}>{msg.firstName ? `${msg.firstName} ${msg.lastName || ''}` : msg.email?.split('@')[0] || 'User'}</p>
                          <span className="text-xs text-slate-500">{getTimeAgo(msg.timestamp)}</span>
                        </div>
                        <p className={`text-sm truncate ${msg.unread ? textPrimary : textSecondary}`}>
                          {msg.lastMessage || 'Start a conversation'}
                        </p>
                      </div>
                      {msg.unread > 0 && (
                        <div className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0" />
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <div className={`${bgCard} backdrop-blur-xl rounded-2xl p-4 md:p-6 border ${borderColor}`}>
                <h2 className={`text-lg md:text-xl font-semibold ${textPrimary} mb-4 md:mb-6`}>Profile Strength</h2>
                <div className="relative h-40 w-40 mx-auto">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke={darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
                      strokeWidth="12"
                      fill="none"
                    />
                    <motion.circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="url(#employeeGradient)"
                      strokeWidth="12"
                      fill="none"
                      strokeLinecap="round"
                      initial={{ strokeDashoffset: 440 }}
                      animate={{ strokeDashoffset: 110 }}
                      transition={{ duration: 1.5, delay: 0.8 }}
                      strokeDasharray="440"
                    />
                    <defs>
                      <linearGradient id="employeeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#5b7cff" />
                        <stop offset="100%" stopColor="#39c6ff" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className={`text-3xl font-bold ${textPrimary}`}>75%</span>
                    <span className="text-xs text-slate-500">Complete</span>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  {['Add profile photo', 'Add skills', 'Add work experience'].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-slate-500">
                      <FiXCircle className="w-4 h-4 text-red-400" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
                <Link to="/profile" className={`w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl transition font-medium shadow-lg shadow-indigo-500/25`}>
                  Complete Profile
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.main>
    </div>
  );
}