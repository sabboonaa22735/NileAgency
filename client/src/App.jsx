import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import RoleSelection from './pages/RoleSelection';
import EmployeeRegistration from './pages/EmployeeRegistration';
import RecruiterRegistration from './pages/RecruiterRegistration';
import EmployeeDashboard from './pages/EmployeeDashboard';
import RecruiterDashboard from './pages/RecruiterDashboard';
import AdminDashboard from './pages/AdminDashboard';
import JobDetails from './pages/JobDetails';
import ApplyJob from './pages/ApplyJob';
import Chat from './pages/Chat';
import UserProfile from './pages/UserProfile';

const LoadingScreen = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50">
    <div className="w-16 h-16 rounded-full bg-brand-indigo flex items-center justify-center mb-4 animate-pulse">
      <span className="text-white font-bold text-2xl">N</span>
    </div>
    <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-200 border-t-indigo-600"></div>
  </div>
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

const AppRoutes = () => {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingScreen />;
  
  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Landing />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
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
      <Route path="/profile" element={
        <ProtectedRoute allowedRoles={['employee', 'recruiter']}>
          <UserProfile />
        </ProtectedRoute>
      } />
      <Route path="/admin" element={<Navigate to="/admin/login" />} />
      <Route path="/admin/login" element={<AdminDashboard />} />
    </Routes>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}