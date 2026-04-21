import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUsers, FiBriefcase, FiDollarSign, FiMessageSquare, FiLogOut, FiTrash2, FiShield, FiActivity, FiClock, FiEye, FiSend, FiUser, FiArrowLeft, FiPlus, FiEdit, FiFile, FiExternalLink, FiUpload, FiSearch, FiChevronDown, FiMoon, FiSun } from 'react-icons/fi';
import { adminApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';
import { AdminLayout, StatCards, OverviewCards, DataTable, ActivityTimeline, SettingsPage } from '../components/admin';

export default function AdminDashboard() {
  const [darkMode, setDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [payments, setPayments] = useState([]);
  const [applications, setApplications] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showAddJobModal, setShowAddJobModal] = useState(false);
  const [showEditJobModal, setShowEditJobModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [formData, setFormData] = useState({
    email: '', password: '', role: 'employee', firstName: '', lastName: '',
    phone: '', address: '', bio: '', skills: '', companyName: '', industry: '',
    companySize: '', location: '', contactPerson: '', photo: '', resume: '',
    idCard: '', certificate: '', companyLogo: '', businessLicense: '', taxDocument: ''
  });
  const [jobFormData, setJobFormData] = useState({
    title: '', description: '', requirements: '', skills: '', location: '',
    jobType: 'full-time', experienceLevel: 'mid', salaryNegotiable: false,
    benefits: '', applicationDeadline: '', status: 'active', gender: 'both',
    level: 'Not required', levelOther: '', country: 'Ethiopia', state: '', city: '',
    kebele: '', experience: 'Not Required', experienceOther: '', language: [],
    languageOther: '', companyName: ''
  });
  const [jobSearchQuery, setJobSearchQuery] = useState('');
  const [showJobDropdown, setShowJobDropdown] = useState(false);
  const [customJobTitle, setCustomJobTitle] = useState('');
  const ethiopianRegions = ['Addis Ababa', 'Afar', 'Amhara', 'Benishangul-Gumuz', 'Dire Dawa', 'Gambela', 'Harari', 'Oromia', 'Sidama', 'Somali', 'South West Ethiopia Peoples\' Region', 'Tigray', 'Wolaita', 'Other'];
  const ethiopianJobCategories = ['Accountant', 'Administrative Assistant', 'Architect', 'Banker', 'Business Analyst', 'Cashier', 'Chef', 'Civil Engineer', 'Clinical Officer', 'Computer Operator', 'Construction Worker', 'Consultant', 'Content Writer', 'Customer Service', 'Data Analyst', 'Data Entry Clerk', 'Database Administrator', 'Dental Surgeon', 'Designer', 'Doctor', 'Driver', 'Economist', 'Education Teacher', 'Electrical Engineer', 'Electrician', 'Engineer', 'Finance Manager', 'Financial Analyst', 'General Practitioner', 'Graphic Designer', 'HR Manager', 'HR Officer', 'IT Specialist', 'Journalist', 'Lab Technician', 'Lawyer', 'Librarian', 'Logistics Officer', 'Machine Operator', 'Marketing Manager', 'Marketing Officer', 'Mechanical Engineer', 'Medical Doctor', 'Nurse', 'Office Assistant', 'Pharmacist', 'Physical Therapist', 'Pilot', 'Plumber', 'Procurement Officer', 'Project Manager', 'Psychologist', 'Public Relations Officer', 'Quality Assurance', 'Receptionist', 'Researcher', 'Sales Manager', 'Sales Representative', 'Secretary', 'Security Guard', 'Social Worker', 'Software Developer', 'Statistician', 'Stock Clerk', 'Surveyor', 'Teacher', 'Technician', 'Telecommunications Engineer', 'Tour Guide', 'Training Officer', 'Translator', 'Transport Manager', 'Veterinarian', 'Video Editor', 'Warehouse Manager', 'Web Developer', 'Other'];
  const filteredJobCategories = ethiopianJobCategories.filter(job => job.toLowerCase().includes(jobSearchQuery.toLowerCase()));
  const [chatUsers, setChatUsers] = useState([]);
  const [conversations, setConversations] = useState({});
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedChatUser, setSelectedChatUser] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [applicantProfile, setApplicantProfile] = useState(null);
  const [applicationLoading, setApplicationLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const isLoginPage = location.pathname === '/admin/login';
  let socket;

  const getFileUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `http://localhost:3000${url}`;
  };
  const openFile = (url) => {
    const fileUrl = getFileUrl(url);
    if (fileUrl) window.open(fileUrl, '_blank');
  };

  useEffect(() => {
    if (!isLoginPage) { loadData(); initSocket(); }
  }, [isLoginPage]);
  useEffect(() => {
    if (selectedChatUser) loadMessages(selectedChatUser._id);
  }, [selectedChatUser]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'auto' }); }, [messages]);

  const initSocket = () => {
    socket = io('http://localhost:5001');
    const userId = user?._id || user?.id;
    if (userId) {
      socket.emit('join', userId);
      socket.on('newMessage', (msg) => {
        if (msg.senderId === selectedChatUser?._id || msg.receiverId === selectedChatUser?._id) {
          setMessages(prev => {
            if (prev.some(m => (m._id || m.tempId) === (msg._id || msg.tempId))) return prev;
            return [...prev, msg];
          });
        }
        loadConversations();
      });
    }
    return () => { socket.disconnect(); };
  };

  const loadData = async () => {
    try {
      const [statsRes, usersRes, jobsRes, paymentsRes, appsRes, approvalsRes] = await Promise.all([
        adminApi.getDashboard(), adminApi.getUsers(), adminApi.getJobs(),
        adminApi.getPayments(), adminApi.getApplications(), adminApi.getPendingApprovals()
      ]);
      setStats(statsRes.data); setUsers(usersRes.data); setJobs(jobsRes.data);
      setPayments(paymentsRes.data); setApplications(appsRes.data); setPendingApprovals(approvalsRes.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleApprove = async (userId) => {
    try { await adminApi.approveUser(userId); loadData(); } catch (err) { console.error(err); }
  };
  const handleReject = async (userId) => {
    if (!confirm('Are you sure you want to reject this user?')) return;
    try { await adminApi.rejectUser(userId); loadData(); } catch (err) { console.error(err); }
  };
  const handleViewApplication = async (app) => {
    setSelectedApplication(app); setApplicationLoading(true);
    try {
      if (app.employeeId) {
        const res = await adminApi.getUser(app.employeeId._id || app.employeeId);
        setApplicantProfile(res.data);
      } else { setApplicantProfile(null); }
    } catch (err) { console.error(err); setApplicantProfile(null); }
    setApplicationLoading(false);
  };
  const handleApproveApplication = async (applicationId) => {
    try {
      await adminApi.updateApplicationStatus(applicationId, { status: 'accepted' });
      setApplications(applications.map(app => app._id === applicationId ? { ...app, status: 'accepted' } : app));
      setSelectedApplication(null);
      alert('Application approved successfully!');
    } catch (err) { console.error(err); alert('Failed to approve application'); }
  };
  const handleRejectApplication = async (applicationId) => {
    if (!confirm('Are you sure you want to reject this application?')) return;
    try {
      await adminApi.updateApplicationStatus(applicationId, { status: 'rejected' });
      setApplications(applications.map(app => app._id === applicationId ? { ...app, status: 'rejected' } : app));
      setSelectedApplication(null);
    } catch (err) { console.error(err); alert('Failed to reject application'); }
  };
  const handleBackToApplications = () => { setSelectedApplication(null); setApplicantProfile(null); };

  const resetForm = () => {
    setFormData({ email: '', password: '', role: 'employee', firstName: '', lastName: '', phone: '', address: '', bio: '', skills: '', companyName: '', industry: '', companySize: '', location: '', contactPerson: '', photo: '', resume: '', idCard: '', certificate: '', companyLogo: '', businessLicense: '', taxDocument: '' });
  };
  const handleOpenAddModal = () => { resetForm(); setShowAddUserModal(true); };
  const handleOpenEditModal = async (userId) => {
    try {
      const { data } = await adminApi.getUser(userId);
      setEditingUser(data);
      setFormData({
        email: data.user.email, password: '', role: data.user.role,
        firstName: data.profile?.firstName || '', lastName: data.profile?.lastName || '',
        phone: data.profile?.phone || '', address: data.profile?.address || '',
        bio: data.profile?.bio || '', skills: Array.isArray(data.profile?.skills) ? data.profile.skills.join(', ') : '',
        companyName: data.profile?.companyName || '', industry: data.profile?.industry || '',
        companySize: data.profile?.companySize || '', location: data.profile?.location || '',
        contactPerson: data.profile?.contactPerson || '', photo: data.profile?.photo || '',
        resume: data.profile?.resume || '', idCard: data.profile?.idCard || '',
        certificate: data.profile?.certificate || '', companyLogo: data.profile?.companyLogo || '',
        businessLicense: data.profile?.businessLicense || '', taxDocument: data.profile?.taxDocument || ''
      });
      setShowEditUserModal(true);
    } catch (err) { console.error(err); }
  };
  const handleFileUpload = async (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const { data } = await adminApi.uploadFile(file);
      setFormData(prev => ({ ...prev, [fieldName]: data.url }));
    } catch (err) { alert('Failed to upload file'); }
  };
  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, skills: formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(s => s) : [] };
      if (!payload.password) { alert('Password is required'); return; }
      await adminApi.createUser(payload);
      setShowAddUserModal(false); resetForm(); loadData(); alert('User created successfully');
    } catch (err) { alert(err.response?.data?.message || 'Failed to create user'); }
  };
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, skills: formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(s => s) : [] };
      if (!payload.password) delete payload.password;
      await adminApi.updateUser(editingUser.user._id, payload);
      setShowEditUserModal(false); setEditingUser(null); resetForm(); loadData(); alert('User updated successfully');
    } catch (err) { alert(err.response?.data?.message || 'Failed to update user'); }
  };
  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: jobFormData.title, description: jobFormData.description,
        requirements: jobFormData.requirements ? jobFormData.requirements.split(',').map(s => s.trim()).filter(s => s) : [],
        skills: jobFormData.skills ? jobFormData.skills.split(',').map(s => s.trim()).filter(s => s) : [],
        location: jobFormData.location, jobType: jobFormData.jobType, experienceLevel: jobFormData.experienceLevel,
        salary: { negotiable: jobFormData.salaryNegotiable, currency: 'USD' },
        benefits: jobFormData.benefits ? jobFormData.benefits.split(',').map(s => s.trim()).filter(s => s) : [],
        applicationDeadline: jobFormData.applicationDeadline || null, status: 'active',
        gender: jobFormData.gender, level: jobFormData.level === 'other' ? jobFormData.levelOther : jobFormData.level,
        country: jobFormData.country, state: jobFormData.state, city: jobFormData.city,
        kebele: jobFormData.kebele, experience: jobFormData.experience === 'other' ? jobFormData.experienceOther : jobFormData.experience,
        language: jobFormData.language, languageOther: jobFormData.languageOther, companyName: jobFormData.companyName
      };
      await adminApi.createJob(payload);
      setShowAddJobModal(false);
      setJobFormData({ title: '', description: '', requirements: '', skills: '', location: '', jobType: 'full-time', experienceLevel: 'mid', salaryNegotiable: false, benefits: '', applicationDeadline: '', status: 'active', gender: 'both', level: 'Not required', levelOther: '', country: 'Ethiopia', state: '', city: '', kebele: '', experience: 'Not Required', experienceOther: '', language: [], languageOther: '', companyName: '' });
      setCustomJobTitle(''); loadData(); alert('Job created successfully');
    } catch (err) { alert(err.response?.data?.message || 'Failed to create job'); }
  };
  const handleOpenEditJobModal = (job) => {
    setEditingJob(job);
    setCustomJobTitle(job.title && !ethiopianJobCategories.includes(job.title) ? job.title : '');
    setJobFormData({
      title: job.title || '', description: job.description || '',
      requirements: Array.isArray(job.requirements) ? job.requirements.join(', ') : '',
      skills: Array.isArray(job.skills) ? job.skills.join(', ') : '',
      location: job.location || '', jobType: job.jobType || 'full-time',
      experienceLevel: job.experienceLevel || 'mid', salaryNegotiable: job.salary?.negotiable || false,
      benefits: Array.isArray(job.benefits) ? job.benefits.join(', ') : '',
      applicationDeadline: job.applicationDeadline ? new Date(job.applicationDeadline).toISOString().split('T')[0] : '',
      status: job.status || 'active', gender: job.gender || 'both', level: job.level || 'Not required',
      levelOther: '', country: job.country || 'Ethiopia', state: job.state || '', city: job.city || '',
      experience: job.experience || 'Not Required', experienceOther: '', phone: job.phone || '', email: job.email || '',
      companyName: job.companyName || ''
    });
    setShowEditJobModal(true);
  };
  const handleUpdateJob = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: jobFormData.title, description: jobFormData.description,
        requirements: jobFormData.requirements ? jobFormData.requirements.split(',').map(s => s.trim()).filter(s => s) : [],
        skills: jobFormData.skills ? jobFormData.skills.split(',').map(s => s.trim()).filter(s => s) : [],
        location: jobFormData.location, jobType: jobFormData.jobType, experienceLevel: jobFormData.experienceLevel,
        salary: { negotiable: jobFormData.salaryNegotiable, currency: 'USD' },
        benefits: jobFormData.benefits ? jobFormData.benefits.split(',').map(s => s.trim()).filter(s => s) : [],
        applicationDeadline: jobFormData.applicationDeadline || null, status: jobFormData.status,
        gender: jobFormData.gender, level: jobFormData.level === 'other' ? jobFormData.levelOther : jobFormData.level,
        country: jobFormData.country, state: jobFormData.state, city: jobFormData.city,
        experience: jobFormData.experience === 'other' ? jobFormData.experienceOther : jobFormData.experience,
        phone: jobFormData.phone, email: jobFormData.email, companyName: jobFormData.companyName
      };
      await adminApi.updateJob(editingJob._id, payload);
      setShowEditJobModal(false); setEditingJob(null); loadData(); alert('Job updated successfully');
    } catch (err) { alert(err.response?.data?.message || 'Failed to update job'); }
  };
  const handleViewUser = async (userId) => {
    try { const { data } = await adminApi.getUser(userId); setSelectedUser(data); } catch (err) { console.error(err); }
  };
  const closeModal = () => setSelectedUser(null);
  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try { await adminApi.deleteUser(userId); loadData(); } catch (err) { console.error(err); }
  };
  const handleDeleteJob = async (jobId) => {
    if (!confirm('Are you sure you want to delete this job?')) return;
    try { await adminApi.deleteJob(jobId); loadData(); } catch (err) { console.error(err); }
  };
  const handleLogin = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    try {
      const { data } = await adminApi.login({ email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.location.href = '/admin/dashboard';
    } catch (err) { alert('Invalid admin credentials'); }
  };
  const loadChatUsers = async () => { try { const res = await adminApi.getChatUsers(); setChatUsers(res.data); } catch (err) { console.error(err); } };
  const loadConversations = async () => { try { const res = await adminApi.getChatConversations(); setConversations(res.data); } catch (err) { console.error(err); } };
  const loadMessages = async (partnerId) => { try { const res = await adminApi.getChatMessages(partnerId); setMessages(res.data); } catch (err) { console.error(err); } };
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChatUser) return;
    const userId = user?._id || user?.id;
    socket.emit('sendMessage', { senderId: userId, receiverId: selectedChatUser._id, message: newMessage });
    setMessages(prev => [...prev, { senderId: userId, receiverId: selectedChatUser._id, content: newMessage, createdAt: new Date(), tempId: Date.now() }]);
    setNewMessage('');
  };
  const handleSelectChatUser = async (chatUser) => { setSelectedChatUser(chatUser); await loadMessages(chatUser._id); };
  const handleBackToList = () => { setSelectedChatUser(null); setMessages([]); loadConversations(); };

  useEffect(() => {
    if (activeTab === 'messages') { loadChatUsers(); loadConversations(); }
  }, [activeTab]);

  if (isLoginPage) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-all duration-500 ${darkMode ? 'bg-[#0B0F19]' : 'bg-gradient-to-br from-indigo-50 via-white to-indigo-100'}`}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 10 }} className="text-center mb-8">
            <motion.div whileHover={{ rotate: 360, scale: 1.1 }} transition={{ duration: 0.5 }} className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 mb-4 shadow-2xl shadow-indigo-500/30">
              <FiShield className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'} mb-2`}>Admin Login</h1>
            <p className={darkMode ? 'text-slate-400' : 'text-slate-500'}>Access the admin panel</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={`rounded-2xl shadow-2xl p-8 border backdrop-blur-xl ${darkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-100'}`}>
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'} mb-2`}>Email</label>
                <input name="email" type="email" className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition ${darkMode ? 'bg-slate-700/50 border-slate-600 text-white placeholder-slate-400' : 'border-slate-200'}`} required />
              </div>
              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'} mb-2`}>Password</label>
                <input name="password" type="password" className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition ${darkMode ? 'bg-slate-700/50 border-slate-600 text-white placeholder-slate-400' : 'border-slate-200'}`} required />
              </div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="w-full py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 hover:from-indigo-600 hover:via-purple-600 hover:to-cyan-600 text-white font-semibold rounded-xl transition shadow-lg shadow-indigo-500/30">Login</motion.button>
            </form>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  const textPrimary = darkMode ? 'text-slate-100' : 'text-slate-900';
  const textSecondary = darkMode ? 'text-slate-400' : 'text-slate-600';
  const textMuted = darkMode ? 'text-slate-500' : 'text-slate-400';
  const bgCard = darkMode ? 'bg-slate-800/50' : 'bg-white';
  const borderColor = darkMode ? 'border-slate-700/50' : 'border-slate-200';

  const renderDashboardTab = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="mb-6">
        <h2 className={`text-2xl font-bold ${textPrimary}`}>Dashboard</h2>
        <p className={`${textSecondary} mt-1`}>Welcome back! Here's what's happening.</p>
      </div>
      <StatCards stats={stats} darkMode={darkMode} />
      <OverviewCards stats={stats} darkMode={darkMode} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2" />
        <ActivityTimeline darkMode={darkMode} />
      </div>
    </motion.div>
  );

  const renderApprovalsTab = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="mb-6">
        <h2 className={`text-2xl font-bold ${textPrimary}`}>Pending Approvals</h2>
        <p className={`${textSecondary} mt-1`}>Review and manage user registrations.</p>
      </div>
      {pendingApprovals.length === 0 ? (
        <div className={`rounded-2xl border ${borderColor} ${bgCard} p-12 text-center`}>
          <FiActivity className={`w-12 h-12 mx-auto mb-4 ${darkMode ? 'text-emerald-500' : 'text-emerald-600'}`} />
          <p className={`${textSecondary}`}>No pending approvals</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingApprovals.map((approval, index) => (
            <motion.div key={approval._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className={`rounded-2xl border ${borderColor} ${bgCard} p-5 hover:scale-[1.01] transition-transform`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl ${darkMode ? 'bg-indigo-500/20' : 'bg-indigo-100'} flex items-center justify-center`}>
                    <FiUser className={`w-6 h-6 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                  </div>
                  <div>
                    <h3 className={`font-semibold ${textPrimary}`}>{approval.email}</h3>
                    <p className={`text-sm ${textSecondary} mt-0.5`}>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${approval.role === 'recruiter' ? (darkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700') : (darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700')}`}>{approval.role}</span>
                      {' • '}
                      <span className={darkMode ? 'text-amber-400' : 'text-amber-600'}>{approval.registrationStatus}</span>
                    </p>
                    <p className={`text-xs ${textMuted} mt-1`}>Registered: {new Date(approval.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleViewUser(approval._id)} className={`p-2.5 rounded-xl ${darkMode ? 'hover:bg-slate-700 text-blue-400' : 'hover:bg-indigo-50 text-indigo-600'} transition`}><FiEye className="w-4 h-4" /></motion.button>
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleApprove(approval._id)} className={`p-2.5 rounded-xl ${darkMode ? 'hover:bg-slate-700 text-emerald-400' : 'hover:bg-emerald-50 text-emerald-600'} transition`}><FiActivity className="w-4 h-4" /></motion.button>
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleReject(approval._id)} className={`p-2.5 rounded-xl ${darkMode ? 'hover:bg-slate-700 text-red-400' : 'hover:bg-red-50 text-red-600'} transition`}><FiTrash2 className="w-4 h-4" /></motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );

  const renderUsersTab = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className={`text-2xl font-bold ${textPrimary}`}>Users</h2>
          <p className={`${textSecondary} mt-1`}>Manage all registered users.</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleOpenAddModal} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition shadow-lg shadow-indigo-500/25">
          <FiPlus className="w-4 h-4" />Add User
        </motion.button>
      </div>
      <DataTable data={users} darkMode={darkMode} onView={(u) => handleViewUser(u._id)} onEdit={(u) => handleOpenEditModal(u._id)} onDelete={(userId) => handleDeleteUser(userId)} />
    </motion.div>
  );

  const renderJobsTab = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className={`text-2xl font-bold ${textPrimary}`}>Jobs</h2>
          <p className={`${textSecondary} mt-1`}>Manage all job postings.</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowAddJobModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition shadow-lg shadow-indigo-500/25">
          <FiPlus className="w-4 h-4" />Add Job
        </motion.button>
      </div>
      {jobs.length === 0 ? (
        <div className={`rounded-2xl border ${borderColor} ${bgCard} p-12 text-center`}>
          <FiBriefcase className={`w-12 h-12 mx-auto mb-4 ${textMuted}`} />
          <p className={`${textSecondary}`}>No jobs found. Click "Add Job" to create one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map((job, index) => (
            <motion.div key={job._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className={`rounded-2xl border ${borderColor} ${bgCard} p-5 hover:scale-[1.01] transition-transform`}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className={`font-semibold ${textPrimary}`}>{job.title}</h3>
                  <p className={`text-sm ${textSecondary} mt-1`}>{job.recruiterId?.companyName || 'Unknown'}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${job.status === 'active' ? (darkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700') : (darkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700')}`}>{job.status}</span>
                    <span className={`text-xs ${textMuted} flex items-center gap-1`}><FiBriefcase className="w-3 h-3" />{job.jobType}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleOpenEditJobModal(job)} className={`p-2 rounded-xl ${darkMode ? 'hover:bg-slate-700 text-amber-400' : 'hover:bg-amber-50 text-amber-600'} transition`}><FiEdit className="w-4 h-4" /></motion.button>
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleDeleteJob(job._id)} className={`p-2 rounded-xl ${darkMode ? 'hover:bg-slate-700 text-red-400' : 'hover:bg-red-50 text-red-600'} transition`}><FiTrash2 className="w-4 h-4" /></motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );

  const renderPaymentsTab = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="mb-6">
        <h2 className={`text-2xl font-bold ${textPrimary}`}>Payments</h2>
        <p className={`${textSecondary} mt-1`}>Track all payment transactions.</p>
      </div>
      {payments.length === 0 ? (
        <div className={`rounded-2xl border ${borderColor} ${bgCard} p-12 text-center`}>
          <FiDollarSign className={`w-12 h-12 mx-auto mb-4 ${textMuted}`} />
          <p className={`${textSecondary}`}>No payments yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {payments.map((payment, index) => (
            <motion.div key={payment._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className={`rounded-2xl border ${borderColor} ${bgCard} p-5`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`text-2xl font-bold ${textPrimary}`}>${payment.amount}</h3>
                  <p className={`text-sm ${textSecondary}`}>{payment.type}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${payment.status === 'completed' ? (darkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700') : payment.status === 'pending' ? (darkMode ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700') : (darkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700')}`}>{payment.status}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );

  const renderApplicationsTab = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="mb-6">
        <h2 className={`text-2xl font-bold ${textPrimary}`}>Applications</h2>
        <p className={`${textSecondary} mt-1`}>Review job applications.</p>
      </div>
      {selectedApplication ? (
        <div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleBackToApplications} className={`flex items-center gap-2 mb-4 ${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'}`}><FiArrowLeft className="w-4 h-4" />Back to Applications</motion.button>
          {applicationLoading ? (
            <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent" /></div>
          ) : applicantProfile ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className={`rounded-2xl border ${borderColor} ${bgCard} p-5`}>
                  <h3 className={`text-lg font-semibold ${textPrimary} mb-4`}>Applicant Information</h3>
                  <div className="space-y-4">
                    <div><span className={`text-sm ${textMuted}`}>Name</span><p className={`font-medium ${textPrimary}`}>{applicantProfile.firstName} {applicantProfile.lastName}</p></div>
                    <div><span className={`text-sm ${textMuted}`}>Email</span><p className={textPrimary}>{applicantProfile.email || 'Not provided'}</p></div>
                    <div><span className={`text-sm ${textMuted}`}>Phone</span><p className={textPrimary}>{applicantProfile.phone || 'Not provided'}</p></div>
                    {applicantProfile.skills?.length > 0 && (
                      <div><span className={`text-sm ${textMuted}`}>Skills</span><div className="flex flex-wrap gap-2 mt-1">{applicantProfile.skills.map((skill, i) => (<span key={i} className={`px-2 py-1 rounded-full text-xs ${darkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-700'}`}>{skill}</span>))}</div></div>
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                  <div className={`rounded-2xl border ${borderColor} ${bgCard} p-5`}>
                    <h3 className={`text-lg font-semibold ${textPrimary} mb-4`}>Job Applied</h3>
                    <p className={`font-medium ${textPrimary}`}>{selectedApplication.jobId?.title}</p>
                    <p className={`text-sm ${textSecondary} mt-1`}>{selectedApplication.jobId?.location}</p>
                  </div>
                  <div className={`rounded-2xl border ${borderColor} ${bgCard} p-5`}>
                    <h3 className={`text-lg font-semibold ${textPrimary} mb-4`}>Status</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${selectedApplication.status === 'accepted' ? (darkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700') : selectedApplication.status === 'rejected' ? (darkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700') : (darkMode ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700')}`}>{selectedApplication.status}</span>
                  </div>
                </div>
              </div>
              {selectedApplication.status === 'pending' && (
                <div className="flex gap-4">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => handleApproveApplication(selectedApplication._id)} className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition"><FiActivity className="w-5 h-5" />Approve</motion.button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => handleRejectApplication(selectedApplication._id)} className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition"><FiTrash2 className="w-5 h-5" />Reject</motion.button>
                </div>
              )}
            </div>
          ) : <p className={`${textSecondary} text-center py-8`}>No applicant information found</p>}
        </div>
      ) : (
        <div className="space-y-4">
          {applications.length === 0 ? (
            <p className={`${textSecondary} text-center py-8`}>No applications yet</p>
          ) : (
            applications.map((app, index) => (
              <motion.div key={app._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className={`rounded-2xl border ${borderColor} ${bgCard} p-5 hover:scale-[1.01] transition-transform`}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className={`font-semibold ${textPrimary}`}>{app.jobId?.title || 'Unknown Job'}</h3>
                    <p className={`text-sm ${textSecondary} mt-1`}>Applicant: {app.employeeId?._id?.slice(0, 8) || 'Unknown'}</p>
                    <p className={`text-xs ${textMuted} mt-1`}>Applied: {new Date(app.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleViewApplication(app)} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg ${darkMode ? 'hover:bg-slate-700 text-indigo-400' : 'hover:bg-indigo-50 text-indigo-600'} transition`}><FiEye className="w-4 h-4" />Review</motion.button>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${app.status === 'accepted' ? (darkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700') : app.status === 'rejected' ? (darkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700') : (darkMode ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700')}`}>{app.status}</span>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}
    </motion.div>
  );

  const renderSettingsTab = () => <SettingsPage darkMode={darkMode} onDarkModeChange={setDarkMode} />;

  const renderMessagesTab = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`rounded-2xl border ${borderColor} ${bgCard} overflow-hidden`}>
      <div className="flex h-[calc(100vh-12rem)]">
        <div className={`${selectedChatUser ? 'hidden md:block' : 'block'} w-full md:w-1/3 border-r ${borderColor}`}>
          <div className={`p-5 border-b ${borderColor} ${darkMode ? 'bg-indigo-600' : 'bg-indigo-600'}`}>
            <h2 className="text-lg font-semibold text-white">Messages</h2>
            <p className="text-indigo-200 text-sm">Chat with users</p>
          </div>
          <div className="overflow-y-auto h-[calc(100%-5rem)]">
            {Object.keys(conversations).length === 0 && chatUsers.length === 0 ? (
              <div className={`p-4 text-center ${textSecondary}`}>No conversations yet</div>
            ) : (
              <>
                {Object.entries(conversations).map(([userId, conv]) => {
                  const convUser = conv.user || {};
                  const displayName = convUser.email || convUser.firstName ? (convUser.firstName ? `${convUser.firstName} ${convUser.lastName || ''}` : convUser.email) : 'Unknown User';
                  return (
                    <button key={userId} onClick={() => handleSelectChatUser({ _id: userId, email: convUser.email, role: convUser.role, firstName: convUser.firstName, lastName: convUser.lastName })} className={`flex items-center gap-3 w-full p-4 ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-indigo-50'} transition border-b ${darkMode ? 'border-slate-800' : 'border-slate-100'} ${selectedChatUser?._id === userId ? (darkMode ? 'bg-slate-700' : 'bg-indigo-50') : ''}`}>
                      <div className={`w-10 h-10 rounded-full ${darkMode ? 'bg-indigo-500' : 'bg-indigo-600'} flex items-center justify-center`}><FiUser className="w-5 h-5 text-white" /></div>
                      <div className="flex-1 text-left min-w-0"><p className={`font-medium ${textPrimary} truncate`}>{displayName}</p><p className={`text-xs ${textMuted} truncate`}>{conv.lastMessage}</p></div>
                      {conv.unread > 0 && <span className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">{conv.unread}</span>}
                    </button>
                  );
                })}
                {chatUsers.filter(u => !conversations[u._id]).map(u => {
                  const displayName = u.firstName ? `${u.firstName} ${u.lastName || ''}` : u.email;
                  return (
                    <button key={u._id} onClick={() => handleSelectChatUser(u)} className={`flex items-center gap-3 w-full p-4 ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-indigo-50'} transition border-b ${darkMode ? 'border-slate-800' : 'border-slate-100'} ${selectedChatUser?._id === u._id ? (darkMode ? 'bg-slate-700' : 'bg-indigo-50') : ''}`}>
                      <div className={`w-10 h-10 rounded-full ${darkMode ? 'bg-indigo-500' : 'bg-indigo-600'} flex items-center justify-center`}><FiUser className="w-5 h-5 text-white" /></div>
                      <div className="flex-1 text-left min-w-0"><p className={`font-medium ${textPrimary} truncate`}>{displayName}</p><p className={`text-xs ${textSecondary} capitalize`}>{u.role}</p></div>
                    </button>
                  );
                })}
              </>
            )}
          </div>
        </div>
        <div className={`${selectedChatUser ? 'block' : 'hidden md:block'} flex-1 flex flex-col`}>
          {selectedChatUser ? (
            <>
              <div className={`p-4 border-b ${borderColor} flex items-center gap-3`}>
                <button onClick={handleBackToList} className={`md:hidden p-2 rounded-lg ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-200'} transition`}><FiArrowLeft className={`w-5 h-5 ${textSecondary}`} /></button>
                <div className={`w-10 h-10 rounded-full ${darkMode ? 'bg-indigo-500' : 'bg-indigo-600'} flex items-center justify-center`}><FiUser className="w-5 h-5 text-white" /></div>
                <div><p className={`font-medium ${textPrimary}`}>{selectedChatUser.firstName ? `${selectedChatUser.firstName} ${selectedChatUser.lastName || ''}` : selectedChatUser.email}</p><p className={`text-xs ${textSecondary} capitalize`}>{selectedChatUser.role}</p></div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-900/30">
                {messages.map((msg, i) => {
                  const currentUserId = user?._id || user?.id;
                  const isMe = msg.senderId === currentUserId;
                  return (
                    <motion.div key={msg._id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs md:max-w-md px-4 py-2.5 rounded-2xl ${isMe ? (darkMode ? 'bg-indigo-600 text-white' : 'bg-indigo-600 text-white') : (darkMode ? 'bg-slate-700 text-slate-100' : 'bg-white border border-slate-200 text-slate-900')}`}>
                        <p>{msg.content}</p>
                        <p className={`text-xs mt-1 ${isMe ? 'text-indigo-200' : textMuted}`}>{new Date(msg.createdAt || msg.timestamp).toLocaleTimeString()}</p>
                      </div>
                    </motion.div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
              <form onSubmit={handleSendMessage} className={`p-4 border-t ${borderColor} ${darkMode ? 'bg-slate-800/50' : 'bg-white'}`}>
                <div className="flex gap-2">
                  <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." className={`flex-1 px-4 py-3 rounded-xl border ${borderColor} ${darkMode ? 'bg-slate-700/50 text-slate-100 placeholder:text-slate-500' : 'bg-slate-50 text-slate-900 placeholder:text-slate-400'} focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition`} />
                  <motion.button type="submit" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} disabled={!newMessage.trim()} className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed"><FiSend className="w-5 h-5" /></motion.button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center"><FiMessageSquare className={`w-12 h-12 mx-auto mb-4 ${textMuted}`} /><p className={textSecondary}>Select a user to start chatting</p></div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard': return renderDashboardTab();
      case 'approvals': return renderApprovalsTab();
      case 'users': return renderUsersTab();
      case 'jobs': return renderJobsTab();
      case 'payments': return renderPaymentsTab();
      case 'applications': return renderApplicationsTab();
      case 'messages': return renderMessagesTab();
      case 'settings': return renderSettingsTab();
      default: return renderDashboardTab();
    }
  };

  return (
    <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab} darkMode={darkMode} setDarkMode={setDarkMode} pendingCount={pendingApprovals.length} onLogout={logout} user={user}>
      {renderContent()}
    </AdminLayout>
  );
}