import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FiMoon, FiSun, FiGlobe, FiBell, FiShield, FiLock, FiMonitor, 
  FiSmartphone, FiMail, FiClock, FiVolume2, FiDatabase, FiSave,
  FiCheck, FiX, FiChevronRight
} from 'react-icons/fi';

export default function SettingsPage({ darkMode = true, onDarkModeChange }) {
  const [settings, setSettings] = useState({
    darkMode: darkMode,
    language: 'en',
    notifications: {
      email: true,
      push: true,
      sms: false,
      newUsers: true,
      newJobs: true,
      newPayments: true,
      applications: true,
    },
    security: {
      twoFactor: false,
      sessionTimeout: 30,
    },
    display: {
      compactMode: false,
      showAnimations: true,
      reducedMotion: false,
    },
    privacy: {
      profileVisibility: 'public',
      showOnlineStatus: true,
    },
  });

  const textPrimary = darkMode ? 'text-slate-100' : 'text-slate-900';
  const textSecondary = darkMode ? 'text-slate-400' : 'text-slate-600';
  const textMuted = darkMode ? 'text-slate-500' : 'text-slate-400';
  const bgCard = darkMode ? 'bg-slate-800/50' : 'bg-white';
  const bgCardHover = darkMode ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50';
  const borderColor = darkMode ? 'border-slate-700/50' : 'border-slate-200';

  const ToggleSwitch = ({ enabled, onChange }) => (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={() => onChange(!enabled)}
      className={`relative w-12 h-7 rounded-full transition-colors duration-300 ${
        enabled 
          ? 'bg-indigo-500' 
          : darkMode ? 'bg-slate-600' : 'bg-slate-300'
      }`}
    >
      <motion.div
        animate={{ x: enabled ? 22 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className={`absolute top-1 w-5 h-5 rounded-full shadow-md ${
          enabled ? 'bg-white' : darkMode ? 'bg-slate-200' : 'bg-white'
        }`}
      />
    </motion.button>
  );

  const SettingSection = ({ title, description, icon: Icon, children }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border ${borderColor} ${bgCard} backdrop-blur-xl overflow-hidden`}
    >
      <div className={`p-5 border-b ${borderColor} flex items-center gap-4`}>
        <div className={`w-10 h-10 rounded-xl ${darkMode ? 'bg-indigo-500/20' : 'bg-indigo-100'} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
        </div>
        <div>
          <h3 className={`text-lg font-semibold ${textPrimary}`}>{title}</h3>
          <p className={`text-sm ${textMuted}`}>{description}</p>
        </div>
      </div>
      <div className="p-5">
        {children}
      </div>
    </motion.div>
  );

  const SettingRow = ({ label, description, children, onClick }) => (
    <div 
      onClick={onClick}
      className={`flex items-center justify-between py-4 ${
        onClick ? 'cursor-pointer' : ''
      } border-b ${darkMode ? 'border-slate-700/30' : 'border-slate-100'} last:border-0`}
    >
      <div className="flex-1">
        <div className={`font-medium ${textPrimary}`}>{label}</div>
        {description && (
          <div className={`text-sm ${textMuted} mt-0.5`}>{description}</div>
        )}
      </div>
      {children}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className={`text-2xl font-bold ${textPrimary}`}>Settings</h2>
        <p className={`${textSecondary} mt-1`}>Manage your dashboard preferences</p>
      </motion.div>

      <SettingSection 
        title="Appearance" 
        description="Customize how the dashboard looks"
        icon={FiMonitor}
      >
        <SettingRow label="Dark Mode" description="Use dark theme across all pages">
          <ToggleSwitch 
            enabled={settings.darkMode} 
            onChange={(val) => {
              setSettings(prev => ({ ...prev, darkMode: val }));
              onDarkModeChange?.(val);
            }} 
          />
        </SettingRow>
        
        <SettingRow label="Compact Mode" description="Show more content with less spacing">
          <ToggleSwitch 
            enabled={settings.display.compactMode}
            onChange={(val) => setSettings(prev => ({ 
              ...prev, 
              display: { ...prev.display, compactMode: val } 
            }))} 
          />
        </SettingRow>
        
        <SettingRow label="Animations" description="Enable smooth transitions and effects">
          <ToggleSwitch 
            enabled={settings.display.showAnimations}
            onChange={(val) => setSettings(prev => ({ 
              ...prev, 
              display: { ...prev.display, showAnimations: val } 
            }))} 
          />
        </SettingRow>
        
        <SettingRow label="Reduced Motion" description="Minimize animations for accessibility">
          <ToggleSwitch 
            enabled={settings.display.reducedMotion}
            onChange={(val) => setSettings(prev => ({ 
              ...prev, 
              display: { ...prev.display, reducedMotion: val } 
            }))} 
          />
        </SettingRow>
      </SettingSection>

      <SettingSection 
        title="Notifications" 
        description="Configure how you receive alerts"
        icon={FiBell}
      >
        <SettingRow label="Email Notifications" description="Receive updates via email">
          <ToggleSwitch 
            enabled={settings.notifications.email}
            onChange={(val) => setSettings(prev => ({ 
              ...prev, 
              notifications: { ...prev.notifications, email: val } 
            }))} 
          />
        </SettingRow>
        
        <SettingRow label="Push Notifications" description="Get browser notifications">
          <ToggleSwitch 
            enabled={settings.notifications.push}
            onChange={(val) => setSettings(prev => ({ 
              ...prev, 
              notifications: { ...prev.notifications, push: val } 
            }))} 
          />
        </SettingRow>
        
        <SettingRow label="New User Registrations" description="Notify when users register">
          <ToggleSwitch 
            enabled={settings.notifications.newUsers}
            onChange={(val) => setSettings(prev => ({ 
              ...prev, 
              notifications: { ...prev.notifications, newUsers: val } 
            }))} 
          />
        </SettingRow>
        
        <SettingRow label="New Job Postings" description="Notify when new jobs are posted">
          <ToggleSwitch 
            enabled={settings.notifications.newJobs}
            onChange={(val) => setSettings(prev => ({ 
              ...prev, 
              notifications: { ...prev.notifications, newJobs: val } 
            }))} 
          />
        </SettingRow>
        
        <SettingRow label="Payment Updates" description="Notify for payment activities">
          <ToggleSwitch 
            enabled={settings.notifications.newPayments}
            onChange={(val) => setSettings(prev => ({ 
              ...prev, 
              notifications: { ...prev.notifications, newPayments: val } 
            }))} 
          />
        </SettingRow>
      </SettingSection>

      <SettingSection 
        title="Security" 
        description="Protect your account"
        icon={FiShield}
      >
        <SettingRow label="Two-Factor Authentication" description="Add an extra layer of security">
          <ToggleSwitch 
            enabled={settings.security.twoFactor}
            onChange={(val) => setSettings(prev => ({ 
              ...prev, 
              security: { ...prev.security, twoFactor: val } 
            }))} 
          />
        </SettingRow>
        
        <SettingRow 
          label="Session Timeout" 
          description="Auto logout after inactivity"
        >
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
            darkMode ? 'bg-slate-700' : 'bg-slate-100'
          }`}>
            <select 
              value={settings.security.sessionTimeout}
              onChange={(e) => setSettings(prev => ({ 
                ...prev, 
                security: { ...prev.security, sessionTimeout: parseInt(e.target.value) } 
              }))}
              className={`bg-transparent outline-none ${textPrimary} text-sm`}
            >
              <option value={15}>15 min</option>
              <option value={30}>30 min</option>
              <option value={60}>1 hour</option>
              <option value={120}>2 hours</option>
            </select>
            <FiChevronRight className={`w-4 h-4 ${textMuted}`} />
          </div>
        </SettingRow>
      </SettingSection>

      <SettingSection 
        title="Privacy" 
        description="Control your data visibility"
        icon={FiLock}
      >
        <SettingRow 
          label="Profile Visibility" 
          description="Who can see your profile"
        >
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
            darkMode ? 'bg-slate-700' : 'bg-slate-100'
          }`}>
            <select 
              value={settings.privacy.profileVisibility}
              onChange={(e) => setSettings(prev => ({ 
                ...prev, 
                privacy: { ...prev.privacy, profileVisibility: e.target.value } 
              }))}
              className={`bg-transparent outline-none ${textPrimary} text-sm`}
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="contacts">Contacts Only</option>
            </select>
            <FiChevronRight className={`w-4 h-4 ${textMuted}`} />
          </div>
        </SettingRow>
        
        <SettingRow label="Show Online Status" description="Let others see when you're online">
          <ToggleSwitch 
            enabled={settings.privacy.showOnlineStatus}
            onChange={(val) => setSettings(prev => ({ 
              ...prev, 
              privacy: { ...prev.privacy, showOnlineStatus: val } 
            }))} 
          />
        </SettingRow>
      </SettingSection>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex justify-end gap-3"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`px-6 py-3 rounded-xl ${
            darkMode 
              ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' 
              : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
          } transition font-medium`}
        >
          Cancel
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition font-medium shadow-lg shadow-indigo-500/25"
        >
          <FiSave className="w-4 h-4" />
          Save Changes
        </motion.button>
      </motion.div>
    </motion.div>
  );
}