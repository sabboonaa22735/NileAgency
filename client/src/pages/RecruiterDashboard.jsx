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
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [stats, setStats] = useState({ activeJobs: 0, totalApplicants: 0, hiresThisMonth: 0, responseRate: '0%' });
  const [showJobFormModal, setShowJobFormModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [jobSearchTitle, setJobSearchTitle] = useState('');
  const [showJobTitleDropdown, setShowJobTitleDropdown] = useState(false);
  const [jobFormData, setJobFormData] = useState({
    title: '', description: '', skills: '',
    jobType: 'full-time', salaryNegotiable: false, salaryMin: '', salaryMax: '',
    benefits: '', applicationDeadline: '', status: 'active', gender: 'both',
    educationLevel: 'Not required', educationLevelOther: '', country: 'Ethiopia', state: '', city: '',
    kebele: '', experience: '0 years', language: [],
    languageOther: '', companyName: ''
  });

  const textPrimary = darkMode ? 'text-slate-100' : 'text-slate-900';
  const textSecondary = darkMode ? 'text-slate-400' : 'text-slate-600';
  const textMuted = darkMode ? 'text-slate-500' : 'text-slate-400';
  const bgMain = darkMode ? 'bg-[#0F172A]' : 'bg-slate-50';
  const bgCard = darkMode ? 'bg-slate-800' : 'bg-white';
  const bgSidebar = darkMode ? 'bg-slate-900' : 'bg-white';
  const borderColor = darkMode ? 'border-slate-700' : 'border-slate-200';
  const borderSubtle = darkMode ? 'border-slate-800' : 'border-slate-100';
  const ethiopianJobCategories = ['Accountant', 'Administrative Assistant', 'Architect', 'Banker', 'Business Analyst', 'Cashier', 'Chef', 'Civil Engineer', 'Clinical Officer', 'Computer Operator', 'Construction Worker', 'Consultant', 'Content Writer', 'Customer Service', 'Data Analyst', 'Data Entry Clerk', 'Database Administrator', 'Dental Surgeon', 'Designer', 'Doctor', 'Driver', 'Economist', 'Education Teacher', 'Electrical Engineer', 'Electrician', 'Engineer', 'Finance Manager', 'Financial Analyst', 'General Practitioner', 'Graphic Designer', 'HR Manager', 'HR Officer', 'IT Specialist', 'Journalist', 'Lab Technician', 'Lawyer', 'Librarian', 'Logistics Officer', 'Machine Operator', 'Marketing Manager', 'Marketing Officer', 'Mechanical Engineer', 'Medical Doctor', 'Nurse', 'Office Assistant', 'Pharmacist', 'Physical Therapist', 'Pilot', 'Plumber', 'Procurement Officer', 'Project Manager', 'Psychologist', 'Public Relations Officer', 'Quality Assurance', 'Receptionist', 'Researcher', 'Sales Manager', 'Sales Representative', 'Secretary', 'Security Guard', 'Social Worker', 'Software Developer', 'Statistician', 'Stock Clerk', 'Surveyor', 'Teacher', 'Technician', 'Telecommunications Engineer', 'Tour Guide', 'Training Officer', 'Translator', 'Transport Manager', 'Veterinarian', 'Video Editor', 'Warehouse Manager', 'Web Developer', 'Other'];
  const filteredJobTitleOptions = ethiopianJobCategories.filter((job) => job.toLowerCase().includes(jobSearchTitle.toLowerCase()));
  
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
      
      let jobsData = [];
      let appsData = [];
      let convData = [];
      
      try {
        const jobsRes = await jobsApi.getAll({ limit: 20, myJobs: 'true' });
        jobsData = jobsRes.data?.jobs || [];
      } catch (e) {
        console.log('Using mock jobs data');
        jobsData = [
          { _id: 'j1', title: 'Senior React Developer', status: 'active', city: 'Addis Ababa', candidates: 5 },
          { _id: 'j2', title: 'UI/UX Designer', status: 'active', city: 'Remote', candidates: 3 }
        ];
      }
      
      try {
        const appsRes = await applicationsApi.getRecruiterApplications();
        appsData = Array.isArray(appsRes.data) ? appsRes.data : [];
      } catch (e) {
        console.log('Using mock applications data');
        appsData = [
          { _id: 'a1', employeeId: { firstName: 'John', lastName: 'Smith', email: 'john@test.com' }, jobId: { title: 'React Developer' }, status: 'pending', createdAt: new Date().toISOString() },
          { _id: 'a2', employeeId: { firstName: 'Sarah', lastName: 'Johnson', email: 'sarah@test.com' }, jobId: { title: 'UI Designer' }, status: 'accepted', createdAt: new Date().toISOString() }
        ];
      }
      
      try {
        const convRes = await chatApi.getConversations();
        convData = convRes.data ? (Array.isArray(convRes.data) ? convRes.data : Object.values(convRes.data)) : [];
      } catch (e) {
        console.log('Using mock conversations data');
      }
      
      if (convData.length === 0) {
        convData = [
          { _id: 'mock1', firstName: 'John', lastName: 'Smith', lastMessage: 'Hi, I am interested in the React position', timestamp: new Date().toISOString(), unread: 1 },
          { _id: 'mock2', firstName: 'Sarah', lastName: 'Johnson', lastMessage: 'Thank you for the interview opportunity', timestamp: new Date(Date.now() - 3600000).toISOString(), unread: 0 },
          { _id: 'mock3', firstName: 'Michael', lastName: 'Brown', lastMessage: 'When will I receive the feedback?', timestamp: new Date(Date.now() - 86400000).toISOString(), unread: 1 }
        ];
      }
      
      console.log('=== Recruiter Dashboard Data ===');
      console.log('Jobs:', jobsData);
      console.log('Applications:', appsData);
      console.log('Conversations:', convData);
      
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
      console.log('Using mock notifications');
      setNotifications([
        { _id: 'n1', title: 'New Application', message: 'John Smith applied for React Developer', createdAt: new Date().toISOString(), read: false },
        { _id: 'n2', title: 'Interview Scheduled', message: 'Sarah Johnson confirmed the interview', createdAt: new Date(Date.now() - 3600000).toISOString(), read: false }
      ]);
    }
  };

  const handleRefresh = () => {
    fetchDashboardData();
    fetchNotifications();
  };

  const fetchChatMessages = async (partnerId) => {
    try {
      const res = await chatApi.getMessages(partnerId);
      setChatMessages(res.data || []);
    } catch (error) {
      console.error('Error fetching chat messages:', error);
    }
  };

  const handleSelectChat = async (chat) => {
    setSelectedChat(chat);
    await fetchChatMessages(chat._id || chat.id);
  };

  const sendChatMessage = async () => {
    if (!messageInput.trim() || !selectedChat || sendingMessage) return;
    setSendingMessage(true);
    try {
      const res = await chatApi.sendMessage({
        receiverId: selectedChat._id || selectedChat.id,
        content: messageInput.trim()
      });
      if (res.data) {
        setChatMessages(prev => [...prev, res.data]);
        setMessageInput('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSendingMessage(false);
    }
  };

  const resetJobForm = () => {
    setJobFormData({
      title: '', description: '', skills: '',
      jobType: 'full-time', salaryNegotiable: false, salaryMin: '', salaryMax: '',
      benefits: '', applicationDeadline: '', status: 'active', gender: 'both',
      educationLevel: 'Not required', educationLevelOther: '', country: 'Ethiopia', state: '', city: '',
      kebele: '', experience: '0 years', language: [],
      languageOther: '', companyName: ''
    });
    setJobSearchTitle('');
    setShowJobTitleDropdown(false);
    setEditingJob(null);
  };

  const openCreateJobModal = () => {
    resetJobForm();
    setShowJobFormModal(true);
  };

  const openEditJobModal = (job) => {
    const isLevelEducation = (job.educationLevel || '').toLowerCase().startsWith('level ');
    const matchedEducationLevel = ['Phd', 'Masters', 'Degree', 'Diploma', 'Above grade 12', 'Above grade 10', 'Above grade 8', 'Not required'].includes(job.educationLevel)
      ? job.educationLevel
      : isLevelEducation
        ? 'Level'
        : 'Other';

    setEditingJob(job);
    setJobFormData({
      title: job.title || '',
      description: job.description || '',
      skills: Array.isArray(job.skills) ? job.skills.join(', ') : '',
      jobType: job.jobType || 'full-time',
      salaryNegotiable: job.salaryNegotiable || false,
      salaryMin: job.salary?.min || '',
      salaryMax: job.salary?.max || '',
      benefits: Array.isArray(job.benefits) ? job.benefits.join(', ') : '',
      applicationDeadline: job.applicationDeadline ? new Date(job.applicationDeadline).toISOString().split('T')[0] : '',
      status: job.status || 'active',
      gender: job.gender || 'both',
      educationLevel: matchedEducationLevel,
      educationLevelOther: isLevelEducation ? job.educationLevel.replace(/^Level\s*/i, '') : (matchedEducationLevel === 'Other' ? (job.educationLevel || '') : ''),
      country: job.country || 'Ethiopia',
      state: job.state || '',
      city: job.city || '',
      kebele: job.kebele || '',
      experience: job.experienceLevel || '0 years',
      language: Array.isArray(job.language) ? job.language : [],
      languageOther: job.languageOther || '',
      companyName: job.companyName || ''
    });
    setJobSearchTitle(job.title || '');
    setShowJobFormModal(true);
  };

  const closeJobFormModal = () => {
    setShowJobFormModal(false);
    resetJobForm();
  };

  const renderSettingsModal = () => {
    if (!showSettingsModal) return null;
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={() => setShowSettingsModal(false)}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className={`w-full max-w-lg rounded-2xl border ${borderColor} ${bgCard} p-6 shadow-2xl`}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className={`text-2xl font-bold ${textPrimary}`}>Settings</h2>
              <p className={`${textSecondary} mt-1`}>Manage your preferences</p>
            </div>
            <button onClick={() => setShowSettingsModal(false)} className={`p-2 rounded-lg ${darkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`}>
              <FiX className="w-5 h-5" />
            </button>
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
            <div>
              <h3 className={`text-lg font-semibold ${textPrimary} mb-4`}>Notifications</h3>
              <div className={`space-y-3 p-4 rounded-xl ${darkMode ? 'bg-slate-700/30' : 'bg-slate-100'}`}>
                <div className="flex items-center justify-between">
                  <span className={textPrimary}>Email Notifications</span>
                  <div className={`w-12 h-7 rounded-full ${darkMode ? 'bg-slate-600' : 'bg-slate-300'} p-1`}>
                    <div className={`w-5 h-5 rounded-full ${darkMode ? 'bg-indigo-500' : 'bg-white'} `} />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className={textPrimary}>Push Notifications</span>
                  <div className={`w-12 h-7 rounded-full ${darkMode ? 'bg-slate-600' : 'bg-slate-300'} p-1`}>
                    <div className={`w-5 h-5 rounded-full ${darkMode ? 'bg-indigo-500' : 'bg-white'} `} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  const renderSecurityModal = () => {
    if (!showSecurityModal) return null;
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={() => setShowSecurityModal(false)}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className={`w-full max-w-lg rounded-2xl border ${borderColor} ${bgCard} p-6 shadow-2xl`}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className={`text-2xl font-bold ${textPrimary}`}>Security</h2>
              <p className={`${textSecondary} mt-1`}>Manage your account security</p>
            </div>
            <button onClick={() => setShowSecurityModal(false)} className={`p-2 rounded-lg ${darkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`}>
              <FiX className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-6">
            <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-700/30' : 'bg-slate-100'}`}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className={`font-medium ${textPrimary}`}>Change Password</h4>
                  <p className={`text-sm ${textSecondary}`}>Update your password regularly</p>
                </div>
                <FiShield className={`w-5 h-5 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
              </div>
              <button className={`w-full py-2 rounded-lg ${darkMode ? 'bg-indigo-500 hover:bg-indigo-600' : 'bg-indigo-500 hover:bg-indigo-600'} text-white transition`}>
                Update Password
              </button>
            </div>
            <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-700/30' : 'bg-slate-100'}`}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className={`font-medium ${textPrimary}`}>Two-Factor Authentication</h4>
                  <p className={`text-sm ${textSecondary}`}>Add an extra layer of security</p>
                </div>
                <FiShield className={`w-5 h-5 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
              </div>
              <button className={`w-full py-2 rounded-lg ${darkMode ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-emerald-500 hover:bg-emerald-600'} text-white transition`}>
                Enable 2FA
              </button>
            </div>
            <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-700/30' : 'bg-slate-100'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className={`font-medium ${textPrimary}`}>Active Sessions</h4>
                  <p className={`text-sm ${textSecondary}`}>Manage your logged in devices</p>
                </div>
                <FiShield className={`w-5 h-5 ${darkMode ? 'text-amber-400' : 'text-amber-600'}`} />
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  const handleSaveJob = async (e) => {
    e.preventDefault();
    try {
      const normalizedEducationLevel =
        jobFormData.educationLevel === 'Level'
          ? `Level ${jobFormData.educationLevelOther}`.trim()
          : jobFormData.educationLevel === 'Other'
            ? jobFormData.educationLevelOther
            : jobFormData.educationLevel;

      const payload = {
        title: jobFormData.title,
        description: jobFormData.description,
        skills: jobFormData.skills ? jobFormData.skills.split(',').map((s) => s.trim()).filter((s) => s) : [],
        location: [jobFormData.city, jobFormData.kebele].filter(Boolean).join(', '),
        jobType: jobFormData.jobType,
        salary: { min: Number(jobFormData.salaryMin) || 0, max: Number(jobFormData.salaryMax) || 0, currency: 'USD' },
        salaryNegotiable: jobFormData.salaryNegotiable,
        benefits: jobFormData.benefits ? jobFormData.benefits.split(',').map((s) => s.trim()).filter((s) => s) : [],
        applicationDeadline: jobFormData.applicationDeadline || null,
        status: jobFormData.status,
        gender: jobFormData.gender,
        country: jobFormData.country,
        state: jobFormData.state,
        city: jobFormData.city,
        kebele: jobFormData.kebele,
        experience: jobFormData.experience,
        educationLevel: normalizedEducationLevel,
        language: jobFormData.language,
        languageOther: jobFormData.languageOther,
        companyName: jobFormData.companyName
      };

      if (editingJob?._id) {
        await jobsApi.update(editingJob._id, payload);
      } else {
        await jobsApi.create(payload);
      }

      closeJobFormModal();
      await fetchDashboardData();
    } catch (error) {
      console.error('Error saving job:', error);
      alert(error.response?.data?.message || 'Failed to save job');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    try {
      await jobsApi.delete(jobId);
      await fetchDashboardData();
    } catch (error) {
      console.error('Error deleting job:', error);
      alert(error.response?.data?.message || 'Failed to delete job');
    }
  };

  const kpiCards = [
    { label: 'Active Jobs', value: stats.activeJobs || 0, change: `${jobs.length} total`, trend: 'up', icon: FiBriefcase, color: 'from-blue-500 to-cyan-400' },
    { label: 'Total Applicants', value: stats.totalApplicants || 0, change: `${candidates.length} live`, trend: 'up', icon: FiUsers, color: 'from-purple-500 to-pink-400' },
    { label: 'Hires This Month', value: stats.hiresThisMonth || 0, change: 'accepted', trend: 'up', icon: FiAward, color: 'from-emerald-500 to-teal-400' },
    { label: 'Response Rate', value: stats.responseRate || '0%', change: 'real-time', trend: 'up', icon: FiTrendingUp, color: 'from-amber-500 to-orange-400' },
  ];

  const formatRelativeDate = (value) => {
    if (!value) return 'Unknown';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Unknown';
    const diffMs = Date.now() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const formatSalary = (salary) => {
    if (!salary) return 'Not specified';
    const { min = 0, max = 0, currency = 'USD' } = salary;
    if (!min && !max) return 'Not specified';
    if (min && max) return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
    return `${currency} ${(max || min).toLocaleString()}`;
  };

  const jobsData = jobs.map((job) => ({
    _id: job._id,
    title: job.title || 'Untitled Job',
    applicants: Array.isArray(job.applicants) ? job.applicants.length : 0,
    status: job.status || 'draft',
    posted: formatRelativeDate(job.createdAt),
    salary: formatSalary(job.salary)
  }));

  const candidatesData = candidates.map((app) => {
    const firstName = app.employeeId?.firstName || app.firstName || 'Candidate';
    const lastName = app.employeeId?.lastName || app.lastName || '';
    return {
      _id: app._id,
      name: `${firstName} ${lastName}`.trim(),
      role: app.jobId?.title || 'Position',
      status: app.status || 'pending',
      rating: null,
      avatar: `${firstName[0] || 'C'}${lastName[0] || ''}`.trim() || 'C',
      experience: app.employeeId?.experienceLevel || 'N/A',
      location: app.city || 'N/A',
      skills: Array.isArray(app.employeeId?.skills) ? app.employeeId.skills : []
    };
  });

  const messagesData = messages.map((m, i) => {
    const displayName = m.firstName ? `${m.firstName} ${m.lastName || ''}`.trim() : (m.name || m.email || 'User');
    return {
      _id: m._id || i,
      name: displayName,
      lastMessage: m.lastMessage || m.message || m.content || 'No messages yet',
      time: m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A',
      unread: (m.unread || 0) > 0,
      avatar: `${(m.firstName || displayName || 'U')[0]}${(m.lastName || '')[0] || ''}`.trim() || 'U'
    };
  });

  const applicationsData = [
    { stage: 'Pending', count: candidates.filter((c) => c.status === 'pending').length, color: 'from-blue-400 to-blue-600' },
    { stage: 'Interview', count: candidates.filter((c) => c.status === 'interview').length, color: 'from-amber-400 to-amber-600' },
    { stage: 'Accepted', count: candidates.filter((c) => c.status === 'accepted').length, color: 'from-emerald-400 to-emerald-600' },
    { stage: 'Rejected', count: candidates.filter((c) => c.status === 'rejected').length, color: 'from-rose-400 to-red-600' },
  ];

  const statsChart = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - index));
    const monthLabel = date.toLocaleString('default', { month: 'short' });
    const hires = candidates.filter((candidate) => {
      if (candidate.status !== 'accepted' || !candidate.updatedAt) return false;
      const updatedAt = new Date(candidate.updatedAt);
      return updatedAt.getMonth() === date.getMonth() && updatedAt.getFullYear() === date.getFullYear();
    }).length;
    return { name: monthLabel, hires };
  });

  const orb1X = useTransform(mouseX, [-20, 20], [-15, 15]);
  const orb1Y = useTransform(mouseY, [-20, 20], [-15, 15]);
  const orb2X = useTransform(mouseX, [-20, 20], [20, -20]);
  const orb2Y = useTransform(mouseY, [-20, 20], [12, -12]);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: FiHome },
    { id: 'jobs', label: 'Jobs', icon: FiBriefcase },
    { id: 'messages', label: 'Messages', icon: FiMessageSquare },
    { id: 'analytics', label: 'Analytics', icon: FiBarChart2 },
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
            : job.status === 'closed'
              ? darkMode ? 'bg-rose-500/20 text-rose-400' : 'bg-rose-100 text-rose-700'
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
        <div className="flex items-center gap-2">
          <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }} onClick={() => openEditJobModal(jobs.find((item) => item._id === job._id) || job)} className={`p-2 rounded-lg ${darkMode ? 'hover:bg-slate-700 text-amber-400' : 'hover:bg-slate-100 text-amber-600'} transition`}>
            <FiEdit className="w-4 h-4" />
          </motion.button>
          <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }} onClick={() => handleDeleteJob(job._id)} className={`p-2 rounded-lg ${darkMode ? 'hover:bg-slate-700 text-rose-400' : 'hover:bg-slate-100 text-rose-600'} transition`}>
            <FiX className="w-4 h-4" />
          </motion.button>
        </div>
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
        {candidate.rating ? (
          <div className="flex items-center gap-1 text-amber-400">
            <FiStar className="w-4 h-4 fill-current" />
            <span className="text-sm font-medium">{candidate.rating}</span>
          </div>
        ) : (
          <span className={`text-xs px-2 py-1 rounded-lg ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
            Live applicant
          </span>
        )}
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
          candidate.status === 'accepted' ? darkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700' :
          candidate.status === 'interview' ? darkMode ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700' :
          candidate.status === 'rejected' ? darkMode ? 'bg-rose-500/20 text-rose-400' : 'bg-rose-100 text-rose-700' :
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

  const renderJobFormModal = () => {
    if (!showJobFormModal) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={closeJobFormModal}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className={`w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border ${borderColor} ${bgCard} p-6 shadow-2xl`}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className={`text-2xl font-bold ${textPrimary}`}>{editingJob ? 'Edit Job' : 'Create Job'}</h2>
              <p className={`${textSecondary} mt-1`}>Use the same job form structure as the admin dashboard.</p>
            </div>
            <button onClick={closeJobFormModal} className={`p-2 rounded-lg ${darkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`}>
              <FiX className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSaveJob} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Job Title</label>
                <div className="relative">
                  <FiSearch className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${textMuted}`} />
                  <input
                    type="text"
                    value={jobFormData.title === 'Other' ? jobSearchTitle : jobFormData.title}
                    onFocus={() => {
                      setJobSearchTitle(jobFormData.title === 'Other' ? jobSearchTitle : jobFormData.title);
                      setShowJobTitleDropdown(true);
                    }}
                    onChange={(e) => {
                      const value = e.target.value;
                      setJobSearchTitle(value);
                      setShowJobTitleDropdown(true);
                      setJobFormData((prev) => ({ ...prev, title: value }));
                    }}
                    onBlur={() => window.setTimeout(() => setShowJobTitleDropdown(false), 150)}
                    placeholder="Search or choose a job title"
                    className={`w-full pl-11 pr-10 py-3 rounded-xl border ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-400' : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'} focus:ring-2 focus:ring-indigo-500/20 outline-none`}
                    required
                  />
                  <FiChevronDown className={`pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 ${textMuted}`} />

                  {showJobTitleDropdown && (
                    <div className={`absolute z-20 mt-2 w-full rounded-2xl border shadow-2xl overflow-hidden ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                      <div className={`max-h-64 overflow-y-auto ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
                        {filteredJobTitleOptions.length > 0 ? filteredJobTitleOptions.map((job) => (
                          <button
                            key={job}
                            type="button"
                            onMouseDown={() => {
                              setJobFormData((prev) => ({ ...prev, title: job }));
                              setJobSearchTitle(job);
                              setShowJobTitleDropdown(false);
                            }}
                            className={`w-full px-4 py-3 text-left transition ${darkMode ? 'text-slate-100 hover:bg-slate-700 border-b border-slate-700 last:border-b-0' : 'text-slate-900 hover:bg-slate-50 border-b border-slate-100 last:border-b-0'}`}
                          >
                            {job}
                          </button>
                        )) : (
                          <div className={`px-4 py-3 ${textSecondary}`}>No matching job titles</div>
                        )}
                        <button
                          type="button"
                          onMouseDown={() => {
                            setJobFormData((prev) => ({ ...prev, title: 'Other' }));
                            setShowJobTitleDropdown(false);
                          }}
                          className={`w-full px-4 py-3 text-left font-medium ${darkMode ? 'text-indigo-300 hover:bg-slate-700' : 'text-indigo-600 hover:bg-indigo-50'}`}
                        >
                          Other
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {jobFormData.title === 'Other' && (
                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Specify Job Title</label>
                  <input
                    type="text"
                    value={jobSearchTitle}
                    onChange={(e) => {
                      setJobSearchTitle(e.target.value);
                      setJobFormData((prev) => ({ ...prev, title: e.target.value }));
                    }}
                    className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                    required
                  />
                </div>
              )}

              <div>
                <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Company Name</label>
                <input type="text" value={jobFormData.companyName} onChange={(e) => setJobFormData((prev) => ({ ...prev, companyName: e.target.value }))} className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`} />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>City</label>
                <input type="text" value={jobFormData.city} onChange={(e) => setJobFormData((prev) => ({ ...prev, city: e.target.value }))} className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`} />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Kebele</label>
                <input type="text" value={jobFormData.kebele} onChange={(e) => setJobFormData((prev) => ({ ...prev, kebele: e.target.value }))} className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`} />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Job Type</label>
                <select value={jobFormData.jobType} onChange={(e) => setJobFormData((prev) => ({ ...prev, jobType: e.target.value }))} className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Experience</label>
                <select value={jobFormData.experience} onChange={(e) => setJobFormData((prev) => ({ ...prev, experience: e.target.value }))} className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
                  <option value="0 years">0 years</option>
                  <option value="1 year">1 year</option>
                  <option value="2 years">2 years</option>
                  <option value="3 years">3 years</option>
                  <option value="4 years">4 years</option>
                  <option value="5 years">5 years</option>
                  <option value="Above 5 years">Above 5 years</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Gender</label>
                <select value={jobFormData.gender} onChange={(e) => setJobFormData((prev) => ({ ...prev, gender: e.target.value }))} className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
                  <option value="both">Both</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Education Level</label>
                <select value={jobFormData.educationLevel} onChange={(e) => setJobFormData((prev) => ({ ...prev, educationLevel: e.target.value, educationLevelOther: e.target.value === 'Level' || e.target.value === 'Other' ? prev.educationLevelOther : '' }))} className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
                  <option value="Phd">Phd</option>
                  <option value="Masters">Masters</option>
                  <option value="Degree">Degree</option>
                  <option value="Diploma">Diploma</option>
                  <option value="Level">Level</option>
                  <option value="Above grade 12">Above grade 12</option>
                  <option value="Above grade 10">Above grade 10</option>
                  <option value="Above grade 8">Above grade 8</option>
                  <option value="Not required">Not required</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              {(jobFormData.educationLevel === 'Level' || jobFormData.educationLevel === 'Other') && (
                <div>
                  <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>{jobFormData.educationLevel === 'Level' ? 'Specify Level' : 'Specify Education Need'}</label>
                  <input type="text" value={jobFormData.educationLevelOther} onChange={(e) => setJobFormData((prev) => ({ ...prev, educationLevelOther: e.target.value }))} className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`} required />
                </div>
              )}
              <div>
                <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Status</label>
                <select value={jobFormData.status} onChange={(e) => setJobFormData((prev) => ({ ...prev, status: e.target.value }))} className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
                  <option value="active">Active</option>
                  <option value="closed">Closed</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Application Deadline</label>
                <input type="date" value={jobFormData.applicationDeadline} onChange={(e) => setJobFormData((prev) => ({ ...prev, applicationDeadline: e.target.value }))} className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`} />
              </div>
              <div className="md:col-span-2">
                <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Skills</label>
                <textarea rows="3" value={jobFormData.skills} onChange={(e) => setJobFormData((prev) => ({ ...prev, skills: e.target.value }))} placeholder="Comma separated" className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`} />
              </div>
              <div className="md:col-span-2">
                <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Benefits</label>
                <textarea rows="3" value={jobFormData.benefits} onChange={(e) => setJobFormData((prev) => ({ ...prev, benefits: e.target.value }))} placeholder="Comma separated" className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`} />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Minimum Salary</label>
                <input type="number" min="0" value={jobFormData.salaryMin} onChange={(e) => setJobFormData((prev) => ({ ...prev, salaryMin: e.target.value }))} className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`} />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Maximum Salary</label>
                <input type="number" min="0" value={jobFormData.salaryMax} onChange={(e) => setJobFormData((prev) => ({ ...prev, salaryMax: e.target.value }))} className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`} />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input id="recruiterSalaryNegotiable" type="checkbox" checked={jobFormData.salaryNegotiable} onChange={(e) => setJobFormData((prev) => ({ ...prev, salaryNegotiable: e.target.checked }))} className="w-4 h-4 rounded accent-indigo-600" />
              <label htmlFor="recruiterSalaryNegotiable" className={textSecondary}>Salary negotiable</label>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Description</label>
              <textarea rows="5" value={jobFormData.description} onChange={(e) => setJobFormData((prev) => ({ ...prev, description: e.target.value }))} className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`} required />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium">
                {editingJob ? 'Save Changes' : 'Create Job'}
              </button>
              <button type="button" onClick={closeJobFormModal} className={`flex-1 py-3 rounded-xl font-medium ${darkMode ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-900'}`}>
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    );
  };

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
                    {messagesData.length === 0 ? (
                      <div className={`rounded-xl p-6 text-center ${darkMode ? 'bg-slate-800/40 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
                        No conversations yet.
                      </div>
                    ) : messagesData.map(msg => (
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
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={openCreateJobModal} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl text-sm font-medium shadow-lg shadow-indigo-500/25">
                      <FiPlus className="w-4 h-4" />Post Job
                    </motion.button>
                  </div>
                  <div className="space-y-3">
                    {jobsData.length === 0 ? (
                      <div className={`rounded-xl p-6 text-center ${darkMode ? 'bg-slate-800/40 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
                        No jobs posted yet.
                      </div>
                    ) : jobsData.map(job => <JobCard key={job._id || job.id} job={job} />)}
                  </div>
                 </div>
               </div>
               <div>
                 <div className={`p-6 rounded-2xl ${bgCard} backdrop-blur-xl ${borderColor} border`}>
                   <div className="flex items-center justify-between mb-4">
                     <h3 className={`text-lg font-bold ${textPrimary}`}>Recent Applicants</h3>
                     <button onClick={() => setActiveTab('jobs')} className={`text-sm ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>View Jobs</button>
                   </div>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                     {candidatesData.length === 0 ? (
                       <div className={`sm:col-span-2 rounded-xl p-6 text-center ${darkMode ? 'bg-slate-800/40 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
                         No applicants yet.
                       </div>
                     ) : candidatesData.slice(0, 4).map(candidate => <CandidateCard key={candidate._id || candidate.id} candidate={candidate} />)}
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
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={openCreateJobModal} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium shadow-lg shadow-indigo-500/25">
                  <FiPlus className="w-5 h-5" />Create Job
                </motion.button>
              </div>
              <div className="space-y-4">
                {jobsData.length === 0 ? (
                  <div className={`rounded-xl p-6 text-center ${darkMode ? 'bg-slate-800/40 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
                    No jobs found.
                  </div>
                ) : jobsData.map(job => <JobCard key={job._id || job.id} job={job} />)}
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
                {candidatesData.length === 0 ? (
                  <div className={`xl:col-span-4 lg:col-span-3 sm:col-span-2 rounded-xl p-6 text-center ${darkMode ? 'bg-slate-800/40 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
                    No candidates found.
                  </div>
                ) : candidatesData.map(candidate => <CandidateCard key={candidate._id || candidate.id} candidate={candidate} />)}
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
                <div className="lg:col-span-1 space-y-2 max-h-[500px] overflow-y-auto">
                  {messagesData.length === 0 ? (
                    <div className={`rounded-xl p-6 text-center ${darkMode ? 'bg-slate-700/30 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
                      No messages yet.
                    </div>
                  ) : messagesData.map(msg => (
                    <motion.div 
                      key={msg._id || msg.id}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => handleSelectChat(msg)}
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer ${selectedChat?._id === msg._id || selectedChat?.id === msg.id ? (darkMode ? 'bg-slate-700/70' : 'bg-indigo-100') : (darkMode ? 'bg-slate-700/30 hover:bg-slate-700/50' : 'bg-slate-50 hover:bg-slate-100')}`}
                    >
                      <div className={`w-12 h-12 rounded-full ${selectedChat?._id === msg._id || selectedChat?.id === msg.id ? 'bg-gradient-to-r from-cyan-500 to-blue-500' : 'bg-gradient-to-br from-blue-500 to-purple-500'} flex items-center justify-center text-white font-bold`}>
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
                <div className="lg:col-span-3 flex flex-col">
                  {selectedChat ? (
                    <>
                      <div className={`p-3 rounded-t-xl ${darkMode ? 'bg-slate-700/50' : 'bg-slate-100'} flex items-center gap-3`}>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold">
                          {selectedChat.avatar}
                        </div>
                        <h4 className={`font-medium ${textPrimary}`}>{selectedChat.name}</h4>
                      </div>
                      <div className={`flex-1 min-h-[350px] max-h-[350px] overflow-y-auto rounded-b-xl ${darkMode ? 'bg-slate-700/20' : 'bg-slate-50'} p-4 space-y-3`}>
                        {chatMessages.length === 0 ? (
                          <div className={`flex items-center justify-center h-full ${textSecondary}`}>
                            <p>No messages yet. Start the conversation!</p>
                          </div>
                        ) : chatMessages.map((msg, idx) => {
                          const isSender = msg.senderId === user?._id || msg.senderId === user?.id;
                          return (
                            <motion.div
                              key={msg._id || idx}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`flex ${isSender ? 'justify-start' : 'justify-end'}`}
                            >
                              <div className={`max-w-[70%] px-4 py-3 rounded-2xl ${
                                isSender 
                                  ? 'bg-indigo-600 text-white' 
                                  : 'bg-white text-black border border-gray-200'
                              }`}>
                                <p className="text-sm">{msg.content}</p>
                                <p className={`text-xs mt-1 ${isSender ? 'text-white/70' : 'text-gray-500'}`}>
                                  {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                                </p>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                      <div className="flex items-center gap-3 mt-4">
                        <input 
                          type="text" 
                          value={messageInput}
                          onChange={(e) => setMessageInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
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
                          onClick={sendChatMessage}
                          disabled={!messageInput.trim() || sendingMessage}
                          className={`p-3 rounded-xl shadow-lg ${
                            !messageInput.trim() || sendingMessage
                              ? 'bg-slate-500 cursor-not-allowed'
                              : 'bg-gradient-to-r from-indigo-500 to-purple-500 shadow-indigo-500/25'
                          } text-white`}
                        >
                          <FiSend className="w-5 h-5" />
                        </motion.button>
                      </div>
                    </>
                  ) : (
                    <div className={`h-[400px] rounded-xl ${darkMode ? 'bg-slate-700/20' : 'bg-slate-50'} flex items-center justify-center`}>
                      <p className={textSecondary}>Select a conversation to start messaging</p>
                    </div>
                  )}
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
        setActiveTab('dashboard');
        return null;

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
              onClick={() => { console.log('Notification clicked'); setShowNotifications(!showNotifications); }}
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
              {messagesData.filter(m => m.unread).length > 0 && (
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
              <button onClick={() => { setShowSettingsModal(true); setShowProfile(false); }} className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-100 text-slate-700'}`}>
                <FiSettings className="w-4 h-4" />
                <span className="text-sm">Settings</span>
              </button>
              <button onClick={() => { setShowSecurityModal(true); setShowProfile(false); }} className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-100 text-slate-700'}`}>
                <FiShield className="w-4 h-4" />
                <span className="text-sm">Security</span>
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

      <AnimatePresence>{renderJobFormModal()}</AnimatePresence>
      <AnimatePresence>{renderSettingsModal()}</AnimatePresence>
      <AnimatePresence>{renderSecurityModal()}</AnimatePresence>
    </div>
  );
};

export default RecruiterDashboard;
