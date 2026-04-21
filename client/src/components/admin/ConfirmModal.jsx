import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiAlertTriangle, FiCheckCircle, FiXCircle, FiInfo, FiX,
  FiCheck, FiTrash2, FiEdit, FiUserPlus, FiBriefcase
} from 'react-icons/fi';

const iconTypes = {
  danger: { icon: FiAlertTriangle, color: 'text-red-500', bg: 'bg-red-500/20' },
  success: { icon: FiCheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/20' },
  warning: { icon: FiAlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/20' },
  info: { icon: FiInfo, color: 'text-blue-500', bg: 'bg-blue-500/20' },
  delete: { icon: FiTrash2, color: 'text-red-500', bg: 'bg-red-500/20' },
  edit: { icon: FiEdit, color: 'text-amber-500', bg: 'bg-amber-500/20' },
  addUser: { icon: FiUserPlus, color: 'text-indigo-500', bg: 'bg-indigo-500/20' },
  addJob: { icon: FiBriefcase, color: 'text-purple-500', bg: 'bg-purple-500/20' },
};

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  type = 'info',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  darkMode = true,
  loading = false,
}) {
  const config = iconTypes[type] || iconTypes.info;
  const IconComponent = config.icon;

  const textPrimary = darkMode ? 'text-slate-100' : 'text-slate-900';
  const textSecondary = darkMode ? 'text-slate-400' : 'text-slate-600';
  const bgCard = darkMode ? 'bg-slate-800/90' : 'bg-white';
  const borderColor = darkMode ? 'border-slate-700/50' : 'border-slate-200';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25 }}
            className={`relative ${bgCard} rounded-2xl border ${borderColor} shadow-2xl max-w-md w-full p-6`}
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className={`absolute top-4 right-4 p-2 rounded-lg ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'} transition`}
            >
              <FiX className={`w-5 h-5 ${textSecondary}`} />
            </motion.button>

            <div className="flex flex-col items-center text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring' }}
                className={`w-16 h-16 rounded-2xl ${config.bg} flex items-center justify-center mb-4`}
              >
                <IconComponent className={`w-8 h-8 ${config.color}`} />
              </motion.div>
              
              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={`text-xl font-bold ${textPrimary} mb-2`}
              >
                {title}
              </motion.h3>
              
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className={`${textSecondary} mb-6`}
              >
                {message}
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex gap-3 w-full"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  disabled={loading}
                  className={`flex-1 py-3 rounded-xl ${
                    darkMode 
                      ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' 
                      : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                  } transition font-medium disabled:opacity-50`}
                >
                  {cancelText}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onConfirm}
                  disabled={loading}
                  className={`flex-1 py-3 rounded-xl transition font-medium disabled:opacity-50 ${
                    type === 'danger' || type === 'delete'
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Loading...
                    </div>
                  ) : (
                    confirmText
                  )}
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}