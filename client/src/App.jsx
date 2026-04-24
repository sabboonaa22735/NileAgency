import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import RoleSelection from './pages/RoleSelection';
import EmployeeRegistration from './pages/EmployeeRegistration';
import RecruiterRegistration from './pages/RecruiterRegistration';
import EmployeeDashboard from './pages/EmployeeDashboard';
import RecruiterDashboard from './pages/RecruiterDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminLoginPage from './pages/AdminLoginPage';
import JobDetails from './pages/JobDetails';
import ApplyJob from './pages/ApplyJob';
import Chat from './pages/Chat';
import UserProfile from './pages/UserProfile';
import Settings from './pages/Settings';
import Jobs from './pages/Jobs';
import Applications from './pages/Applications';
import SavedJobs from './pages/SavedJobs';
import { Reveal, Scene } from './components/ui/Scene';
import ConfirmEmail from './pages/ConfirmEmail';

const getAuthenticatedHome = (user) => {
  if (!user) return '/';
  if (user.role === 'admin') return '/admin';
  if (!user.role) return '/role-selection';
  if (user.registrationStatus === 'pending_approval') return '/pending-approval';
  if (user.registrationStatus === 'rejected') return '/rejected';
  if (user.registrationStatus !== 'approved') return `/${user.role}-registration`;
  if (user.role === 'recruiter') return '/recruiter';
  return '/dashboard';
};

const LoadingScreen = () => (
  <Scene className="px-6 py-10" contentClassName="flex min-h-screen items-center justify-center">
    <Reveal className="glass-card flex w-full max-w-sm flex-col items-center px-10 py-12 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-[22px] bg-gradient-to-br from-indigo-400 via-blue-400 to-cyan-300 text-2xl font-bold text-slate-950 shadow-2xl shadow-cyan-400/20">
        N
      </div>
      <div className="mb-4 animate-spin rounded-full h-10 w-10 border-4 border-white/10 border-t-cyan-300"></div>
      <h1 className="text-2xl font-bold text-white">Loading Nile Agency</h1>
      <p className="mt-2 text-sm text-slate-300">Preparing your dashboard and live data.</p>
    </Reveal>
  </Scene>
);

const PendingApprovalMessage = ({ role, isDark }) => {
  const [companyPhone, setCompanyPhone] = useState('+251912345678');
  const [companyEmail, setCompanyEmail] = useState('info@nileagency.com');
  
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch('/api/admin/public-payment-settings');
        if (res.ok) {
          const data = await res.json();
          const phone = data.find(s => s.key === 'company_phone');
          const email = data.find(s => s.key === 'company_email');
          if (phone && phone.value) setCompanyPhone(phone.value);
          if (email && email.value) setCompanyEmail(email.value);
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadSettings();
  }, []);
  
  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${isDark ? 'bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'}`}>
      <div className="max-w-md w-full text-center">
        <div className={`p-8 rounded-3xl border backdrop-blur-xl ${isDark ? 'bg-slate-900/80 border-slate-700' : 'bg-white/80 border-slate-200'} shadow-2xl`}>
          <div className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Awaiting Admin Approval
          </h1>
          <p className={`mb-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Your {role} registration is pending approval. Our admin team will review your application and documents.
          </p>
          <div className={`p-4 rounded-xl mb-6 ${isDark ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-200'}`}>
            <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>
              <strong>Important:</strong> You will be notified by email within <strong>10 minutes</strong> if your application is approved.
            </p>
            {companyPhone && (
              <p className={`text-sm mt-2 ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>
                Or call us at: <span className="font-bold">{companyPhone}</span>
              </p>
            )}
            {companyEmail && (
              <p className={`text-sm mt-1 ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>
                Or email: <span className="font-bold">{companyEmail}</span>
              </p>
            )}
          </div>
          <button 
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              window.location.href = '/login';
            }}
            className="w-full py-3 px-6 rounded-xl font-semibold bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg"
          >
            Return to Login
          </button>
        </div>
    </div>
  </div>
);
};

const ApprovedMessage = ({ role, isDark }) => (
  <div className={`min-h-screen flex items-center justify-center p-4 ${isDark ? 'bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-950' : 'bg-gradient-to-br from-blue-50 via-white to-green-50'}`}>
    <div className="max-w-md w-full text-center">
      <div className={`p-10 rounded-3xl border backdrop-blur-xl ${isDark ? 'bg-slate-900/80 border-slate-700' : 'bg-white/80 border-slate-200'} shadow-2xl`}>
        <div className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          You Are Approved!
        </h1>
        <p className={`mb-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Congratulations! Your {role} registration has been approved.
        </p>
        <div className={`p-4 rounded-xl mb-6 ${isDark ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-emerald-50 border border-emerald-200'}`}>
          <p className={`text-sm ${isDark ? 'text-emerald-300' : 'text-emerald-800'}`}>
            <strong>Check your email</strong> for confirmation. You can now login to your {role} dashboard.
          </p>
        </div>
        <button 
          onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }}
          className="w-full py-3 px-6 rounded-xl font-semibold bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg"
        >
          Go to Login
        </button>
      </div>
    </div>
  </div>
);

const RejectedMessage = ({ role, isDark }) => (
  <div className={`min-h-screen flex items-center justify-center p-4 ${isDark ? 'bg-gradient-to-br from-slate-950 via-red-950 to-slate-950' : 'bg-gradient-to-br from-red-50 via-white to-pink-50'}`}>
    <div className="max-w-md w-full text-center">
      <div className={`p-8 rounded-3xl border backdrop-blur-xl ${isDark ? 'bg-slate-900/80 border-slate-700' : 'bg-white/80 border-slate-200'} shadow-2xl`}>
        <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Registration Not Approved
        </h1>
        <p className={`mb-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Your {role} registration was not approved. Please contact support for more information.
        </p>
        <button 
          onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }}
          className="w-full py-3 px-6 rounded-xl font-semibold bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg"
        >
          Go to Login
        </button>
      </div>
    </div>
  </div>
);

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" />;
  
  const isApproved = user.registrationStatus === 'approved';
  const isPendingApproval = user.registrationStatus === 'pending_approval';
  
  if (!user.role && allowedRoles) return <Navigate to="/role-selection" />;
  
  if (allowedRoles && user.role && !allowedRoles.includes(user.role)) {
    if (user.role === 'admin') return <Navigate to="/admin" />;
    return <Navigate to="/login" />;
  }
  
  if (isPendingApproval) {
    return <PendingApprovalMessage role={user.role} isDark={true} />;
  }
  
  if (user.registrationStatus === 'rejected') {
    return <RejectedMessage role={user.role} isDark={true} />;
  }
  
  return children;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user || user.role !== 'admin') return <Navigate to="/admin/login" replace />;

  return children;
};

const AppRoutes = () => {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingScreen />;
  
return (
    <Routes>
      <Route path="/" element={user ? <Navigate to={getAuthenticatedHome(user)} replace /> : <Landing />} />
      <Route path="/login" element={user ? <Navigate to={getAuthenticatedHome(user)} replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to={getAuthenticatedHome(user)} replace /> : <Register />} />
      <Route path="/confirm-email" element={user ? <Navigate to={getAuthenticatedHome(user)} replace /> : <ConfirmEmail />} />
      <Route path="/forgot-password" element={user ? <Navigate to={getAuthenticatedHome(user)} replace /> : <ForgotPassword />} />
      <Route path="/role-selection" element={
        <ProtectedRoute>
          <RoleSelection />
        </ProtectedRoute>
      } />
      <Route path="/employee-registration" element={
        <ProtectedRoute>
          <EmployeeRegistration />
        </ProtectedRoute>
      } />
      <Route path="/recruiter-registration" element={
        <ProtectedRoute>
          <RecruiterRegistration />
        </ProtectedRoute>
      } />
      <Route path="/recruiter" element={
        <ProtectedRoute allowedRoles={['recruiter']}>
          <RecruiterDashboard />
        </ProtectedRoute>
      } />
      <Route path="/recruiter/dashboard" element={
        <ProtectedRoute allowedRoles={['recruiter']}>
          <RecruiterDashboard />
        </ProtectedRoute>
      } />
      <Route path="/dashboard" element={
        <ProtectedRoute allowedRoles={['employee', 'recruiter']}>
          {user?.role === 'employee' ? <EmployeeDashboard /> : <RecruiterDashboard />}
        </ProtectedRoute>
      } />
      <Route path="/jobs/:id" element={
        <ProtectedRoute allowedRoles={['employee', 'recruiter']}>
          <JobDetails />
        </ProtectedRoute>
      } />
      <Route path="/apply/:jobId" element={
        <ProtectedRoute allowedRoles={['employee']}>
          <ApplyJob />
        </ProtectedRoute>
      } />
      <Route path="/chat" element={
        <ProtectedRoute allowedRoles={['employee', 'recruiter']}>
          <Chat />
        </ProtectedRoute>
      } />
      <Route path="/chat/:partnerId" element={
        <ProtectedRoute allowedRoles={['employee', 'recruiter']}>
          <Chat />
        </ProtectedRoute>
      } />
      <Route path="/jobs" element={
        <ProtectedRoute allowedRoles={['employee', 'recruiter']}>
          <Jobs />
        </ProtectedRoute>
      } />
      <Route path="/applications" element={
        <ProtectedRoute allowedRoles={['employee']}>
          <Applications />
        </ProtectedRoute>
      } />
      <Route path="/saved-jobs" element={
        <ProtectedRoute allowedRoles={['employee']}>
          <SavedJobs />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute allowedRoles={['employee', 'recruiter']}>
          <UserProfile />
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute allowedRoles={['employee', 'recruiter']}>
          <Settings />
        </ProtectedRoute>
      } />
      <Route path="/admin" element={
        <AdminRoute>
          <AdminDashboard />
        </AdminRoute>
      } />
      <Route path="/admin/login" element={user?.role === 'admin' ? <Navigate to="/admin" replace /> : <AdminLoginPage />} />
      <Route path="/pending-approval" element={
        <ProtectedRoute allowedRoles={['employee', 'recruiter']}>
          <PendingApprovalMessage role={user?.role} isDark={true} />
        </ProtectedRoute>
      } />
      <Route path="/approved" element={
        <ProtectedRoute allowedRoles={['employee', 'recruiter']}>
          <ApprovedMessage role={user?.role} isDark={true} />
        </ProtectedRoute>
      } />
      <Route path="/rejected" element={
        <ProtectedRoute allowedRoles={['employee', 'recruiter']}>
          <RejectedMessage role={user?.role} isDark={true} />
        </ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
