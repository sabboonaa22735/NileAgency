import { Link } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiMail, FiLock, FiCheck, FiZap, FiKey } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { useTheme } from '../context/ThemeContext';
import AuthShell from '../components/ui/AuthShell';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    setTimeout(() => {
      setSubmitted(true);
      setLoading(false);
    }, 1500);
  };

  const handleGoogleReset = () => {
    window.location.href = 'http://localhost:5000/api/auth/google';
  };

  if (submitted) {
    return (
      <AuthShell
        badge="Reset link sent"
        title="Check your email"
        subtitle="We've sent a password reset link to your inbox."
        sideTitle="Recover your account"
        sideBody="Reset your password securely with our encrypted recovery system."
        sideStats={[
          { value: '256-bit', label: 'Encryption' },
          { value: 'Instant', label: 'Recovery' },
          { value: 'Secure', label: 'Protocol' }
        ]}
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="success-icon-wrapper"
          >
            <FiCheck className="success-icon" />
          </motion.div>

          <h2 className="text-2xl font-bold text-white mb-4">Email Sent!</h2>
          <p className="text-slate-300 mb-8">
            We've sent a password reset link to <strong>{email}</strong>
            <br />Follow the instructions to reset your password.
          </p>

          <div className="options-card">
            <h3 className="options-title">Having trouble?</h3>
            <ul className="options-list">
              <li>Check your spam folder</li>
              <li>Make sure your email is correct</li>
              <li>Try a different recovery method</li>
            </ul>
          </div>

          <Link to="/login" className="back-link">
            <FiArrowLeft /> Back to login
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      badge="Password recovery"
      title="Reset your password"
      subtitle="Enter your email to receive a reset link."
      sideTitle="Recover your account"
      sideBody="Reset your password securely with our encrypted recovery system."
      sideStats={[
        { value: '256-bit', label: 'Encryption' },
        { value: 'Instant', label: 'Recovery' },
        { value: 'Secure', label: 'Protocol' }
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
        <div className="input-group">
          <label className="input-label">Email address</label>
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
              <span>Send Reset Link</span>
              <FiKey className="btn-icon" />
            </>
          )}
        </motion.button>

        <div className="divider">
          <span>or try</span>
        </div>

        <motion.button
          type="button"
          onClick={handleGoogleReset}
          className="google-btn"
          whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.12)' }}
          whileTap={{ scale: 0.98 }}
        >
          <FcGoogle className="google-icon" />
          <span>Reset with Google</span>
        </motion.button>
      </form>

      <div className="security-note">
        <FiZap className="security-icon" />
        <p>
          Your account is protected with 256-bit encryption.
          We never store your password in plain text.
        </p>
      </div>

      <Link to="/login" className="back-link">
        <FiArrowLeft /> Back to login
      </Link>
    </AuthShell>
  );
}