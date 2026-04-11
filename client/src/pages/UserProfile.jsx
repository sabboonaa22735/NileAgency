import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiCamera, FiArrowLeft, FiSave, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';

export default function UserProfile() {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
    profileImage: null
  });
  const [currentImage, setCurrentImage] = useState('');
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  useEffect(() => {
    if (user) {
      setFormData({
        ...formData,
        email: user.email || '',
        firstName: user.firstName || '',
        lastName: user.lastName || ''
      });
      if (user.profileImage) {
        setCurrentImage(user.profileImage);
      }
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }
      setFormData({ ...formData, profileImage: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password && formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append('email', formData.email);
      data.append('firstName', formData.firstName);
      data.append('lastName', formData.lastName);
      if (formData.password) {
        data.append('password', formData.password);
      }
      if (formData.profileImage) {
        data.append('profileImage', formData.profileImage);
      }

      await authApi.updateUserProfile(data);
      await refreshUser();
      setSuccess('Profile updated successfully!');
      setFormData({ ...formData, password: '', confirmPassword: '', profileImage: null });
      setPreview('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
    setLoading(false);
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }
    try {
      await authApi.deleteAccount();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete account');
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <nav className="glass sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/dashboard" className="flex items-center gap-2">
              <FiArrowLeft className="w-5 h-5 text-brand-dark" />
              <span className="text-brand-dark font-medium">Back</span>
            </Link>
            <div className="flex items-center gap-2">
              <FiUser className="w-5 h-5 text-brand-indigo" />
              <span className="text-brand-dark font-semibold">My Profile</span>
            </div>
            <div className="w-20" />
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-8"
        >
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-brand-dark mb-2">Account Settings</h1>
            <p className="text-brand-gray">Manage your account information</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 text-green-600 text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center mb-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-brand-indigo/10 flex items-center justify-center overflow-hidden border-4 border-brand-indigo/20">
                  {preview ? (
                    <img src={preview} alt="Profile" className="w-full h-full object-cover" />
                  ) : currentImage ? (
                    <img src={currentImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <FiUser className="w-16 h-16 text-brand-indigo/50" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-brand-indigo flex items-center justify-center cursor-pointer hover:bg-brand-indigo/90 transition">
                  <FiCamera className="w-5 h-5 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-sm text-brand-gray mt-2">Click camera icon to upload photo</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-brand-dark mb-2">First Name</label>
                <div className="relative">
                  <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gray" />
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="input-glass w-full pl-12"
                    placeholder="Your first name"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-dark mb-2">Last Name</label>
                <div className="relative">
                  <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gray" />
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="input-glass w-full pl-12"
                    placeholder="Your last name"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-dark mb-2">Email</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gray" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-glass w-full pl-12"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-brand-dark mb-4">Change Password</h3>
              <p className="text-sm text-brand-gray mb-4">Leave blank if you don't want to change your password</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-2">New Password</label>
                  <div className="relative">
                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gray" />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="input-glass w-full pl-12"
                      placeholder="Leave blank to keep current"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-2">Confirm New Password</label>
                  <div className="relative">
                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gray" />
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="input-glass w-full pl-12"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <FiSave className="w-5 h-5" />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>

          <div className="border-t border-gray-200 mt-8 pt-8">
            <h3 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h3>
            <p className="text-sm text-brand-gray mb-4">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <button
              onClick={handleDeleteAccount}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition"
            >
              <FiTrash2 className="w-5 h-5" />
              Delete My Account
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
