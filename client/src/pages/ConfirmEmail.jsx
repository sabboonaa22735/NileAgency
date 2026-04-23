import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiMail, FiCheck, FiArrowRight } from 'react-icons/fi';
import { authApi } from '../services/api';
import AuthShell from '../components/ui/AuthShell';

export default function ConfirmEmail() {
  const [otp, setOtp] = useState(['', '', '', '', '', '',]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      document.getElementById(`otp-input-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-input-${index - 1}`)?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;
    
    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);
    
    if (pastedData.length < 6) {
      document.getElementById(`otp-input-${pastedData.length}`)?.focus();
    } else {
      document.getElementById(`otp-input-5`)?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setLoading(true);

    try {
      const { data } = await authApi.verifyOtp({ email, otp: otpCode });
      
      if (data.token && data.user) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      
      navigate('/role-selection', { state: { email } });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired code');
    }

    setLoading(false);
  };

  useEffect(() => {
    if (resendTimer === 0) return;
    const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const handleResend = async () => {
    if (resendTimer > 0) return;
    
    try {
      await authApi.resendOtp({ email });
      setResendTimer(60);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend code');
    }
  };

  return (
    <AuthShell
      badge="Verify your email"
      title="Check your inbox"
      subtitle="We've sent a 6-digit verification code to your email."
      sideTitle="Security that doesn't slow you down."
      sideBody="By verifying your email, we ensure a safer community and protect your account from unauthorized access."
      sideStats={[
        { value: '6', label: 'Digit code' },
        { value: '5min', label: 'Code validity' },
        { value: 'Safe', label: 'Verified account' }
      ]}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-brand-indigo/20 flex items-center justify-center">
            <FiMail className="w-6 h-6 text-brand-indigo" />
          </div>
        </div>

        <p className="text-center text-brand-gray mb-6">
          Enter the 6-digit code sent to<br />
          <span className="font-medium text-brand-dark">{email}</span>
        </p>

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

        <div className="otp-container" onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-input-${index}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={`otp-input ${digit ? 'otp-filled' : ''}`}
            />
          ))}
        </div>

        <motion.button
          type="submit"
          disabled={loading || otp.join('').length !== 6}
          className="submit-btn btn-3d-press ripple-effect w-full"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? (
            <span className="loading-spinner"></span>
          ) : (
            <>
              <span>Verify Email</span>
              <FiArrowRight className="btn-icon" />
            </>
          )}
        </motion.button>

        <p className="terms-text text-center">
          Didn't receive the code?{' '}
          <button
            type="button"
            onClick={handleResend}
            disabled={resendTimer > 0}
            className="terms-link"
          >
            {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend code'}
          </button>
        </p>
      </form>

      <p className="signup-prompt">
        <button
          onClick={() => navigate('/register')}
          className="signup-link flex items-center gap-2"
        >
          <FiArrowLeft /> Back to registration
        </button>
      </p>
    </AuthShell>
  );
}