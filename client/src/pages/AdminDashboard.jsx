import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUsers, FiBriefcase, FiDollarSign, FiMessageSquare, FiLogOut, FiTrash2, FiShield, FiActivity, FiCheck, FiX, FiClock, FiEye, FiSend, FiUser, FiArrowLeft, FiPlus, FiEdit, FiFile, FiExternalLink, FiUpload, FiSearch, FiChevronDown } from 'react-icons/fi';
import { adminApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';

let socket;

export default function AdminDashboard() {
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
    email: '',
    password: '',
    role: 'employee',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    bio: '',
    skills: '',
    companyName: '',
    industry: '',
    companySize: '',
    location: '',
    contactPerson: '',
    photo: '',
    resume: '',
    idCard: '',
    certificate: '',
    companyLogo: '',
    businessLicense: '',
    taxDocument: ''
  });
  const [jobFormData, setJobFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    skills: '',
    location: '',
    jobType: 'full-time',
    experienceLevel: 'mid',
    salaryNegotiable: false,
    benefits: '',
    applicationDeadline: '',
    status: 'active',
    gender: 'both',
    level: 'Not required',
    levelOther: '',
    country: 'Ethiopia',
    state: '',
    city: '',
    kebele: '',
    experience: 'Not Required',
    experienceOther: '',
    language: [],
    languageOther: '',
    companyName: ''
  });

  const [jobSearchQuery, setJobSearchQuery] = useState('');
  const [showJobDropdown, setShowJobDropdown] = useState(false);
  const [customJobTitle, setCustomJobTitle] = useState('');

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

  const getFileUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `http://localhost:3000${url}`;
  };

  const openFile = (url) => {
    const fileUrl = getFileUrl(url);
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    }
  };

  useEffect(() => {
    if (!isLoginPage) {
      loadData();
      initSocket();
    }
  }, [isLoginPage]);

  useEffect(() => {
    if (selectedChatUser) {
      loadMessages(selectedChatUser._id);
    }
  }, [selectedChatUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [messages]);

  const initSocket = () => {
    socket = io('http://localhost:5001');
    
    const userId = user?._id || user?.id;
    if (userId) {
      socket.emit('join', userId);
      
      socket.on('newMessage', (msg) => {
        if (msg.senderId === selectedChatUser?._id || msg.receiverId === selectedChatUser?._id) {
          setMessages(prev => {
            if (prev.some(m => (m._id || m.tempId) === (msg._id || msg.tempId))) {
              return prev;
            }
            return [...prev, msg];
          });
        }
        loadConversations();
      });
    }
    
    return () => {
      socket.disconnect();
    };
  };

  const loadData = async () => {
    try {
      const [statsRes, usersRes, jobsRes, paymentsRes, appsRes, approvalsRes] = await Promise.all([
        adminApi.getDashboard(),
        adminApi.getUsers(),
        adminApi.getJobs(),
        adminApi.getPayments(),
        adminApi.getApplications(),
        adminApi.getPendingApprovals()
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setJobs(jobsRes.data);
      setPayments(paymentsRes.data);
      setApplications(appsRes.data);
      setPendingApprovals(approvalsRes.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleApprove = async (userId) => {
    try {
      await adminApi.approveUser(userId);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (userId) => {
    if (!confirm('Are you sure you want to reject this user?')) return;
    try {
      await adminApi.rejectUser(userId);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleViewApplication = async (app) => {
    setSelectedApplication(app);
    setApplicationLoading(true);
    try {
      if (app.employeeId) {
        const res = await adminApi.getUser(app.employeeId._id || app.employeeId);
        setApplicantProfile(res.data);
      } else {
        setApplicantProfile(null);
      }
    } catch (err) {
      console.error(err);
      setApplicantProfile(null);
    }
    setApplicationLoading(false);
  };

  const handleApproveApplication = async (applicationId) => {
    try {
      await adminApi.updateApplicationStatus(applicationId, { status: 'accepted' });
      setApplications(applications.map(app => 
        app._id === applicationId ? { ...app, status: 'accepted' } : app
      ));
      setSelectedApplication(null);
      alert('Application approved successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to approve application');
    }
  };

  const handleRejectApplication = async (applicationId) => {
    if (!confirm('Are you sure you want to reject this application?')) return;
    try {
      await adminApi.updateApplicationStatus(applicationId, { status: 'rejected' });
      setApplications(applications.map(app => 
        app._id === applicationId ? { ...app, status: 'rejected' } : app
      ));
      setSelectedApplication(null);
    } catch (err) {
      console.error(err);
      alert('Failed to reject application');
    }
  };

  const handleBackToApplications = () => {
    setSelectedApplication(null);
    setApplicantProfile(null);
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      role: 'employee',
      firstName: '',
      lastName: '',
      phone: '',
      address: '',
      bio: '',
      skills: '',
      companyName: '',
      industry: '',
      companySize: '',
      location: '',
      contactPerson: '',
      photo: '',
      resume: '',
      idCard: '',
      certificate: '',
      companyLogo: '',
      businessLicense: '',
      taxDocument: ''
    });
  };

  const handleOpenAddModal = () => {
    resetForm();
    setShowAddUserModal(true);
  };

  const handleOpenEditModal = async (userId) => {
    try {
      const { data } = await adminApi.getUser(userId);
      setEditingUser(data);
      setFormData({
        email: data.user.email,
        password: '',
        role: data.user.role,
        firstName: data.profile?.firstName || '',
        lastName: data.profile?.lastName || '',
        phone: data.profile?.phone || '',
        address: data.profile?.address || '',
        bio: data.profile?.bio || '',
        skills: Array.isArray(data.profile?.skills) ? data.profile.skills.join(', ') : '',
        companyName: data.profile?.companyName || '',
        industry: data.profile?.industry || '',
        companySize: data.profile?.companySize || '',
        location: data.profile?.location || '',
        contactPerson: data.profile?.contactPerson || '',
        photo: data.profile?.photo || '',
        resume: data.profile?.resume || '',
        idCard: data.profile?.idCard || '',
        certificate: data.profile?.certificate || '',
        companyLogo: data.profile?.companyLogo || '',
        businessLicense: data.profile?.businessLicense || '',
        taxDocument: data.profile?.taxDocument || ''
      });
      setShowEditUserModal(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileUpload = async (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const { data } = await adminApi.uploadFile(file);
      setFormData(prev => ({ ...prev, [fieldName]: data.url }));
    } catch (err) {
      alert('Failed to upload file');
    }
  };

  const renderFileUpload = (label, fieldName, accept = "*") => {
    const hasFile = formData[fieldName];
    const fileName = hasFile ? formData[fieldName].split('/').pop() : '';
    
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <div className="flex items-center gap-2">
          <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition">
            <FiUpload className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">{hasFile ? 'Change File' : 'Upload'}</span>
            <input
              type="file"
              accept={accept}
              className="hidden"
              onChange={(e) => handleFileUpload(e, fieldName)}
            />
          </label>
          {hasFile && (
            <button
              onClick={() => openFile(formData[fieldName])}
              className="flex items-center gap-1 px-3 py-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition"
            >
              <FiExternalLink className="w-4 h-4" />
            </button>
          )}
        </div>
        {hasFile && (
          <p className="text-xs text-gray-500 mt-1 truncate">{fileName}</p>
        )}
      </div>
    );
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        skills: formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(s => s) : []
      };
      if (!payload.password) {
        alert('Password is required');
        return;
      }
      await adminApi.createUser(payload);
      setShowAddUserModal(false);
      resetForm();
      loadData();
      alert('User created successfully');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create user');
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        skills: formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(s => s) : []
      };
      if (!payload.password) delete payload.password;
      await adminApi.updateUser(editingUser.user._id, payload);
      setShowEditUserModal(false);
      setEditingUser(null);
      resetForm();
      loadData();
      alert('User updated successfully');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user');
    }
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: jobFormData.title,
        description: jobFormData.description,
        requirements: jobFormData.requirements ? jobFormData.requirements.split(',').map(s => s.trim()).filter(s => s) : [],
        skills: jobFormData.skills ? jobFormData.skills.split(',').map(s => s.trim()).filter(s => s) : [],
        location: jobFormData.location,
        jobType: jobFormData.jobType,
        experienceLevel: jobFormData.experienceLevel,
        salary: {
          negotiable: jobFormData.salaryNegotiable,
          currency: 'USD'
        },
        benefits: jobFormData.benefits ? jobFormData.benefits.split(',').map(s => s.trim()).filter(s => s) : [],
        applicationDeadline: jobFormData.applicationDeadline || null,
        status: 'active',
        gender: jobFormData.gender,
        level: jobFormData.level === 'other' ? jobFormData.levelOther : jobFormData.level,
        country: jobFormData.country,
        state: jobFormData.state,
        city: jobFormData.city,
        kebele: jobFormData.kebele,
        experience: jobFormData.experience === 'other' ? jobFormData.experienceOther : jobFormData.experience,
        language: jobFormData.language,
        languageOther: jobFormData.languageOther,
        companyName: jobFormData.companyName
      };
      await adminApi.createJob(payload);
      setShowAddJobModal(false);
      setJobFormData({
        title: '',
        description: '',
        requirements: '',
        skills: '',
        location: '',
        jobType: 'full-time',
        experienceLevel: 'mid',
        salaryNegotiable: false,
        benefits: '',
        applicationDeadline: '',
        status: 'active',
        gender: 'both',
        level: 'Not required',
        levelOther: '',
        country: 'Ethiopia',
        state: '',
        city: '',
        kebele: '',
        experience: 'Not Required',
        experienceOther: '',
        language: [],
        languageOther: '',
        companyName: ''
      });
      setCustomJobTitle('');
      loadData();
      alert('Job created successfully');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create job');
    }
  };

  const handleOpenEditJobModal = (job) => {
    setEditingJob(job);
    setCustomJobTitle(job.title && !ethiopianJobCategories.includes(job.title) ? job.title : '');
    setJobFormData({
      title: job.title || '',
      description: job.description || '',
      requirements: Array.isArray(job.requirements) ? job.requirements.join(', ') : '',
      skills: Array.isArray(job.skills) ? job.skills.join(', ') : '',
      location: job.location || '',
      jobType: job.jobType || 'full-time',
      experienceLevel: job.experienceLevel || 'mid',
      salaryNegotiable: job.salary?.negotiable || false,
      benefits: Array.isArray(job.benefits) ? job.benefits.join(', ') : '',
      applicationDeadline: job.applicationDeadline ? new Date(job.applicationDeadline).toISOString().split('T')[0] : '',
      status: job.status || 'active',
      gender: job.gender || 'both',
      level: job.level || 'Not required',
      levelOther: '',
      country: job.country || 'Ethiopia',
      state: job.state || '',
      city: job.city || '',
      experience: job.experience || 'Not Required',
      experienceOther: '',
      phone: job.phone || '',
      email: job.email || '',
      companyName: job.companyName || ''
    });
    setShowEditJobModal(true);
  };

  const handleUpdateJob = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: jobFormData.title,
        description: jobFormData.description,
        requirements: jobFormData.requirements ? jobFormData.requirements.split(',').map(s => s.trim()).filter(s => s) : [],
        skills: jobFormData.skills ? jobFormData.skills.split(',').map(s => s.trim()).filter(s => s) : [],
        location: jobFormData.location,
        jobType: jobFormData.jobType,
        experienceLevel: jobFormData.experienceLevel,
        salary: {
          negotiable: jobFormData.salaryNegotiable,
          currency: 'USD'
        },
        benefits: jobFormData.benefits ? jobFormData.benefits.split(',').map(s => s.trim()).filter(s => s) : [],
        applicationDeadline: jobFormData.applicationDeadline || null,
        status: jobFormData.status,
        gender: jobFormData.gender,
        level: jobFormData.level === 'other' ? jobFormData.levelOther : jobFormData.level,
        country: jobFormData.country,
        state: jobFormData.state,
        city: jobFormData.city,
        experience: jobFormData.experience === 'other' ? jobFormData.experienceOther : jobFormData.experience,
        phone: jobFormData.phone,
        email: jobFormData.email,
        companyName: jobFormData.companyName
      };
      await adminApi.updateJob(editingJob._id, payload);
      setShowEditJobModal(false);
      setEditingJob(null);
      loadData();
      alert('Job updated successfully');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update job');
    }
  };

  const handleViewUser = async (userId) => {
    try {
      const { data } = await adminApi.getUser(userId);
      setSelectedUser(data);
    } catch (err) {
      console.error(err);
    }
  };

  const closeModal = () => setSelectedUser(null);

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await adminApi.deleteUser(userId);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!confirm('Are you sure you want to delete this job?')) return;
    try {
      await adminApi.deleteJob(jobId);
      loadData();
    } catch (err) {
      console.error(err);
    }
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
    } catch (err) {
      alert('Invalid admin credentials');
    }
  };

  const loadChatUsers = async () => {
    try {
      const res = await adminApi.getChatUsers();
      setChatUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadConversations = async () => {
    try {
      const res = await adminApi.getChatConversations();
      setConversations(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadMessages = async (partnerId) => {
    try {
      const res = await adminApi.getChatMessages(partnerId);
      setMessages(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChatUser) return;
    
    const userId = user?._id || user?.id;
    const tempId = Date.now();
    
    socket.emit('sendMessage', {
      senderId: userId,
      receiverId: selectedChatUser._id,
      message: newMessage
    });
    
    setMessages(prev => [...prev, {
      senderId: userId,
      receiverId: selectedChatUser._id,
      content: newMessage,
      createdAt: new Date(),
      tempId
    }]);
    
    setNewMessage('');
  };

  const handleSelectChatUser = async (chatUser) => {
    setSelectedChatUser(chatUser);
    await loadMessages(chatUser._id);
  };

  const handleBackToList = () => {
    setSelectedChatUser(null);
    setMessages([]);
    loadConversations();
  };

  if (isLoginPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-indigo-100">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 mb-4">
              <FiShield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Login</h1>
            <p className="text-gray-500">Access the admin panel</p>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input name="email" type="email" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input name="password" type="password" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" required />
              </div>
              <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition shadow-lg shadow-indigo-200">
                Login
              </button>
            </form>
            <div className="mt-4 text-center">
              <Link to="/" className="text-sm text-gray-500 hover:text-indigo-600">Back to Home</Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  useEffect(() => {
    if (activeTab === 'messages') {
      loadChatUsers();
      loadConversations();
    }
  }, [activeTab]);

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: FiUsers, color: 'bg-indigo-500' },
    { label: 'Total Jobs', value: stats?.totalJobs || 0, icon: FiBriefcase, color: 'bg-indigo-600' },
    { label: 'Active Jobs', value: stats?.activeJobs || 0, icon: FiActivity, color: 'bg-indigo-700' },
    { label: 'Total Revenue', value: `$${stats?.totalRevenue || 0}`, icon: FiDollarSign, color: 'bg-indigo-800' }
  ];

  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/admin" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
                <FiShield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Admin Panel</span>
            </Link>
            <div className="flex items-center gap-4">
              <button onClick={logout} className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition">
                <FiLogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition"
            >
              <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center mb-4`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-gray-500 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          <div className="md:col-span-1 space-y-2">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: FiActivity },
              { id: 'approvals', label: 'Approvals', icon: FiClock, badge: pendingApprovals.length },
              { id: 'users', label: 'Users', icon: FiUsers },
              { id: 'jobs', label: 'Jobs', icon: FiBriefcase },
              { id: 'payments', label: 'Payments', icon: FiDollarSign },
              { id: 'applications', label: 'Applications', icon: FiMessageSquare },
              { id: 'messages', label: 'Messages', icon: FiMessageSquare }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 w-full p-3 rounded-xl transition ${
                  activeTab === tab.id 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'bg-gray-50 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
                {tab.badge > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="md:col-span-3">
            {activeTab === 'dashboard' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Overview</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                    <div className="text-4xl font-bold text-indigo-600 mb-2">{stats?.totalUsers || 0}</div>
                    <div className="text-gray-600">Total Users</div>
                  </div>
                  <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                    <div className="text-4xl font-bold text-indigo-600 mb-2">{stats?.totalEmployees || 0}</div>
                    <div className="text-gray-600">Employees</div>
                  </div>
                  <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                    <div className="text-4xl font-bold text-indigo-600 mb-2">{stats?.totalRecruiters || 0}</div>
                    <div className="text-gray-600">Recruiters</div>
                  </div>
                  <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                    <div className="text-4xl font-bold text-indigo-600 mb-2">{stats?.pendingApplications || 0}</div>
                    <div className="text-gray-600">Pending Applications</div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'approvals' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Pending Approvals</h2>
                {pendingApprovals.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No pending approvals</p>
                ) : (
                  <div className="space-y-4">
                    {pendingApprovals.map((approval) => (
                      <div key={approval._id} className="flex justify-between items-center p-4 rounded-xl bg-gray-50 border border-gray-100">
                        <div>
                          <h3 className="text-gray-900 font-medium">{approval.email}</h3>
                          <p className="text-gray-500 text-sm">
                            {approval.role} - {approval.registrationStatus}
                          </p>
                          <p className="text-gray-400 text-xs mt-1">
                            Registered: {new Date(approval.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleViewUser(approval._id)}
                            className="p-2 rounded-lg text-indigo-600 hover:bg-indigo-100 transition"
                            title="View Details"
                          >
                            <FiEye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleApprove(approval._id)}
                            className="p-2 rounded-lg text-green-600 hover:bg-green-100 transition"
                            title="Approve"
                          >
                            <FiCheck className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleReject(approval._id)}
                            className="p-2 rounded-lg text-red-600 hover:bg-red-100 transition"
                            title="Reject"
                          >
                            <FiX className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'users' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">All Users</h2>
                  <button
                    onClick={handleOpenAddModal}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition shadow-md shadow-indigo-200"
                  >
                    <FiPlus className="w-5 h-5" />
                    Add User
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-gray-500 font-medium">Email</th>
                        <th className="text-left py-3 px-4 text-gray-500 font-medium">Role</th>
                        <th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th>
                        <th className="text-left py-3 px-4 text-gray-500 font-medium">Created</th>
                        <th className="text-left py-3 px-4 text-gray-500 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u._id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-gray-900">{u.email}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              u.role === 'admin' ? 'bg-purple-100 text-purple-600' :
                              u.role === 'recruiter' ? 'bg-green-100 text-green-600' :
                              'bg-blue-100 text-blue-600'
                            }`}>
                              {u.role || 'unverified'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              u.registrationStatus === 'approved' ? 'bg-green-100 text-green-600' :
                              u.registrationStatus === 'pending_approval' ? 'bg-yellow-100 text-yellow-600' :
                              'bg-red-100 text-red-600'
                            }`}>
                              {u.registrationStatus || 'N/A'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-500">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleOpenEditModal(u._id)}
                                className="p-2 rounded-lg text-indigo-600 hover:bg-indigo-100 transition"
                                title="Edit User"
                              >
                                <FiEdit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleViewUser(u._id)}
                                className="p-2 rounded-lg text-blue-600 hover:bg-blue-100 transition"
                                title="View Details"
                              >
                                <FiEye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u._id)}
                                className="p-2 rounded-lg text-red-600 hover:bg-red-100 transition"
                                title="Delete User"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'jobs' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">All Jobs</h2>
                  <button
                    onClick={() => setShowAddJobModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
                  >
                    <FiPlus className="w-4 h-4" /> Add Job
                  </button>
                </div>
                <div className="space-y-4">
                  {jobs.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No jobs found. Click "Add Job" to create one.
                    </div>
                  ) : (
                    jobs.map(job => (
                      <div key={job._id} className="flex justify-between items-center p-4 rounded-xl bg-gray-50 border border-gray-100">
                        <div>
                          <h3 className="text-gray-900 font-medium">{job.title}</h3>
                          <p className="text-gray-500 text-sm">{job.recruiterId?.companyName || 'Unknown'}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            job.status === 'active' ? 'bg-green-100 text-green-600' :
                            'bg-red-100 text-red-600'
                          }`}>
                            {job.status}
                          </span>
                          <button
                            onClick={() => handleOpenEditJobModal(job)}
                            className="p-2 rounded-lg text-indigo-600 hover:bg-indigo-100 transition"
                            title="Edit Job"
                          >
                            <FiEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteJob(job._id)}
                            className="p-2 rounded-lg text-red-600 hover:bg-red-100 transition"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'payments' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Payments</h2>
                <div className="space-y-4">
                  {payments.map(payment => (
                    <div key={payment._id} className="flex justify-between items-center p-4 rounded-xl bg-gray-50 border border-gray-100">
                      <div>
                        <h3 className="text-gray-900 font-medium">${payment.amount}</h3>
                        <p className="text-gray-500 text-sm">{payment.type}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        payment.status === 'completed' ? 'bg-green-100 text-green-600' :
                        payment.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-red-100 text-red-600'
                      }`}>
                        {payment.status}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'applications' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Applications</h2>
                {selectedApplication ? (
                  <div>
                    <button
                      onClick={handleBackToApplications}
                      className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 mb-4"
                    >
                      <FiArrowLeft className="w-4 h-4" />
                      Back to Applications
                    </button>
                    
                    {applicationLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent"></div>
                      </div>
                    ) : applicantProfile ? (
                      <div className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Applicant Information</h3>
                            <div className="space-y-3">
                              <div>
                                <span className="text-gray-500 text-sm">Name</span>
                                <p className="text-gray-900 font-medium">{applicantProfile.firstName} {applicantProfile.lastName}</p>
                              </div>
                              <div>
                                <span className="text-gray-500 text-sm">Email</span>
                                <p className="text-gray-900">{applicantProfile.email || 'Not provided'}</p>
                              </div>
                              <div>
                                <span className="text-gray-500 text-sm">Phone</span>
                                <p className="text-gray-900">{applicantProfile.phone || 'Not provided'}</p>
                              </div>
                              <div>
                                <span className="text-gray-500 text-sm">Address</span>
                                <p className="text-gray-900">{applicantProfile.address || 'Not provided'}</p>
                              </div>
                              {applicantProfile.skills && applicantProfile.skills.length > 0 && (
                                <div>
                                  <span className="text-gray-500 text-sm">Skills</span>
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    {applicantProfile.skills.map((skill, i) => (
                                      <span key={i} className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs">
                                        {skill}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {applicantProfile.bio && (
                                <div>
                                  <span className="text-gray-500 text-sm">Bio</span>
                                  <p className="text-gray-900">{applicantProfile.bio}</p>
                                </div>
                              )}
                              {applicantProfile.experience && applicantProfile.experience.length > 0 && (
                                <div>
                                  <span className="text-gray-500 text-sm">Experience</span>
                                  {applicantProfile.experience.map((exp, i) => (
                                    <p key={i} className="text-gray-900">{exp.description || exp.title}</p>
                                  ))}
                                </div>
                              )}
                              {applicantProfile.education && applicantProfile.education.length > 0 && (
                                <div>
                                  <span className="text-gray-500 text-sm">Education</span>
                                  {applicantProfile.education.map((edu, i) => (
                                    <p key={i} className="text-gray-900">{edu.degree} - {edu.institution}</p>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                              <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Applied</h3>
                              <p className="text-gray-900 font-medium">{selectedApplication.jobId?.title}</p>
                              <p className="text-gray-500 text-sm mt-1">{selectedApplication.jobId?.location}</p>
                              <p className="text-gray-500 text-sm">{selectedApplication.jobId?.jobType}</p>
                            </div>
                            
                            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                              <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Details</h3>
                              <div className="space-y-2">
                                <p className="text-gray-500 text-sm">
                                  <span className="font-medium">Applied on:</span> {new Date(selectedApplication.createdAt).toLocaleDateString()}
                                </p>
                                <p className="text-gray-500 text-sm">
                                  <span className="font-medium">Current Status:</span>{' '}
                                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                    selectedApplication.status === 'accepted' ? 'bg-green-100 text-green-600' :
                                    selectedApplication.status === 'rejected' ? 'bg-red-100 text-red-600' :
                                    'bg-yellow-100 text-yellow-600'
                                  }`}>
                                    {selectedApplication.status}
                                  </span>
                                </p>
                              </div>
                            </div>
                            
                            {applicantProfile.resume && (
                              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Resume</h3>
                                <a
                                  href={getFileUrl(applicantProfile.resume)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800"
                                >
                                  <FiFile className="w-4 h-4" />
                                  View Resume
                                  <FiExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {selectedApplication.status === 'pending' && (
                          <div className="flex gap-4 mt-6 pt-6 border-t">
                            <button
                              onClick={() => handleApproveApplication(selectedApplication._id)}
                              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition"
                            >
                              <FiCheck className="w-5 h-5" />
                              Approve Application
                            </button>
                            <button
                              onClick={() => handleRejectApplication(selectedApplication._id)}
                              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition"
                            >
                              <FiX className="w-5 h-5" />
                              Reject Application
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <p>No applicant information found</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {applications.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No applications yet</p>
                    ) : (
                      applications.map(app => (
                        <div key={app._id} className="flex justify-between items-center p-4 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100 transition">
                          <div>
                            <h3 className="text-gray-900 font-medium">{app.jobId?.title || 'Unknown Job'}</h3>
                            <p className="text-gray-500 text-sm">Applicant ID: {app.employeeId?._id || 'Unknown'}</p>
                            <p className="text-gray-400 text-xs">Applied: {new Date(app.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleViewApplication(app)}
                              className="flex items-center gap-1 px-3 py-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                            >
                              <FiEye className="w-4 h-4" />
                              Review
                            </button>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              app.status === 'accepted' ? 'bg-green-100 text-green-600' :
                              app.status === 'rejected' ? 'bg-red-100 text-red-600' :
                              'bg-yellow-100 text-yellow-600'
                            }`}>
                              {app.status}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'messages' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex h-[calc(100vh-20rem)]">
                  <div className={`${selectedChatUser ? 'hidden md:block' : 'block'} w-full md:w-1/3 border-r border-gray-100`}>
                    <div className="p-4 border-b border-gray-100 bg-indigo-600 flex justify-between items-center">
                      <div>
                        <h2 className="text-lg font-semibold text-white">Messages</h2>
                        <p className="text-indigo-200 text-sm">Chat with users</p>
                      </div>
                      <button
                        onClick={() => { loadChatUsers(); loadConversations(); }}
                        className="text-indigo-200 hover:text-white text-sm"
                      >
                        Refresh
                      </button>
                    </div>
                    <div className="overflow-y-auto h-[calc(100%-4rem)]">
                      {Object.keys(conversations).length === 0 && chatUsers.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          No conversations yet
                        </div>
                      ) : (
                        <>
                          {Object.keys(conversations).length > 0 && Object.entries(conversations).map(([userId, conv]) => {
                            const convUser = conv.user || {};
                            const displayName = convUser.email || convUser.firstName ? 
                              (convUser.firstName ? `${convUser.firstName} ${convUser.lastName || ''}` : convUser.email) : 
                              'Unknown User';
                            return (
                              <button
                                key={userId}
                                onClick={() => handleSelectChatUser({ _id: userId, email: convUser.email, role: convUser.role, firstName: convUser.firstName, lastName: convUser.lastName })}
                                className={`flex items-center gap-3 w-full p-4 hover:bg-indigo-50 transition border-b border-gray-50 ${
                                  selectedChatUser?._id === userId ? 'bg-indigo-50' : ''
                                }`}
                              >
                                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center relative">
                                  <FiUser className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1 text-left min-w-0">
                                  <p className="text-gray-900 font-medium truncate">{displayName}</p>
                                  <p className="text-gray-500 text-xs truncate">{conv.lastMessage}</p>
                                </div>
                                {conv.unread > 0 && (
                                  <span className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                    {conv.unread}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                          {chatUsers.length > 0 && (
                            <>
                              {Object.keys(conversations).length > 0 && (
                                <div className="px-4 py-2 text-xs text-gray-400 uppercase bg-gray-50">All Users</div>
                              )}
                              {chatUsers.filter(u => !conversations[u._id]).map(u => {
                                const displayName = u.firstName ? `${u.firstName} ${u.lastName || ''}` : u.email;
                                return (
                                  <button
                                    key={u._id}
                                    onClick={() => handleSelectChatUser(u)}
                                    className={`flex items-center gap-3 w-full p-4 hover:bg-indigo-50 transition border-b border-gray-50 ${
                                      selectedChatUser?._id === u._id ? 'bg-indigo-50' : ''
                                    }`}
                                  >
                                    <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center">
                                      <FiUser className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="flex-1 text-left min-w-0">
                                      <p className="text-gray-900 font-medium truncate">{displayName}</p>
                                      <p className="text-gray-500 text-xs capitalize">{u.role}</p>
                                    </div>
                                  </button>
                                );
                              })}
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  <div className={`${selectedChatUser ? 'block' : 'hidden md:block'} flex-1 flex flex-col`}>
                    {selectedChatUser ? (
                      <>
                        <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
                          <button
                            onClick={handleBackToList}
                            className="md:hidden p-2 rounded-lg hover:bg-gray-200 transition"
                          >
                            <FiArrowLeft className="w-5 h-5 text-gray-600" />
                          </button>
                          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center">
                            <FiUser className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="text-gray-900 font-medium">
                              {selectedChatUser.firstName ? `${selectedChatUser.firstName} ${selectedChatUser.lastName || ''}` : selectedChatUser.email}
                            </p>
                            <p className="text-gray-500 text-xs capitalize">{selectedChatUser.role}</p>
                          </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                          {messages.map((msg, i) => {
                            const currentUserId = user?._id || user?.id;
                            const isMe = msg.senderId === currentUserId;
                            return (
                              <motion.div
                                key={msg._id || i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex ${isMe ? 'justify-start' : 'justify-end'}`}
                              >
                                <div className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl ${
                                  isMe
                                    ? 'bg-brand-indigo text-white'
                                    : 'bg-white border border-gray-200 text-gray-900'
                                }`}>
                                  <p>{msg.content}</p>
                                  <p className={`text-xs mt-1 ${
                                    isMe ? 'text-indigo-200' : 'text-gray-400'
                                  }`}>
                                    {new Date(msg.createdAt || msg.timestamp).toLocaleTimeString()}
                                  </p>
                                </div>
                              </motion.div>
                            );
                          })}
                          <div ref={messagesEndRef} />
                        </div>
                        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              placeholder="Type a message..."
                              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                            />
                            <button
                              type="submit"
                              className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition shadow-md shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={!newMessage.trim()}
                            >
                              <FiSend className="w-5 h-5" />
                            </button>
                          </div>
                        </form>
                      </>
                    ) : (
                      <div className="flex-1 flex items-center justify-center bg-gray-50">
                        <div className="text-center">
                          <FiMessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                          <p className="text-gray-500">Select a user to start chatting</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeModal}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">User Details</h2>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                  <FiX className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-500 text-sm">Email</p>
                    <p className="text-gray-900">{selectedUser.user?.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Role</p>
                    <p className="text-gray-900">{selectedUser.user?.role || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Status</p>
                    <p className="text-gray-900">{selectedUser.user?.registrationStatus}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Registered</p>
                    <p className="text-gray-900">{new Date(selectedUser.user?.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {selectedUser.profile && (
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      {selectedUser.user?.role === 'employee' ? 'Employee Profile' : 'Company Profile'}
                    </h3>
                    
                    {selectedUser.user?.role === 'employee' ? (
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Name</p>
                          <p className="text-gray-900">{selectedUser.profile.firstName} {selectedUser.profile.lastName}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Phone</p>
                          <p className="text-gray-900">{selectedUser.profile.phone || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Address</p>
                          <p className="text-gray-900">{selectedUser.profile.address || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Skills</p>
                          <p className="text-gray-900">{selectedUser.profile.skills?.join(', ') || 'N/A'}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-gray-500">Bio</p>
                          <p className="text-gray-900">{selectedUser.profile.bio || 'N/A'}</p>
                        </div>
                        <div className="col-span-2 border-t border-gray-200 pt-4 mt-4">
                          <h4 className="text-sm font-semibold text-gray-700 mb-3">Documents</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-gray-50 rounded-xl">
                              <p className="text-gray-500 text-xs mb-2">Photo</p>
                              {selectedUser.profile.photo ? (
                                <div className="flex items-center gap-2">
                                  <img src={getFileUrl(selectedUser.profile.photo)} alt="Photo" className="w-12 h-12 object-cover rounded-lg" onError={(e) => e.target.style.display = 'none'} />
                                  <button onClick={() => openFile(selectedUser.profile.photo)} className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-xs">
                                    <FiExternalLink className="w-3 h-3" /> View
                                  </button>
                                </div>
                              ) : (
                                <p className="text-gray-400 text-xs">Not uploaded</p>
                              )}
                            </div>
                            <div className="p-3 bg-gray-50 rounded-xl">
                              <p className="text-gray-500 text-xs mb-2">Resume</p>
                              {selectedUser.profile.resume ? (
                                <div className="flex items-center gap-2">
                                  <FiFile className="w-6 h-6 text-indigo-600" />
                                  <button onClick={() => openFile(selectedUser.profile.resume)} className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-xs">
                                    <FiExternalLink className="w-3 h-3" /> View
                                  </button>
                                </div>
                              ) : (
                                <p className="text-gray-400 text-xs">Not uploaded</p>
                              )}
                            </div>
                            <div className="p-3 bg-gray-50 rounded-xl">
                              <p className="text-gray-500 text-xs mb-2">ID Card</p>
                              {selectedUser.profile.idCard ? (
                                <div className="flex items-center gap-2">
                                  <img src={getFileUrl(selectedUser.profile.idCard)} alt="ID Card" className="w-12 h-12 object-cover rounded-lg" onError={(e) => e.target.style.display = 'none'} />
                                  <button onClick={() => openFile(selectedUser.profile.idCard)} className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-xs">
                                    <FiExternalLink className="w-3 h-3" /> View
                                  </button>
                                </div>
                              ) : (
                                <p className="text-gray-400 text-xs">Not uploaded</p>
                              )}
                            </div>
                            <div className="p-3 bg-gray-50 rounded-xl">
                              <p className="text-gray-500 text-xs mb-2">Certificate</p>
                              {selectedUser.profile.certificate ? (
                                <div className="flex items-center gap-2">
                                  <FiFile className="w-6 h-6 text-indigo-600" />
                                  <button onClick={() => openFile(selectedUser.profile.certificate)} className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-xs">
                                    <FiExternalLink className="w-3 h-3" /> View
                                  </button>
                                </div>
                              ) : (
                                <p className="text-gray-400 text-xs">Not uploaded</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Company Name</p>
                          <p className="text-gray-900">{selectedUser.profile.companyName || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Industry</p>
                          <p className="text-gray-900">{selectedUser.profile.industry || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Company Size</p>
                          <p className="text-gray-900">{selectedUser.profile.companySize || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Location</p>
                          <p className="text-gray-900">{selectedUser.profile.location || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Website</p>
                          <p className="text-gray-900">{selectedUser.profile.website || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Contact Person</p>
                          <p className="text-gray-900">{selectedUser.profile.contactPerson || 'N/A'}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-gray-500">Description</p>
                          <p className="text-gray-900">{selectedUser.profile.companyDescription || 'N/A'}</p>
                        </div>
                        <div className="col-span-2 border-t border-gray-200 pt-4 mt-4">
                          <h4 className="text-sm font-semibold text-gray-700 mb-3">Company Documents</h4>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="p-3 bg-gray-50 rounded-xl">
                              <p className="text-gray-500 text-xs mb-2">Company Logo</p>
                              {selectedUser.profile.companyLogo ? (
                                <div className="flex items-center gap-2">
                                  <img src={getFileUrl(selectedUser.profile.companyLogo)} alt="Logo" className="w-12 h-12 object-cover rounded-lg" onError={(e) => e.target.style.display = 'none'} />
                                  <button onClick={() => openFile(selectedUser.profile.companyLogo)} className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-xs">
                                    <FiExternalLink className="w-3 h-3" /> View
                                  </button>
                                </div>
                              ) : (
                                <p className="text-gray-400 text-xs">Not uploaded</p>
                              )}
                            </div>
                            <div className="p-3 bg-gray-50 rounded-xl">
                              <p className="text-gray-500 text-xs mb-2">Business License</p>
                              {selectedUser.profile.businessLicense ? (
                                <div className="flex items-center gap-2">
                                  <FiFile className="w-6 h-6 text-indigo-600" />
                                  <button onClick={() => openFile(selectedUser.profile.businessLicense)} className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-xs">
                                    <FiExternalLink className="w-3 h-3" /> View
                                  </button>
                                </div>
                              ) : (
                                <p className="text-gray-400 text-xs">Not uploaded</p>
                              )}
                            </div>
                            <div className="p-3 bg-gray-50 rounded-xl">
                              <p className="text-gray-500 text-xs mb-2">Tax Document</p>
                              {selectedUser.profile.taxDocument ? (
                                <div className="flex items-center gap-2">
                                  <FiFile className="w-6 h-6 text-indigo-600" />
                                  <button onClick={() => openFile(selectedUser.profile.taxDocument)} className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-xs">
                                    <FiExternalLink className="w-3 h-3" /> View
                                  </button>
                                </div>
                              ) : (
                                <p className="text-gray-400 text-xs">Not uploaded</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {selectedUser.payment && (
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment Information</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Amount</p>
                        <p className="text-gray-900 font-semibold">${selectedUser.payment.amount}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Payment Method</p>
                        <p className="text-gray-900 capitalize">{selectedUser.payment.paymentMethod}</p>
                      </div>
                      {selectedUser.payment.bankReference && (
                        <div className="col-span-2">
                          <p className="text-gray-500">Bank Reference</p>
                          <p className="text-gray-900">{selectedUser.payment.bankReference}</p>
                        </div>
                      )}
                      <div className="col-span-2">
                        <p className="text-gray-500">Payment Proof</p>
                        <p className={`text-gray-900 ${selectedUser.payment.paymentProof ? 'text-green-600' : 'text-red-600'}`}>
                          {selectedUser.payment.paymentProof ? 'Uploaded' : 'Not uploaded'}
                        </p>
                        {selectedUser.payment.paymentProof && (
                          <button 
                            onClick={() => openFile(selectedUser.payment.paymentProof)}
                            className="text-indigo-600 hover:text-indigo-800 text-sm"
                          >
                            View Payment Proof
                          </button>
                        )}
                      </div>
                      <div>
                        <p className="text-gray-500">Payment Status</p>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          selectedUser.payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                          selectedUser.payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {selectedUser.payment.status}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => { handleApprove(selectedUser.user._id); closeModal(); }}
                    className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center gap-2 transition"
                  >
                    <FiCheck className="w-4 h-4" /> Approve
                  </button>
                  <button
                    onClick={() => { handleReject(selectedUser.user._id); closeModal(); }}
                    className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center justify-center gap-2 transition"
                  >
                    <FiX className="w-4 h-4" /> Reject
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {showAddUserModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddUserModal(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Add New User</h2>
                <button onClick={() => setShowAddUserModal(false)} className="text-gray-400 hover:text-gray-600">
                  <FiX className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                    <input
                      type="password"
                      required
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                  <select
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="employee">Employee</option>
                    <option value="recruiter">Recruiter</option>
                  </select>
                </div>
                
                {formData.role === 'employee' ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                        <input
                          type="text"
                          className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                        <input
                          type="text"
                          className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input
                          type="text"
                          className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                        <input
                          type="text"
                          className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                      <textarea
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma separated)</label>
                      <input
                        type="text"
                        placeholder="e.g. JavaScript, React, Node.js"
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        value={formData.skills}
                        onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                        <input
                          type="text"
                          className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                          value={formData.industry}
                          onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Company Size</label>
                        <input
                          type="text"
                          placeholder="e.g. 10-50, 100+"
                          className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                          value={formData.companySize}
                          onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                        <input
                          type="text"
                          className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                        <input
                          type="text"
                          className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                          value={formData.contactPerson}
                          onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                        />
                      </div>
                    </div>
                  </>
                )}
                
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddUserModal(false)}
                    className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
                  >
                    Create User
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {showAddJobModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddJobModal(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Add New Job</h2>
                <button onClick={() => setShowAddJobModal(false)} className="text-gray-400 hover:text-gray-600">
                  <FiX className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleCreateJob} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
                  <div className="relative">
                    <div 
                      className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition cursor-pointer"
                      onClick={() => {
                        setShowJobDropdown(!showJobDropdown);
                        setJobSearchQuery('');
                      }}
                    >
                      <FiSearch className="ml-3 text-gray-400" />
                      <input
                        type="text"
                        className="w-full px-3 py-2.5 outline-none bg-transparent cursor-text"
                        value={jobSearchQuery}
                        onChange={(e) => {
                          setJobSearchQuery(e.target.value);
                          setShowJobDropdown(true);
                        }}
                        onFocus={() => setShowJobDropdown(true)}
                        placeholder="Search for a job title..."
                      />
                      <FiChevronDown className="mr-3 text-gray-400 cursor-pointer" />
                    </div>
                    {showJobDropdown && (
                      <div className="absolute z-20 w-full mt-1 bg-white rounded-xl shadow-xl border border-gray-100 max-h-64 overflow-y-auto">
                        {filteredJobCategories.length > 0 ? (
                          filteredJobCategories.map((job, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => {
                                if (job === 'Other') {
                                  setJobFormData({ ...jobFormData, title: 'Other' });
                                  setJobSearchQuery('');
                                  setShowJobDropdown(false);
                                } else {
                                  setJobFormData({ ...jobFormData, title: job });
                                  setCustomJobTitle('');
                                  setJobSearchQuery('');
                                  setShowJobDropdown(false);
                                }
                              }}
                              className="w-full px-4 py-2.5 text-left hover:bg-indigo-50 text-gray-700 transition flex items-center gap-2"
                            >
                              <FiBriefcase className="text-gray-400" />
                              {job}
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-gray-500 text-center">No matching jobs found</div>
                        )}
                      </div>
                    )}
                  </div>
                  {jobFormData.title === 'Other' && (
                    <div className="mt-2">
                      <input
                        type="text"
                        value={customJobTitle}
                        onChange={(e) => {
                          setCustomJobTitle(e.target.value);
                          setJobFormData({ ...jobFormData, title: e.target.value });
                        }}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        placeholder="Enter custom job title..."
                        required
                      />
                    </div>
                  )}
                  {jobFormData.title && jobFormData.title !== 'Other' && (
                    <p className="mt-1 text-sm text-indigo-600 flex items-center gap-1">
                      <FiCheck className="w-4 h-4" /> Selected: {jobFormData.title}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      value={jobFormData.companyName}
                      onChange={(e) => setJobFormData({ ...jobFormData, companyName: e.target.value })}
                      placeholder="Enter company name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
                    <select
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      value={jobFormData.jobType}
                      onChange={(e) => setJobFormData({ ...jobFormData, jobType: e.target.value })}
                    >
                      <option value="full-time">Full-time</option>
                      <option value="part-time">Part-time</option>
                      <option value="contract">Contract</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Skills (For tech related)</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    value={jobFormData.skills}
                    onChange={(e) => setJobFormData({ ...jobFormData, skills: e.target.value })}
                    placeholder="e.g. JavaScript, React, TypeScript"
                  />
                </div>
                
               
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Application Deadline</label>
                    <input
                      type="date"
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      value={jobFormData.applicationDeadline}
                      onChange={(e) => setJobFormData({ ...jobFormData, applicationDeadline: e.target.value })}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={jobFormData.salaryNegotiable}
                      onChange={(e) => setJobFormData({ ...jobFormData, salaryNegotiable: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Salary Negotiable</span>
                  </label>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Benefits (comma separated)</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    value={jobFormData.benefits}
                    onChange={(e) => setJobFormData({ ...jobFormData, benefits: e.target.value })}
                    placeholder="e.g. Health insurance, Remote work, Bonus"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                    <select
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      value={jobFormData.gender}
                      onChange={(e) => setJobFormData({ ...jobFormData, gender: e.target.value })}
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="both">Both</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Education Level</label>
                    <select
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      value={jobFormData.level}
                      onChange={(e) => setJobFormData({ ...jobFormData, level: e.target.value })}
                    >
                      <option value="Not required">Not required</option>
                      <option value="Above Grade 8">Above Grade 8</option>
                      <option value="Above Grade 10">Above Grade 10</option>
                      <option value="Above Grade 12">Above Grade 12</option>
                      <option value="Level I">Level I</option>
                      <option value="Level II">Level II</option>
                      <option value="Level III">Level III</option>
                      <option value="Level IV">Level IV</option>
                      <option value="Diploma">Diploma</option>
                      <option value="Degree">Degree</option>
                      <option value="Masters">Masters</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                {jobFormData.level === 'other' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Specify Education Level</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      value={jobFormData.levelOther}
                      onChange={(e) => setJobFormData({ ...jobFormData, levelOther: e.target.value })}
                      placeholder="Enter education level"
                    />
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-gray-50"
                      value={jobFormData.country}
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State/Region</label>
                    <select
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      value={jobFormData.state}
                      onChange={(e) => setJobFormData({ ...jobFormData, state: e.target.value })}
                    >
                      <option value="">Select Region</option>
                      {ethiopianRegions.map((region) => (
                        <option key={region} value={region}>{region}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      value={jobFormData.city}
                      onChange={(e) => setJobFormData({ ...jobFormData, city: e.target.value })}
                      placeholder="Enter city"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kebele</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      value={jobFormData.kebele}
                      onChange={(e) => setJobFormData({ ...jobFormData, kebele: e.target.value })}
                      placeholder="Enter kebele"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                    <select
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      value={jobFormData.experience}
                      onChange={(e) => setJobFormData({ ...jobFormData, experience: e.target.value })}
                    >
                      <option value="Not Required">Not Required</option>
                      <option value="1 year">1 year</option>
                      <option value="2 years">2 years</option>
                      <option value="3 years">3 years</option>
                      <option value="4 years">4 years</option>
                      <option value="5 years">5 years</option>
                      <option value="Above 5 years">Above 5 years</option>
                      <option value="Above 10 years">Above 10 years</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  {jobFormData.experience === 'other' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Specify Experience</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        value={jobFormData.experienceOther}
                        onChange={(e) => setJobFormData({ ...jobFormData, experienceOther: e.target.value })}
                        placeholder="Enter experience requirement"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Language Required</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Oromic', 'English', 'Amharic', 'Other'].map((lang) => (
                      <label key={lang} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={jobFormData.language.includes(lang)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setJobFormData({ ...jobFormData, language: [...jobFormData.language, lang] });
                            } else {
                              setJobFormData({ ...jobFormData, language: jobFormData.language.filter(l => l !== lang) });
                            }
                          }}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">{lang}</span>
                      </label>
                    ))}
                  </div>
                </div>
                {jobFormData.language.includes('Other') && (
                  <div>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      value={jobFormData.languageOther}
                      onChange={(e) => setJobFormData({ ...jobFormData, languageOther: e.target.value })}
                      placeholder="Specify other language"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Description</label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    value={jobFormData.description}
                    onChange={(e) => setJobFormData({ ...jobFormData, description: e.target.value })}
                    placeholder="Describe the job responsibilities and role..."
                  />
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddJobModal(false)}
                    className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
                  >
                    Create Job
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {showEditJobModal && editingJob && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => { setShowEditJobModal(false); setEditingJob(null); }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Edit Job</h2>
                <button onClick={() => { setShowEditJobModal(false); setEditingJob(null); }} className="text-gray-400 hover:text-gray-600">
                  <FiX className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleUpdateJob} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
                  <div className="relative">
                    <div 
                      className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition cursor-pointer"
                      onClick={() => {
                        setShowJobDropdown(!showJobDropdown);
                        setJobSearchQuery('');
                      }}
                    >
                      <FiSearch className="ml-3 text-gray-400" />
                      <input
                        type="text"
                        className="w-full px-3 py-2.5 outline-none bg-transparent cursor-text"
                        value={jobSearchQuery}
                        onChange={(e) => {
                          setJobSearchQuery(e.target.value);
                          setShowJobDropdown(true);
                        }}
                        onFocus={() => setShowJobDropdown(true)}
                        placeholder="Search for a job title..."
                      />
                      <FiChevronDown className="mr-3 text-gray-400 cursor-pointer" />
                    </div>
                    {showJobDropdown && (
                      <div className="absolute z-20 w-full mt-1 bg-white rounded-xl shadow-xl border border-gray-100 max-h-64 overflow-y-auto">
                        {filteredJobCategories.length > 0 ? (
                          filteredJobCategories.map((job, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => {
                                if (job === 'Other') {
                                  setJobFormData({ ...jobFormData, title: 'Other' });
                                  setJobSearchQuery('');
                                  setShowJobDropdown(false);
                                } else {
                                  setJobFormData({ ...jobFormData, title: job });
                                  setCustomJobTitle('');
                                  setJobSearchQuery('');
                                  setShowJobDropdown(false);
                                }
                              }}
                              className="w-full px-4 py-2.5 text-left hover:bg-indigo-50 text-gray-700 transition flex items-center gap-2"
                            >
                              <FiBriefcase className="text-gray-400" />
                              {job}
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-gray-500 text-center">No matching jobs found</div>
                        )}
                      </div>
                    )}
                  </div>
                  {jobFormData.title === 'Other' && (
                    <div className="mt-2">
                      <input
                        type="text"
                        value={customJobTitle}
                        onChange={(e) => {
                          setCustomJobTitle(e.target.value);
                          setJobFormData({ ...jobFormData, title: e.target.value });
                        }}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        placeholder="Enter custom job title..."
                        required
                      />
                    </div>
                  )}
                  {jobFormData.title && jobFormData.title !== 'Other' && (
                    <p className="mt-1 text-sm text-indigo-600 flex items-center gap-1">
                      <FiCheck className="w-4 h-4" /> Selected: {jobFormData.title}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      value={jobFormData.companyName}
                      onChange={(e) => setJobFormData({ ...jobFormData, companyName: e.target.value })}
                      placeholder="Enter company name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
                    <select
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      value={jobFormData.jobType}
                      onChange={(e) => setJobFormData({ ...jobFormData, jobType: e.target.value })}
                    >
                      <option value="full-time">Full-time</option>
                      <option value="part-time">Part-time</option>
                      <option value="contract">Contract</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Description *</label>
                  <textarea
                    rows={4}
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    value={jobFormData.description}
                    onChange={(e) => setJobFormData({ ...jobFormData, description: e.target.value })}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Application Deadline</label>
                    <input
                      type="date"
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      value={jobFormData.applicationDeadline}
                      onChange={(e) => setJobFormData({ ...jobFormData, applicationDeadline: e.target.value })}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={jobFormData.salaryNegotiable}
                      onChange={(e) => setJobFormData({ ...jobFormData, salaryNegotiable: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Salary Negotiable</span>
                  </label>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Benefits (comma separated)</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    value={jobFormData.benefits}
                    onChange={(e) => setJobFormData({ ...jobFormData, benefits: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    value={jobFormData.status}
                    onChange={(e) => setJobFormData({ ...jobFormData, status: e.target.value })}
                  >
                    <option value="active">Active</option>
                    <option value="closed">Closed</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                    <select
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      value={jobFormData.gender}
                      onChange={(e) => setJobFormData({ ...jobFormData, gender: e.target.value })}
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="both">Both</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Education Level</label>
                    <select
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      value={jobFormData.level}
                      onChange={(e) => setJobFormData({ ...jobFormData, level: e.target.value })}
                    >
                      <option value="Not required">Not required</option>
                      <option value="Above Grade 8">Above Grade 8</option>
                      <option value="Above Grade 10">Above Grade 10</option>
                      <option value="Above Grade 12">Above Grade 12</option>
                      <option value="Level I">Level I</option>
                      <option value="Level II">Level II</option>
                      <option value="Level III">Level III</option>
                      <option value="Level IV">Level IV</option>
                      <option value="Diploma">Diploma</option>
                      <option value="Degree">Degree</option>
                      <option value="Masters">Masters</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                {jobFormData.level === 'other' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Specify Education Level</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      value={jobFormData.levelOther}
                      onChange={(e) => setJobFormData({ ...jobFormData, levelOther: e.target.value })}
                      placeholder="Enter education level"
                    />
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-gray-50"
                      value={jobFormData.country}
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State/Region</label>
                    <select
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      value={jobFormData.state}
                      onChange={(e) => setJobFormData({ ...jobFormData, state: e.target.value })}
                    >
                      <option value="">Select Region</option>
                      {ethiopianRegions.map((region) => (
                        <option key={region} value={region}>{region}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      value={jobFormData.city}
                      onChange={(e) => setJobFormData({ ...jobFormData, city: e.target.value })}
                      placeholder="Enter city"
                    />
                  </div>
                
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                    <select
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      value={jobFormData.experience}
                      onChange={(e) => setJobFormData({ ...jobFormData, experience: e.target.value })}
                    >
                      <option value="Not Required">Not Required</option>
                      <option value="1 year">1 year</option>
                      <option value="2 years">2 years</option>
                      <option value="3 years">3 years</option>
                      <option value="4 years">4 years</option>
                      <option value="5 years">5 years</option>
                      <option value="Above 5 years">Above 5 years</option>
                      <option value="Above 10 years">Above 10 years</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  {jobFormData.experience === 'other' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Specify Experience</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        value={jobFormData.experienceOther}
                        onChange={(e) => setJobFormData({ ...jobFormData, experienceOther: e.target.value })}
                        placeholder="Enter experience requirement"
                      />
                    </div>
                  )}
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => { setShowEditJobModal(false); setEditingJob(null); }}
                    className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
                  >
                    Update Job
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {showEditUserModal && editingUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => { setShowEditUserModal(false); setEditingUser(null); }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Edit User</h2>
                <button onClick={() => { setShowEditUserModal(false); setEditingUser(null); }} className="text-gray-400 hover:text-gray-600">
                  <FiX className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleUpdateUser} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-gray-100"
                      value={formData.email}
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password (leave blank to keep current)</label>
                    <input
                      type="password"
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Enter new password"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-gray-100"
                    value={formData.role}
                    disabled
                  >
                    <option value="employee">Employee</option>
                    <option value="recruiter">Recruiter</option>
                  </select>
                </div>
                
                {formData.role === 'employee' ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                        <input
                          type="text"
                          className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                        <input
                          type="text"
                          className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input
                          type="text"
                          className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                        <input
                          type="text"
                          className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                      <textarea
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma separated)</label>
                      <input
                        type="text"
                        placeholder="e.g. JavaScript, React, Node.js"
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        value={formData.skills}
                        onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                      />
                    </div>
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Documents</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {renderFileUpload('Photo', 'photo', 'image/*')}
                        {renderFileUpload('Resume', 'resume', '.pdf,.doc,.docx')}
                        {renderFileUpload('ID Card', 'idCard', 'image/*,.pdf')}
                        {renderFileUpload('Certificate', 'certificate', '.pdf,.doc,.docx')}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                        <input
                          type="text"
                          className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                          value={formData.industry}
                          onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Company Size</label>
                        <input
                          type="text"
                          placeholder="e.g. 10-50, 100+"
                          className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                          value={formData.companySize}
                          onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                        <input
                          type="text"
                          className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                        <input
                          type="text"
                          className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                          value={formData.contactPerson}
                          onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Company Documents</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {renderFileUpload('Company Logo', 'companyLogo', 'image/*')}
                        {renderFileUpload('Business License', 'businessLicense', 'image/*,.pdf')}
                        {renderFileUpload('Tax Document', 'taxDocument', 'image/*,.pdf')}
                      </div>
                    </div>
                  </>
                )}
                
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => { setShowEditUserModal(false); setEditingUser(null); }}
                    className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
                  >
                    Update User
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
