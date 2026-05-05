import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  verifyOtp: (data) => api.post('/auth/verify-otp', data),
  resendOtp: (data) => api.post('/auth/resend-otp', data),
  selectRole: (data) => api.post('/auth/select-role', data),
  me: () => api.get('/auth/me'),
  updateUserProfile: (data) => api.put('/auth/profile', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteAccount: () => api.delete('/auth/account'),
  completeEmployeeStep1: (data) => api.post('/auth/employee/step1', data),
  completeEmployeeStep2: (data) => api.post('/auth/employee/step2', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  completeEmployeeStep3: (data) => api.post('/auth/employee/step3', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  completeRecruiterStep1: (data) => api.post('/auth/recruiter/step1', data),
  completeRecruiterStep2: (data) => api.post('/auth/recruiter/step2', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  completeRecruiterStep3: (data) => api.post('/auth/recruiter/step3', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};

export const jobsApi = {
  getAll: (params) => api.get('/jobs', { params }),
  getById: (id) => api.get(`/jobs/${id}`),
  create: (data) => api.post('/jobs', data),
  update: (id, data) => api.put(`/jobs/${id}`, data),
  delete: (id) => api.delete(`/jobs/${id}`)
};

export const usersApi = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getEmployee: (id) => api.get(`/users/employee/${id}`),
  getRecruiter: (id) => api.get(`/users/recruiter/${id}`),
  bookmarkJob: (jobId) => api.post(`/users/bookmark/${jobId}`),
  removeBookmark: (jobId) => api.delete(`/users/bookmark/${jobId}`),
  getSavedJobs: () => api.get('/users/saved-jobs'),
  getProfileViews: () => api.get('/users/profile-views')
};

export const dashboardApi = {
  getEmployeeStats: () => api.get('/dashboard/employee/stats'),
  getEmployeeDashboard: () => api.get('/dashboard/employee')
};

export const applicationsApi = {
  apply: (data) => api.post('/applications', data),
  applyWithResume: (data) => {
    const formData = new FormData();
    formData.append('jobId', data.jobId);
    formData.append('firstName', data.firstName || '');
    formData.append('middleName', data.middleName || '');
    formData.append('lastName', data.lastName || '');
    formData.append('email', data.email || '');
    formData.append('phone', data.phone || '');
    formData.append('city', data.city || '');
    formData.append('coverLetter', data.coverLetter || '');
    formData.append('resume', data.resume);
    return api.post('/applications', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  myApplications: () => api.get('/applications/my'),
  getRecruiterApplications: () => api.get('/applications/recruiter/my'),
  getJobApplications: (jobId) => api.get(`/applications/job/${jobId}`),
  updateStatus: (id, data) => api.put(`/applications/${id}/status`, data)
};

export const chatApi = {
  getConversations: () => api.get('/chat/conversations'),
  getMessages: (partnerId) => api.get(`/chat/${partnerId}`),
  sendMessage: (data) => api.post('/chat', data),
  getAdmin: () => api.get('/chat/admin'),
  getContacts: () => api.get('/chat/contacts')
};

export const paymentsApi = {
  createStripeIntent: (data) => api.post('/payments/stripe/create-intent', data),
  initializeChapa: (data) => api.post('/payments/chapa/initialize', data),
  getHistory: () => api.get('/payments/history')
};

export const notificationsApi = {
  getAll: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/read/${id}`),
  markAllRead: () => api.put('/notifications/read-all')
};

export const adminApi = {
  login: (data) => api.post('/admin/login', data),
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: () => api.get('/admin/users'),
  getUser: (id) => api.get(`/admin/users/${id}`),
  createUser: (data) => api.post('/admin/users', data),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getJobs: () => api.get('/admin/jobs'),
  createJob: (data) => api.post('/admin/jobs', data),
  updateJob: (id, data) => api.put(`/admin/jobs/${id}`, data),
  deleteJob: (id) => api.delete(`/admin/jobs/${id}`),
  getPayments: () => api.get('/admin/payments'),
  getApplications: () => api.get('/admin/applications'),
  getPendingApprovals: () => api.get('/admin/pending-approvals'),
  approveUser: (id) => api.post(`/admin/approve/${id}`),
  rejectUser: (id) => api.post(`/admin/reject/${id}`),
  updateApplicationStatus: (id, data) => api.put(`/applications/${id}/status`, data),
  uploadFile: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/admin/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getChatUsers: () => api.get('/chat/admin/users'),
  getChatConversations: () => api.get('/chat/conversations'),
  getChatMessages: (partnerId) => api.get(`/chat/${partnerId}`),
  sendChatMessage: (data) => api.post('/chat', data),
  getPaymentSettings: () => api.get('/admin/payment-settings'),
  createPaymentSetting: (data) => api.post('/admin/payment-settings', data),
  updatePaymentSetting: (key, data) => api.post('/admin/payment-settings', { key, ...data }),
  deletePaymentSetting: (key) => api.delete(`/admin/payment-settings/${key}`),
  getNotifications: () => api.get('/admin/notifications'),
  markNotificationRead: (id) => api.put(`/admin/notifications/${id}/read`)
};

export default api;