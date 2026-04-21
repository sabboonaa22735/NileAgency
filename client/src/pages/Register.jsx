import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowRight, FiBriefcase, FiLock, FiMail, FiUser, FiArrowLeft, FiCheck, FiEye, FiEyeOff, FiZap, FiShield } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { authApi } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import AuthShell from '../components/ui/AuthShell';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [intent, setIntent] = useState('employee');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const handleGoogleRegister = () => {
    window.location.href = 'http://localhost:5000/api/auth/google';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await authApi.register({ email, password });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }

    setLoading(false);
  };

  const getPasswordStrength = () => {
    if (!password) return { strength: 0, label: '', color: '' };
    let strength = 0;
    if (password.length >= 6) strength += 25;
    if (password.length >= 10) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    
    const labels = ['Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['#ef4444', '#f59e0b', '#22c55e', '#10b981'];
    return { strength, label: labels[Math.min(Math.floor(strength / 25), 3)], color: colors[Math.min(Math.floor(strength / 25), 3)] };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <AuthShell
      badge="Create your space"
      title="Create a new account"
      subtitle="Join the platform with a more premium, polished first impression."
      sideTitle="Beautiful onboarding that feels intentional from the first click."
      sideBody="We're pairing cleaner forms with dramatic depth, ambient lighting, and motion that makes the product feel alive without slowing it down."
      sideStats={[
        { value: '2', label: 'Primary user paths' },
        { value: '3D', label: 'Motion-rich surfaces' },
        { value: 'Fast', label: 'Low-friction setup' }
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
          <label className="input-label">I want to</label>
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              type="button"
              onClick={() => setIntent('employee')}
              className={`role-card ${intent === 'employee' ? 'active' : ''}`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="icon-wrapper">
                <FiUser className="h-5 w-5 text-cyan-300" />
              </div>
              <div className="role-title">Find Jobs</div>
              <div className="role-desc">Apply and build your profile</div>
            </motion.button>
            <motion.button
              type="button"
              onClick={() => setIntent('recruiter')}
              className={`role-card ${intent === 'recruiter' ? 'active' : ''}`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="icon-wrapper">
                <FiBriefcase className="h-5 w-5 text-purple-300" />
              </div>
              <div className="role-title">Hire Talent</div>
              <div className="role-desc">Post jobs and manage applicants</div>
            </motion.button>
          </div>
        </div>

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
              placeholder="At least 6 characters"
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
          {password && (
            <div className="password-strength">
              <div className="strength-bar">
                <motion.div
                  className="strength-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${passwordStrength.strength}%` }}
                  style={{ backgroundColor: passwordStrength.color }}
                />
              </div>
              <span className="strength-label" style={{ color: passwordStrength.color }}>
                {passwordStrength.label}
              </span>
            </div>
          )}
        </div>

        <div className="input-group">
          <label className="input-label">Confirm Password</label>
          <div className="input-wrapper">
            <div className="input-icon">
              <FiLock />
            </div>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat your password"
              className="input-field pr-12"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="password-toggle"
            >
              {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
          {confirmPassword && password === confirmPassword && (
            <div className="password-match">
              <FiCheck className="match-icon" /> Passwords match
            </div>
          )}
        </div>

        <p className="terms-text">
          By continuing, you agree to the platform{' '}
          <Link to="/terms" className="terms-link">terms</Link> and{' '}
          <Link to="/privacy" className="terms-link">privacy policy</Link>.
        </p>

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
              <span>Create Account</span>
              <FiArrowRight className="btn-icon" />
            </>
          )}
        </motion.button>

        <div className="divider">
          <span>or continue with</span>
        </div>

        <motion.button
          type="button"
          onClick={handleGoogleRegister}
          className="google-btn"
          whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.12)' }}
          whileTap={{ scale: 0.98 }}
        >
          <FcGoogle className="google-icon" />
          <span>Sign up with Google</span>
        </motion.button>
      </form>

      <p className="signup-prompt">
        Already have an account?{' '}
        <Link to="/login" className="signup-link">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}