import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

const getAuthenticatedHome = (user) => {
  if (!user) return '/';
  if (user.role === 'admin') return '/admin';
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

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" />;
  if (!user.role && allowedRoles) return <Navigate to="/role-selection" />;
  if (allowedRoles && user.role && !allowedRoles.includes(user.role)) {
    if (user.role === 'admin') return <Navigate to="/admin" />;
    return <Navigate to="/login" />;
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
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
