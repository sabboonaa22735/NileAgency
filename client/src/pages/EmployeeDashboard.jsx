import { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { io } from 'socket.io-client';
import { 
  FiSearch, FiBriefcase, FiBookmark, FiMessageSquare, FiBell, FiUser, FiLogOut, 
  FiMapPin, FiDollarSign, FiClock, FiMenu, FiSend, FiArrowLeft, FiFileText, 
  FiGlobe, FiSun, FiMoon, FiChevronLeft, FiChevronRight, FiPlus, FiX, FiCheck,
  FiCalendar, FiTrendingUp, FiActivity, FiTarget, FiAward, FiUsers, FiHome,
  FiSettings, FiFolder, FiStar, FiMoreVertical, FiFilter, FiGrid, FiList,
  FiCommand, FiZap, FiLayers, FiBarChart2, FiEdit2, FiFile, FiCheckCircle,
  FiAlertCircle, FiXCircle, FiPhone, FiVideo, FiPaperclip, FiShield,
  FiArrowRight, FiTrendingDown, FiEye, FiMenu as FiMenuIcon, FiAlertTriangle, FiRefreshCw,
  FiSmile, FiTrash2
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { notificationsApi, applicationsApi, jobsApi, usersApi, chatApi } from '../services/api';

const mockJobs = [
  { id: 1, title: 'Senior React Developer', company: 'TechCorp', location: 'Remote', salary: '$80-120k', type: 'Full-time', posted: '2h ago', logo: 'TC', tags: ['React', 'TypeScript'], featured: true },
  { id: 2, title: 'UI/UX Designer', company: 'DesignLab', location: 'New York, NY', salary: '$70-90k', type: 'Full-time', posted: '5h ago', logo: 'DL', tags: ['Figma', 'UI Design'], featured: false },
  { id: 3, title: 'Full Stack Engineer', company: 'StartupXYZ', location: 'San Francisco, CA', salary: '$100-140k', type: 'Full-time', posted: '1d ago', logo: 'SX', tags: ['Node.js', 'React'], featured: true },
  { id: 4, title: 'Product Manager', company: 'InnovateCo', location: 'Austin, TX', salary: '$90-130k', type: 'Full-time', posted: '2d ago', logo: 'IC', tags: ['Agile', 'Strategy'], featured: false },
  { id: 5, title: 'DevOps Engineer', company: 'CloudTech', location: 'Remote', salary: '$85-115k', type: 'Contract', posted: '3d ago', logo: 'CT', tags: ['AWS', 'Docker'], featured: false },
];

const mockApplications = [
  { id: 1, jobTitle: 'Frontend Developer', company: 'Google', status: 'accepted', date: '2025-04-15', avatar: 'G' },
  { id: 2, jobTitle: 'UI Designer', company: 'Meta', status: 'pending', date: '2025-04-18', avatar: 'M' },
  { id: 3, jobTitle: 'Full Stack Dev', company: 'Amazon', status: 'rejected', date: '2025-04-10', avatar: 'A' },
  { id: 4, jobTitle: 'Product Designer', company: 'Apple', status: 'pending', date: '2025-04-19', avatar: 'Ap' },
];

const mockMessages = [
  { id: 1, name: 'Sarah Chen', lastMessage: 'Hey! How\'s the project going?', time: '2m ago', unread: true, avatar: 'SC', online: true },
  { id: 2, name: 'Mike Johnson', lastMessage: 'Thanks for the update!', time: '1h ago', unread: false, avatar: 'MJ', online: false },
  { id: 3, name: 'Emily Davis', lastMessage: 'Let\'s schedule a call tomorrow', time: '3h ago', unread: true, avatar: 'ED', online: true },
  { id: 4, name: 'Alex Kim', lastMessage: 'Got it, I\'ll review the PR', time: '1d ago', unread: false, avatar: 'AK', online: false },
];

const sidebarItems = [
  { id: 'dashboard', icon: FiHome, label: 'Dashboard' },
  { id: 'jobs', icon: FiBriefcase, label: 'Find Jobs' },
  { id: 'applications', icon: FiFileText, label: 'Applications' },
  { id: 'messages', icon: FiMessageSquare, label: 'Messages' },
  { id: 'settings', icon: FiSettings, label: 'Settings' },
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
  const [darkMode, setDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [messageSearch, setMessageSearch] = useState('');
  const [chatMessage, setChatMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [stats, setStats] = useState({ applications: 0, interviews: 0, profileViews: 0, savedJobs: 0 });
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const messagesEndRef = useRef(null);
  
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const searchInputRef = useRef(null);

  const textPrimary = darkMode ? 'text-slate-100' : 'text-slate-900';
  const textSecondary = darkMode ? 'text-slate-400' : 'text-slate-600';
  const textMuted = darkMode ? 'text-slate-500' : 'text-slate-400';
  const bgMain = darkMode ? 'bg-[#0F172A]' : 'bg-slate-50';
  const bgCard = darkMode ? 'bg-slate-800' : 'bg-white';
  const bgSidebar = darkMode ? 'bg-slate-900' : 'bg-white';
  const borderColor = darkMode ? 'border-slate-700' : 'border-slate-200';
  const glassEffect = darkMode ? 'backdrop-blur-xl bg-slate-800/95 border border-slate-700' : 'backdrop-blur-xl bg-white/95 border border-slate-200';

  const handleRefresh = () => {
    fetchNotifications();
    fetchDashboardData();
  };

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
    fetchNotifications();
    fetchDashboardData();
    fetchInitialUnreadCount();
    const interval = setInterval(() => {
      fetchNotifications();
      fetchDashboardData();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchInitialUnreadCount = async () => {
    try {
      const convRes = await chatApi.getConversations();
      const convList = Array.isArray(convRes.data) ? convRes.data : Object.values(convRes.data || {});
      const totalUnread = convList.reduce((sum, conv) => sum + (conv.unread || 0), 0);
      setUnreadMessages(totalUnread);
    } catch (error) {
      console.error('Error fetching initial unread count:', error);
    }
  };

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || '/api';
    const socketUrl = apiUrl.startsWith('http') ? apiUrl.replace('/api', '') : undefined;
    const newSocket = io(socketUrl);
    const userId = user?._id || user?.id;
    if (userId) {
      newSocket.emit('join', userId);
      newSocket.on('newMessage', (msg) => {
        if (activeTab !== 'messages') {
          setUnreadMessages(prev => prev + 1);
        }
      });
    }
    setSocket(newSocket);
    return () => newSocket.disconnect();
  }, [user, activeTab]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotifications();
      fetchDashboardData();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      setNotificationsLoading(true);
      const res = await notificationsApi.getAll();
      const data = Array.isArray(res.data) ? res.data : (res.data.notifications || []);
      setNotifications(data);
} catch (error) {
      console.error('Error fetching conversations:', error);
      setConversations([]);
    }
  };

  const fetchContacts = async () => {
    try {
      const contactsRes = await chatApi.getContacts();
      const contacts = Array.isArray(contactsRes.data) ? contactsRes.data : [];
      setConversations(contacts);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      try {
        const convRes = await chatApi.getConversations();
        const convData = convRes.data ? (Array.isArray(convRes.data) ? convRes.data : Object.values(convRes.data)) : [];
        setConversations(convData);
      } catch (err) {
        setConversations([]);
      }
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [jobsRes, appsRes, savedRes, viewsRes, convRes] = await Promise.all([
        jobsApi.getAll({ limit: 10 }),
        applicationsApi.myApplications(),
        usersApi.getSavedJobs(),
        usersApi.getProfileViews(),
        chatApi.getConversations()
      ]);
      
      console.log('=== Dashboard Data ===');
      console.log('Jobs:', jobsRes.data);
      console.log('Applications:', appsRes.data);
      console.log('Conversations:', convRes.data);
      
      const jobsData = jobsRes.data?.jobs || [];
      const appsData = Array.isArray(appsRes.data) ? appsRes.data : [];
      const convData = convRes.data ? (Array.isArray(convRes.data) ? convRes.data : Object.values(convRes.data)) : [];
      
      setJobs(jobsData);
      setApplications(appsData);
      setConversations(convData);
      setStats({
        applications: appsData.length,
        interviews: appsData.filter(a => a.status === 'accepted').length,
        profileViews: viewsRes.data?.count || 0,
        savedJobs: (savedRes.data || []).length
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setJobs([]);
      setApplications([]);
      setConversations([]);
      setStats({ applications: 0, interviews: 0, profileViews: 0, savedJobs: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mockMessages]);

  const userInitials = user?.email?.[0]?.toUpperCase() || 'U';
  const userName = user?.email?.split('@')[0] || 'User';

  const statCards = [
    { label: 'Applications', value: stats.applications, change: '+3', icon: FiFileText, gradient: 'from-blue-500 to-cyan-500' },
    { label: 'Interviews', value: stats.interviews, change: '+1', icon: FiCalendar, gradient: 'from-emerald-500 to-teal-500' },
    { label: 'Profile Views', value: stats.profileViews, change: '+24', icon: FiEye, gradient: 'from-purple-500 to-pink-500' },
    { label: 'Saved Jobs', value: stats.savedJobs, change: '+5', icon: FiBookmark, gradient: 'from-amber-500 to-orange-500' },
  ];

  const filteredJobs = mockJobs.filter(job => 
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
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
            <button 
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              style={{ position: 'relative', zIndex: 999, background: 'transparent', border: 'none', cursor: 'pointer', padding: '10px', borderRadius: '12px' }}
              className={darkMode ? 'hover:bg-slate-700 text-amber-400' : 'hover:bg-slate-100 text-indigo-600'}
            >
              {darkMode ? <FiMoon className="w-5 h-5" /> : <FiSun className="w-5 h-5" />}
            </button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleRefresh}
              className={`p-2.5 rounded-xl ${darkMode ? 'hover:bg-slate-700 text-cyan-400' : 'hover:bg-slate-100 text-indigo-600'} transition`}
              title="Refresh data"
            >
              <FiRefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </motion.button>

            <button 
              type="button"
              onClick={() => { console.log('Notification clicked', showNotifications); setShowNotifications(!showNotifications); }}
              style={{ position: 'relative', zIndex: 999, background: 'transparent', border: 'none', cursor: 'pointer', padding: '10px', borderRadius: '12px', display: 'flex', alignItems: 'center' }}
              className={darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}
            >
              <FiBell className={`w-5 h-5 ${textSecondary}`} />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full" />
              )}
            </button>

            <motion.button
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab('messages')}
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
              {conversations.filter(c => c.unread).length > 0 && (
                <motion.span 
                  className="absolute top-0 right-0 w-3 h-3 bg-cyan-500 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
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
            style={{ position: 'fixed', right: 20, top: 70, zIndex: 9999, width: 320, background: darkMode ? '#1e293b' : '#ffffff', borderRadius: 16, padding: 16, boxShadow: '0 10px 40px rgba(0,0,0,0.3)' }}
          >
            <div style={{ borderBottom: '1px solid #334155', paddingBottom: 12, marginBottom: 12 }}>
              <h3 style={{ fontWeight: 600, color: darkMode ? '#f1f5f9' : '#0f172a' }}>Notifications</h3>
            </div>
            <div style={{ maxHeight: 200, overflowY: 'auto' }}>
              {notificationsLoading ? (
                <div style={{ color: '#94a3b8', textAlign: 'center' }}>Loading...</div>
              ) : notifications.length === 0 ? (
                <div style={{ color: '#94a3b8', textAlign: 'center' }}>No notifications</div>
              ) : notifications.slice(0, 5).map((notif) => (
                <div key={notif._id || notif.id} style={{ padding: '8px 0', borderBottom: '1px solid #334155' }}>
                  <p style={{ color: darkMode ? '#e2e8f0' : '#1e293b', fontSize: 14 }}>{notif.message || notif.title}</p>
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
              <button onClick={() => { setActiveTab('settings'); setShowProfileMenu(false); }} className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-100 text-slate-700'}`}>
                <FiSettings className="w-4 h-4" />
                <span className="text-sm">Settings</span>
              </button>
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
              const showBadge = item.id === 'messages' && unreadMessages > 0;
              return (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (item.id === 'messages') {
                      setUnreadMessages(0);
                    }
                  }}
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
                    <div className="relative">
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      {item.id === 'messages' && unreadMessages > 0 && (
                        <span style={{ position: 'absolute', top: '-8px', right: '-8px', minWidth: '18px', height: '18px', backgroundColor: 'red', color: 'white', fontSize: '10px', fontWeight: 'bold', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>
                          {unreadMessages > 9 ? '9+' : unreadMessages}
                        </span>
                      )}
                    </div>
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
                    const showBadge = item.id === 'messages' && unreadMessages > 0;
                    return (
                      <motion.button
                        key={item.id}
                        onClick={() => { 
                          setActiveTab(item.id); 
                          setShowMobileMenu(false);
                          if (item.id === 'messages') {
                            setUnreadMessages(0);
                          }
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                          activeTab === item.id
                            ? darkMode ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                            : darkMode ? 'text-slate-400 hover:bg-slate-700/50' : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <div className="relative">
                          <Icon className="w-5 h-5" />
                          {item.id === 'messages' && unreadMessages > 0 && (
                            <span style={{ position: 'absolute', top: '-8px', right: '-8px', minWidth: '18px', height: '18px', backgroundColor: 'red', color: 'white', fontSize: '10px', fontWeight: 'bold', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>
                              {unreadMessages > 9 ? '9+' : unreadMessages}
                            </span>
                          )}
                        </div>
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
          {activeTab === 'dashboard' && (
            <DashboardTab darkMode={darkMode} jobs={jobs} applications={applications} stats={stats} loading={loading} />
          )}
          {activeTab === 'jobs' && (
            <JobsTab darkMode={darkMode} jobs={jobs} setJobs={setJobs} />
          )}
          {activeTab === 'applications' && (
            <ApplicationsTab darkMode={darkMode} applications={applications} setApplications={setApplications} />
          )}
          {activeTab === 'messages' && (
            <MessagesTab darkMode={darkMode} socket={socket} />
          )}
          {activeTab === 'settings' && (
            <SettingsTab darkMode={darkMode} />
          )}
        </div>
      </motion.main>
    </div>
  );
}

const DashboardTab = ({ darkMode, jobs = [], applications = [], stats, loading }) => {
  const textPrimary = darkMode ? 'text-slate-100' : 'text-slate-900';
  const textSecondary = darkMode ? 'text-slate-400' : 'text-slate-600';
  const bgCard = darkMode ? 'bg-slate-800' : 'bg-white';
  const borderColor = darkMode ? 'border-slate-700' : 'border-slate-200';
  const { user } = useAuth();
  const userName = user?.email?.split('@')[0] || 'User';
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const statCards = [
    { label: 'Applications', value: stats?.applications || 0, change: '+3', icon: FiFileText, gradient: 'from-blue-500 to-cyan-500' },
    { label: 'Interviews', value: stats?.interviews || 0, change: '+1', icon: FiCalendar, gradient: 'from-emerald-500 to-teal-500' },
    { label: 'Profile Views', value: stats?.profileViews || 0, change: '+24', icon: FiEye, gradient: 'from-purple-500 to-pink-500' },
    { label: 'Saved Jobs', value: stats?.savedJobs || 0, change: '+5', icon: FiBookmark, gradient: 'from-amber-500 to-orange-500' },
  ];

  const displayJobs = jobs.length > 0 ? jobs.slice(0, 3) : mockJobs.slice(0, 3);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500/20 border-t-indigo-500"></div>
      </div>
    );
  }

  return (
    <>
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <h1 className={`text-2xl md:text-3xl font-bold ${textPrimary} mb-2`}>
          {greeting}, {userName}
        </h1>
        <p className={textSecondary}>Here is your job search overview for today.</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <div className={`${bgCard} backdrop-blur-xl rounded-2xl p-4 md:p-6 border ${borderColor}`}>
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className={`text-lg md:text-xl font-semibold ${textPrimary}`}>Recent Jobs</h2>
            </div>
            <div className="space-y-3 md:space-y-4">
              {displayJobs.slice(0, 3).map((job, index) => (
                <motion.div
                  key={job._id || job.id || index}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className={`p-4 rounded-xl transition-all hover:scale-[1.02] cursor-pointer ${
                    darkMode ? 'bg-slate-800/40 hover:bg-slate-700/50' : 'bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-medium text-sm">{job.recruiterId?.companyName?.[0] || job.company?.[0] || job.title?.[0] || 'J'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-semibold ${textPrimary} mb-1`}>{job.title}</h3>
                      <p className="text-sm text-slate-500">{job.recruiterId?.companyName || job.company || 'Company'} - {job.location || 'Remote'}</p>
                    </div>
                    <span className="text-sm font-medium text-indigo-400">{job.salary?.min && job.salary?.max ? `ETB ${job.salary.min.toLocaleString()}-${job.salary.max.toLocaleString()}` : typeof job.salary === 'string' ? job.salary : 'Competitive'}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className={`${bgCard} backdrop-blur-xl rounded-2xl p-4 md:p-6 border ${borderColor} h-full`}>
            <h2 className={`text-lg md:text-xl font-semibold ${textPrimary} mb-4 md:mb-6`}>Profile Strength</h2>
            <div className="relative h-40 w-40 mx-auto">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="80" cy="80" r="70" stroke={darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} strokeWidth="12" fill="none" />
                <motion.circle cx="80" cy="80" r="70" stroke="url(#tabGradient)" strokeWidth="12" fill="none" strokeLinecap="round" initial={{ strokeDashoffset: 440 }} animate={{ strokeDashoffset: 110 }} transition={{ duration: 1.5, delay: 0.8 }} strokeDasharray="440" />
                <defs><linearGradient id="tabGradient" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#5b7cff" /><stop offset="100%" stopColor="#39c6ff" /></linearGradient></defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className={`text-3xl font-bold ${textPrimary}`}>75%</span>
                <span className="text-xs text-slate-500">Complete</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

const JobsTab = ({ darkMode, jobs = [], setJobs }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const textPrimary = darkMode ? 'text-slate-100' : 'text-slate-900';
  const textSecondary = darkMode ? 'text-slate-400' : 'text-slate-600';
  const bgCard = darkMode ? 'bg-slate-800' : 'bg-white';
  const borderColor = darkMode ? 'border-slate-700' : 'border-slate-200';

  const displayJobs = jobs.length > 0 ? jobs : mockJobs;
  const filteredJobs = displayJobs.filter(job => 
    job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.company?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-6">
        <h1 className={`text-2xl md:text-3xl font-bold ${textPrimary} mb-2`}>Find Jobs</h1>
        <p className={textSecondary}>{filteredJobs.length} jobs available</p>
      </motion.div>

      <div className="relative mb-6">
        <FiSearch className={`absolute left-4 top-1/2 -translate-y-1/2 ${textSecondary}`} />
        <input type="text" placeholder="Search jobs..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={`w-full pl-12 pr-4 py-3 ${bgCard} border ${borderColor} rounded-xl ${textPrimary} placeholder:${textSecondary} focus:outline-none focus:border-indigo-500`} />
      </div>

      <div className="space-y-4">
        {filteredJobs.map((job, index) => (
          <motion.div key={job._id || job.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className={`${bgCard} border ${borderColor} rounded-2xl p-4 md:p-6 hover:border-indigo-500/50 transition-colors`}>
            <div className="flex flex-col md:flex-row md:items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-lg">{job.recruiterId?.companyName?.[0] || job.company?.[0] || 'C'}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <h3 className={`text-lg font-semibold ${textPrimary} mb-1`}>{job.title}</h3>
                    <p className={textSecondary}>{job.recruiterId?.companyName || job.company || 'Company'}</p>
                  </div>
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-colors">
                    <FiBookmark className="w-5 h-5" />
                  </motion.button>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mb-3">
                  <span className="flex items-center gap-1"><FiMapPin className="w-4 h-4" />{job.location || 'Remote'}</span>
                  <span className="flex items-center gap-1"><FiDollarSign className="w-4 h-4" />{job.salary?.min && job.salary?.max ? `ETB ${job.salary.min.toLocaleString()}-${job.salary.max.toLocaleString()}` : typeof job.salary === 'string' ? job.salary : 'Competitive'}</span>
                  <span className="flex items-center gap-1"><FiClock className="w-4 h-4" />{job.posted}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {(job.tags || job.skills || []).map(tag => (
                    <span key={tag} className="px-3 py-1 text-xs bg-indigo-500/20 text-indigo-300 rounded-full">{tag}</span>
                  ))}
                </div>
              </div>
              <div className="flex flex-row md:flex-col gap-2 flex-shrink-0">
                <button onClick={() => navigate(`/jobs/${job._id || job.id}`)} className="px-6 py-2 bg-indigo-500 text-white rounded-xl text-center font-medium hover:bg-indigo-600 transition-colors">View</button>
                <button onClick={() => navigate(`/apply/${job._id || job.id}`)} className="px-6 py-2 bg-slate-700 text-white rounded-xl text-center font-medium hover:bg-slate-600 transition-colors">Apply</button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </>
  );
};

const ApplicationsTab = ({ darkMode, applications = [], setApplications }) => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const textPrimary = darkMode ? 'text-slate-100' : 'text-slate-900';
  const textSecondary = darkMode ? 'text-slate-400' : 'text-slate-600';
  const bgCard = darkMode ? 'bg-slate-800' : 'bg-white';
  const borderColor = darkMode ? 'border-slate-700' : 'border-slate-200';

  const displayApps = applications.length > 0 ? applications : mockApplications;
  const statusCounts = {
    all: displayApps.length,
    pending: displayApps.filter(a => a.status === 'pending').length,
    accepted: displayApps.filter(a => a.status === 'accepted').length,
    rejected: displayApps.filter(a => a.status === 'rejected').length,
  };

  const filteredApps = displayApps.filter(app => {
    if (filter === 'all') return true;
    return app.status === filter;
  });

  return (
    <>
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-6">
        <h1 className={`text-2xl md:text-3xl font-bold ${textPrimary} mb-2`}>My Applications</h1>
        <p className={textSecondary}>{displayApps.length} total applications</p>
      </motion.div>

      <div className="flex flex-wrap gap-2 mb-6">
        {['all', 'pending', 'accepted', 'rejected'].map(status => (
          <button key={status} onClick={() => setFilter(status)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filter === status ? 'bg-indigo-500 text-white' : `${bgCard} ${textSecondary} hover:bg-slate-700`}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)} ({statusCounts[status]})
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredApps.map((app, index) => (
          <motion.div key={app._id || app.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className={`${bgCard} border ${borderColor} rounded-2xl p-4 md:p-6 hover:border-indigo-500/50 transition-colors`}>
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <FiFileText className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <h3 className={`text-lg font-semibold ${textPrimary} mb-1`}>{app.jobId?.title || app.jobTitle || 'Job Title'}</h3>
                    <p className={textSecondary}>{app.jobId?.recruiterId?.companyName || app.company || 'Company'}</p>
                  </div>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full flex-shrink-0 ${
                    app.status === 'accepted' ? 'bg-emerald-500/20 text-emerald-400' : app.status === 'rejected' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>{app.status}</span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                  <span className="flex items-center gap-1"><FiClock className="w-4 h-4" />Applied: {new Date(app.createdAt || app.date).toLocaleDateString()}</span>
                </div>
              </div>
              <button onClick={() => navigate(`/jobs/${app.jobId?._id || app.jobId}`)} className="px-4 py-2 bg-slate-700 text-white rounded-xl text-sm font-medium hover:bg-slate-600">View Job</button>
            </div>
          </motion.div>
        ))}
      </div>
    </>
  );
};

const MessagesTab = ({ darkMode, socket }) => {
  const [conversations, setConversations] = useState([]);
  const [admin, setAdmin] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [messageMenuId, setMessageMenuId] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editText, setEditText] = useState('');
  const [selectedMessages, setSelectedMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const textPrimary = darkMode ? 'text-slate-100' : 'text-slate-900';
  const textSecondary = darkMode ? 'text-slate-400' : 'text-slate-600';
  const bgCard = darkMode ? 'bg-slate-800' : 'bg-white';
  const borderColor = darkMode ? 'border-slate-700' : 'border-slate-200';

  const emojis = ['😊', '😂', '❤️', '👍', '🎉', '🔥', '💯', '🙏', '😍', '🤔', '😎', '🥳'];

  useEffect(() => {
    fetchAdmin();
    fetchConversations();
  }, []);

  useEffect(() => {
    if (!socket) return;
    
    const handleNewMessage = (msg) => {
      if (selectedChat && msg.senderId?.toString() === selectedChat._id?.toString()) {
        setMessages(prev => [...prev, msg]);
        scrollToBottom();
      }
      fetchConversations();
    };

    socket.on('newMessage', handleNewMessage);
    return () => socket.off('newMessage', handleNewMessage);
  }, [socket, selectedChat]);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat._id);
    }
  }, [selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenu(null);
      setShowEmojiPicker(false);
      setShowOptions(false);
      setMessageMenuId(null);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchAdmin = async () => {
    try {
      const response = await chatApi.getAdmin();
      setAdmin(response.data);
      if (response.data?._id) {
        setSelectedChat(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch admin:', error);
    }
  };

  const fetchConversations = async () => {
    try {
      const response = await chatApi.getConversations();
      const convList = Object.values(response.data);
      setConversations(convList);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      setLoading(false);
    }
  };

  const fetchMessages = async (partnerId) => {
    try {
      const response = await chatApi.getMessages(partnerId);
      setMessages(response.data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      setMessages([]);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat || sending) return;

    setSending(true);
    try {
      const response = await chatApi.sendMessage({
        receiverId: selectedChat._id,
        content: newMessage.trim()
      });
      setMessages(prev => [...prev, response.data]);
      setNewMessage('');
      fetchConversations();
      scrollToBottom();
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewMessage(prev => prev + `[File: ${file.name}]`);
    }
  };

  const addEmoji = (emoji) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const toggleMessageMenu = (e, msgId) => {
    e.stopPropagation();
    setMessageMenuId(messageMenuId === msgId ? null : msgId);
  };

  const deleteMessage = (msgId) => {
    setMessages(prev => prev.filter(m => m._id !== msgId));
    setMessageMenuId(null);
    setContextMenu(null);
  };

  const handleContextMenu = (e, msg) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      msg: msg
    });
  };

  const copyMessage = (content) => {
    navigator.clipboard.writeText(content);
    setContextMenu(null);
  };

  const startEditing = (msg) => {
    setEditingMessageId(msg._id);
    setEditText(msg.content);
    setContextMenu(null);
  };

  const saveEdit = (msgId) => {
    setMessages(prev => prev.map(m => m._id === msgId ? { ...m, content: editText } : m));
    setEditingMessageId(null);
    setEditText('');
  };

  const cancelEdit = () => {
    setEditingMessageId(null);
    setEditText('');
  };

  const replyToMessage = (msg) => {
    setNewMessage(prev => prev + `[Reply to: ${msg.content.substring(0, 30)}...]\n`);
    setContextMenu(null);
  };

  const toggleSelectMessage = (msgId) => {
    setSelectedMessages(prev => 
      prev.includes(msgId) ? prev.filter(id => id !== msgId) : [...prev, msgId]
    );
  };

  const deleteSelectedMessages = () => {
    setMessages(prev => prev.filter(m => !selectedMessages.includes(m._id)));
    setSelectedMessages([]);
  };

  const displayAdmin = admin ? {
    _id: admin._id,
    firstName: admin.email?.split('@')[0] || 'Admin',
    email: admin.email,
    role: 'admin',
    lastMessage: conversations.find(c => c._id === admin._id)?.lastMessage || '',
    timestamp: conversations.find(c => c._id === admin._id)?.timestamp,
    unread: conversations.find(c => c._id === admin._id)?.unread || 0
  } : null;

  return (
    <>
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-6">
        <h1 className={`text-2xl md:text-3xl font-bold ${textPrimary} mb-2`}>Messages</h1>
        <p className={textSecondary}>{admin ? 'Chat with Admin' : 'Loading...'}</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-1">
          <div className={`${bgCard} border ${borderColor} rounded-2xl overflow-hidden`}>
            <div className={`p-4 border-b ${borderColor}`}>
              <h3 className={`font-semibold ${textPrimary}`}>Contacts</h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                    <FiRefreshCw className={`w-6 h-6 mx-auto ${textSecondary}`} />
                  </motion.div>
                </div>
              ) : displayAdmin ? (
                <button 
                  key={displayAdmin._id} 
                  onClick={() => setSelectedChat(displayAdmin)} 
                  className={`w-full flex items-center gap-3 p-4 transition ${selectedChat?._id === displayAdmin._id ? (darkMode ? 'bg-indigo-500/20' : 'bg-indigo-50') : 'hover:bg-slate-700/30'}`}
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">A</span>
                    </div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between">
                      <p className={`font-medium ${textPrimary}`}>Admin</p>
                      <span className="text-xs text-slate-500">
                        {displayAdmin.timestamp ? new Date(displayAdmin.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                    <p className={`text-sm truncate ${displayAdmin.unread > 0 ? textPrimary : textSecondary}`}>
                      {displayAdmin.lastMessage || 'Start a conversation'}
                    </p>
                  </div>
                  {displayAdmin.unread > 0 && <div className="w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center text-xs text-white">{displayAdmin.unread}</div>}
                </button>
              ) : (
                <div className="p-4 text-center">
                  <p className={textSecondary}>No admin available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className={`${bgCard} border ${borderColor} rounded-2xl h-[500px] flex flex-col relative`}>
            {selectedChat ? (
              <>
                <div className={`p-4 border-b ${borderColor} flex items-center justify-between relative z-10`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white text-sm">A</span>
                    </div>
                    <div>
                      <h3 className={`font-semibold ${textPrimary}`}>Admin</h3>
                      <p className="text-xs text-emerald-400">Online</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      type="button"
                      onClick={() => { console.log('Voice call clicked'); alert('Voice call feature coming soon!'); }}
                      style={{ padding: '8px', borderRadius: '8px', cursor: 'pointer', backgroundColor: 'transparent' }} 
                      title="Voice Call"
                    >
                      <FiPhone style={{ width: '20px', height: '20px', color: '#6366f1' }} />
                    </button>
                    <button 
                      type="button"
                      onClick={() => { console.log('Video call clicked'); alert('Video call feature coming soon!'); }}
                      style={{ padding: '8px', borderRadius: '8px', cursor: 'pointer', backgroundColor: 'transparent' }} 
                      title="Video Call"
                    >
                      <FiVideo style={{ width: '20px', height: '20px', color: '#6366f1' }} />
                    </button>
                    <button 
                      type="button"
                      onClick={() => { console.log('Options clicked'); alert('Options: Search, Mute, Clear chat'); }}
                      style={{ padding: '8px', borderRadius: '8px', cursor: 'pointer', backgroundColor: 'transparent' }} 
                      title="More Options"
                    >
                      <FiMoreVertical style={{ width: '20px', height: '20px', color: '#6366f1' }} />
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {selectedMessages.length > 0 && (
                    <div style={{ padding: '8px 16px', marginBottom: '8px', backgroundColor: darkMode ? '#334155' : '#e2e8f0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ color: darkMode ? '#f1f5f9' : '#1e293b', fontWeight: 500 }}>{selectedMessages.length} selected</span>
                      <button onClick={deleteSelectedMessages} style={{ padding: '4px 12px', borderRadius: '6px', cursor: 'pointer', backgroundColor: '#ef4444', color: 'white', border: 'none', fontSize: '12px' }}>Delete All</button>
                    </div>
                  )}
                  {messages.map((msg, index) => {
                    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                    const isOwn = msg.senderId?.toString() === (currentUser._id || currentUser.id)?.toString();
                    const isEditing = editingMessageId === msg._id;
                    const isSelected = selectedMessages.includes(msg._id);
                    return (
                      <div key={msg._id || index} className={`flex ${isOwn ? 'justify-start' : 'justify-end'}`}>
                        <div 
                          onContextMenu={(e) => handleContextMenu(e, msg)}
                          style={{ 
                            position: 'relative', 
                            maxWidth: '75%', 
                            padding: isSelected ? '12px' : '12px 16px', 
                            borderRadius: '16px', 
                            backgroundColor: isSelected ? (darkMode ? '#4338ca' : '#c7d2fe') : (isOwn ? '#6366f1' : (darkMode ? '#334155' : 'white')), 
                            color: isSelected ? 'white' : (isOwn ? 'white' : (darkMode ? '#f1f5f9' : '#1e293b')),
                            border: isSelected ? '2px solid #818cf8' : (isOwn ? 'none' : `1px solid ${borderColor}`),
                            cursor: 'pointer'
                          }}
                        >
                          <div style={{ position: 'absolute', top: '50%', left: isOwn ? '-24px' : 'auto', right: isOwn ? 'auto' : '-24px', transform: 'translateY(-50%)' }}>
                            <input 
                              type="checkbox" 
                              checked={isSelected}
                              onChange={() => toggleSelectMessage(msg._id)}
                              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                            />
                          </div>
                          {isEditing ? (
                            <div>
                              <input 
                                type="text" 
                                value={editText} 
                                onChange={(e) => setEditText(e.target.value)}
                                style={{ 
                                  width: '100%', 
                                  padding: '4px 8px', 
                                  borderRadius: '6px', 
                                  border: 'none', 
                                  backgroundColor: darkMode ? '#1e293b' : '#f1f5f9',
                                  color: 'inherit',
                                  fontSize: '14px'
                                }}
                                autoFocus
                              />
                              <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
                                <button onClick={() => saveEdit(msg._id)} style={{ padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', backgroundColor: '#22c55e', color: 'white', border: 'none', fontSize: '11px' }}>Save</button>
                                <button onClick={cancelEdit} style={{ padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', backgroundColor: '#64748b', color: 'white', border: 'none', fontSize: '11px' }}>Cancel</button>
                              </div>
                            </div>
                          ) : (
                            <p style={{ margin: 0 }}>{msg.content}</p>
                          )}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', marginTop: '4px', opacity: 0.7 }}>
                            <span style={{ fontSize: '11px' }}>{new Date(msg.createdAt || msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            {isOwn && <FiCheck style={{ width: '12px', height: '12px' }} />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
                <form onSubmit={handleSendMessage} style={{ padding: '16px', borderTop: `1px solid ${borderColor}`, position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button 
                      type="button"
                      onClick={() => { console.log('Emoji clicked'); setShowEmojiPicker(!showEmojiPicker); }}
                      style={{ padding: '8px', borderRadius: '8px', cursor: 'pointer', backgroundColor: 'transparent' }}
                      title="Emoji"
                    >
                      <FiSmile style={{ width: '20px', height: '20px', color: '#6366f1' }} />
                    </button>
                    <button 
                      type="button"
                      onClick={() => { console.log('File clicked'); fileInputRef.current?.click(); }}
                      style={{ padding: '8px', borderRadius: '8px', cursor: 'pointer', backgroundColor: 'transparent' }}
                      title="Attach File"
                    >
                      <FiPaperclip style={{ width: '20px', height: '20px', color: '#6366f1' }} />
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                      id="file-input"
                    />
                    <input 
                      type="text" 
                      value={newMessage} 
                      onChange={(e) => setNewMessage(e.target.value)} 
                      placeholder="Type a message..." 
                      style={{ flex: 1, padding: '12px 16px', borderRadius: '9999px', outline: 'none', backgroundColor: darkMode ? '#334155' : '#f1f5f9', color: darkMode ? 'white' : '#0f172a', border: 'none' }}
                    />
                    <button 
                      type="submit" 
                      disabled={!newMessage.trim() || sending}
                      style={{ padding: '12px', borderRadius: '9999px', backgroundColor: '#6366f1', color: 'white', cursor: newMessage.trim() && !sending ? 'pointer' : 'not-allowed', opacity: newMessage.trim() && !sending ? 1 : 0.5 }}
                    >
                      <FiSend style={{ width: '20px', height: '20px' }} />
                    </button>
                  </div>
                  {showEmojiPicker && (
                    <div style={{ position: 'absolute', bottom: '64px', left: '16px', padding: '12px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', zIndex: 50, backgroundColor: darkMode ? '#334155' : 'white', border: darkMode ? 'none' : '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {emojis.map((emoji, i) => (
                          <button 
                            key={i}
                            type="button"
                            onClick={() => addEmoji(emoji)}
                            style={{ padding: '8px', fontSize: '20px', borderRadius: '8px', cursor: 'pointer', backgroundColor: 'transparent', border: 'none' }}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <FiMessageSquare className={`w-16 h-16 ${textSecondary} mx-auto mb-4`} />
                  <p className={`text-lg font-medium ${textPrimary}`}>Select a conversation</p>
                  <p className={textSecondary}>Choose a chat to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {contextMenu && (
        <div 
          style={{ 
            position: 'fixed', 
            top: contextMenu.y, 
            left: contextMenu.x, 
            zIndex: 1000,
            backgroundColor: darkMode ? '#1e293b' : 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            border: darkMode ? 'none' : '1px solid #e2e8f0',
            minWidth: '150px',
            overflow: 'hidden'
          }}
        >
          <button onClick={() => startEditing(contextMenu.msg)} style={{ width: '100%', padding: '10px 16px', textAlign: 'left', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: darkMode ? '#f1f5f9' : '#1e293b', fontSize: '13px' }}>Edit</button>
          <button onClick={() => copyMessage(contextMenu.msg.content)} style={{ width: '100%', padding: '10px 16px', textAlign: 'left', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: darkMode ? '#f1f5f9' : '#1e293b', fontSize: '13px' }}>Copy</button>
          <button onClick={() => replyToMessage(contextMenu.msg)} style={{ width: '100%', padding: '10px 16px', textAlign: 'left', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: darkMode ? '#f1f5f9' : '#1e293b', fontSize: '13px' }}>Reply</button>
          <button onClick={() => toggleSelectMessage(contextMenu.msg._id)} style={{ width: '100%', padding: '10px 16px', textAlign: 'left', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: darkMode ? '#f1f5f9' : '#1e293b', fontSize: '13px' }}>Select</button>
          <button onClick={() => deleteMessage(contextMenu.msg._id)} style={{ width: '100%', padding: '10px 16px', textAlign: 'left', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '13px' }}>Delete</button>
        </div>
      )}
    </>
  );
};

const SettingsTab = ({ darkMode }) => {
  const [activeSettingsTab, setActiveSettingsTab] = useState('account');
  const textPrimary = darkMode ? 'text-slate-100' : 'text-slate-900';
  const textSecondary = darkMode ? 'text-slate-400' : 'text-slate-600';
  const bgCard = darkMode ? 'bg-slate-800' : 'bg-white';
  const borderColor = darkMode ? 'border-slate-700' : 'border-slate-200';
  const { user } = useAuth();

  const settingsTabs = [
    { id: 'account', label: 'Account', icon: FiUser },
    { id: 'security', label: 'Security', icon: FiShield },
    { id: 'notifications', label: 'Notifications', icon: FiBell },
    { id: 'preferences', label: 'Preferences', icon: FiSettings },
  ];

  return (
    <>
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-6">
        <h1 className={`text-2xl md:text-3xl font-bold ${textPrimary} mb-2`}>Settings</h1>
        <p className={textSecondary}>Manage your account preferences</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="lg:col-span-1">
          <div className={`${bgCard} border ${borderColor} rounded-2xl p-2`}>
            {settingsTabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveSettingsTab(tab.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeSettingsTab === tab.id ? 'bg-indigo-500/20 text-indigo-400' : `${textSecondary} hover:bg-slate-700/30`}`}>
                <tab.icon className="w-5 h-5" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3">
          {activeSettingsTab === 'account' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`${bgCard} border ${borderColor} rounded-2xl p-6`}>
              <h3 className={`text-lg font-semibold ${textPrimary} mb-4`}>Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm ${textSecondary} mb-2`}>First Name</label>
                  <input type="text" defaultValue={user?.email?.split('@')[0]?.charAt(0).toUpperCase()} className={`w-full px-4 py-3 ${darkMode ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-900'} rounded-xl outline-none focus:border-indigo-500`} />
                </div>
                <div>
                  <label className={`block text-sm ${textSecondary} mb-2`}>Last Name</label>
                  <input type="text" defaultValue="" className={`w-full px-4 py-3 ${darkMode ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-900'} rounded-xl outline-none focus:border-indigo-500`} />
                </div>
                <div>
                  <label className={`block text-sm ${textSecondary} mb-2`}>Email</label>
                  <input type="email" defaultValue={user?.email} className={`w-full px-4 py-3 ${darkMode ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-900'} rounded-xl outline-none focus:border-indigo-500`} />
                </div>
                <div>
                  <label className={`block text-sm ${textSecondary} mb-2`}>Phone</label>
                  <input type="tel" defaultValue="" placeholder="+1 (555) 000-0000" className={`w-full px-4 py-3 ${darkMode ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-900'} rounded-xl outline-none focus:border-indigo-500`} />
                </div>
              </div>
              <button className="mt-6 px-6 py-3 bg-indigo-500 text-white rounded-xl font-medium hover:bg-indigo-600 transition-colors">Save Changes</button>
            </motion.div>
          )}

          {activeSettingsTab === 'security' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`${bgCard} border ${borderColor} rounded-2xl p-6`}>
              <h3 className={`text-lg font-semibold ${textPrimary} mb-4`}>Change Password</h3>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm ${textSecondary} mb-2`}>Current Password</label>
                  <input type="password" placeholder="Enter current password" className={`w-full px-4 py-3 ${darkMode ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-900'} rounded-xl outline-none focus:border-indigo-500`} />
                </div>
                <div>
                  <label className={`block text-sm ${textSecondary} mb-2`}>New Password</label>
                  <input type="password" placeholder="Enter new password" className={`w-full px-4 py-3 ${darkMode ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-900'} rounded-xl outline-none focus:border-indigo-500`} />
                </div>
                <div>
                  <label className={`block text-sm ${textSecondary} mb-2`}>Confirm New Password</label>
                  <input type="password" placeholder="Confirm new password" className={`w-full px-4 py-3 ${darkMode ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-900'} rounded-xl outline-none focus:border-indigo-500`} />
                </div>
              </div>
              <button className="mt-6 px-6 py-3 bg-indigo-500 text-white rounded-xl font-medium hover:bg-indigo-600 transition-colors">Update Password</button>
            </motion.div>
          )}

          {activeSettingsTab === 'notifications' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`${bgCard} border ${borderColor} rounded-2xl p-6`}>
              <h3 className={`text-lg font-semibold ${textPrimary} mb-4`}>Email Notifications</h3>
              <div className="space-y-4">
                {[{ label: 'New job matches', desc: 'Get notified when new jobs match your preferences' }, { label: 'Application updates', desc: 'Get notified about application status changes' }, { label: 'Interview requests', desc: 'Get notified when recruiters want to interview' }].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl">
                    <div>
                      <p className={`font-medium ${textPrimary}`}>{item.label}</p>
                      <p className="text-sm text-slate-500">{item.desc}</p>
                    </div>
                    <button className="w-12 h-7 rounded-full bg-indigo-500 relative"><motion.div className="w-5 h-5 rounded-full bg-white shadow-lg absolute right-1 top-1" /></button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeSettingsTab === 'preferences' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`${bgCard} border ${borderColor} rounded-2xl p-6`}>
              <h3 className={`text-lg font-semibold ${textPrimary} mb-4`}>Appearance</h3>
              <div className="flex items-center gap-4">
                <button className={`flex-1 p-4 rounded-xl ${!darkMode ? 'bg-indigo-500/20 border-2 border-indigo-500' : 'bg-slate-700/30 border-2 border-transparent'}`}>
                  <FiSun className={`w-6 h-6 mx-auto mb-2 ${textPrimary}`} />
                  <p className={`text-center font-medium ${textPrimary}`}>Light</p>
                </button>
                <button className={`flex-1 p-4 rounded-xl ${darkMode ? 'bg-indigo-500/20 border-2 border-indigo-500' : 'bg-slate-700/30 border-2 border-transparent'}`}>
                  <FiMoon className={`w-6 h-6 mx-auto mb-2 ${textPrimary}`} />
                  <p className={`text-center font-medium ${textPrimary}`}>Dark</p>
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};