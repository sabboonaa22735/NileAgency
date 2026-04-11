import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBriefcase, FiMessageSquare, FiBell, FiLogOut, FiPlus, FiMapPin, FiDollarSign, FiClock, FiX, FiMenu, FiTrash2, FiSend, FiUser, FiSearch, FiChevronDown, FiCheck, FiGlobe, FiSun, FiMoon } from 'react-icons/fi';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { jobsApi, usersApi, notificationsApi, chatApi } from '../services/api';

let socket;

export default function RecruiterDashboard() {
  const [activeTab, setActiveTab] = useState('jobs');
  const [jobs, setJobs] = useState([]);
  const [profile, setProfile] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPostJob, setShowPostJob] = useState(false);
  const [uiLanguage, setUiLanguage] = useState('English');
  const [darkMode, setDarkMode] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [jobSearchQuery, setJobSearchQuery] = useState('');
  const [showJobDropdown, setShowJobDropdown] = useState(false);
  const [customJobTitle, setCustomJobTitle] = useState('');
  const [newJob, setNewJob] = useState({
    title: '', description: '', jobType: 'full-time', salaryNegotiable: false, skills: '',
    gender: 'both', level: 'Not required', levelOther: '', country: 'Ethiopia', state: '', city: '', kebele: '',
    experience: 'Not Required', experienceOther: '', companyName: '', language: [], languageOther: ''
  });

  const ethiopianRegions = [
    'Addis Ababa', 'Afar', 'Amhara', 'Benishangul-Gumuz', 'Dire Dawa',
    'Gambela', 'Harari', 'Oromia', 'Sidama', 'Somali', 'South West Ethiopia Peoples\' Region',
    'Tigray', 'Wolaita', 'Other'
  ];

  const ethiopianJobCategories = [
    'Accountant', 'Administrative Assistant', 'Architect', 'Banker', 'Business Analyst', 'Cashier',
    'Chef', 'Civil Engineer', 'Clinical Officer', 'Computer Operator', 'Construction Worker', 'Consultant',
    'Content Writer', 'Customer Service', 'Data Analyst', 'Data Entry Clerk', 'Database Administrator',
    'Dental Surgeon', 'Designer', 'Doctor', 'Driver', 'Economist', 'Education Teacher', 'Electrical Engineer',
    'Electrician', 'Engineer', 'Finance Manager', 'Financial Analyst', 'General Practitioner', 'Graphic Designer',
    'HR Manager', 'HR Officer', 'IT Specialist', 'Journalist', 'Lab Technician', 'Lawyer', 'Librarian',
    'Logistics Officer', 'Machine Operator', 'Marketing Manager', 'Marketing Officer', 'Mechanical Engineer',
    'Medical Doctor', 'Nurse', 'Office Assistant', 'Pharmacist', 'Physical Therapist', 'Pilot', 'Plumber',
    'Procurement Officer', 'Project Manager', 'Psychologist', 'Public Relations Officer', 'Quality Assurance',
    'Receptionist', 'Researcher', 'Sales Manager', 'Sales Representative', 'Secretary', 'Security Guard',
    'Social Worker', 'Software Developer', 'Statistician', 'Stock Clerk', 'Surveyor', 'Teacher', 'Technician',
    'Telecommunications Engineer', 'Tour Guide', 'Training Officer', 'Translator', 'Transport Manager',
    'Veterinarian', 'Video Editor', 'Warehouse Manager', 'Web Developer', 'Other'
  ];

  const filteredJobCategories = ethiopianJobCategories.filter(job =>
    job.toLowerCase().includes(jobSearchQuery.toLowerCase())
  );
  const [conversations, setConversations] = useState({});
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedChat, setSelectedChat] = useState(null);
  const [adminChatOpen, setAdminChatOpen] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState({});
  const [admin, setAdmin] = useState(null);
  const messagesEndRef = useRef(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const translations = {
    English: {
      myJobs: 'My Jobs', messages: 'Messages', profile: 'Company Profile',
      postJob: 'Post Job', settings: 'Settings', preferences: 'Preferences',
      security: 'Security', logout: 'Logout', noJobs: 'No jobs posted yet',
      postFirstJob: 'Post Your First Job', applicants: 'applicants',
      active: 'active', closed: 'closed', chatWithAdmin: 'Chat with Admin',
      messagesComing: 'Messages feature coming soon', completeProfile: 'Complete Your Company Profile',
      companyName: 'Company Name', companyDescription: 'Company Description', industry: 'Industry',
      companySize: 'Company Size', location: 'Location', website: 'Website',
      saveProfile: 'Save Company Profile', notifications: 'Notifications',
      markAllRead: 'Mark all read', noNotifications: 'No notifications yet'
    },
    'Afan Oromo': {
      myJobs: 'Hojii keewani', messages: 'Ergaa', profile: 'Sadarkii Kampaniyaa',
      postJob: 'Hojii Baxi', settings: 'Haala', preferences: 'Fedhii',
      security: 'Tasgabee', logout: 'Baasi', noJobs: 'Hojii laale',
      postFirstJob: 'Hojii Tokkoo Baxi', applicants: 'dhaabbii',
      active: 'haala galaa', closed: 'ciirce', chatWithAdmin: 'Ergaa AdminWani',
      messagesComing: 'Ergaa dhiha', completeProfile: 'Sadarkii Kampaniyaa Guuti',
      companyName: 'Maqaa Kampaniyaa', companyDescription: 'IBSA Kampaniyaa', industry: 'Industrii',
      companySize: 'Baay\'ina nama', location: 'Iddoo', website: 'Website',
      saveProfile: 'Sadarkii Saveessi', notifications: 'Barruu',
      markAllRead: 'Hunda Dubbiisaa', noNotifications: 'Barruu hinjiruu'
    },
    Amharic: {
      myJobs: 'የኔ ስራዎች', messages: 'መልክቶች', profile: 'የኩባንያው ፕሮፋይል',
      postJob: 'ስራ ለጥፍ', settings: 'ቅንብሮች', preferences: 'ምርጫዎች',
      security: 'ደህንነት', logout: 'ውጣ', noJobs: 'ስራ የለም',
      postFirstJob: 'የመጀመሪያውስራን ለጥፍ', applicants: 'አመራር',
      active: 'ንቃታማ', closed: 'ተዘግቷል', chatWithAdmin: 'ከአስተዳዳሪ ጋር መልክት',
      messagesComing: 'መልክቶች በቅርብ እየመጡ', completeProfile: 'የኩባንያውን ፕሮፋይል ጨርስ',
      companyName: 'የኩባንያው ስም', companyDescription: 'የኩባንያው ገለፃፃ', industry: 'ኢንዱስትሪ',
      companySize: 'የኩባንያው መጠን', location: 'አካባቢ', website: 'ድህረ ገፅ',
      saveProfile: 'ፕሮፋይል አስቀምጥ', notifications: 'ማስታወቂያዎች',
      markAllRead: 'ሁሉንም አንብብ', noNotifications: 'ማስታወቂያዎች የሉም'
    }
  };

  const t = (key) => translations[uiLanguage]?.[key] || translations['English'][key] || key;

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const loadData = async () => {
    try {
      const [jobsRes, profileRes, notificationsRes] = await Promise.all([
        jobsApi.getAll({ myJobs: true }),
        usersApi.getProfile(),
        notificationsApi.getAll()
      ]);
      setJobs(jobsRes.data.jobs);
      setProfile(profileRes.data);
      setNotifications(notificationsRes.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handlePostJob = async (e) => {
    e.preventDefault();
    try {
      await jobsApi.create({
        ...newJob,
        gender: newJob.gender,
        country: newJob.country,
        state: newJob.state,
        city: newJob.city,
        kebele: newJob.kebele,
        companyName: newJob.companyName,
        educationLevel: newJob.level === 'Other' ? newJob.levelOther : newJob.level,
        experienceLevel: newJob.experience === 'Other' ? newJob.experienceOther : newJob.experience,
        salaryNegotiable: newJob.salaryNegotiable,
        techStack: newJob.skills.split(',').map(s => s.trim()),
        language: newJob.language,
        languageOther: newJob.languageOther
      });
      setShowPostJob(false);
      setNewJob({
        title: '', description: '', jobType: 'full-time', salaryNegotiable: false, skills: '',
        gender: 'both', level: 'Not required', levelOther: '', country: 'Ethiopia', state: '', city: '', kebele: '',
        experience: 'Not Required', experienceOther: '', companyName: '', language: [], languageOther: ''
      });
      loadData();
      alert('Job posted successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to post job');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!confirm('Are you sure you want to delete this job?')) return;
    try {
      await jobsApi.delete(jobId);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      companyName: formData.get('companyName'),
      companyDescription: formData.get('companyDescription'),
      industry: formData.get('industry'),
      companySize: formData.get('companySize'),
      location: formData.get('location'),
      website: formData.get('website')
    };
    try {
      await usersApi.updateProfile(data);
      loadData();
      alert('Company profile saved successfully!');
    } catch (err) {
      console.error(err);
    }
  };

  const tabs = [
    { id: 'jobs', label: t('myJobs'), icon: FiBriefcase },
    { id: 'messages', label: t('messages'), icon: FiMessageSquare },
    { id: 'profile', label: t('profile'), icon: FiUser },
    { id: 'settings', label: t('settings'), icon: FiBriefcase },
    { id: 'preferences', label: t('preferences'), icon: FiBriefcase },
    { id: 'security', label: t('security'), icon: FiBriefcase }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <nav className="glass sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-brand-indigo flex items-center justify-center">
                <span className="text-white font-bold text-lg">N</span>
              </div>
              <span className="text-xl font-bold text-brand-dark">Nile Agency</span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <div className="flex gap-4">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 ${activeTab === tab.id ? 'text-brand-indigo font-semibold' : 'text-brand-gray hover:text-brand-dark'}`}
                  >
                    <tab.icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                ))}
              </div>
              <button onClick={() => setShowPostJob(true)} className="btn-primary">
                <FiPlus className="w-5 h-5" /> {t('postJob')}
              </button>
              <div className="relative">
                <button onClick={() => setShowLangMenu(!showLangMenu)} className="text-brand-gray hover:text-brand-dark">
                  <FiGlobe className="w-5 h-5" />
                </button>
                {showLangMenu && (
                  <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                    {['English', 'Afan Oromo', 'Amharic'].map((lang) => (
                      <button
                        key={lang}
                        onClick={() => { setUiLanguage(lang); setShowLangMenu(false); }}
                        className={`w-full text-left px-4 py-2 hover:bg-gray-50 ${uiLanguage === lang ? 'text-brand-indigo font-medium' : 'text-brand-dark'}`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={() => setDarkMode(!darkMode)} className="text-brand-gray hover:text-brand-dark">
                {darkMode ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
              </button>
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative text-brand-gray hover:text-brand-dark transition mr-3"
                >
                  <FiBell className="w-5 h-5" />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 max-h-96 overflow-y-auto"
                  >
                    <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
                      <h3 className="font-semibold text-brand-dark">Notifications</h3>
                      {notifications.some(n => !n.read) && (
                        <button 
                          onClick={handleMarkAllRead}
                          className="text-xs text-brand-indigo hover:text-indigo-700"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    {notifications.length === 0 ? (
                      <p className="px-4 py-6 text-center text-brand-gray">No notifications yet</p>
                    ) : (
                      notifications.slice(0, 10).map((notification) => (
                        <button
                          key={notification._id}
                          onClick={() => {
                            if (!notification.read) {
                              notificationsApi.markAsRead(notification._id);
                              setNotifications(prev => prev.map(n => 
                                n._id === notification._id ? { ...n, read: true } : n
                              ));
                            }
                            setShowNotifications(false);
                          }}
                          className={`w-full px-4 py-3 text-left flex items-start gap-3 hover:bg-gray-50 transition ${
                            !notification.read ? 'bg-indigo-50' : ''
                          }`}
                        >
                          <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                            notification.type === 'job' ? 'bg-green-500' :
                            notification.type === 'application' ? 'bg-blue-500' :
                            notification.type === 'message' ? 'bg-yellow-500' :
                            'bg-gray-500'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${!notification.read ? 'text-brand-dark' : 'text-brand-gray'}`}>
                              {notification.title}
                            </p>
                            <p className="text-xs text-brand-gray truncate">{notification.message}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(notification.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </button>
                      ))
                    )}
                  </motion.div>
                )}
              </div>
              <div className="relative">
                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="w-9 h-9 rounded-full bg-brand-indigo flex items-center justify-center hover:bg-indigo-600 transition"
                >
                  <span className="text-white font-medium">{user?.email?.[0]?.toUpperCase()}</span>
                </button>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50"
                  >
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-brand-dark truncate">{user?.email}</p>
                      <p className="text-xs text-brand-gray capitalize">{user?.role}</p>
                    </div>
                    <button
                      onClick={() => { setShowProfileMenu(false); setActiveTab('profile'); }}
                      className="w-full px-4 py-2 text-left text-brand-gray hover:bg-gray-50 flex items-center gap-2 transition"
                    >
                      <FiUser className="w-4 h-4" />
                      Company Profile
                    </button>
                    <button
                      onClick={() => { setShowProfileMenu(false); setActiveTab('settings'); }}
                      className="w-full px-4 py-2 text-left text-brand-gray hover:bg-gray-50 flex items-center gap-2 transition"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Settings
                    </button>
                    <button
                      onClick={() => { setShowProfileMenu(false); setActiveTab('preferences'); }}
                      className="w-full px-4 py-2 text-left text-brand-gray hover:bg-gray-50 flex items-center gap-2 transition"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                      </svg>
                      Preferences
                    </button>
                    <button
                      onClick={() => { setShowProfileMenu(false); setActiveTab('security'); }}
                      className="w-full px-4 py-2 text-left text-brand-gray hover:bg-gray-50 flex items-center gap-2 transition"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Security
                    </button>
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left text-red-500 hover:bg-red-50 flex items-center gap-2 transition"
                      >
                        <FiLogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'jobs' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-2xl font-bold text-brand-dark mb-6">My Jobs</h2>
              <div className="space-y-4">
              {jobs.length === 0 ? (
                <div className="glass rounded-2xl p-8 text-center">
                  <p className="text-brand-gray mb-4">{t('noJobs')}</p>
                  <button onClick={() => setShowPostJob(true)} className="btn-primary">{t('postFirstJob')}</button>
                </div>
              ) : (
                jobs.map((job) => (
                  <motion.div key={job._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-brand-dark mb-2">{job.title}</h3>
                        <div className="flex flex-wrap gap-4 text-sm text-brand-gray mb-3">
                          <span className="flex items-center gap-1"><FiMapPin /> {job.location || 'Remote'}</span>
                          <span className="flex items-center gap-1"><FiClock /> {job.jobType}</span>
                          <span className="flex items-center gap-1"><FiUser /> {job.applicants?.length || 0} {t('applicants')}</span>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${job.status === 'active' ? 'bg-green-100 text-green-700' : job.status === 'closed' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                          {job.status === 'active' ? t('active') : job.status === 'closed' ? t('closed') : job.status}
                        </span>
                      </div>
                      <button onClick={() => handleDeleteJob(job._id)} className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition">
                        <FiTrash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'messages' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-2xl font-bold text-brand-dark mb-6">{t('chatWithAdmin')}</h2>
            <div className="glass rounded-2xl p-8 text-center text-brand-gray">
              <FiMessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{t('messagesComing')}</p>
            </div>
          </motion.div>
        )}

        {activeTab === 'profile' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-2xl font-bold text-brand-dark mb-6">{t('completeProfile')}</h2>
            <div className="glass rounded-2xl p-6">
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-2">{t('companyName')}</label>
                  <input name="companyName" defaultValue={profile?.companyName} className="input-glass w-full" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-2">{t('companyDescription')}</label>
                  <textarea name="companyDescription" defaultValue={profile?.companyDescription} className="input-glass w-full h-32" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-2">{t('industry')}</label>
                  <input name="industry" defaultValue={profile?.industry} className="input-glass w-full" />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-brand-dark mb-2">{t('companySize')}</label>
                    <select name="companySize" defaultValue={profile?.companySize || '1-10'} className="input-glass w-full">
                      <option value="1-10">1-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-dark mb-2">Location</label>
                    <input name="location" defaultValue={profile?.location} className="input-glass w-full" />
                  </div>
                </div>
                <button type="submit" className="btn-primary">Save Company Profile</button>
              </form>
            </div>
          </motion.div>
)}

        {activeTab === 'preferences' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-2xl font-bold text-brand-dark mb-6">Preferences</h2>
            <div className="glass rounded-2xl p-6 space-y-6">
              <div className="border-b border-gray-100 pb-4">
                <h3 className="text-lg font-semibold text-brand-dark mb-4">Job Posting Defaults</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-brand-dark mb-2">Default Job Type</label>
                    <select className="input-glass w-full md:w-1/2">
                      <option value="full-time">Full-time</option>
                      <option value="part-time">Part-time</option>
                      <option value="contract">Contract</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-dark mb-2">Default Location</label>
                    <select className="input-glass w-full md:w-1/2">
                      <option value="Addis Ababa">Addis Ababa</option>
                      <option value="Remote">Remote</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-brand-dark mb-4">Application Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-brand-dark font-medium">Auto-approve Applications</p>
                      <p className="text-sm text-brand-gray">Automatically approve matching applications</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-indigo"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-brand-dark font-medium">Show Company Logo</p>
                      <p className="text-sm text-brand-gray">Display your company logo on job posts</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-indigo"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
)}
      </main>

      {showPostJob && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="glass rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-brand-dark">Post New Job</h3>
              <button onClick={() => setShowPostJob(false)} className="p-2 rounded-lg hover:bg-gray-100">
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handlePostJob} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Job Title</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={newJob.title} 
                    onChange={(e) => {
                      setNewJob({...newJob, title: e.target.value});
                      setJobSearchQuery(e.target.value);
                      setShowJobDropdown(true);
                    }} 
                    onFocus={() => setShowJobDropdown(true)}
                    className="input-glass w-full" 
                    placeholder="Search job title..." 
                    required 
                  />
                  {showJobDropdown && jobSearchQuery && (
                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {ethiopianJobCategories.filter(job => job.toLowerCase().includes(jobSearchQuery.toLowerCase())).map((job) => (
                        <button
                          key={job}
                          type="button"
                          onClick={() => {
                            setNewJob({...newJob, title: job});
                            setShowJobDropdown(false);
                            setJobSearchQuery('');
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-indigo-50"
                        >
                          {job}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Company Name</label>
                  <input type="text" value={newJob.companyName} onChange={(e) => setNewJob({...newJob, companyName: e.target.value})} className="input-glass w-full" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Job Type</label>
                  <select value={newJob.jobType} onChange={(e) => setNewJob({...newJob, jobType: e.target.value})} className="input-glass w-full">
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Gender</label>
                  <select value={newJob.gender} onChange={(e) => setNewJob({...newJob, gender: e.target.value})} className="input-glass w-full">
                    <option value="both">Male & Female</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Education Level</label>
                  <select value={newJob.level} onChange={(e) => setNewJob({...newJob, level: e.target.value})} className="input-glass w-full">
                    <option value="Not required">Not required</option>
                    <option value="Above Grade 12">Above Grade 12</option>
                    <option value="Diploma">Diploma</option>
                    <option value="Degree">Degree</option>
                    <option value="Masters">Masters</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                {newJob.level === 'Other' && (
                  <div>
                    <input type="text" value={newJob.levelOther} onChange={(e) => setNewJob({...newJob, levelOther: e.target.value})} className="input-glass w-full" placeholder="Specify education level" />
                  </div>
                )}
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Country</label>
                  <input type="text" value={newJob.country} className="input-glass w-full" readOnly />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">State/Region</label>
                  <select value={newJob.state} onChange={(e) => setNewJob({...newJob, state: e.target.value})} className="input-glass w-full">
                    <option value="">Select Region</option>
                    {ethiopianRegions.map((region) => (
                      <option key={region} value={region}>{region}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">City</label>
                  <input type="text" value={newJob.city} onChange={(e) => setNewJob({...newJob, city: e.target.value})} className="input-glass w-full" placeholder="City" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Kebele</label>
                  <input type="text" value={newJob.kebele} onChange={(e) => setNewJob({...newJob, kebele: e.target.value})} className="input-glass w-full" placeholder="Kebele" />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Experience Level</label>
                  <select value={newJob.experience} onChange={(e) => setNewJob({...newJob, experience: e.target.value})} className="input-glass w-full">
                    <option value="Not Required">Not Required</option>
                    <option value="Entry Level">Entry Level</option>
                    <option value="Mid Level">Mid Level</option>
                    <option value="Senior Level">Senior Level</option>
                    <option value="Lead">Lead</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                {newJob.experience === 'Other' && (
                  <div>
                    <input type="text" value={newJob.experienceOther} onChange={(e) => setNewJob({...newJob, experienceOther: e.target.value})} className="input-glass w-full" placeholder="Specify experience level" />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Language Required</label>
                <div className="grid md:grid-cols-2 gap-2">
                  {['Afan Oromo', 'English', 'Amharic', 'Tigrigna', 'Somali', 'Other'].map((lang) => (
                    <label key={lang} className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={newJob.language.includes(lang)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewJob({...newJob, language: [...newJob.language, lang]});
                          } else {
                            setNewJob({...newJob, language: newJob.language.filter(l => l !== lang)});
                          }
                        }}
                        className="w-4 h-4" 
                      />
                      <span className="text-sm">{lang}</span>
                    </label>
                  ))}
                </div>
              </div>
              {newJob.language.includes('Other') && (
                <div>
                  <input type="text" value={newJob.languageOther} onChange={(e) => setNewJob({...newJob, languageOther: e.target.value})} className="input-glass w-full" placeholder="Specify other language" />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-2">Tech Stack (Skills)</label>
                <input type="text" value={newJob.skills} onChange={(e) => setNewJob({...newJob, skills: e.target.value})} className="input-glass w-full" placeholder="React, Node.js, Python" />
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={newJob.salaryNegotiable} onChange={(e) => setNewJob({...newJob, salaryNegotiable: e.target.checked})} className="w-4 h-4" />
                  <span className="text-sm">Salary Negotiable</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Job Description</label>
                <textarea value={newJob.description} onChange={(e) => setNewJob({...newJob, description: e.target.value})} className="input-glass w-full h-32" required />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowPostJob(false)} className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-brand-gray hover:bg-gray-50 transition">Cancel</button>
                <button type="submit" className="flex-1 btn-primary">Post Job</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}