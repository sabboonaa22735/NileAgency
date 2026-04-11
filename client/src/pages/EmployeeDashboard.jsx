import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiBriefcase, FiBookmark, FiMessageSquare, FiBell, FiUser, FiLogOut, FiMapPin, FiDollarSign, FiClock, FiMenu, FiSend, FiArrowLeft, FiFileText, FiGlobe, FiSun, FiMoon } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { jobsApi, usersApi, notificationsApi, applicationsApi, chatApi } from '../services/api';
import { io } from 'socket.io-client';

export default function EmployeeDashboard() {
  const [activeTab, setActiveTab] = useState('jobs');
  const [jobs, setJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [profile, setProfile] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ 
    location: '', 
    jobType: '', 
    experienceLevel: '',
    educationLevel: '',
    gender: '',
    state: '',
    skills: ''
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [language, setLanguage] = useState('English');
  const [darkMode, setDarkMode] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [conversations, setConversations] = useState({});
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState({});
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatLoading, setChatLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

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

  useEffect(() => {
    if (!dataLoading && profile && !profile.firstName && !profile.lastName && activeTab === 'jobs') {
      setActiveTab('profile');
    }
  }, [profile, dataLoading]);

  const loadData = async () => {
    setDataLoading(true);
    try {
      const [jobsRes, profileRes, notificationsRes, appsRes] = await Promise.all([
        jobsApi.getAll({ limit: 20 }),
        usersApi.getProfile(),
        notificationsApi.getAll(),
        applicationsApi.myApplications()
      ]);
      setJobs(jobsRes.data.jobs || []);
      setProfile(profileRes.data);
      setNotifications(notificationsRes.data || []);
      setApplications(appsRes.data || []);
      if (profileRes.data?.savedJobs) {
        const saved = await Promise.all(
          profileRes.data.savedJobs.map(id => jobsApi.getById(id))
        );
        setSavedJobs(saved.map(r => r.data));
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setJobs([]);
      setProfile({});
      setNotifications([]);
      setApplications([]);
    }
    setDataLoading(false);
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const res = await jobsApi.getAll({ search: searchQuery, ...filters });
      setJobs(res.data.jobs);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleSaveJob = async (jobId, e) => {
    e?.stopPropagation();
    const isSaved = profile?.savedJobs?.includes(jobId);
    try {
      if (isSaved) {
        await usersApi.removeBookmark(jobId);
      } else {
        await usersApi.bookmarkJob(jobId);
      }
      const profileRes = await usersApi.getProfile();
      setProfile(profileRes.data);
      if (profileRes.data?.savedJobs) {
        const saved = await Promise.all(
          profileRes.data.savedJobs.map(id => jobsApi.getById(id))
        );
        setSavedJobs(saved.map(r => r.data));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleApplyClick = (jobId) => {
    navigate(`/apply/${jobId}`);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      bio: formData.get('bio'),
      skills: formData.get('skills')?.split(',').map(s => s.trim()).filter(Boolean),
      location: formData.get('location'),
      expectedSalary: parseInt(formData.get('expectedSalary')) || 0
    };
    try {
      await usersApi.updateProfile(data);
      loadData();
      alert('Profile saved successfully!');
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.read) {
        await notificationsApi.markAsRead(notification._id);
        setNotifications(prev => prev.map(n => 
          n._id === notification._id ? { ...n, read: true } : n
        ));
      }
      if (notification.link) {
        navigate(notification.link);
      }
      setShowNotifications(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const loadChatContacts = async () => {
    try {
      const res = await chatApi.getContacts();
      const contactsData = res.data || [];
      setContacts(contactsData);
      const convObj = {};
      contactsData.forEach(c => {
        convObj[c._id] = c;
      });
      setConversations(convObj);
      setChatLoading(false);
    } catch (err) {
      console.error('Error loading contacts:', err.response?.data || err.message);
      setChatLoading(false);
    }
  };

  const loadChatConversations = async () => {
    try {
      const res = await chatApi.getConversations();
      const convData = res.data || {};
      if (Object.keys(convData).length > 0) {
        setConversations(convData);
        setChatLoading(false);
      } else {
        loadChatContacts();
      }
    } catch (err) {
      loadChatContacts();
    }
  };

  const loadChatMessages = async (id) => {
    if (!id || typeof id !== 'string' || id === 'undefined' || id === 'null' || id === '' || !id.trim()) return;
    setSelectedChat(id);
    try {
      const res = await chatApi.getMessages(id);
      setMessages(res.data);
      const partner = contacts.find(c => c._id === id);
      if (partner) {
        const updatedConv = { ...conversations };
        updatedConv[id] = { ...partner, lastMessage: res.data[res.data.length - 1] };
        setConversations(updatedConv);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const sendChatMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;
    const tempId = Date.now();
    setMessages(prev => [...prev, { senderId: user._id, receiverId: selectedChat, content: newMessage, tempId }]);
    const msg = newMessage;
    setNewMessage('');
    if (socketRef.current) {
      socketRef.current.emit('sendMessage', {
        senderId: user._id,
        receiverId: selectedChat,
        message: msg
      });
    }
    loadChatConversations();
  };

  const initChatSocket = () => {
    if (!user?._id) return;
    if (!socketRef.current) {
      socketRef.current = io('http://localhost:5001');
    }
    socketRef.current.emit('join', user._id);
    
    socketRef.current.on('userOnline', ({ userId }) => {
      setOnlineUsers(prev => ({ ...prev, [userId]: true }));
    });
    
    socketRef.current.on('userOffline', ({ userId }) => {
      setOnlineUsers(prev => ({ ...prev, [userId]: false }));
    });
    
    socketRef.current.on('newMessage', (msg) => {
      if (msg.senderId === selectedChat || msg.receiverId === selectedChat) {
        setMessages(prev => {
          if (prev.some(m => m._id === msg._id || m.tempId === msg.tempId)) {
            return prev;
          }
          return [...prev, { ...msg, content: msg.content || msg.message }];
        });
      }
      loadChatConversations();
    });
  };

  useEffect(() => {
    if (activeTab === 'messages') {
      loadChatContacts();
      loadChatConversations();
      initChatSocket();
    }
  }, [activeTab]);

  if (dataLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50">
        <div className="w-16 h-16 rounded-full bg-brand-indigo flex items-center justify-center mb-4">
          <span className="text-white font-bold text-2xl">N</span>
        </div>
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-200 border-t-indigo-600"></div>
        <p className="mt-4 text-brand-gray">Loading dashboard...</p>
      </div>
    );
  }

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
            
            <div className="hidden md:flex items-center gap-4">
              <button 
                onClick={() => setActiveTab('jobs')}
                className={`text-sm font-medium transition ${activeTab === 'jobs' ? 'text-brand-indigo' : 'text-brand-gray hover:text-brand-dark'}`}
              >
                Browse Jobs
              </button>
              <button 
                onClick={() => setActiveTab('applications')}
                className={`text-sm font-medium transition ${activeTab === 'applications' ? 'text-brand-indigo' : 'text-brand-gray hover:text-brand-dark'}`}
              >
                My Applications
              </button>
              <button 
                onClick={() => setActiveTab('messages')}
                className={`text-sm font-medium transition ${activeTab === 'messages' ? 'text-brand-indigo' : 'text-brand-gray hover:text-brand-dark'}`}
              >
                Messages
              </button>
              <button 
                onClick={() => setActiveTab('profile')}
                className={`text-sm font-medium transition ${activeTab === 'profile' ? 'text-brand-indigo' : 'text-brand-gray hover:text-brand-dark'}`}
              >
My Profile
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
                        onClick={() => { setLanguage(lang); setShowLangMenu(false); }}
                        className={`w-full text-left px-4 py-2 hover:bg-gray-50 ${language === lang ? 'text-brand-indigo font-medium' : 'text-brand-dark'}`}
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
                  className="relative text-brand-gray hover:text-brand-dark transition"
                >
                  <FiBell className="w-5 h-5" />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  )}
                </button>
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
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
                            onClick={() => handleNotificationClick(notification)}
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
                </AnimatePresence>
              </div>
              
              <div className="relative">
                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="w-9 h-9 rounded-full bg-brand-indigo flex items-center justify-center hover:bg-indigo-600 transition"
                >
                  <span className="text-white font-medium">{user?.email?.[0]?.toUpperCase()}</span>
                </button>
                <AnimatePresence>
                  {showProfileMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50"
                    >
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-brand-dark truncate">{user?.email}</p>
                        <p className="text-xs text-brand-gray capitalize">{user?.role}</p>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setShowProfileMenu(false)}
                        className="w-full px-4 py-2 text-left text-brand-gray hover:bg-gray-50 flex items-center gap-2 transition"
                      >
                        <FiUser className="w-4 h-4" />
                        My Profile
                      </Link>
                      <button
                        onClick={() => { setShowProfileMenu(false); setActiveTab('saved'); }}
                        className="w-full px-4 py-2 text-left text-brand-gray hover:bg-gray-50 flex items-center gap-2 transition"
                      >
                        <FiBookmark className="w-4 h-4" />
                        Saved Jobs
                        {savedJobs.length > 0 && (
                          <span className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                            {savedJobs.length}
                          </span>
                        )}
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
                          onClick={() => { logout(); navigate('/login'); }}
                          className="w-full px-4 py-2 text-left text-red-500 hover:bg-red-50 flex items-center gap-2 transition"
                        >
                          <FiLogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2">
              <FiMenu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass"
          >
            <div className="p-4 space-y-2">
              <button
                onClick={() => { setActiveTab('jobs'); setMobileMenuOpen(false); }}
                className={`flex items-center gap-3 w-full p-3 rounded-xl transition ${
                  activeTab === 'jobs' ? 'bg-brand-indigo text-white' : 'text-brand-gray hover:bg-gray-100'
                }`}
              >
                <FiBriefcase className="w-5 h-5" />
                Browse Jobs
              </button>
              <button
                onClick={() => { setActiveTab('applications'); setMobileMenuOpen(false); }}
                className={`flex items-center gap-3 w-full p-3 rounded-xl transition ${
                  activeTab === 'applications' ? 'bg-brand-indigo text-white' : 'text-brand-gray hover:bg-gray-100'
                }`}
              >
                <FiFileText className="w-5 h-5" />
                My Applications
              </button>
              <button
                onClick={() => { setActiveTab('messages'); setMobileMenuOpen(false); }}
                className={`flex items-center gap-3 w-full p-3 rounded-xl transition ${
                  activeTab === 'messages' ? 'bg-brand-indigo text-white' : 'text-brand-gray hover:bg-gray-100'
                }`}
              >
                <FiMessageSquare className="w-5 h-5" />
                Messages
              </button>
              <button
                onClick={() => { setActiveTab('profile'); setMobileMenuOpen(false); }}
                className={`flex items-center gap-3 w-full p-3 rounded-xl transition ${
                  activeTab === 'profile' ? 'bg-brand-indigo text-white' : 'text-brand-gray hover:bg-gray-100'
                }`}
              >
                <FiUser className="w-5 h-5" />
                My Profile
              </button>
              <button onClick={handleLogout} className="flex items-center gap-3 w-full p-3 rounded-xl text-red-500 hover:bg-red-50 transition">
                <FiLogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <main>
            {activeTab === 'jobs' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="glass rounded-2xl p-4 mb-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search jobs by title..."
                        className="input-glass w-full pl-10"
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      />
                    </div>
                    <button onClick={handleSearch} className="btn-primary">
                      Search
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {jobs.map((job, i) => (
                    <motion.div
                      key={job._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="glass rounded-2xl p-6 card-hover"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-brand-dark mb-2">{job.title}</h3>
                          <p className="text-brand-gray mb-3">{job.recruiterId?.companyName}</p>
                          <div className="flex flex-wrap gap-4 text-sm text-brand-gray">
                            <span className="flex items-center gap-1"><FiMapPin /> {job.location || 'Remote'}</span>
                            {job.city && <span className="flex items-center gap-1"><FiMapPin /> {job.city}</span>}
                            {job.country && <span className="flex items-center gap-1"><FiMapPin /> {job.country}</span>}
                            <span className="flex items-center gap-1"><FiClock /> {job.jobType}</span>
                            <span className="flex items-center gap-1"><FiDollarSign /> {job.salary?.negotiable ? 'Salary Negotiable' : 'Not specified'}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => handleSaveJob(job._id, e)}
                            className={`p-2 rounded-lg hover:bg-gray-100 transition ${profile?.savedJobs?.includes(job._id) ? 'text-brand-indigo' : 'text-brand-gray'}`}
                          >
                            {profile?.savedJobs?.includes(job._id) ? (
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
                            ) : (
                              <FiBookmark className="w-5 h-5" />
                            )}
                          </button>
                          <Link to={`/jobs/${job._id}`} className="btn-primary text-sm">
                            View
                          </Link>
                          <button
                            onClick={() => handleApplyClick(job._id)}
                            className="btn-primary text-sm"
                          >
                            Apply
                          </button>
                        </div>
                      </div>
</motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'applications' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="text-2xl font-bold text-brand-dark mb-6">My Applications</h2>
                <div className="space-y-4">
                  {applications.length === 0 ? (
                    <p className="text-brand-gray">No applications yet</p>
                  ) : (
                    applications.map((app) => (
                      <div key={app._id} className="glass rounded-2xl p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-xl font-semibold text-brand-dark mb-2">{app.jobId?.title}</h3>
                            <p className="text-brand-gray">Applied on {new Date(app.createdAt).toLocaleDateString()}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            app.status === 'accepted' ? 'bg-green-100 text-green-700' :
                            app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            app.status === 'interview' ? 'bg-blue-100 text-blue-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {app.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'saved' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="text-2xl font-bold text-brand-dark mb-6">Saved Jobs</h2>
                <div className="space-y-4">
                  {savedJobs.length === 0 ? (
                    <p className="text-brand-gray">No saved jobs yet</p>
                  ) : (
                    savedJobs.map((job) => (
                      <div key={job._id} className="glass rounded-2xl p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-xl font-semibold text-brand-dark mb-2">{job.title}</h3>
                            <p className="text-brand-gray mb-3">{job.recruiterId?.companyName}</p>
                          </div>
                          <Link to={`/jobs/${job._id}`} className="btn-primary text-sm">
                            View
                          </Link>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'profile' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="text-2xl font-bold text-brand-dark mb-6">Complete Your Profile</h2>
                <div className="glass rounded-2xl p-6">
                  <form onSubmit={handleSaveProfile} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-brand-dark mb-2">First Name</label>
                        <input
                          type="text"
                          name="firstName"
                          defaultValue={profile?.firstName}
                          className="input-glass w-full"
                          placeholder="First name"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-brand-dark mb-2">Last Name</label>
                        <input
                          type="text"
                          name="lastName"
                          defaultValue={profile?.lastName}
                          className="input-glass w-full"
                          placeholder="Last name"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-brand-dark mb-2">Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        defaultValue={profile?.phone}
                        className="input-glass w-full"
                        placeholder="Phone number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-brand-dark mb-2">Location</label>
                      <input
                        type="text"
                        name="location"
                        defaultValue={profile?.location}
                        className="input-glass w-full"
                        placeholder="Your location"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-brand-dark mb-2">Expected Salary</label>
                      <input
                        type="number"
                        name="expectedSalary"
                        defaultValue={profile?.expectedSalary}
                        className="input-glass w-full"
                        placeholder="Expected salary"
                      />
                    </div>
                    <button type="submit" className="btn-primary">
                      Save Profile
                    </button>
                  </form>
                </div>
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="text-2xl font-bold text-brand-dark mb-6">Settings</h2>
                <div className="glass rounded-2xl p-6 space-y-6">
                  <div className="border-b border-gray-100 pb-4">
                    <h3 className="text-lg font-semibold text-brand-dark mb-4">Account Settings</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-brand-dark font-medium">Email Notifications</p>
                          <p className="text-sm text-brand-gray">Receive email updates about your applications</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-indigo"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-brand-dark font-medium">Push Notifications</p>
                          <p className="text-sm text-brand-gray">Receive push notifications on your device</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-indigo"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-brand-dark font-medium">Job Alerts</p>
                          <p className="text-sm text-brand-gray">Get notified when new jobs match your preferences</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-indigo"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-b border-gray-100 pb-4">
                    <h3 className="text-lg font-semibold text-brand-dark mb-4">Language & Region</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-brand-dark mb-2">Language</label>
                        <select className="input-glass w-full">
                          <option value="en">English</option>
                          <option value="am">Amharic</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-brand-dark mb-2">Timezone</label>
                        <select className="input-glass w-full">
                          <option value="Africa/Addis_Ababa">Africa/Addis Ababa (GMT+3)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-brand-dark mb-4">Connected Accounts</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold">L</span>
                          </div>
                          <div>
                            <p className="text-brand-dark font-medium">LinkedIn</p>
                            <p className="text-sm text-brand-gray">Not connected</p>
                          </div>
                        </div>
                        <button className="text-brand-indigo hover:text-indigo-700 text-sm font-medium">Connect</button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'preferences' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="text-2xl font-bold text-brand-dark mb-6">Preferences</h2>
                <div className="glass rounded-2xl p-6 space-y-6">
                  <div className="border-b border-gray-100 pb-4">
                    <h3 className="text-lg font-semibold text-brand-dark mb-4">Job Preferences</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-brand-dark mb-2">Preferred Job Types</label>
                        <div className="flex flex-wrap gap-3">
                          {['full-time', 'part-time', 'contract', 'internship'].map(type => (
                            <label key={type} className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" className="rounded text-brand-indigo" defaultChecked />
                              <span className="text-sm capitalize">{type.replace('-', ' ')}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-brand-dark mb-2">Preferred Locations</label>
                        <div className="flex flex-wrap gap-3">
                          {['Addis Ababa', 'Remote', 'Bahir Dar', 'Hawassa', 'Adama'].map(loc => (
                            <label key={loc} className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" className="rounded text-brand-indigo" defaultChecked />
                              <span className="text-sm">{loc}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-brand-dark mb-2">Minimum Salary Expectation</label>
                        <select className="input-glass w-full md:w-1/2">
                          <option value="">Select minimum salary</option>
                          <option value="5000">5,000 ETB</option>
                          <option value="10000">10,000 ETB</option>
                          <option value="20000">20,000 ETB</option>
                          <option value="30000">30,000 ETB</option>
                          <option value="50000">50,000+ ETB</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-b border-gray-100 pb-4">
                    <h3 className="text-lg font-semibold text-brand-dark mb-4">Resume Visibility</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-brand-dark font-medium">Profile Visibility</p>
                          <p className="text-sm text-brand-gray">Allow recruiters to find your profile</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-indigo"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-brand-dark font-medium">Show Online Status</p>
                          <p className="text-sm text-brand-gray">Let recruiters see when you're online</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-indigo"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-brand-dark mb-4">Application Settings</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-brand-dark mb-2">Auto-apply to Matching Jobs</label>
                        <select className="input-glass w-full md:w-1/2">
                          <option value="off">Off</option>
                          <option value="low">Low matching threshold</option>
                          <option value="medium">Medium matching threshold</option>
                          <option value="high">High matching threshold</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-brand-dark font-medium">Save Draft Applications</p>
                          <p className="text-sm text-brand-gray">Automatically save incomplete applications</p>
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

            {activeTab === 'security' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="text-2xl font-bold text-brand-dark mb-6">Security</h2>
                <div className="glass rounded-2xl p-6 space-y-6">
                  <div className="border-b border-gray-100 pb-4">
                    <h3 className="text-lg font-semibold text-brand-dark mb-4">Password</h3>
                    <form className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-brand-dark mb-2">Current Password</label>
                        <input type="password" className="input-glass w-full md:w-1/2" placeholder="Enter current password" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-brand-dark mb-2">New Password</label>
                        <input type="password" className="input-glass w-full md:w-1/2" placeholder="Enter new password" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-brand-dark mb-2">Confirm New Password</label>
                        <input type="password" className="input-glass w-full md:w-1/2" placeholder="Confirm new password" />
                      </div>
                      <button type="submit" className="btn-primary">Update Password</button>
                    </form>
                  </div>
                  
                  <div className="border-b border-gray-100 pb-4">
                    <h3 className="text-lg font-semibold text-brand-dark mb-4">Two-Factor Authentication</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-brand-dark font-medium">Enable 2FA</p>
                        <p className="text-sm text-brand-gray">Add an extra layer of security to your account</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-indigo"></div>
                      </label>
                    </div>
                  </div>
                  
                  <div className="border-b border-gray-100 pb-4">
                    <h3 className="text-lg font-semibold text-brand-dark mb-4">Active Sessions</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-brand-indigo rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-brand-dark font-medium">Current Session</p>
                            <p className="text-sm text-brand-gray">Chrome on Windows - Addis Ababa</p>
                          </div>
                        </div>
                        <span className="text-green-500 text-sm font-medium">Active</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-brand-dark mb-4">Login History</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <div>
                          <p className="text-sm text-brand-dark">Login from Chrome on Windows</p>
                          <p className="text-xs text-brand-gray">Today, 10:30 AM - Addis Ababa, Ethiopia</p>
                        </div>
                        <span className="text-green-500 text-xs">Success</span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <div>
                          <p className="text-sm text-brand-dark">Login from Mobile App</p>
                          <p className="text-xs text-brand-gray">Yesterday, 3:15 PM - Addis Ababa, Ethiopia</p>
                        </div>
                        <span className="text-green-500 text-xs">Success</span>
                      </div>
                    </div>
                    <button className="mt-4 text-brand-indigo hover:text-indigo-700 text-sm">View Full History</button>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-100">
                    <h3 className="text-lg font-semibold text-brand-dark mb-4 text-red-500">Danger Zone</h3>
                    <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                      <div>
                        <p className="text-brand-dark font-medium">Delete Account</p>
                        <p className="text-sm text-brand-gray">Permanently delete your account and all data</p>
                      </div>
                      <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm">Delete Account</button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </main>
        </div>
      </div>
    );
  }