import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUser, FiLock, FiBell, FiShield, FiMoon, FiSun, FiGlobe, FiMail,
  FiArrowLeft, FiCheck, FiChevronRight, FiSmartphone, FiMonitor,
  FiEye, FiEyeOff, FiKey, FiLogOut, FiDownload, FiTrash2, FiSave,
  FiHome, FiBriefcase, FiMessageSquare, FiSearch, FiSettings
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const tabs = [
  { id: 'account', label: 'Account', icon: FiUser },
  { id: 'security', label: 'Security', icon: FiShield },
  { id: 'notifications', label: 'Notifications', icon: FiBell },
  { id: 'preferences', label: 'Preferences', icon: FiSettings },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState('account');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 1000);
  };

  const ProfileCard = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-morphism rounded-2xl p-6"
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-indigo to-brand-blue flex items-center justify-center">
          <span className="text-white text-2xl font-bold">{user?.email?.[0]?.toUpperCase() || 'U'}</span>
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-white">{user?.email?.split('@')[0] || 'User'}</h3>
          <p className="text-sm text-gray-400">{user?.email}</p>
          <p className="text-xs text-brand-indigo capitalize">{user?.role}</p>
        </div>
        <button className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors">
          <FiUser className="w-5 h-5" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <button className="btn-primary justify-center">
          <FiDownload className="w-4 h-4" />
          Export Data
        </button>
        <button className="btn-secondary text-white justify-center">
          <FiTrash2 className="w-4 h-4" />
          Delete Account
        </button>
      </div>
    </motion.div>
  );

  const AccountSettings = () => (
    <div className="space-y-6">
      <ProfileCard />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-morphism rounded-2xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">First Name</label>
            <input
              type="text"
              defaultValue={user?.email?.split('@')[0]?.charAt(0).toUpperCase()}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Last Name</label>
            <input
              type="text"
              defaultValue=""
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Email</label>
            <input
              type="email"
              defaultValue={user?.email}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Phone</label>
            <input
              type="tel"
              defaultValue=""
              placeholder="+1 (555) 000-0000"
              className="input-field"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-400 mb-2">Location</label>
            <input
              type="text"
              defaultValue=""
              placeholder="City, Country"
              className="input-field"
            />
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-morphism rounded-2xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Bio</h3>
        <textarea
          rows={4}
          placeholder="Tell us about yourself..."
          className="input-field resize-none"
        />
      </motion.div>
    </div>
  );

  const SecuritySettings = () => (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-morphism rounded-2xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Change Password</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Current Password</label>
            <div className="relative">
              <input
                type="password"
                defaultValue=""
                placeholder="Enter current password"
                className="input-field pr-12"
              />
              <button className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                <FiEye className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">New Password</label>
            <input
              type="password"
              defaultValue=""
              placeholder="Enter new password"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Confirm New Password</label>
            <input
              type="password"
              defaultValue=""
              placeholder="Confirm new password"
              className="input-field"
            />
          </div>
          <button className="btn-primary">
            <FiKey className="w-4 h-4" />
            Update Password
          </button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-morphism rounded-2xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Two-Factor Authentication</h3>
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <FiShield className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="font-medium text-white">Authenticator App</p>
              <p className="text-sm text-gray-400">Use an app to generate codes</p>
            </div>
          </div>
          <button className="btn-secondary text-white">
            Enable
          </button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-morphism rounded-2xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Active Sessions</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
            <div className="flex items-center gap-4">
              <FiMonitor className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-white">MacBook Pro</p>
                <p className="text-sm text-gray-400">Chrome • San Francisco, CA</p>
              </div>
            </div>
            <span className="text-xs text-emerald-400">Active now</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
            <div className="flex items-center gap-4">
              <FiSmartphone className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-white">iPhone 15 Pro</p>
                <p className="text-sm text-gray-400">Safari • San Francisco, CA</p>
              </div>
            </div>
            <button className="text-xs text-red-400 hover:underline">
              Revoke
            </button>
          </div>
        </div>
        <button className="w-full mt-4 p-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2">
          <FiLogOut className="w-4 h-4" />
          Sign out of all devices
        </button>
      </motion.div>
    </div>
  );

  const NotificationSettings = () => (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-morphism rounded-2xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Email Notifications</h3>
        <div className="space-y-4">
          {[
            { label: 'New job matches', desc: 'Get notified when new jobs match your preferences', enabled: true },
            { label: 'Application updates', desc: 'Get notified about application status changes', enabled: true },
            { label: 'Interview requests', desc: 'Get notified when recruiters want to interview', enabled: true },
            { label: 'Weekly digest', desc: 'Receive a weekly summary of your activity', enabled: false },
            { label: 'Product updates', desc: 'News about new features and improvements', enabled: false },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
              <div>
                <p className="font-medium text-white">{item.label}</p>
                <p className="text-sm text-gray-400">{item.desc}</p>
              </div>
              <button
                className={`w-12 h-7 rounded-full transition-colors ${
                  item.enabled ? 'bg-brand-indigo' : 'bg-white/20'
                }`}
              >
                <motion.div
                  className="w-5 h-5 rounded-full bg-white shadow-lg"
                  initial={false}
                  animate={{ x: item.enabled ? 20 : 2 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-morphism rounded-2xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Push Notifications</h3>
        <div className="space-y-4">
          {[
            { label: 'New messages', desc: 'Get notified for new messages', enabled: true },
            { label: 'Application views', desc: 'Get notified when your application is viewed', enabled: false },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
              <div>
                <p className="font-medium text-white">{item.label}</p>
                <p className="text-sm text-gray-400">{item.desc}</p>
              </div>
              <button
                className={`w-12 h-7 rounded-full transition-colors ${
                  item.enabled ? 'bg-brand-indigo' : 'bg-white/20'
                }`}
              >
                <motion.div
                  className="w-5 h-5 rounded-full bg-white shadow-lg"
                  initial={false}
                  animate={{ x: item.enabled ? 20 : 2 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-morphism rounded-2xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Email Preferences</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Email Address</label>
            <input
              type="email"
              defaultValue={user?.email}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Frequency</label>
            <select className="input-field">
              <option>Instant</option>
              <option>Daily digest</option>
              <option>Weekly digest</option>
              <option>Never</option>
            </select>
          </div>
        </div>
      </motion.div>
    </div>
  );

  const PreferenceSettings = () => (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-morphism rounded-2xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Appearance</h3>
        <div className="flex items-center gap-4">
          <button
            onClick={() => isDark && toggleTheme()}
            className={`flex-1 p-4 rounded-xl transition-all ${
              !isDark ? 'bg-brand-indigo/20 border-2 border-brand-indigo' : 'bg-white/5 border-2 border-transparent'
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center mx-auto mb-3">
              <FiSun className="w-6 h-6 text-yellow-400" />
            </div>
            <p className="text-center font-medium text-white">Light</p>
          </button>
          <button
            onClick={() => !isDark && toggleTheme()}
            className={`flex-1 p-4 rounded-xl transition-all ${
              isDark ? 'bg-brand-indigo/20 border-2 border-brand-indigo' : 'bg-white/5 border-2 border-transparent'
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-900/50 flex items-center justify-center mx-auto mb-3">
              <FiMoon className="w-6 h-6 text-indigo-400" />
            </div>
            <p className="text-center font-medium text-white">Dark</p>
          </button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-morphism rounded-2xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Language & Region</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Language</label>
            <select className="input-field">
              <option>English (US)</option>
              <option>English (UK)</option>
              <option>Spanish</option>
              <option>French</option>
              <option>German</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Timezone</label>
            <select className="input-field">
              <option>Pacific Time (PT)</option>
              <option>Mountain Time (MT)</option>
              <option>Central Time (CT)</option>
              <option>Eastern Time (ET)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Currency</label>
            <select className="input-field">
              <option>USD ($)</option>
              <option>EUR (€)</option>
              <option>GBP (£)</option>
            </select>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-morphism rounded-2xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Privacy</h3>
        <div className="space-y-4">
          {[
            { label: 'Profile visibility', desc: 'Who can see your profile', value: 'Public' },
            { label: 'Activity status', desc: 'Show your activity to others', value: 'On' },
            { label: 'Search engine', desc: 'Appear in search results', value: 'On' },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
              <div>
                <p className="font-medium text-white">{item.label}</p>
                <p className="text-sm text-gray-400">{item.desc}</p>
              </div>
              <button className="flex items-center gap-2 text-brand-indigo">
                <span>{item.value}</span>
                <FiChevronRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-dark-bg transition-colors duration-300">
      <motion.div 
        initial={{ x: -280 }}
        animate={{ x: sidebarCollapsed ? -240 : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed left-0 top-0 h-screen glass-morphism z-40 dark:bg-dark-surface"
        style={{ width: sidebarCollapsed ? 72 : 260 }}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 flex items-center justify-between border-b border-white/5">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-indigo to-brand-blue flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">N</span>
              </div>
              {!sidebarCollapsed && (
                <span className="text-xl font-bold text-white">Nile</span>
              )}
            </Link>
          </div>

          <div className="flex-1 py-4 overflow-y-auto">
            {[
              { id: 'dashboard', icon: FiHome, label: 'Dashboard', path: '/dashboard' },
              { id: 'messages', icon: FiMessageSquare, label: 'Messages', path: '/chat' },
              { id: 'profile', icon: FiUser, label: 'Profile', path: '/profile' },
              { id: 'settings', icon: FiSettings, label: 'Settings', path: '/settings' },
            ].map((item) => (
              <Link
                key={item.id}
                to={item.path}
                className={`w-full flex items-center gap-3 px-4 py-3 mx-2 rounded-xl transition-all ${
                  item.id === 'settings' 
                    ? 'bg-brand-indigo/20 text-brand-indigo border-l-2 border-brand-indigo' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                } ${sidebarCollapsed ? 'justify-center' : ''}`}
              >
                <item.icon className="w-5 h-5" />
                {!sidebarCollapsed && <span className="text-sm">{item.label}</span>}
              </Link>
            ))}
          </div>

          <div className="p-4 border-t border-white/5">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-full flex items-center justify-center gap-2 py-2 text-gray-400 hover:text-white"
            >
              {sidebarCollapsed ? <FiChevronRight className="w-5 h-5" /> : <FiArrowLeft className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 right-0 left-0 h-16 glass-morphism z-30 dark:bg-dark-surface"
        style={{ marginLeft: sidebarCollapsed ? 72 : 260 }}
      >
        <div className="flex items-center justify-between h-full px-6">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white">
              <FiArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </Link>
            <h1 className="text-xl font-semibold text-white">Settings</h1>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleSave}
              disabled={loading}
              className={`btn-primary ${saved ? 'bg-emerald-500' : ''}`}
            >
              {saved ? <FiCheck className="w-4 h-4" /> : loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <FiSave className="w-4 h-4" />
              )}
              {saved ? 'Saved!' : 'Save Changes'}
            </button>
          </div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="pt-16 min-h-screen"
        style={{ marginLeft: sidebarCollapsed ? 72 : 260 }}
      >
        <div className="flex p-4 md:p-6 gap-6">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="w-64 flex-shrink-0 hidden md:block"
          >
            <div className="glass-morphism rounded-2xl p-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === tab.id 
                      ? 'bg-brand-indigo/20 text-brand-indigo' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </motion.div>

          <div className="flex-1">
            <AnimatePresence mode="wait">
              {activeTab === 'account' && <AccountSettings key="account" />}
              {activeTab === 'security' && <SecuritySettings key="security" />}
              {activeTab === 'notifications' && <NotificationSettings key="notifications" />}
              {activeTab === 'preferences' && <PreferenceSettings key="preferences" />}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}