import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
  FiHome, FiBriefcase, FiUsers, FiMessageSquare, FiBarChart2, FiSettings, FiSearch, FiBell, FiSun, FiMoon,
  FiPlus, FiFilter, FiMoreVertical, FiClock, FiStar, FiDownload, FiUpload,
  FiSend, FiPaperclip, FiPhone, FiVideo, FiCalendar, FiMapPin, FiDollarSign, FiAward, FiTrendingUp,
  FiChevronLeft, FiChevronRight, FiChevronDown, FiArrowUp, FiArrowDown, FiLogOut, FiUser, FiEdit, FiShield, FiMenu,
  FiX, FiFilter as FiFilterIcon, FiRefreshCw, FiBookmark
} from 'react-icons/fi';
import { jobsApi, applicationsApi, chatApi, usersApi, notificationsApi } from '../services/api';

const RecruiterDashboard = () => {
  const { user, logout: authLogout } = useAuth();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({ activeJobs: 0, totalApplicants: 0, hiresThisMonth: 0, responseRate: '0%' });

  const textPrimary = darkMode ? 'text-slate-100' : 'text-slate-900';
  const textSecondary = darkMode ? 'text-slate-400' : 'text-slate-600';
  const textMuted = darkMode ? 'text-slate-500' : 'text-slate-400';
  const bgMain = darkMode ? 'bg-[#0F172A]' : 'bg-slate-50';
  const bgCard = darkMode ? 'bg-slate-800' : 'bg-white';
  const bgSidebar = darkMode ? 'bg-slate-900' : 'bg-white';
  const borderColor = darkMode ? 'border-slate-700' : 'border-slate-200';
  const borderSubtle = darkMode ? 'border-slate-800' : 'border-slate-100';
  
  const glassEffect = darkMode ? 'backdrop-blur-xl bg-slate-800/95 border border-slate-700' : 'backdrop-blur-xl bg-white/95 border border-slate-200';

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
    fetchDashboardData();
    fetchNotifications();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [jobsRes, appsRes, convRes] = await Promise.all([
        jobsApi.getAll({ limit: 20, myJobs: 'true' }),
        applicationsApi.myApplications(),
        chatApi.getConversations()
      ]);
      
      console.log('=== Recruiter Dashboard Data ===');
      console.log('Jobs:', jobsRes.data);
      console.log('Applications:', appsRes.data);
      console.log('Conversations:', convRes.data);
      
      const jobsData = jobsRes.data?.jobs || [];
      const appsData = Array.isArray(appsRes.data) ? appsRes.data : [];
      const convData = convRes.data ? (Array.isArray(convRes.data) ? convRes.data : Object.values(convRes.data)) : [];
      
      setJobs(jobsData);
      setCandidates(appsData);
      setMessages(convData);
      setStats({
        activeJobs: jobsData.filter(j => j.status === 'active').length,
        totalApplicants: appsData.length,
        hiresThisMonth: appsData.filter(a => a.status === 'accepted' && new Date(a.updatedAt).getMonth() === new Date().getMonth()).length,
        responseRate: appsData.length > 0 ? `${Math.round((appsData.filter(a => a.status !== 'pending').length / appsData.length) * 100)}%` : '0%'
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await notificationsApi.getAll();
      const data = Array.isArray(res.data) ? res.data : (res.data.notifications || []);
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleRefresh = () => {
    fetchDashboardData();
    fetchNotifications();
  };

  const kpiCards = [
    { label: 'Active Jobs', value: stats.activeJobs || 0, change: '+3', trend: 'up', icon: FiBriefcase, color: 'from-blue-500 to-cyan-400' },
    { label: 'Total Applicants', value: stats.totalApplicants || 0, change: '+18%', trend: 'up', icon: FiUsers, color: 'from-purple-500 to-pink-400' },
    { label: 'Hires This Month', value: stats.hiresThisMonth || 0, change: '+2', trend: 'up', icon: FiAward, color: 'from-emerald-500 to-teal-400' },
    { label: 'Response Rate', value: stats.responseRate || '0%', change: '+5%', trend: 'up', icon: FiTrendingUp, color: 'from-amber-500 to-orange-400' },
  ];

  const jobsData = jobs.length > 0 ? jobs : [
    { _id: 1, title: 'Senior Frontend Developer', applicants: 45, status: 'active', createdAt: '2 days ago', salary: '$120K - $150K' },
    { _id: 2, title: 'Product Designer', applicants: 32, status: 'active', createdAt: '3 days ago', salary: '$90K - $120K' },
    { _id: 3, title: 'Backend Engineer', applicants: 28, status: 'active', createdAt: '5 days ago', salary: '$130K - $160K' },
    { _id: 4, title: 'DevOps Engineer', applicants: 15, status: 'paused', createdAt: '1 week ago', salary: '$110K - $140K' },
  ];

  const candidatesData = candidates.length > 0 ? candidates.map(app => ({
    _id: app._id,
    name: app.employeeId?.firstName || app.firstName || 'Candidate',
    role: app.jobId?.title || 'Position',
    status: app.status,
    rating: 4.5,
    avatar: (app.employeeId?.firstName || 'C')[0] + (app.employeeId?.lastName || '')[0] || 'C',
    experience: 'N/A',
    location: app.city || 'N/A',
    skills: []
  })) : [
    { _id: 1, name: 'Sarah Chen', role: 'Frontend Developer', status: 'interview', rating: 4.8, avatar: 'SC', experience: '5 years', location: 'San Francisco, CA', skills: ['React', 'TypeScript'] },
    { _id: 2, name: 'Marcus Johnson', role: 'Product Designer', status: 'screening', rating: 4.5, avatar: 'MJ', experience: '7 years', location: 'New York, NY', skills: ['Figma'] },
    { _id: 3, name: 'Emily Davis', role: 'Backend Developer', status: 'applied', rating: 4.2, avatar: 'ED', experience: '4 years', location: 'Austin, TX', skills: ['Python'] },
    { _id: 4, name: 'James Wilson', role: 'DevOps Engineer', status: 'hired', rating: 4.9, avatar: 'JW', experience: '6 years', location: 'Seattle, WA', skills: ['AWS'] },
  ];

  const messagesData = messages.length > 0 ? messages.map((m, i) => ({
    _id: m._id || i,
    name: m.user?.firstName || m.email || 'User',
    lastMessage: m.lastMessage || m.message || 'No messages',
    time: m.timestamp ? new Date(m.timestamp).toLocaleTimeString() : 'N/A',
    unread: m.unread > 0,
    avatar: (m.user?.firstName || 'U')[0]
  })) : [
    { _id: 1, name: 'Sarah Chen', lastMessage: 'Thank you for the opportunity!', time: '2 min ago', unread: true, avatar: 'SC' },
    { _id: 2, name: 'Marcus Johnson', lastMessage: 'When is the next interview?', time: '1 hour ago', unread: true, avatar: 'MJ' },
    { _id: 3, name: 'Emily Davis', lastMessage: 'I have attached my updated resume.', time: '3 hours ago', unread: false, avatar: 'ED' },
  ];

  const applicationsData = [
    { stage: 'Applied', count: candidates.filter(c => c.status === 'applied').length || 128, color: 'from-blue-400 to-blue-600' },
    { stage: 'Screening', count: candidates.filter(c => c.status === 'screening').length || 45, color: 'from-purple-400 to-purple-600' },
    { stage: 'Interview', count: candidates.filter(c => c.status === 'interview').length || 18, color: 'from-amber-400 to-amber-600' },
    { stage: 'Offer', count: candidates.filter(c => c.status === 'offer').length || 6, color: 'from-emerald-400 to-emerald-600' },
    { stage: 'Hired', count: candidates.filter(c => c.status === 'accepted').length || 8, color: 'from-cyan-400 to-cyan-600' },
  ];

  const orb1X = useTransform(mouseX, [-20, 20], [-15, 15]);
  const orb1Y = useTransform(mouseY, [-20, 20], [-15, 15]);
  const orb2X = useTransform(mouseX, [-20, 20], [20, -20]);
  const orb2Y = useTransform(mouseY, [-20, 20], [12, -12]);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: FiHome },
    { id: 'jobs', label: 'Jobs', icon: FiBriefcase },
    { id: 'candidates', label: 'Candidates', icon: FiUsers },
    { id: 'messages', label: 'Messages', icon: FiMessageSquare },
    { id: 'analytics', label: 'Analytics', icon: FiBarChart2 },
    { id: 'settings', label: 'Settings', icon: FiSettings },
  ];

  const sidebarWidth = sidebarCollapsed ? 'w-20' : 'w-64';

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

  const GridPattern = () => (
    <div className="fixed inset-0 pointer-events-none -z-10 opacity-30">
      <div className="absolute inset-0" style={{
        backgroundImage: `linear-gradient(rgba(99, 102, 241, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.3) 1px, transparent 1px)`,
        backgroundSize: '60px 60px'
      }} />
    </div>
  );

  const StatCard = ({ title, value, change, trend, icon: Icon, color, delay }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.1, type: 'spring', damping: 20 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className={`group relative p-5 lg:p-6 rounded-2xl cursor-pointer transition-all duration-500 overflow-hidden ${
        darkMode 
          ? 'bg-gradient-to-br from-slate-800/80 via-slate-800/60 to-slate-900/80 border-slate-700/50 hover:border-slate-600/50 shadow-xl shadow-black/20' 
          : 'bg-gradient-to-br from-white via-white to-slate-50 border-slate-200/50 hover:border-slate-300/50 shadow-lg'
      } backdrop-blur-xl`}
    >
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${color.replace('to-', '/20 via-').replace(' ', '')}/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      
      <motion.div
        className="absolute top-0 right-0 w-24 h-24 rounded-full blur-[40px]"
        style={{ background: color.split(' ')[1]?.replace('to-', '') || 'indigo', opacity: 0.15 }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: delay * 0.3
        }}
      />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <motion.div whileHover={{ rotate: 5, scale: 1.1 }} className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </motion.div>
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: delay * 0.1 + 0.2 }}
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              trend === 'up' 
                ? darkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600'
                : darkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600'
            }`}
          >
            {trend === 'up' ? <FiArrowUp className="w-3 h-3" /> : <FiArrowDown className="w-3 h-3" />}
            {change}
          </motion.div>
        </div>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay * 0.1 + 0.1 }}
        >
          <div className={`text-3xl lg:text-4xl font-bold bg-gradient-to-r ${color} bg-clip-text text-transparent mb-1`}>
            {value}
          </div>
          <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{title}</div>
        </motion.div>
      </div>
    </motion.div>
  );

  const JobCard = ({ job }) => (
    <motion.div 
      whileHover={{ scale: 1.01 }}
      className={`p-5 rounded-xl ${darkMode ? 'bg-slate-800/40' : 'bg-white'} ${darkMode ? 'border-slate-700/30' : 'border-slate-200'} border hover:border-indigo-500/30 transition-all`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className={`font-semibold ${textPrimary}`}>{job.title}</h3>
          <p className={`text-sm ${textSecondary}`}>{job.posted}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          job.status === 'active' 
            ? darkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
            : darkMode ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700'
        }`}>
          {job.status}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-1 text-sm ${textMuted}`}>
            <FiUsers className="w-4 h-4" />
            <span>{job.applicants} applicants</span>
          </div>
          <div className={`flex items-center gap-1 text-sm ${textMuted}`}>
            <FiDollarSign className="w-4 h-4" />
            <span>{job.salary}</span>
          </div>
        </div>
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className={`p-2 rounded-lg ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'} transition`}>
          <FiMoreVertical className={`w-5 h-5 ${textSecondary}`} />
        </motion.button>
      </div>
    </motion.div>
  );

  const CandidateCard = ({ candidate }) => (
    <motion.div 
      whileHover={{ scale: 1.02, rotate: 0.5 }}
      className={`p-4 rounded-xl ${darkMode ? 'bg-slate-800/40' : 'bg-white'} ${darkMode ? 'border-slate-700/30' : 'border-slate-200'} border cursor-pointer hover:border-indigo-500/30 transition-all`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${
          candidate.status === 'hired' ? 'from-emerald-500 to-teal-500' :
          candidate.status === 'interview' ? 'from-amber-500 to-orange-500' :
          candidate.status === 'screening' ? 'from-purple-500 to-pink-500' :
          'from-blue-500 to-cyan-500'
        } flex items-center justify-center text-white font-bold`}>
          {candidate.avatar}
        </div>
        <div className="flex-1">
          <h4 className={`font-semibold ${textPrimary}`}>{candidate.name}</h4>
          <p className={`text-sm ${textSecondary}`}>{candidate.role}</p>
        </div>
        <div className="flex items-center gap-1 text-amber-400">
          <FiStar className="w-4 h-4 fill-current" />
          <span className="text-sm font-medium">{candidate.rating}</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mb-3">
        {candidate.skills.slice(0, 3).map(skill => (
          <span key={skill} className={`px-2 py-1 rounded-lg text-xs ${
            darkMode ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-100 text-indigo-700'
          }`}>
            {skill}
          </span>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className={`flex items-center gap-2 text-sm ${textMuted}`}>
          <FiMapPin className="w-4 h-4" />
          <span>{candidate.location}</span>
        </div>
        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
          candidate.status === 'hired' ? darkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700' :
          candidate.status === 'interview' ? darkMode ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700' :
          candidate.status === 'screening' ? darkMode ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-700' :
          darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'
        }`}>
          {candidate.status}
        </span>
      </div>
    </motion.div>
  );

  const PipelineStage = ({ stage, count, color }) => (
    <div className="flex-1 min-w-[180px]">
      <div className={`p-3 rounded-t-xl bg-gradient-to-r ${color}`}>
        <div className="flex items-center justify-between">
          <span className="text-white font-semibold text-sm">{stage}</span>
          <span className="text-white/80 text-sm">{count}</span>
        </div>
      </div>
      <div className={`p-3 rounded-b-xl ${darkMode ? 'bg-slate-800/30' : 'bg-slate-50'} ${darkMode ? 'border-slate-700/30' : 'border-slate-200'} border border-t-0`}>
        <div className="h-24 rounded-lg bg-slate-500/10 flex items-center justify-center">
          <span className={`text-sm ${textMuted}`}>Drag here</span>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="mb-6">
              <h2 className={`text-2xl font-bold ${textPrimary}`}>Dashboard</h2>
              <p className={`${textSecondary} mt-1`}>Welcome back! Here's your recruitment overview.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
              {kpiCards.map((kpi, i) => (
                <StatCard key={kpi.label} {...kpi} delay={i} />
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className={`p-6 rounded-2xl ${bgCard} backdrop-blur-xl ${borderColor} border`}>
                  <h3 className={`text-lg font-bold ${textPrimary} mb-4`}>Hiring Pipeline</h3>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {applicationsData.map(app => (
                      <PipelineStage key={app.stage} {...app} />
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <div className={`p-6 rounded-2xl ${bgCard} backdrop-blur-xl ${borderColor} border`}>
                  <h3 className={`text-lg font-bold ${textPrimary} mb-4`}>Recent Messages</h3>
                  <div className="space-y-3">
                    {messagesData.map(msg => (
                      <motion.div 
                        key={msg._id || msg.id}
                        whileHover={{ scale: 1.02 }}
                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer ${darkMode ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'}`}
                      >
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm`}>
                          {msg.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className={`font-medium ${textPrimary}`}>{msg.name}</h4>
                            <span className={`text-xs ${textMuted}`}>{msg.time}</span>
                          </div>
                          <p className={`text-sm truncate ${textSecondary}`}>{msg.lastMessage}</p>
                        </div>
                        {msg.unread && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <div className={`p-6 rounded-2xl ${bgCard} backdrop-blur-xl ${borderColor} border`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-lg font-bold ${textPrimary}`}>Active Jobs</h3>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl text-sm font-medium shadow-lg shadow-indigo-500/25">
                      <FiPlus className="w-4 h-4" />Post Job
                    </motion.button>
                  </div>
<div className="space-y-3">
                     {jobsData.map(job => <JobCard key={job._id || job.id} job={job} />)}
                   </div>
                 </div>
               </div>
               <div>
                 <div className={`p-6 rounded-2xl ${bgCard} backdrop-blur-xl ${borderColor} border`}>
                   <div className="flex items-center justify-between mb-4">
                     <h3 className={`text-lg font-bold ${textPrimary}`}>Top Candidates</h3>
                     <button className={`text-sm ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>View All</button>
                   </div>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                     {candidatesData.slice(0, 4).map(candidate => <CandidateCard key={candidate._id || candidate.id} candidate={candidate} />)}
                   </div>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 'jobs':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className={`p-6 rounded-2xl ${bgCard} backdrop-blur-xl ${borderColor} border`}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className={`text-2xl font-bold ${textPrimary}`}>Job Postings</h2>
                  <p className={`${textSecondary} mt-1`}>Manage your job listings</p>
                </div>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium shadow-lg shadow-indigo-500/25">
                  <FiPlus className="w-5 h-5" />Create Job
                </motion.button>
              </div>
              <div className="space-y-4">
                {jobsData.map(job => <JobCard key={job._id || job.id} job={job} />)}
              </div>
            </div>
          </motion.div>
        );

      case 'candidates':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className={`p-6 rounded-2xl ${bgCard} backdrop-blur-xl ${borderColor} border`}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className={`text-2xl font-bold ${textPrimary}`}>Candidates</h2>
                  <p className={`${textSecondary} mt-1`}>Review and manage applicants</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-slate-100'}`}>
                    <FiSearch className={`w-4 h-4 ${textMuted}`} />
                    <input 
                      type="text" 
                      placeholder="Search candidates..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`bg-transparent outline-none ${textPrimary} placeholder:${textMuted} w-40`}
                    />
                  </div>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className={`p-2 rounded-xl ${darkMode ? 'bg-slate-700/50 hover:bg-slate-600' : 'bg-slate-100 hover:bg-slate-200'}`}>
                    <FiFilterIcon className={`w-5 h-5 ${textSecondary}`} />
                  </motion.button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {candidatesData.map(candidate => <CandidateCard key={candidate._id || candidate.id} candidate={candidate} />)}
              </div>
            </div>
          </motion.div>
        );

      case 'messages':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className={`p-6 rounded-2xl ${bgCard} backdrop-blur-xl ${borderColor} border`}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className={`text-2xl font-bold ${textPrimary}`}>Messages</h2>
                  <p className={`${textSecondary} mt-1`}>Communicate with candidates</p>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1 space-y-2">
                  {messagesData.map(msg => (
                    <motion.div 
                      key={msg._id || msg.id}
                      whileHover={{ scale: 1.02 }}
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer ${darkMode ? 'bg-slate-700/30 hover:bg-slate-700/50' : 'bg-slate-50 hover:bg-slate-100'}`}
                    >
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold`}>
                        {msg.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-medium ${textPrimary}`}>{msg.name}</h4>
                        <p className={`text-sm truncate ${textSecondary}`}>{msg.lastMessage}</p>
                      </div>
                      {msg.unread && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />}
                    </motion.div>
                  ))}
                </div>
                <div className="lg:col-span-3">
                  <div className={`h-[400px] rounded-xl ${darkMode ? 'bg-slate-700/20' : 'bg-slate-50'} flex items-center justify-center`}>
                    <p className={textSecondary}>Select a conversation to start messaging</p>
                  </div>
                  <div className="flex items-center gap-3 mt-4">
                    <input 
                      type="text" 
                      placeholder="Type a message..." 
                      className={`flex-1 px-4 py-3 rounded-xl border ${borderColor} ${
                        darkMode 
                          ? 'bg-slate-700/50 text-slate-100 placeholder:text-slate-500 focus:border-indigo-500' 
                          : 'bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500'
                      } focus:ring-2 focus:ring-indigo-500/20 outline-none transition`}
                    />
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl shadow-lg shadow-indigo-500/25"
                    >
                      <FiSend className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 'analytics':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className={`p-6 rounded-2xl ${bgCard} backdrop-blur-xl ${borderColor} border`}>
              <div className="mb-6">
                <h2 className={`text-2xl font-bold ${textPrimary}`}>Analytics</h2>
                <p className={`${textSecondary} mt-1`}>Track your recruitment performance</p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className={`text-lg font-semibold ${textPrimary} mb-4`}>Hiring Trends</h3>
                  <div className={`h-64 rounded-xl ${darkMode ? 'bg-slate-700/30' : 'bg-slate-100'} flex items-end justify-between px-4 pb-4`}>
                    {statsChart.map((stat, i) => (
                      <div key={stat.name} className="flex flex-col items-center gap-2">
                        <motion.div 
                          initial={{ height: 0 }}
                          animate={{ height: `${stat.hires * 20}px` }}
                          transition={{ delay: i * 0.1 }}
                          className="w-8 bg-gradient-to-t from-indigo-500 to-purple-500 rounded-t-lg"
                        />
                        <span className={`text-xs ${textMuted}`}>{stat.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {kpiCards.map(kpi => (
                    <StatCard key={kpi.label} {...kpi} delay={0} />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 'settings':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className={`p-6 rounded-2xl ${bgCard} backdrop-blur-xl ${borderColor} border`}>
              <div className="mb-6">
                <h2 className={`text-2xl font-bold ${textPrimary}`}>Settings</h2>
                <p className={`${textSecondary} mt-1`}>Manage your preferences</p>
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className={`text-lg font-semibold ${textPrimary} mb-4`}>Appearance</h3>
                  <div className={`flex items-center justify-between p-4 rounded-xl ${darkMode ? 'bg-slate-700/30' : 'bg-slate-100'}`}>
                    <span className={textPrimary}>Dark Mode</span>
                    <motion.button 
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setDarkMode(!darkMode)}
                      className={`w-14 h-8 rounded-full p-1 ${darkMode ? 'bg-indigo-500' : 'bg-slate-300'}`}
                    >
                      <motion.div 
                        animate={{ x: darkMode ? 24 : 0 }}
                        className="w-6 h-6 bg-white rounded-full"
                      />
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

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
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`lg:hidden p-2 rounded-xl ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'} transition`}
            >
              {mobileMenuOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
            </button>

            <motion.div className="flex items-center gap-3">
              <motion.div whileHover={{ rotate: 360, scale: 1.1 }} transition={{ duration: 0.5 }} className={`w-10 h-10 rounded-xl ${darkMode ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : 'bg-gradient-to-br from-indigo-500 to-indigo-600'} flex items-center justify-center`}>
                <FiShield className="w-5 h-5 text-white" />
              </motion.div>
              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className={`text-lg font-bold ${textPrimary} hidden lg:block`}>
                    Nile Recruit
                  </motion.span>
                )}
              </AnimatePresence>
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
              className={`p-2.5 rounded-xl z-[70] ${darkMode ? 'hover:bg-slate-700 text-amber-400' : 'hover:bg-slate-100 text-indigo-600'} transition`}
            >
              {darkMode ? <FiMoon className="w-5 h-5" /> : <FiSun className="w-5 h-5" />}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleRefresh}
              className={`p-2.5 rounded-xl ${darkMode ? 'hover:bg-slate-700 text-cyan-400' : 'hover:bg-slate-100 text-indigo-600'} transition`}
              title="Refresh data"
            >
              <FiRefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </motion.button>

            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowNotifications(!showNotifications)}
              className={`relative p-2.5 rounded-xl z-[70] ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'} transition`}
            >
              <FiBell className={`w-5 h-5 ${textSecondary}`} />
              {notifications.filter(n => !n.read).length > 0 && (
                <motion.span 
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg shadow-red-500/40"
                />
              )}
            </motion.button>

            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowProfile(!showProfile)}
              className={`flex items-center gap-2 p-1.5 pr-3 rounded-xl ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'} transition`}
            >
              <div className={`w-8 h-8 rounded-xl ${darkMode ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : 'bg-gradient-to-br from-indigo-500 to-indigo-600'} flex items-center justify-center`}>
                <span className="text-sm font-semibold text-white">RC</span>
              </div>
              <span className={`text-sm font-medium ${textPrimary} hidden lg:block`}>Recruiter</span>
            </motion.button>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {showProfile && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className={`absolute right-4 top-14 w-56 ${glassEffect} rounded-2xl overflow-hidden z-[60] shadow-2xl`}
          >
            <div className={`p-4 border-b ${borderColor}`}>
              <p className={`font-medium ${textPrimary} truncate`}>{user?.email || 'recruiter@company.com'}</p>
              <p className="text-xs text-slate-500 capitalize">{user?.role || 'Recruiter'}</p>
            </div>
            <div className="p-2">
              <Link to="/profile" onClick={() => setShowProfile(false)} className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-100 text-slate-700'}`}>
                <FiUser className="w-4 h-4" />
                <span className="text-sm">My Profile</span>
              </Link>
              <Link to="/saved-jobs" onClick={() => setShowProfile(false)} className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-100 text-slate-700'}`}>
                <FiBookmark className="w-4 h-4" />
                <span className="text-sm">Saved Jobs</span>
              </Link>
              <button onClick={() => { setActiveTab('settings'); setShowProfile(false); }} className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-100 text-slate-700'}`}>
                <FiSettings className="w-4 h-4" />
                <span className="text-sm">Settings</span>
              </button>
              <button onClick={() => { authLogout(); navigate('/login'); }} className={`w-full flex items-center gap-3 p-2 rounded-lg ${darkMode ? 'hover:bg-red-500/10 text-red-400' : 'hover:bg-red-50 text-red-600'} transition-colors`}>
                <FiLogOut className="w-4 h-4" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showProfile && (
          <div className="fixed inset-0 z-[50]" onClick={() => setShowProfile(false)} />
        )}
      </AnimatePresence>

      <div className="fixed top-16 left-0 right-0 h-px z-40">
        <motion.div 
          className="h-full bg-gradient-to-r from-indigo-500 via-cyan-500 to-purple-500"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
      </div>

      <motion.aside 
        initial={{ x: -100 }}
        animate={{ x: 0 }}
        className={`fixed left-0 top-16 bottom-0 z-30 ${sidebarWidth} ${bgSidebar} border-r ${borderColor} transition-all duration-300 hidden lg:flex flex-col overflow-hidden`}
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
            <motion.div 
              className="absolute right-2 bottom-1/3 w-12 h-12 rounded-full bg-purple-500/15 blur-2xl"
              animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 4, repeat: Infinity, delay: 1 }}
            />
          </div>
        )}
        <div className="flex-1 p-3 overflow-y-auto relative z-10">
          <nav className="space-y-1">
            {tabs.map((tab, index) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setActiveTab(tab.id)}
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
                        {tab.label}
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
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/50 lg:hidden"
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
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <motion.button
                        key={tab.id}
                        onClick={() => { setActiveTab(tab.id); setMobileMenuOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                          isActive
                            ? darkMode ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                            : darkMode ? 'text-slate-400 hover:bg-slate-700/50' : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-sm font-medium">{tab.label}</span>
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
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </div>
      </motion.main>
    </div>
  );
};

export default RecruiterDashboard;