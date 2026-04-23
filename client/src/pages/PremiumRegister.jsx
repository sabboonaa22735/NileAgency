import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiArrowRight, FiCheck, FiShield } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { PremiumAuthLayout, AuthForm } from '../components/ui/PremiumAuth';

const PasswordStrength = ({ password }) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  
  const getStrength = () => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 6) strength += 25;
    if (password.length >= 10) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    return strength;
  };
  
  const strength = getStrength();
  const bars = 4;
  const activeBars = Math.ceil((strength / 100) * bars);
  
  const getStrengthClass = () => {
    if (strength >= 75) return 'strong';
    if (strength >= 50) return 'medium';
    if (strength >= 25) return 'weak';
    return '';
  };

  if (!password) return null;

  return (
    <div className="password-strength-meter">
      <div className="strength-bars">
        {[...Array(bars)].map((_, i) => (
          <div
            key={i}
            className={`strength-bar ${i < activeBars ? getStrengthClass() : ''}`}
          />
        ))}
      </div>
      <span className={`strength-label ${getStrengthClass()}`}>
        {getStrengthClass() || ''} {getStrengthClass() ? 'strength' : ''}
      </span>
    </div>
  );
};

export default function PremiumRegister() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!agreeTerms) {
      setError('Please agree to the terms and conditions');
      return;
    }

    setLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate('/role-selection');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }

    setLoading(false);
  };

  const handleGoogleRegister = () => {
    window.location.href = 'http://localhost:5001/api/auth/google';
  };

  return (
    <PremiumAuthLayout>
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="error-message"
          >
            <FiShield className="flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        <div className="premium-input">
          <div className="input-icon">
            <FiUser />
          </div>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Full name"
            required
            autoComplete="name"
          />
        </div>

        <div className="premium-input">
          <div className="input-icon">
            <FiMail />
          </div>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email address"
            required
            autoComplete="email"
          />
        </div>

        <div className="premium-input">
          <div className="input-icon">
            <FiLock />
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password (min. 6 characters)"
            required
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="password-toggle"
          >
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </button>
        </div>

        <PasswordStrength password={formData.password} />

        <div className="premium-input">
          <div className="input-icon">
            <FiLock />
          </div>
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm password"
            required
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="password-toggle"
          >
            {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
          </button>
        </div>

        {formData.confirmPassword && formData.password === formData.confirmPassword && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="success-message"
          >
            <FiCheck className="flex-shrink-0" />
            <span>Passwords match!</span>
          </motion.div>
        )}

        <label className="premium-checkbox">
          <input
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
          />
          <span className="checkmark">
            <FiCheck className="w-3 h-3" />
          </span>
          <span className={isLight ? 'text-gray-600' : 'text-gray-300'}>
            I agree to the{' '}
            <Link to="/terms" className={isLight ? 'text-indigo-600' : 'text-indigo-400'}>
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className={isLight ? 'text-indigo-600' : 'text-indigo-400'}>
              Privacy Policy
            </Link>
          </span>
        </label>

        <motion.button
          type="submit"
          disabled={loading}
          className="premium-btn primary w-full"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? (
            <span className="loading-spinner" />
          ) : (
            <>
              <span>Create account</span>
              <FiArrowRight className="w-5 h-5" />
            </>
          )}
        </motion.button>

        <div className="premium-divider">
          <span>or continue with</span>
        </div>

        <motion.button
          type="button"
          onClick={handleGoogleRegister}
          className="social-btn"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <FcGoogle className="w-5 h-5" />
          <span>Sign up with Google</span>
        </motion.button>

        <p className={`form-footer ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
          Already have an account?
          <Link to="/login" className={isLight ? 'text-indigo-600' : 'text-indigo-400'}>
            {' '}Sign in
          </Link>
        </p>
      </form>
    </PremiumAuthLayout>
  );
}