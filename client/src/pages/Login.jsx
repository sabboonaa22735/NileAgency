import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowRight, FiLock, FiMail, FiShield, FiStar, FiArrowLeft, FiEye, FiEyeOff, FiZap, FiCheck } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import AuthShell from '../components/ui/AuthShell';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/api/auth/google';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(email, password);
      navigate(data.user.role ? '/dashboard' : '/role-selection');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }

    setLoading(false);
  };

  return (
    <AuthShell
      badge="Secure access"
      title="Welcome back"
      subtitle="Step into a sharper, faster recruitment workspace."
      sideTitle="A more premium way to hire, apply, and move work forward."
      sideBody="Nile Agency now feels more cinematic and product-grade, with depth, motion, and cleaner focus through every workflow."
      sideStats={[
        { value: '24/7', label: 'Live recruiter access' },
        { value: '10k+', label: 'Roles in motion' },
        { value: '98%', label: 'Approval confidence' }
      ]}
    >
      <div className="theme-toggle-wrapper flex justify-end mb-4">
        <motion.button
          onClick={toggleTheme}
          className="theme-btn"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="theme-icon-text">{isDark ? '☀️' : '🌙'}</span>
        </motion.button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="error-banner"
            >
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="input-group">
          <label className="input-label">Email</label>
          <div className="input-wrapper">
            <div className="input-icon">
              <FiMail />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="input-field"
              required
            />
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">Password</label>
          <div className="input-wrapper">
            <div className="input-icon">
              <FiLock />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="input-field pr-12"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="password-toggle"
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="checkbox-label">
            <input type="checkbox" className="checkbox-input" />
            <span className="checkbox-custom"></span>
            <span>Remember me</span>
          </label>
          <Link to="/forgot-password" className="forgot-link">
            Forgot password?
          </Link>
        </div>

        <motion.button
          type="submit"
          disabled={loading}
          className="submit-btn btn-3d-press ripple-effect w-full"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? (
            <span className="loading-spinner"></span>
          ) : (
            <>
              <span>Sign In</span>
              <FiArrowRight className="btn-icon" />
            </>
          )}
        </motion.button>

        <div className="divider">
          <span>or continue with</span>
        </div>

        <motion.button
          type="button"
          onClick={handleGoogleLogin}
          className="google-btn"
          whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.12)' }}
          whileTap={{ scale: 0.98 }}
        >
          <FcGoogle className="google-icon" />
          <span>Continue with Google</span>
        </motion.button>
      </form>

      <div className="mt-8 feature-card">
        <div className="feature-header">
          <FiZap className="feature-icon" />
          <span>What's new</span>
        </div>
        <ul className="feature-list">
          <li><FiCheck className="check-icon" /> Faster authentication</li>
          <li><FiCheck className="check-icon" /> Richer dashboards</li>
          <li><FiCheck className="check-icon" /> Motion-led feedback</li>
        </ul>
      </div>

      <p className="mt-6 signup-prompt">
        Don't have an account?{' '}
        <Link to="/register" className="signup-link">
          Create one
        </Link>
      </p>
    </AuthShell>
  );
}
