import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUsers, FiBriefcase, FiDollarSign, FiMessageSquare, FiLogOut, FiTrash2, FiShield, FiActivity, FiClock, FiEye, FiSend, FiUser, FiArrowLeft, FiPlus, FiEdit, FiFile, FiExternalLink, FiUpload, FiSearch, FiChevronDown, FiMoon, FiSun, FiX, FiCheck, FiEdit2, FiMoreVertical, FiPhone, FiVideo } from 'react-icons/fi';
import { adminApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';
import { AdminLayout, StatCards, OverviewCards, DataTable, ActivityTimeline, SettingsPage } from '../components/admin';

export default function AdminDashboard() {
  const getDefaultUserFormData = () => ({
    email: '', password: '', role: 'employee',
    firstName: '', middleName: '', lastName: '', phone: '+251', country: 'Ethiopia', region: '', city: '',
    dateOfBirth: '', gender: '', bio: '', skills: '', experienceLevel: 'none', educationLevel: 'none',
    expectedSalary: '', availability: 'available', typeOfJob: '', typeOfJobOther: '', languages: [],
    languageOther: '', address: '', photo: '', resume: '', idCard: '', certificate: '',
    companyName: '', industry: '', industryOther: '', numberOfEmployees: '', website: '', foundedYear: '',
    managerName: '', kebele: '', contactEmail: '', contactPhone: '', companyDescription: '',
    companyLogo: '', businessLicense: '', taxDocument: '', paymentProof: '', paymentMethod: '', bankReference: ''
  });

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
  const [formData, setFormData] = useState(getDefaultUserFormData);
  const [jobFormData, setJobFormData] = useState({
    title: '', description: '', skills: '',
    jobType: 'full-time', salaryNegotiable: false, salaryMin: '', salaryMax: '',
    benefits: '', applicationDeadline: '', status: 'active', gender: 'both',
    educationLevel: 'Not required', educationLevelOther: '', country: 'Ethiopia', state: '', city: '',
    kebele: '', experience: '0 years', language: [],
    languageOther: '', companyName: ''
  });
  const [jobSearchQuery, setJobSearchQuery] = useState('');
  const [showJobDropdown, setShowJobDropdown] = useState(false);
  const [customJobTitle, setCustomJobTitle] = useState('');
  const ethiopianRegions = ['Addis Ababa', 'Afar', 'Amhara', 'Benishangul-Gumuz', 'Dire Dawa', 'Gambela', 'Harari', 'Oromia', 'Sidama', 'Somali', 'South West Ethiopia Peoples\' Region', 'Tigray', 'Wolaita', 'Other'];
  const ethiopianJobCategories = ['Accountant', 'Administrative Assistant', 'Architect', 'Banker', 'Business Analyst', 'Cashier', 'Chef', 'Civil Engineer', 'Clinical Officer', 'Computer Operator', 'Construction Worker', 'Consultant', 'Content Writer', 'Customer Service', 'Data Analyst', 'Data Entry Clerk', 'Database Administrator', 'Dental Surgeon', 'Designer', 'Doctor', 'Driver', 'Economist', 'Education Teacher', 'Electrical Engineer', 'Electrician', 'Engineer', 'Finance Manager', 'Financial Analyst', 'General Practitioner', 'Graphic Designer', 'HR Manager', 'HR Officer', 'IT Specialist', 'Journalist', 'Lab Technician', 'Lawyer', 'Librarian', 'Logistics Officer', 'Machine Operator', 'Marketing Manager', 'Marketing Officer', 'Mechanical Engineer', 'Medical Doctor', 'Nurse', 'Office Assistant', 'Pharmacist', 'Physical Therapist', 'Pilot', 'Plumber', 'Procurement Officer', 'Project Manager', 'Psychologist', 'Public Relations Officer', 'Quality Assurance', 'Receptionist', 'Researcher', 'Sales Manager', 'Sales Representative', 'Secretary', 'Security Guard', 'Social Worker', 'Software Developer', 'Statistician', 'Stock Clerk', 'Surveyor', 'Teacher', 'Technician', 'Telecommunications Engineer', 'Tour Guide', 'Training Officer', 'Translator', 'Transport Manager', 'Veterinarian', 'Video Editor', 'Warehouse Manager', 'Web Developer', 'Other'];
  const employeeExperienceLevels = [
    { value: 'none', label: 'No Experience' },
    { value: '1_year', label: '1 Year' },
    { value: '2_years', label: '2 Years' },
    { value: '3_years', label: '3 Years' },
    { value: '4_years', label: '4 Years' },
    { value: '5_years', label: '5 Years' },
    { value: 'above_5_years', label: 'Above 5 Years' },
    { value: 'above_10_years', label: 'Above 10 Years' }
  ];
  const employeeEducationLevels = [
    { value: 'phd', label: 'PHD' }, { value: 'masters', label: 'Masters' },
    { value: 'degree', label: 'Degree' }, { value: 'diploma', label: 'Diploma' },
    { value: 'level_1', label: 'Level I' }, { value: 'level_2', label: 'Level II' },
    { value: 'level_3', label: 'Level III' }, { value: 'level_4', label: 'Level IV' },
    { value: 'above_level_4', label: 'Above Level IV' }, { value: 'above_grade_8', label: 'Above Grade 8' },
    { value: 'above_grade_10', label: 'Above Grade 10' }, { value: 'above_grade_12', label: 'Above Grade 12' },
    { value: 'none', label: 'None of them' }
  ];
  const employeeLanguages = [
    { value: 'oromic', label: 'Oromic' },
    { value: 'english', label: 'English' },
    { value: 'amahric', label: 'Amahric' },
    { value: 'other', label: 'Other' }
  ];
  const recruiterIndustries = [
    { value: '', label: 'Select Industry' },
    { value: 'technology', label: 'Technology' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'finance', label: 'Finance' },
    { value: 'education', label: 'Education' },
    { value: 'retail', label: 'Retail' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'other', label: 'Other' }
  ];
  const filteredJobCategories = ethiopianJobCategories.filter(job => job.toLowerCase().includes(jobSearchQuery.toLowerCase()));
const [chatUsers, setChatUsers] = useState([]);
  const [conversations, setConversations] = useState({});
  const [messages, setMessages] = useState([]);
  const [selectedChatUser, setSelectedChatUser] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [paymentSettings, setPaymentSettings] = useState([]);
  const [showPaymentSettingModal, setShowPaymentSettingModal] = useState(false);
  const [editingPaymentSetting, setEditingPaymentSetting] = useState(null);
  const [paymentFormData, setPaymentFormData] = useState({ key: '', value: '', type: 'text', label: '', category: 'bank' });
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [applicantProfile, setApplicantProfile] = useState(null);
  const [applicationLoading, setApplicationLoading] = useState(false);
  const [userDetailsTab, setUserDetailsTab] = useState('profile');
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileFormData, setProfileFormData] = useState({});
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
    const apiUrl = import.meta.env.VITE_API_URL || '/api';
    const socketUrl = apiUrl.startsWith('http') ? apiUrl.replace('/api', '') : undefined;
    socket = io(socketUrl);
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
      const [statsRes, usersRes, jobsRes, paymentsRes, appsRes, approvalsRes, paySettingsRes] = await Promise.all([
        adminApi.getDashboard(), adminApi.getUsers(), adminApi.getJobs(),
        adminApi.getPayments(), adminApi.getApplications(), adminApi.getPendingApprovals(), adminApi.getPaymentSettings()
      ]);
      setStats(statsRes.data); setUsers(usersRes.data); setJobs(jobsRes.data);
      setPayments(paymentsRes.data); setApplications(appsRes.data); setPendingApprovals(approvalsRes.data);
      setPaymentSettings(paySettingsRes.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleSavePaymentSetting = async (e) => {
    e.preventDefault();
    try {
      await adminApi.updatePaymentSetting(paymentFormData.key, paymentFormData);
      await loadData();
      setShowPaymentSettingModal(false);
      setPaymentFormData({ key: '', value: '', type: 'text', label: '', category: 'bank' });
    } catch (err) { alert(err.response?.data?.message || 'Failed to save'); }
  };

  const handleDeletePaymentSetting = async (key) => {
    if (!confirm('Delete this payment setting?')) return;
    try { await adminApi.deletePaymentSetting(key); await loadData(); } catch (err) { alert('Failed to delete'); }
  };

  const openPaymentSettingModal = (setting = null) => {
    if (setting) {
      setPaymentFormData({ key: setting.key, value: setting.value, type: setting.type, label: setting.label, category: setting.category });
    } else {
      setPaymentFormData({ key: '', value: '', type: 'text', label: '', category: 'bank' });
    }
    setShowPaymentSettingModal(true);
  };

  const handleApprove = async (userId) => {
    console.log('Approving user:', userId);
    try { 
      const { data } = await adminApi.approveUser(userId);
      console.log('Approved:', data);
      alert('User approved successfully!');
      loadData(); 
    } catch (err) { 
      console.error('Approve error:', err);
      alert(err.response?.data?.message || 'Failed to approve user');
    }
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

  const initProfileEdit = () => {
    if (!selectedUser?.profile) return;
    setProfileFormData({
      firstName: selectedUser.profile?.firstName || '',
      lastName: selectedUser.profile?.lastName || '',
      phone: selectedUser.profile?.phone || '',
      region: selectedUser.profile?.region || '',
      city: selectedUser.profile?.city || '',
      gender: selectedUser.profile?.gender || '',
      dateOfBirth: selectedUser.profile?.dateOfBirth || '',
      skills: selectedUser.profile?.skills?.join(', ') || '',
      experienceLevel: selectedUser.profile?.experienceLevel || '',
      educationLevel: selectedUser.profile?.educationLevel || '',
      typeOfJob: selectedUser.profile?.typeOfJob || '',
      companyName: selectedUser.profile?.companyName || '',
      industry: selectedUser.profile?.industry || '',
      numberOfEmployees: selectedUser.profile?.numberOfEmployees || '',
    });
    setEditingProfile(true);
  };

  const handleSaveProfile = async () => {
    if (!selectedUser?.user?._id) return;
    try {
      const payload = { ...profileFormData };
      if (payload.skills) payload.skills = payload.skills.split(',').map(s => s.trim()).filter(s => s);
      await adminApi.updateUser(selectedUser.user._id, { profile: payload });
      setEditingProfile(false);
      loadData();
      alert('Profile updated');
    } catch (err) { console.error(err); alert('Update failed'); }
  };

  const resetForm = () => {
    setFormData(getDefaultUserFormData());
  };
  const handleOpenAddModal = () => { resetForm(); setShowAddUserModal(true); };
  const handleOpenEditModal = async (userId) => {
    try {
      const { data } = await adminApi.getUser(userId);
      setEditingUser(data);
      setFormData({
        ...getDefaultUserFormData(),
        email: data.user.email, password: '', role: data.user.role,
        firstName: data.profile?.firstName || '', middleName: data.profile?.middleName || '', lastName: data.profile?.lastName || '',
        phone: data.profile?.phone || '+251', country: data.profile?.country || 'Ethiopia', region: data.profile?.region || '', city: data.profile?.city || '',
        dateOfBirth: data.profile?.dateOfBirth || '', gender: data.profile?.gender || '', address: data.profile?.address || '',
        bio: data.profile?.bio || '', skills: Array.isArray(data.profile?.skills) ? data.profile.skills.join(', ') : '',
        experienceLevel: data.profile?.experienceLevel || 'none', educationLevel: data.profile?.educationLevel || 'none',
        expectedSalary: data.profile?.expectedSalary || '', availability: data.profile?.availability || 'available',
        typeOfJob: data.profile?.typeOfJob || '', typeOfJobOther: data.profile?.typeOfJobOther || '',
        languages: Array.isArray(data.profile?.languages) ? data.profile.languages : [],
        languageOther: data.profile?.languageOther || '',
        companyName: data.profile?.companyName || '', companyDescription: data.profile?.companyDescription || '', industry: data.profile?.industry || '',
        industryOther: data.profile?.industryOther || '', numberOfEmployees: data.profile?.numberOfEmployees || '',
        website: data.profile?.website || '', foundedYear: data.profile?.foundedYear || '',
        managerName: data.profile?.managerName || '', kebele: data.profile?.kebele || '',
        contactEmail: data.profile?.contactEmail || '', contactPhone: data.profile?.contactPhone || '',
        photo: data.profile?.photo || '', resume: data.profile?.resume || '',
        idCard: data.profile?.idCard || '', certificate: data.profile?.certificate || '',
        companyLogo: data.profile?.companyLogo || '', businessLicense: data.profile?.businessLicense || '',
        taxDocument: data.profile?.taxDocument || '', paymentProof: data.profile?.paymentProof || '',
        paymentMethod: data.profile?.paymentMethod || '', bankReference: data.profile?.bankReference || ''
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
  const handleUserFieldChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleLanguageToggle = (language) => {
    setFormData((prev) => {
      const current = prev.languages || [];
      return {
        ...prev,
        languages: current.includes(language) ? current.filter((item) => item !== language) : [...current, language]
      };
    });
  };
  const buildUserPayload = () => ({
    ...formData,
    industry: formData.industry === 'other' ? formData.industryOther : formData.industry,
    typeOfJob: formData.typeOfJob === 'other' ? formData.typeOfJobOther : formData.typeOfJob,
    skills: formData.skills ? formData.skills.split(',').map((s) => s.trim()).filter((s) => s) : [],
    languages: formData.languages || []
  });
  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const payload = buildUserPayload();
      if (!payload.password) { alert('Password is required'); return; }
      await adminApi.createUser(payload);
      setShowAddUserModal(false); resetForm(); loadData(); alert('User created successfully');
    } catch (err) { alert(err.response?.data?.message || 'Failed to create user'); }
  };
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const payload = buildUserPayload();
      if (!payload.password) delete payload.password;
      await adminApi.updateUser(editingUser.user._id, payload);
      setShowEditUserModal(false); setEditingUser(null); resetForm(); loadData(); alert('User updated successfully');
    } catch (err) { alert(err.response?.data?.message || 'Failed to update user'); }
  };
  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
      const normalizedEducationLevel =
        jobFormData.educationLevel === 'Level'
          ? `Level ${jobFormData.educationLevelOther}`.trim()
          : jobFormData.educationLevel === 'Other'
            ? jobFormData.educationLevelOther
            : jobFormData.educationLevel;

      const payload = {
        title: jobFormData.title, description: jobFormData.description,
        skills: jobFormData.skills ? jobFormData.skills.split(',').map(s => s.trim()).filter(s => s) : [],
        location: [jobFormData.city, jobFormData.kebele].filter(Boolean).join(', '),
        jobType: jobFormData.jobType,
        salary: { min: Number(jobFormData.salaryMin) || 0, max: Number(jobFormData.salaryMax) || 0, currency: 'USD' },
        salaryNegotiable: jobFormData.salaryNegotiable,
        benefits: jobFormData.benefits ? jobFormData.benefits.split(',').map(s => s.trim()).filter(s => s) : [],
        applicationDeadline: jobFormData.applicationDeadline || null, status: jobFormData.status,
        gender: jobFormData.gender,
        country: jobFormData.country, state: jobFormData.state, city: jobFormData.city,
        kebele: jobFormData.kebele, experience: jobFormData.experience,
        educationLevel: normalizedEducationLevel,
        language: jobFormData.language, languageOther: jobFormData.languageOther, companyName: jobFormData.companyName
      };
      await adminApi.createJob(payload);
      setShowAddJobModal(false);
      setJobFormData({ title: '', description: '', skills: '', jobType: 'full-time', salaryNegotiable: false, salaryMin: '', salaryMax: '', benefits: '', applicationDeadline: '', status: 'active', gender: 'both', educationLevel: 'Not required', educationLevelOther: '', country: 'Ethiopia', state: '', city: '', kebele: '', experience: '0 years', language: [], languageOther: '', companyName: '' });
      setCustomJobTitle(''); loadData(); alert('Job created successfully');
    } catch (err) { alert(err.response?.data?.message || 'Failed to create job'); }
  };
  const handleOpenEditJobModal = (job) => {
    setEditingJob(job);
    setCustomJobTitle(job.title && !ethiopianJobCategories.includes(job.title) ? job.title : '');
    const isLevelEducation = (job.educationLevel || '').toLowerCase().startsWith('level ');
    const matchedEducationLevel = ['Phd', 'Masters', 'Degree', 'Diploma', 'Above grade 12', 'Above grade 10', 'Above grade 8', 'Not required'].includes(job.educationLevel)
      ? job.educationLevel
      : isLevelEducation
        ? 'Level'
        : 'Other';
    setJobFormData({
      title: job.title || '', description: job.description || '',
      skills: Array.isArray(job.skills) ? job.skills.join(', ') : '',
      jobType: job.jobType || 'full-time',
      salaryNegotiable: job.salaryNegotiable || false,
      salaryMin: job.salary?.min || '',
      salaryMax: job.salary?.max || '',
      benefits: Array.isArray(job.benefits) ? job.benefits.join(', ') : '',
      applicationDeadline: job.applicationDeadline ? new Date(job.applicationDeadline).toISOString().split('T')[0] : '',
      status: job.status || 'active', gender: job.gender || 'both',
      educationLevel: matchedEducationLevel,
      educationLevelOther: isLevelEducation ? job.educationLevel.replace(/^Level\s*/i, '') : (matchedEducationLevel === 'Other' ? (job.educationLevel || '') : ''),
      country: job.country || 'Ethiopia', state: job.state || '', city: job.city || '',
      kebele: job.kebele || '',
      experience: job.experienceLevel || '0 years', phone: job.phone || '', email: job.email || '',
      companyName: job.companyName || ''
    });
    setShowEditJobModal(true);
  };
  const handleUpdateJob = async (e) => {
    e.preventDefault();
    try {
      const normalizedEducationLevel =
        jobFormData.educationLevel === 'Level'
          ? `Level ${jobFormData.educationLevelOther}`.trim()
          : jobFormData.educationLevel === 'Other'
            ? jobFormData.educationLevelOther
            : jobFormData.educationLevel;

      const payload = {
        title: jobFormData.title, description: jobFormData.description,
        skills: jobFormData.skills ? jobFormData.skills.split(',').map(s => s.trim()).filter(s => s) : [],
        location: [jobFormData.city, jobFormData.kebele].filter(Boolean).join(', '),
        jobType: jobFormData.jobType,
        experienceLevel: jobFormData.experience,
        educationLevel: normalizedEducationLevel,
        salary: { min: Number(jobFormData.salaryMin) || 0, max: Number(jobFormData.salaryMax) || 0, currency: 'USD' },
        salaryNegotiable: jobFormData.salaryNegotiable,
        benefits: jobFormData.benefits ? jobFormData.benefits.split(',').map(s => s.trim()).filter(s => s) : [],
        applicationDeadline: jobFormData.applicationDeadline || null, status: jobFormData.status,
        gender: jobFormData.gender,
        country: jobFormData.country, state: jobFormData.state, city: jobFormData.city,
        kebele: jobFormData.kebele,
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
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChatUser) return;
    const userId = user?._id || user?.id;
    const messageContent = newMessage.trim();
    
    try {
      console.log('Sending message via API:', { receiverId: selectedChatUser._id, content: messageContent });
      const res = await adminApi.sendChatMessage({ receiverId: selectedChatUser._id, content: messageContent });
      console.log('Message sent:', res.data);
      
      setMessages(prev => [...prev, { senderId: userId, receiverId: selectedChatUser._id, content: messageContent, createdAt: new Date(), tempId: Date.now() }]);
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
      alert('Failed to send message: ' + (err.response?.data?.message || err.message));
    }
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className={`text-2xl font-bold ${textPrimary}`}>Payment Settings</h2>
          <p className={`${textSecondary} mt-1`}>Manage payment information, bank details and fees.</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => openPaymentSettingModal()} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition shadow-lg shadow-indigo-500/25">
          <FiPlus className="w-4 h-4" />Add Setting
        </motion.button>
      </div>
      
      <div className="grid gap-4">
        {['bank', 'payment', 'general', 'telebirr'].map(cat => (
          <div key={cat} className={`rounded-xl border ${borderColor} ${bgCard} p-5`}>
            <h3 className={`font-semibold mb-3 capitalize ${textPrimary}`}>{cat === 'bank' ? 'Bank Details' : cat === 'payment' ? 'Payment Fees' : cat === 'telebirr' ? 'Telebirr Settings' : 'General Settings'}</h3>
            <div className="space-y-2">
              {paymentSettings.filter(s => s.category === cat).map(setting => (
                <div key={setting.key} className={`flex items-center justify-between p-3 rounded-lg ${darkMode ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                  <div>
                    <p className={`font-medium ${textPrimary}`}>{setting.label || setting.key}</p>
                    <p className={`text-sm ${textSecondary}`}>{setting.value}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openPaymentSettingModal(setting)} className={`p-2 rounded-lg ${darkMode ? 'hover:bg-slate-600' : 'hover:bg-slate-100'}`}>
                      <FiEdit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeletePaymentSetting(setting.key)} className={`p-2 rounded-lg ${darkMode ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-50 text-red-600'}`}>
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {paymentSettings.filter(s => s.category === cat).length === 0 && (
                <p className={textMuted}>No settings added yet</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );

  const renderApplicationsTab = () => {
    if (selectedApplication) {
      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className={`text-2xl font-bold ${textPrimary}`}>Application Details</h2>
              <p className={`${textSecondary} mt-1`}>Review applicant information and update status.</p>
            </div>
            <button
              onClick={handleBackToApplications}
              className={`px-4 py-2.5 rounded-xl ${darkMode ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-900'} transition`}
            >
              Back
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`rounded-2xl border ${borderColor} ${bgCard} p-6 space-y-3`}>
              <h3 className={`text-lg font-semibold ${textPrimary}`}>Application</h3>
              <p className={textSecondary}><span className={`font-medium ${textPrimary}`}>Job:</span> {selectedApplication.jobId?.title || 'N/A'}</p>
              <p className={textSecondary}><span className={`font-medium ${textPrimary}`}>Applicant:</span> {selectedApplication.employeeId?.firstName || applicantProfile?.profile?.firstName || 'N/A'} {selectedApplication.employeeId?.lastName || applicantProfile?.profile?.lastName || ''}</p>
              <p className={textSecondary}><span className={`font-medium ${textPrimary}`}>Email:</span> {selectedApplication.email || applicantProfile?.user?.email || 'N/A'}</p>
              <p className={textSecondary}><span className={`font-medium ${textPrimary}`}>Phone:</span> {selectedApplication.phone || applicantProfile?.profile?.phone || 'N/A'}</p>
              <p className={textSecondary}><span className={`font-medium ${textPrimary}`}>City:</span> {selectedApplication.city || applicantProfile?.profile?.city || 'N/A'}</p>
              <p className={textSecondary}><span className={`font-medium ${textPrimary}`}>Status:</span> {selectedApplication.status || 'pending'}</p>
              <div>
                <p className={`font-medium mb-2 ${textPrimary}`}>Cover Letter</p>
                <div className={`rounded-xl p-4 ${darkMode ? 'bg-slate-700/60 text-slate-200' : 'bg-slate-50 text-slate-700'}`}>
                  {selectedApplication.coverLetter || 'No cover letter provided.'}
                </div>
              </div>
              {selectedApplication.resume && (
                <div>
                  <p className={`font-medium mb-2 ${textPrimary}`}>Resume/CV</p>
                  <a
                    href={selectedApplication.resume}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl ${darkMode ? 'bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'} transition`}
                  >
                    <FiFile className="w-5 h-5" />
                    <span className="font-medium">View Resume</span>
                    <FiExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>

            <div className={`rounded-2xl border ${borderColor} ${bgCard} p-6 space-y-3`}>
              <h3 className={`text-lg font-semibold ${textPrimary}`}>Applicant Profile</h3>
              {applicationLoading ? (
                <p className={textSecondary}>Loading profile...</p>
              ) : applicantProfile?.profile ? (
                <>
                  <p className={textSecondary}><span className={`font-medium ${textPrimary}`}>Experience:</span> {applicantProfile.profile.experienceLevel || 'N/A'}</p>
                  <p className={textSecondary}><span className={`font-medium ${textPrimary}`}>Education:</span> {applicantProfile.profile.educationLevel || 'N/A'}</p>
                  <p className={textSecondary}><span className={`font-medium ${textPrimary}`}>Skills:</span> {applicantProfile.profile.skills?.join(', ') || 'N/A'}</p>
                  <p className={textSecondary}><span className={`font-medium ${textPrimary}`}>Bio:</span> {applicantProfile.profile.bio || 'N/A'}</p>
                </>
              ) : (
                <p className={textSecondary}>No applicant profile data found.</p>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => handleApproveApplication(selectedApplication._id)}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleRejectApplication(selectedApplication._id)}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="mb-6">
          <h2 className={`text-2xl font-bold ${textPrimary}`}>Applications</h2>
          <p className={`${textSecondary} mt-1`}>Review submitted job applications.</p>
        </div>

        {applications.length === 0 ? (
          <div className={`rounded-2xl border ${borderColor} ${bgCard} p-12 text-center`}>
            <FiFile className={`w-12 h-12 mx-auto mb-4 ${textMuted}`} />
            <p className={textSecondary}>No applications found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app, index) => (
              <motion.div
                key={app._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className={`rounded-2xl border ${borderColor} ${bgCard} p-5`}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h3 className={`font-semibold ${textPrimary}`}>{app.jobId?.title || 'Untitled Job'}</h3>
                    <p className={`text-sm ${textSecondary} mt-1`}>
                      {app.firstName || app.employeeId?.firstName || 'Applicant'} {app.lastName || app.employeeId?.lastName || ''}
                    </p>
                    <p className={`text-xs ${textMuted} mt-1`}>
                      {app.email || 'No email'} • {app.phone || 'No phone'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      app.status === 'accepted'
                        ? (darkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700')
                        : app.status === 'rejected'
                          ? (darkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700')
                          : (darkMode ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700')
                    }`}>
                      {app.status || 'pending'}
                    </span>
                    <button
                      onClick={() => handleViewApplication(app)}
                      className={`px-4 py-2 rounded-xl ${darkMode ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-900'} transition`}
                    >
                      View
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    );
  };

  const renderPaymentSettingsModal = () => {
    if (!showPaymentSettingModal) return null;
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowPaymentSettingModal(false)}>
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()} className={`w-full max-w-md rounded-2xl ${darkMode ? 'bg-slate-800' : 'bg-white'} p-6`}>
          <h3 className={`text-xl font-bold mb-4 ${textPrimary}`}>{paymentFormData.key ? 'Edit' : 'Add'} Payment Setting</h3>
          <form onSubmit={handleSavePaymentSetting} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>Key/Name</label>
              <input type="text" value={paymentFormData.key} onChange={e => setPaymentFormData(p => ({ ...p, key: e.target.value }))} placeholder="e.g., bank_name" className={`w-full px-4 py-2 rounded-xl border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'border-slate-200'}`} required />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>Label</label>
              <input type="text" value={paymentFormData.label} onChange={e => setPaymentFormData(p => ({ ...p, label: e.target.value }))} placeholder="e.g., Bank Name" className={`w-full px-4 py-2 rounded-xl border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'border-slate-200'}`} required />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>Value</label>
              {paymentFormData.type === 'textarea' ? (
                <textarea value={paymentFormData.value} onChange={e => setPaymentFormData(p => ({ ...p, value: e.target.value }))} rows={3} className={`w-full px-4 py-2 rounded-xl border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'border-slate-200'}`} />
              ) : (
                <input type={paymentFormData.type === 'number' ? 'number' : 'text'} value={paymentFormData.value} onChange={e => setPaymentFormData(p => ({ ...p, value: e.target.value }))} className={`w-full px-4 py-2 rounded-xl border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'border-slate-200'}`} required />
              )}
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${textSecondary}`}>Category</label>
              <select value={paymentFormData.category} onChange={e => setPaymentFormData(p => ({ ...p, category: e.target.value }))} className={`w-full px-4 py-2 rounded-xl border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'border-slate-200'}`}>
                <option value="bank">Bank Details</option>
                <option value="telebirr">Telebirr Settings</option>
                <option value="payment">Payment Fees</option>
                <option value="general">General</option>
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">Save</button>
              <button type="button" onClick={() => setShowPaymentSettingModal(false)} className="flex-1 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-xl">Cancel</button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    );
  };

  const renderSettingsTab = () => <SettingsPage darkMode={darkMode} onDarkModeChange={setDarkMode} />;

  const renderMessagesTab = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`rounded-3xl border ${borderColor} ${bgCard} overflow-hidden shadow-2xl`}>
      <div className="flex h-[calc(100vh-12rem)]">
        <div className={`${selectedChatUser ? 'hidden md:block' : 'block'} w-full md:w-1/3 border-r ${borderColor}`}>
          <div className={`p-5 border-b ${borderColor} bg-gradient-to-r from-indigo-600 to-purple-600`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Messages</h2>
                <p className="text-indigo-200 text-sm">Chat with users</p>
              </div>
              <motion.div whileHover={{ scale: 1.1 }} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <FiEdit2 className="w-4 h-4 text-white" />
              </motion.div>
            </div>
          </div>
          <div className="overflow-y-auto h-[calc(100%-5rem)]">
            {Object.keys(conversations).length === 0 && chatUsers.length === 0 ? (
              <div className={`p-6 text-center ${textSecondary}`}>
                <FiMessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No conversations yet</p>
              </div>
            ) : (
              <>
                {Object.entries(conversations).filter(([id, conv]) => conv.email).map(([userId, conv]) => {
                  const displayName = conv.firstName ? `${conv.firstName} ${conv.lastName || ''}` : conv.email;
                  const initial = displayName[0]?.toUpperCase() || 'U';
                  return (
                    <motion.button 
                      key={userId} 
                      whileHover={{ scale: 1.02 }}
                      onClick={() => handleSelectChatUser({ _id: userId, email: conv.email, role: conv.role, firstName: conv.firstName, lastName: conv.lastName })} 
                      className={`flex items-center gap-3 w-full p-4 transition-all border-b ${darkMode ? 'hover:bg-slate-700/50 border-slate-800' : 'hover:bg-indigo-50 border-slate-100'} ${selectedChatUser?._id === userId ? (darkMode ? 'bg-indigo-600/20' : 'bg-indigo-50') : ''}`}
                    >
                      <motion.div whileHover={{ scale: 1.05 }} className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold">{initial}</span>
                      </motion.div>
                      <div className="flex-1 text-left min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`font-medium ${textPrimary} truncate`}>{displayName}</p>
                          {conv.unread > 0 && (
                            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {conv.unread}
                            </motion.span>
                          )}
                        </div>
                        <p className={`text-xs ${textMuted} truncate`}>{conv.lastMessage || 'No messages'}</p>
                      </div>
                    </motion.button>
                  );
                })}
                {chatUsers.filter(u => u.email && !conversations[u._id]).map(u => {
                  const displayName = u.firstName ? `${u.firstName} ${u.lastName || ''}` : u.email;
                  const initial = displayName[0]?.toUpperCase() || 'U';
                  return (
                    <motion.button 
                      key={u._id} 
                      whileHover={{ scale: 1.02 }}
                      onClick={() => handleSelectChatUser(u)} 
                      className={`flex items-center gap-3 w-full p-4 transition-all border-b ${darkMode ? 'hover:bg-slate-700/50 border-slate-800' : 'hover:bg-indigo-50 border-slate-100'} ${selectedChatUser?._id === u._id ? (darkMode ? 'bg-indigo-600/20' : 'bg-indigo-50') : ''}`}
                    >
                      <motion.div whileHover={{ scale: 1.05 }} className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold">{initial}</span>
                      </motion.div>
                      <div className="flex-1 text-left min-w-0">
                        <p className={`font-medium ${textPrimary} truncate`}>{displayName}</p>
                        <p className={`text-xs ${textSecondary} capitalize`}>{u.role}</p>
                      </div>
                    </motion.button>
                  );
                })}
              </>
            )}
          </div>
        </div>
        <div className={`${selectedChatUser ? 'block' : 'hidden md:block'} flex-1 flex flex-col`}>
          {selectedChatUser ? (
            <>
              <motion.div 
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                className={`p-4 border-b ${borderColor} flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600`}
              >
                <button onClick={handleBackToList} className={`md:hidden p-2 rounded-lg hover:bg-white/20 transition`}>
                  <FiArrowLeft className="w-5 h-5 text-white" />
                </button>
                <motion.div whileHover={{ scale: 1.1 }} className="relative">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <span className="text-white font-bold">{selectedChatUser.firstName?.[0] || selectedChatUser.email?.[0] || 'U'}</span>
                  </div>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 ${darkMode ? 'border-slate-800' : 'border-white'} ${selectedChatUser.role === 'recruiter' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                </motion.div>
                <div className="flex-1">
                  <p className="font-bold text-white">{selectedChatUser.firstName ? `${selectedChatUser.firstName} ${selectedChatUser.lastName || ''}` : selectedChatUser.email}</p>
                  <p className="text-xs text-white/80 capitalize">{selectedChatUser.role}</p>
                </div>
                <div className="flex items-center gap-2">
                  <motion.button whileHover={{ scale: 1.1 }} className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition">
                    <FiPhone className="w-5 h-5 text-white" />
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.1 }} className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition">
                    <FiMoreVertical className="w-5 h-5 text-white" />
                  </motion.button>
                </div>
              </motion.div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-900/5 to-slate-900/10">
                {messages.map((msg, i) => {
                  const currentUserId = user?._id || user?.id;
                  const isMe = msg.senderId === currentUserId;
                  return (
                    <motion.div 
                      key={msg._id || i} 
                      initial={{ opacity: 0, scale: 0.8, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className={`flex ${isMe ? 'justify-start' : 'justify-end'}`}
                    >
                      <div className={`max-w-xs md:max-w-md px-5 py-3 rounded-2xl shadow-lg ${
                        isMe 
                          ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-bl-md' 
                          : 'bg-white text-slate-900 border border-slate-200 shadow-xl rounded-br-md'
                      }`}>
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                        <div className={`flex items-center justify-end gap-1.5 mt-1.5 ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>
                          <span className="text-[10px]">{new Date(msg.createdAt || msg.timestamp).toLocaleTimeString()}</span>
                          {isMe && <span className="text-xs">✓✓</span>}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
              <form onSubmit={handleSendMessage} className={`p-4 border-t ${borderColor} ${darkMode ? 'bg-slate-800/50' : 'bg-white'}`}>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {['📎', '🎤', '📷'].map((icon, i) => (
                      <motion.button
                        key={i}
                        type="button"
                        whileHover={{ scale: 1.2 }}
                        className={`p-2 rounded-xl ${darkMode ? 'hover:bg-slate-600' : 'hover:bg-slate-200'} transition-colors`}
                      >
                        <span>{icon}</span>
                      </motion.button>
                    ))}
                  </div>
                  <input 
                    type="text" 
                    value={newMessage} 
                    onChange={(e) => setNewMessage(e.target.value)} 
                    placeholder="Type your message..." 
                    className={`flex-1 px-5 py-3 rounded-2xl border ${borderColor} ${darkMode ? 'bg-slate-700/50 text-slate-100 placeholder:text-slate-400' : 'bg-slate-50 text-slate-900 placeholder:text-slate-400'} focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition`} 
                  />
                  <motion.button 
                    type="submit" 
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.95 }} 
                    disabled={!newMessage.trim()} 
                    className="px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiSend className="w-5 h-5" />
                  </motion.button>
                </div>
              </form>
            </>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex items-center justify-center"
            >
              <div className="text-center">
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-indigo-500/30"
                >
                  <FiMessageSquare className="w-10 h-10 text-white" />
                </motion.div>
                <h3 className={`text-xl font-bold ${textPrimary} mb-2`}>Select a Conversation</h3>
                <p className={textSecondary}>Choose a user to start chatting</p>
              </div>
            </motion.div>
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

  const renderUserDetailsModal = () => {
    if (!selectedUser) return null;
    const { user, profile, payment } = selectedUser;
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={closeModal}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className={`w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl ${darkMode ? 'bg-slate-800' : 'bg-white'} shadow-2xl`}>
          <div className={`sticky top-0 flex items-center justify-between p-6 border-b ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
            <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              {user?.role === 'employee' ? 'Employee' : 'Recruiter'} Details
            </h2>
            <button onClick={closeModal} className={`p-2 rounded-lg ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}>
              <FiArrowLeft className={`w-5 h-5 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`} />
            </button>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex gap-2 mb-4">
              <button onClick={() => { setUserDetailsTab('profile'); setEditingProfile(false); }} className={`px-4 py-2 rounded-lg font-medium ${userDetailsTab === 'profile' ? 'bg-indigo-600 text-white' : darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100'}`}>Profile</button>
              <button onClick={() => { setUserDetailsTab('registration'); setEditingProfile(false); }} className={`px-4 py-2 rounded-lg font-medium ${userDetailsTab === 'registration' ? 'bg-indigo-600 text-white' : darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100'}`}>Registration</button>
              {userDetailsTab === 'profile' && !editingProfile && <button onClick={initProfileEdit} className={`ml-auto px-4 py-2 rounded-lg font-medium ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100'}`}>Edit</button>}
            </div>

            {userDetailsTab === 'profile' && (
              <div className="grid md:grid-cols-2 gap-6">
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                  <h3 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Personal Information</h3>
                  {editingProfile ? (
                    <div className="space-y-3">
                      <div><label className="text-sm">First Name</label><input type="text" value={profileFormData.firstName} onChange={(e) => setProfileFormData({...profileFormData, firstName: e.target.value})} className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600" /></div>
                      <div><label className="text-sm">Last Name</label><input type="text" value={profileFormData.lastName} onChange={(e) => setProfileFormData({...profileFormData, lastName: e.target.value})} className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600" /></div>
                      <div><label className="text-sm">Phone</label><input type="text" value={profileFormData.phone} onChange={(e) => setProfileFormData({...profileFormData, phone: e.target.value})} className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600" /></div>
                      <div><label className="text-sm">Region</label><input type="text" value={profileFormData.region} onChange={(e) => setProfileFormData({...profileFormData, region: e.target.value})} className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600" /></div>
                      <div><label className="text-sm">City</label><input type="text" value={profileFormData.city} onChange={(e) => setProfileFormData({...profileFormData, city: e.target.value})} className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600" /></div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className={darkMode ? 'text-slate-300' : 'text-slate-700'}><span className="font-medium">Name:</span> {user?.firstName} {user?.lastName}</p>
                      <p className={darkMode ? 'text-slate-300' : 'text-slate-700'}><span className="font-medium">Email:</span> {user?.email}</p>
                      <p className={darkMode ? 'text-slate-300' : 'text-slate-700'}><span className="font-medium">Phone:</span> {profile?.phone || 'N/A'}</p>
                      <p className={darkMode ? 'text-slate-300' : 'text-slate-700'}><span className="font-medium">Region:</span> {profile?.region || 'N/A'}</p>
                      <p className={darkMode ? 'text-slate-300' : 'text-slate-700'}><span className="font-medium">City:</span> {profile?.city || 'N/A'}</p>
                    </div>
                  )}
                </div>
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                  <h3 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Professional Information</h3>
                  {editingProfile ? (
                    <div className="space-y-3">
                      {user?.role === 'employee' && (
                        <>
                          <div><label className="text-sm">Type of Job</label><input type="text" value={profileFormData.typeOfJob} onChange={(e) => setProfileFormData({...profileFormData, typeOfJob: e.target.value})} className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600" /></div>
                          <div><label className="text-sm">Skills (comma separated)</label><input type="text" value={profileFormData.skills} onChange={(e) => setProfileFormData({...profileFormData, skills: e.target.value})} className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600" /></div>
                          <div><label className="text-sm">Experience</label><input type="text" value={profileFormData.experienceLevel} onChange={(e) => setProfileFormData({...profileFormData, experienceLevel: e.target.value})} className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600" /></div>
                          <div><label className="text-sm">Education</label><input type="text" value={profileFormData.educationLevel} onChange={(e) => setProfileFormData({...profileFormData, educationLevel: e.target.value})} className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600" /></div>
                        </>
                      )}
                      {user?.role === 'recruiter' && (
                        <>
                          <div><label className="text-sm">Company</label><input type="text" value={profileFormData.companyName} onChange={(e) => setProfileFormData({...profileFormData, companyName: e.target.value})} className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600" /></div>
                          <div><label className="text-sm">Industry</label><input type="text" value={profileFormData.industry} onChange={(e) => setProfileFormData({...profileFormData, industry: e.target.value})} className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600" /></div>
                          <div><label className="text-sm">Employees</label><input type="text" value={profileFormData.numberOfEmployees} onChange={(e) => setProfileFormData({...profileFormData, numberOfEmployees: e.target.value})} className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600" /></div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {user?.role === 'employee' && (
                        <>
                          <p className={darkMode ? 'text-slate-300' : 'text-slate-700'}><span className="font-medium">Type:</span> {profile?.typeOfJob || 'N/A'}</p>
                          <p className={darkMode ? 'text-slate-300' : 'text-slate-700'}><span className="font-medium">Skills:</span> {profile?.skills?.join(', ') || 'N/A'}</p>
                          <p className={darkMode ? 'text-slate-300' : 'text-slate-700'}><span className="font-medium">Experience:</span> {profile?.experienceLevel || 'N/A'}</p>
                          <p className={darkMode ? 'text-slate-300' : 'text-slate-700'}><span className="font-medium">Education:</span> {profile?.educationLevel || 'N/A'}</p>
                        </>
                      )}
                      {user?.role === 'recruiter' && (
                        <>
                          <p className={darkMode ? 'text-slate-300' : 'text-slate-700'}><span className="font-medium">Company:</span> {profile?.companyName || 'N/A'}</p>
                          <p className={darkMode ? 'text-slate-300' : 'text-slate-700'}><span className="font-medium">Industry:</span> {profile?.industry || 'N/A'}</p>
                          <p className={darkMode ? 'text-slate-300' : 'text-slate-700'}><span className="font-medium">Employees:</span> {profile?.numberOfEmployees || 'N/A'}</p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {userDetailsTab === 'registration' && (
              <div className="space-y-6">
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                  <h3 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Bio</h3>
                  <p className={darkMode ? 'text-slate-300' : 'text-slate-700'}>{profile?.bio || 'No bio'}</p>
                </div>
                {user?.role === 'employee' && (
                  <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                    <h3 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Documents</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div><p className="text-sm">Resume</p>{profile?.resume ? <a href={profile.resume} target="_blank" className="text-cyan-500">View</a> : <p>N/A</p>}</div>
                      <div><p className="text-sm">ID Card</p>{profile?.idCard ? <a href={profile.idCard} target="_blank" className="text-cyan-500">View</a> : <p>N/A</p>}</div>
                      <div><p className="text-sm">Certificate</p>{profile?.certificate ? <a href={profile.certificate} target="_blank" className="text-cyan-500">View</a> : <p>N/A</p>}</div>
                    </div>
                  </div>
                )}
                {user?.role === 'recruiter' && (
                  <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                    <h3 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Company Documents</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div><p className="text-sm">Logo</p>{profile?.companyLogo ? <a href={profile.companyLogo} target="_blank" className="text-cyan-500">View</a> : <p>N/A</p>}</div>
                      <div><p className="text-sm">License</p>{profile?.businessLicense ? <a href={profile.businessLicense} target="_blank" className="text-cyan-500">View</a> : <p>N/A</p>}</div>
                      <div><p className="text-sm">Tax Doc</p>{profile?.taxDocument ? <a href={profile.taxDocument} target="_blank" className="text-cyan-500">View</a> : <p>N/A</p>}</div>
                    </div>
                  </div>
                )}
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                  <h3 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Account Status</h3>
                  <p><span className="font-medium">Status:</span> {user?.status || 'pending'}</p>
                  <p><span className="font-medium">Registration Step:</span> {user?.registrationStatus || 'N/A'}</p>
                  <p><span className="font-medium">Date:</span> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
                  {payment && <p><span className="font-medium">Payment:</span> ETB {payment.amount}</p>}
                </div>
              </div>
            )}

            {editingProfile && (
              <div className="flex gap-3">
                <button onClick={() => setEditingProfile(false)} className="flex-1 py-3 bg-slate-600 rounded-xl">Cancel</button>
                <button onClick={handleSaveProfile} className="flex-1 py-3 bg-indigo-600 rounded-xl">Save</button>
              </div>
            )}

            {!editingProfile && (
              <div className="flex gap-3">
                <motion.button whileHover={{ scale: 1.02 }} onClick={() => handleApprove(user?._id)} className="flex-1 py-3 bg-green-600 rounded-xl flex items-center justify-center gap-2">
                  <FiCheck className="w-5 h-5" /> Approve
                </motion.button>
                <motion.button whileHover={{ scale: 1.02 }} onClick={() => handleReject(user?._id)} className="flex-1 py-3 bg-red-600 rounded-xl flex items-center justify-center gap-2">
                  <FiTrash2 className="w-5 h-5" /> Reject
                </motion.button>
                <motion.button whileHover={{ scale: 1.02 }} onClick={closeModal} className="flex-1 py-3 bg-slate-600 rounded-xl">Close</motion.button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    );
  };

  const renderUserFormModal = () => {
    const isOpen = showAddUserModal || showEditUserModal;
    if (!isOpen) return null;

    const isEditing = showEditUserModal;
    const closeUserFormModal = () => {
      setShowAddUserModal(false);
      setShowEditUserModal(false);
      setEditingUser(null);
      resetForm();
    };

    const renderUploadCard = (label, fieldName, hint, required = false, accept = '.pdf,.jpg,.jpeg,.png,.doc,.docx') => (
      <label
        className={`block rounded-2xl border-2 border-dashed p-5 cursor-pointer transition ${
          formData[fieldName]
            ? darkMode
              ? 'border-indigo-400 bg-indigo-500/10'
              : 'border-indigo-500 bg-indigo-50'
            : darkMode
              ? 'border-slate-600 bg-slate-900/30 hover:border-slate-500'
              : 'border-slate-300 bg-slate-50 hover:border-slate-400'
        }`}
      >
        <input type="file" accept={accept} className="hidden" onChange={(e) => handleFileUpload(e, fieldName)} />
        <div className="flex items-start gap-4">
          <div className={`mt-1 flex h-12 w-12 items-center justify-center rounded-2xl ${formData[fieldName] ? 'bg-gradient-to-br from-indigo-500 to-cyan-500 text-white' : darkMode ? 'bg-slate-700 text-slate-300' : 'bg-white text-slate-600'}`}>
            {formData[fieldName] ? <FiCheck className="w-5 h-5" /> : <FiUpload className="w-5 h-5" />}
          </div>
          <div className="min-w-0">
            <p className={`font-medium ${textPrimary}`}>{label}{required ? ' *' : ''}</p>
            <p className={`text-sm mt-1 break-all ${formData[fieldName] ? (darkMode ? 'text-indigo-300' : 'text-indigo-700') : textSecondary}`}>
              {formData[fieldName] ? formData[fieldName].split('/').pop() : hint}
            </p>
          </div>
        </div>
      </label>
    );

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={closeUserFormModal}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border ${borderColor} ${darkMode ? 'bg-slate-800' : 'bg-white'} p-6 shadow-2xl`}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className={`text-2xl font-bold ${textPrimary}`}>{isEditing ? 'Edit User' : 'Add User'}</h2>
              <p className={`mt-1 ${textSecondary}`}>Use the same registration-style inputs for employees and recruiters, including document uploads.</p>
            </div>
            <button
              type="button"
              onClick={closeUserFormModal}
              className={`p-2 rounded-lg ${darkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`}
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={isEditing ? handleUpdateUser : handleCreateUser} className="space-y-6">
            <div className={`rounded-3xl border p-5 ${darkMode ? 'border-slate-700 bg-slate-900/40' : 'border-slate-200 bg-slate-50/80'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${textPrimary}`}>Account</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleUserFieldChange}
                    className={`w-full px-4 py-3 rounded-2xl border ${darkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                    required
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleUserFieldChange}
                    className={`w-full px-4 py-3 rounded-2xl border ${darkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                  >
                    <option value="employee">Employee</option>
                    <option value="recruiter">Recruiter</option>
                  </select>
                </div>
                <div className="md:col-span-3">
                  <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>
                    Password {isEditing ? '(leave blank to keep current)' : ''}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleUserFieldChange}
                    className={`w-full px-4 py-3 rounded-2xl border ${darkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                    required={!isEditing}
                  />
                </div>
              </div>
            </div>

            {formData.role === 'employee' ? (
              <>
                <div className={`rounded-3xl border p-5 ${darkMode ? 'border-slate-700 bg-slate-900/40' : 'border-slate-200 bg-slate-50/80'}`}>
                  <h3 className={`text-lg font-semibold mb-4 ${textPrimary}`}>Employee Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>First Name</label>
                      <input name="firstName" value={formData.firstName} onChange={handleUserFieldChange} className={`w-full px-4 py-3 rounded-2xl border ${darkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`} required />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Middle Name</label>
                      <input name="middleName" value={formData.middleName} onChange={handleUserFieldChange} className={`w-full px-4 py-3 rounded-2xl border ${darkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`} />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Last Name</label>
                      <input name="lastName" value={formData.lastName} onChange={handleUserFieldChange} className={`w-full px-4 py-3 rounded-2xl border ${darkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`} required />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Phone Number</label>
                      <input name="phone" value={formData.phone} onChange={handleUserFieldChange} className={`w-full px-4 py-3 rounded-2xl border ${darkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`} required />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Date of Birth</label>
                      <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleUserFieldChange} className={`w-full px-4 py-3 rounded-2xl border ${darkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`} />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Gender</label>
                      <select name="gender" value={formData.gender} onChange={handleUserFieldChange} className={`w-full px-4 py-3 rounded-2xl border ${darkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Region</label>
                      <select name="region" value={formData.region} onChange={handleUserFieldChange} className={`w-full px-4 py-3 rounded-2xl border ${darkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
                        <option value="">Select Region</option>
                        {ethiopianRegions.map((region) => <option key={region} value={region}>{region}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>City</label>
                      <input name="city" value={formData.city} onChange={handleUserFieldChange} className={`w-full px-4 py-3 rounded-2xl border ${darkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`} required />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Availability</label>
                      <select name="availability" value={formData.availability} onChange={handleUserFieldChange} className={`w-full px-4 py-3 rounded-2xl border ${darkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
                        <option value="available">Available</option>
                        <option value="not_available">Not Available</option>
                        <option value="internship">Internship</option>
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Experience Level</label>
                      <select name="experienceLevel" value={formData.experienceLevel} onChange={handleUserFieldChange} className={`w-full px-4 py-3 rounded-2xl border ${darkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
                        {employeeExperienceLevels.map((level) => <option key={level.value} value={level.value}>{level.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Education Level</label>
                      <select name="educationLevel" value={formData.educationLevel} onChange={handleUserFieldChange} className={`w-full px-4 py-3 rounded-2xl border ${darkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
                        {employeeEducationLevels.map((level) => <option key={level.value} value={level.value}>{level.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Expected Salary</label>
                      <input name="expectedSalary" value={formData.expectedSalary} onChange={handleUserFieldChange} placeholder="Optional" className={`w-full px-4 py-3 rounded-2xl border ${darkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`} />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Type of Job</label>
                      <select name="typeOfJob" value={formData.typeOfJob} onChange={handleUserFieldChange} className={`w-full px-4 py-3 rounded-2xl border ${darkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`} required>
                        <option value="">Select a job type</option>
                        {ethiopianJobCategories.map((job) => <option key={job} value={job === 'Other' ? 'other' : job}>{job}</option>)}
                      </select>
                    </div>
                    {formData.typeOfJob === 'other' && (
                      <div className="md:col-span-2">
                        <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Specify Job Type</label>
                        <input name="typeOfJobOther" value={formData.typeOfJobOther} onChange={handleUserFieldChange} className={`w-full px-4 py-3 rounded-2xl border ${darkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`} required />
                      </div>
                    )}
                    <div className="md:col-span-3">
                      <label className={`block text-sm font-medium mb-3 ${textSecondary}`}>Languages</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {employeeLanguages.map((language) => (
                          <label key={language.value} className={`flex items-center gap-3 rounded-2xl border px-4 py-3 cursor-pointer ${darkMode ? 'border-slate-700 bg-slate-800/60 text-slate-100' : 'border-slate-200 bg-white text-slate-900'}`}>
                            <input type="checkbox" checked={formData.languages.includes(language.value)} onChange={() => handleLanguageToggle(language.value)} className="accent-indigo-600" />
                            <span>{language.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    {formData.languages.includes('other') && (
                      <div className="md:col-span-3">
                        <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Specify Other Language</label>
                        <input name="languageOther" value={formData.languageOther} onChange={handleUserFieldChange} className={`w-full px-4 py-3 rounded-2xl border ${darkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`} />
                      </div>
                    )}
                    <div className="md:col-span-3">
                      <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Skills</label>
                      <input name="skills" value={formData.skills} onChange={handleUserFieldChange} placeholder="JavaScript, React, Node.js..." className={`w-full px-4 py-3 rounded-2xl border ${darkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`} />
                    </div>
                    <div className="md:col-span-3">
                      <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Bio / Summary</label>
                      <textarea name="bio" rows="4" value={formData.bio} onChange={handleUserFieldChange} className={`w-full px-4 py-3 rounded-2xl border ${darkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`} />
                    </div>
                  </div>
                </div>

                <div className={`rounded-3xl border p-5 ${darkMode ? 'border-slate-700 bg-slate-900/40' : 'border-slate-200 bg-slate-50/80'}`}>
                  <h3 className={`text-lg font-semibold mb-4 ${textPrimary}`}>Employee Documents</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderUploadCard('Profile Photo', 'photo', 'PNG or JPG')}
                    {renderUploadCard('Resume / CV', 'resume', 'PDF, DOC, or DOCX')}
                    {renderUploadCard('ID Card / Passport (Fayda)', 'idCard', 'PDF or image', true)}
                    {renderUploadCard('Certificates', 'certificate', 'PDF or image')}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className={`rounded-3xl border p-5 ${darkMode ? 'border-slate-700 bg-slate-900/40' : 'border-slate-200 bg-slate-50/80'}`}>
                  <h3 className={`text-lg font-semibold mb-4 ${textPrimary}`}>Recruiter Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Company Name</label>
                      <input name="companyName" value={formData.companyName} onChange={handleUserFieldChange} className={`w-full px-4 py-3 rounded-2xl border ${darkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`} required />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Industry</label>
                      <select name="industry" value={formData.industry} onChange={handleUserFieldChange} className={`w-full px-4 py-3 rounded-2xl border ${darkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
                        {recruiterIndustries.map((industry) => <option key={industry.value || 'empty'} value={industry.value}>{industry.label}</option>)}
                      </select>
                    </div>
                    {formData.industry === 'other' && (
                      <div className="md:col-span-2">
                        <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Specify Industry</label>
                        <input name="industryOther" value={formData.industryOther} onChange={handleUserFieldChange} className={`w-full px-4 py-3 rounded-2xl border ${darkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`} required />
                      </div>
                    )}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Founded Year</label>
                      <input name="foundedYear" value={formData.foundedYear} onChange={handleUserFieldChange} className={`w-full px-4 py-3 rounded-2xl border ${darkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`} />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Website</label>
                      <input name="website" value={formData.website} onChange={handleUserFieldChange} className={`w-full px-4 py-3 rounded-2xl border ${darkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`} />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Manager / CEO Name</label>
                      <input name="managerName" value={formData.managerName} onChange={handleUserFieldChange} className={`w-full px-4 py-3 rounded-2xl border ${darkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`} required />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Number of Employees</label>
                      <input name="numberOfEmployees" value={formData.numberOfEmployees} onChange={handleUserFieldChange} className={`w-full px-4 py-3 rounded-2xl border ${darkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`} />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>City</label>
                      <input name="city" value={formData.city} onChange={handleUserFieldChange} className={`w-full px-4 py-3 rounded-2xl border ${darkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`} required />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Kebele</label>
                      <input name="kebele" value={formData.kebele} onChange={handleUserFieldChange} className={`w-full px-4 py-3 rounded-2xl border ${darkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`} required />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Contact Email</label>
                      <input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleUserFieldChange} className={`w-full px-4 py-3 rounded-2xl border ${darkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`} />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Contact Phone</label>
                      <input name="contactPhone" value={formData.contactPhone} onChange={handleUserFieldChange} className={`w-full px-4 py-3 rounded-2xl border ${darkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`} />
                    </div>
                    <div className="md:col-span-2">
                      <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Company Description</label>
                      <textarea name="companyDescription" rows="4" value={formData.companyDescription} onChange={handleUserFieldChange} className={`w-full px-4 py-3 rounded-2xl border ${darkMode ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`} />
                    </div>
                  </div>
                </div>

                <div className={`rounded-3xl border p-5 ${darkMode ? 'border-slate-700 bg-slate-900/40' : 'border-slate-200 bg-slate-50/80'}`}>
                  <h3 className={`text-lg font-semibold mb-4 ${textPrimary}`}>Recruiter Documents</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderUploadCard('Business License / Trade License', 'businessLicense', 'PDF or image', true)}
                    {renderUploadCard('Company Logo', 'companyLogo', 'PNG, JPG, or SVG', false, '.png,.jpg,.jpeg,.svg')}
                    {renderUploadCard('Tax Registration Document', 'taxDocument', 'PDF or image')}
                    {renderUploadCard('Payment Proof', 'paymentProof', 'Screenshot or PDF')}
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-3 pt-2">
              <button type="submit" className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium">
                {isEditing ? 'Save Changes' : 'Create User'}
              </button>
              <button
                type="button"
                onClick={closeUserFormModal}
                className={`flex-1 py-3 rounded-xl font-medium ${darkMode ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-900'}`}
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    );
  };

  const renderJobFormModal = () => {
    const isOpen = showAddJobModal || showEditJobModal;
    if (!isOpen) return null;

    const isEditing = showEditJobModal;
    const closeJobFormModal = () => {
      setShowAddJobModal(false);
      setShowEditJobModal(false);
      setEditingJob(null);
      setJobSearchQuery('');
      setShowJobDropdown(false);
      setCustomJobTitle('');
      setJobFormData({
        title: '', description: '', skills: '',
        jobType: 'full-time', salaryNegotiable: false, salaryMin: '', salaryMax: '',
        benefits: '', applicationDeadline: '', status: 'active', gender: 'both',
        educationLevel: 'Not required', educationLevelOther: '', country: 'Ethiopia', state: '', city: '',
        kebele: '', experience: '0 years', language: [],
        languageOther: '', companyName: ''
      });
    };

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={closeJobFormModal}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className={`w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border ${borderColor} ${darkMode ? 'bg-slate-800' : 'bg-white'} p-6 shadow-2xl`}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className={`text-2xl font-bold ${textPrimary}`}>{isEditing ? 'Edit Job' : 'Add Job'}</h2>
              <p className={`mt-1 ${textSecondary}`}>Create and manage published job postings.</p>
            </div>
            <button
              type="button"
              onClick={closeJobFormModal}
              className={`p-2 rounded-lg ${darkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`}
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={isEditing ? handleUpdateJob : handleCreateJob} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Job Title</label>
                <div className="relative">
                  <FiSearch className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${textMuted}`} />
                  <input
                    type="text"
                    value={jobFormData.title === 'Other' ? customJobTitle : jobFormData.title}
                    onFocus={() => {
                      setJobSearchQuery(jobFormData.title === 'Other' ? customJobTitle : jobFormData.title);
                      setShowJobDropdown(true);
                    }}
                    onChange={(e) => {
                      const value = e.target.value;
                      setJobSearchQuery(value);
                      setShowJobDropdown(true);
                      setCustomJobTitle(value);
                      setJobFormData((prev) => ({ ...prev, title: value }));
                    }}
                    onBlur={() => {
                      window.setTimeout(() => setShowJobDropdown(false), 150);
                    }}
                    placeholder="Search or choose a job title"
                    className={`w-full pl-11 pr-10 py-3 rounded-xl border transition-all duration-200 ${
                      darkMode
                        ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30'
                        : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                    }`}
                    required
                  />
                  <FiChevronDown className={`pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 ${textMuted}`} />

                  {showJobDropdown && (
                    <div className={`absolute z-20 mt-2 w-full rounded-2xl border shadow-2xl overflow-hidden ${
                      darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                    }`}>
                      <div className={`max-h-64 overflow-y-auto ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
                        {filteredJobCategories.length > 0 ? (
                          filteredJobCategories.map((job) => (
                            <button
                              key={job}
                              type="button"
                              onMouseDown={() => {
                                setJobFormData((prev) => ({ ...prev, title: job }));
                                setJobSearchQuery(job);
                                setCustomJobTitle('');
                                setShowJobDropdown(false);
                              }}
                              className={`w-full px-4 py-3 text-left transition ${
                                darkMode
                                  ? 'text-slate-100 hover:bg-slate-700 border-b border-slate-700 last:border-b-0'
                                  : 'text-slate-900 hover:bg-slate-50 border-b border-slate-100 last:border-b-0'
                              }`}
                            >
                              {job}
                            </button>
                          ))
                        ) : (
                          <div className={`px-4 py-3 ${textSecondary}`}>No matching job titles</div>
                        )}
                        <button
                          type="button"
                          onMouseDown={() => {
                            setJobFormData((prev) => ({ ...prev, title: 'Other' }));
                            setShowJobDropdown(false);
                          }}
                          className={`w-full px-4 py-3 text-left font-medium transition ${
                            darkMode ? 'text-indigo-300 hover:bg-slate-700' : 'text-indigo-600 hover:bg-indigo-50'
                          }`}
                        >
                          Other
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {(jobFormData.title === 'Other' || customJobTitle) && (
                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Specify Job Title</label>
                  <input
                    type="text"
                    value={customJobTitle}
                    onChange={(e) => {
                      setCustomJobTitle(e.target.value);
                      setJobFormData((prev) => ({ ...prev, title: e.target.value }));
                    }}
                    placeholder="Enter custom job title"
                    className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                    required
                  />
                </div>
              )}

              <div>
                <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Company Name</label>
                <input
                  type="text"
                  value={jobFormData.companyName}
                  onChange={(e) => setJobFormData((prev) => ({ ...prev, companyName: e.target.value }))}
                  className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>City</label>
                <input
                  type="text"
                  value={jobFormData.city}
                  onChange={(e) => setJobFormData((prev) => ({ ...prev, city: e.target.value }))}
                  className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Kebele</label>
                <input
                  type="text"
                  value={jobFormData.kebele}
                  onChange={(e) => setJobFormData((prev) => ({ ...prev, kebele: e.target.value }))}
                  className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Job Type</label>
                <div className="relative group">
                  <select
                    value={jobFormData.jobType}
                    onChange={(e) => setJobFormData((prev) => ({ ...prev, jobType: e.target.value }))}
                    className={`w-full appearance-none px-4 py-3 pr-12 rounded-xl border transition-all duration-200 shadow-sm ${
                      darkMode
                        ? 'bg-slate-700 border-slate-600 text-white hover:border-indigo-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30'
                        : 'bg-white border-slate-300 text-slate-900 hover:border-indigo-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                    }`}
                  >
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="monthly">Monthly</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                    <FiChevronDown className={`w-4 h-4 transition-transform duration-200 group-focus-within:rotate-180 ${darkMode ? 'text-slate-300' : 'text-slate-500'}`} />
                  </div>
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Experience</label>
                <select
                  value={jobFormData.experience}
                  onChange={(e) => setJobFormData((prev) => ({ ...prev, experience: e.target.value }))}
                  className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                >
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
                <select
                  value={jobFormData.gender}
                  onChange={(e) => setJobFormData((prev) => ({ ...prev, gender: e.target.value }))}
                  className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                >
                  <option value="both">Both</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Education Level</label>
                <select
                  value={jobFormData.educationLevel}
                  onChange={(e) => {
                    const value = e.target.value;
                    setJobFormData((prev) => ({
                      ...prev,
                      educationLevel: value,
                      educationLevelOther: value === 'Level' || value === 'Other' ? prev.educationLevelOther : ''
                    }));
                  }}
                  className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                >
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
                  <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>
                    {jobFormData.educationLevel === 'Level' ? 'Specify Level' : 'Specify Education Need'}
                  </label>
                  <input
                    type="text"
                    value={jobFormData.educationLevelOther}
                    onChange={(e) => setJobFormData((prev) => ({ ...prev, educationLevelOther: e.target.value }))}
                    className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                    required
                  />
                </div>
              )}
              <div>
                <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Status</label>
                <select
                  value={jobFormData.status}
                  onChange={(e) => setJobFormData((prev) => ({ ...prev, status: e.target.value }))}
                  className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                >
                  <option value="active">Active</option>
                  <option value="closed">Closed</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Application Deadline</label>
                <input
                  type="date"
                  value={jobFormData.applicationDeadline}
                  onChange={(e) => setJobFormData((prev) => ({ ...prev, applicationDeadline: e.target.value }))}
                  className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                />
              </div>
              <div className="md:col-span-2">
                <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Skills</label>
                <textarea
                  rows="3"
                  value={jobFormData.skills}
                  onChange={(e) => setJobFormData((prev) => ({ ...prev, skills: e.target.value }))}
                  placeholder="Comma separated"
                  className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                />
              </div>
              <div className="md:col-span-2">
                <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Benefits</label>
                <textarea
                  rows="3"
                  value={jobFormData.benefits}
                  onChange={(e) => setJobFormData((prev) => ({ ...prev, benefits: e.target.value }))}
                  placeholder="Comma separated"
                  className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Minimum Salary</label>
                <input
                  type="number"
                  min="0"
                  value={jobFormData.salaryMin}
                  onChange={(e) => setJobFormData((prev) => ({ ...prev, salaryMin: e.target.value }))}
                  className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Maximum Salary</label>
                <input
                  type="number"
                  min="0"
                  value={jobFormData.salaryMax}
                  onChange={(e) => setJobFormData((prev) => ({ ...prev, salaryMax: e.target.value }))}
                  className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                id="salaryNegotiable"
                type="checkbox"
                checked={jobFormData.salaryNegotiable}
                onChange={(e) => setJobFormData((prev) => ({ ...prev, salaryNegotiable: e.target.checked }))}
                className="w-4 h-4 rounded accent-indigo-600"
              />
              <label htmlFor="salaryNegotiable" className={textSecondary}>Salary negotiable</label>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>Description</label>
              <textarea
                rows="5"
                value={jobFormData.description}
                onChange={(e) => setJobFormData((prev) => ({ ...prev, description: e.target.value }))}
                className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                required
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium">
                {isEditing ? 'Save Changes' : 'Create Job'}
              </button>
              <button
                type="button"
                onClick={closeJobFormModal}
                className={`flex-1 py-3 rounded-xl font-medium ${darkMode ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-900'}`}
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab} darkMode={darkMode} setDarkMode={setDarkMode} pendingCount={pendingApprovals.length} onLogout={logout} user={user}>
      {renderContent()}
      <AnimatePresence>{renderUserFormModal()}</AnimatePresence>
      <AnimatePresence>{renderJobFormModal()}</AnimatePresence>
      <AnimatePresence>{renderUserDetailsModal()}</AnimatePresence>
      <AnimatePresence>{renderPaymentSettingsModal()}</AnimatePresence>
    </AdminLayout>
  );
}
