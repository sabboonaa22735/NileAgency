import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiCheck, FiShield } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { PremiumAuthLayout, AuthForm } from '../components/ui/PremiumAuth';

export default function PremiumLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(email, password);
      navigate(data.user?.role ? '/dashboard' : '/role-selection');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    }

    setLoading(false);
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/api/auth/google';
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
            <FiMail />
          </div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="password-toggle"
          >
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <label className="premium-checkbox">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <span className="checkmark">
              <FiCheck className="w-3 h-3" />
            </span>
            <span className={isLight ? 'text-gray-600' : 'text-gray-300'}>Remember me</span>
          </label>
          
          <Link
            to="/forgot-password"
            className={`text-sm font-medium transition-colors ${isLight ? 'text-indigo-600 hover:text-indigo-700' : 'text-indigo-400 hover:text-indigo-300'}`}
          >
            Forgot password?
          </Link>
        </div>

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
              <span>Sign in</span>
              <FiArrowRight className="w-5 h-5" />
            </>
          )}
        </motion.button>

        <div className="premium-divider">
          <span>or continue with</span>
        </div>

        <motion.button
          type="button"
          onClick={handleGoogleLogin}
          className="social-btn"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <FcGoogle className="w-5 h-5" />
          <span>Google</span>
        </motion.button>

        <p className={`form-footer ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
          Don't have an account?
          <Link to="/register" className={isLight ? 'text-indigo-600' : 'text-indigo-400'}>
            {' '}Create one
          </Link>
        </p>
      </form>
    </PremiumAuthLayout>
  );
}