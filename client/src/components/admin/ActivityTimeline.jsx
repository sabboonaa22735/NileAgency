import { motion } from 'framer-motion';
import { 
  FiUser, FiBriefcase, FiDollarSign, FiFileText, FiCheck, FiX, 
  FiClock, FiAlertCircle, FiMessageSquare, FiActivity, FiPlus, FiEdit
} from 'react-icons/fi';

const activityIcons = {
  user: FiUser,
  job: FiBriefcase,
  payment: FiDollarSign,
  application: FiFileText,
  approval: FiCheck,
  rejection: FiX,
  message: FiMessageSquare,
  activity: FiActivity,
  create: FiPlus,
  edit: FiEdit,
};

const activityColors = {
  user: 'from-blue-500 to-cyan-500',
  job: 'from-purple-500 to-pink-500',
  payment: 'from-emerald-500 to-green-500',
  application: 'from-amber-500 to-orange-500',
  approval: 'from-green-500 to-emerald-500',
  rejection: 'from-red-500 to-rose-500',
  message: 'from-indigo-500 to-purple-500',
  activity: 'from-slate-500 to-slate-600',
  create: 'from-emerald-500 to-teal-500',
  edit: 'from-amber-500 to-orange-500',
};

export default function ActivityTimeline({ 
  activities = [], 
  darkMode = true,
  maxItems = 10
}) {
  const textPrimary = darkMode ? 'text-slate-100' : 'text-slate-900';
  const textSecondary = darkMode ? 'text-slate-400' : 'text-slate-600';
  const textMuted = darkMode ? 'text-slate-500' : 'text-slate-400';
  const bgCard = darkMode ? 'bg-slate-800/50' : 'bg-white';
  const borderColor = darkMode ? 'border-slate-700/50' : 'border-slate-200';
  const borderSubtle = darkMode ? 'border-slate-800' : 'border-slate-100';

  const sampleActivities = activities.length > 0 ? activities : [
    {
      id: 1,
      type: 'user',
      title: 'New user registered',
      description: 'John Doe joined as Employee',
      time: '2 minutes ago',
      icon: FiUser,
    },
    {
      id: 2,
      type: 'job',
      title: 'New job posted',
      description: 'Software Developer at Tech Corp',
      time: '15 minutes ago',
      icon: FiBriefcase,
    },
    {
      id: 3,
      type: 'payment',
      title: 'Payment received',
      description: '$500 from ABC Company',
      time: '1 hour ago',
      icon: FiDollarSign,
    },
    {
      id: 4,
      type: 'approval',
      title: 'User approved',
      description: 'Sarah Smith\'s account verified',
      time: '2 hours ago',
      icon: FiCheck,
    },
    {
      id: 5,
      type: 'application',
      title: 'New application',
      description: 'Michael applied for Developer',
      time: '3 hours ago',
      icon: FiFileText,
    },
    {
      id: 6,
      type: 'message',
      title: 'New message',
      description: 'Admin received message from recruiter',
      time: '4 hours ago',
      icon: FiMessageSquare,
    },
    {
      id: 7,
      type: 'activity',
      title: 'System update',
      description: 'Platform updated to v2.0',
      time: '1 day ago',
      icon: FiActivity,
    },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`rounded-2xl border ${borderColor} ${bgCard} backdrop-blur-xl overflow-hidden`}
    >
      <div className={`p-5 border-b ${borderColor}`}>
        <h3 className={`text-lg font-semibold ${textPrimary}`}>Recent Activity</h3>
        <p className={`text-sm ${textMuted}`}>Track all system activities</p>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        <div className="p-4">
          <div className="relative">
            <div className={`absolute left-5 top-0 bottom-0 w-0.5 ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`} />
            
            <div className="space-y-4">
              {sampleActivities.slice(0, maxItems).map((activity, index) => {
                const IconComponent = activity.icon || activityIcons[activity.type] || FiActivity;
                const gradient = activityColors[activity.type] || activityColors.activity;
                
                return (
                  <motion.div
                    key={activity.id || index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative flex gap-4"
                  >
                    <div className="relative z-10">
                      <motion.div 
                        whileHover={{ scale: 1.1 }}
                        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}
                      >
                        <IconComponent className="w-5 h-5 text-white" />
                      </motion.div>
                    </div>
                    
                    <div className="flex-1 min-w-0 pb-6">
                      <div className={`text-sm font-medium ${textPrimary}`}>
                        {activity.title}
                      </div>
                      <div className={`text-xs ${textSecondary} mt-0.5`}>
                        {activity.description}
                      </div>
                      <div className={`text-xs ${textMuted} mt-1 flex items-center gap-1`}>
                        <FiClock className="w-3 h-3" />
                        {activity.time}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      
      <div className={`p-4 border-t ${borderColor}`}>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full py-2.5 rounded-xl ${
            darkMode 
              ? 'bg-slate-700/50 hover:bg-slate-700 text-slate-300' 
              : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
          } transition text-sm font-medium`}
        >
          View All Activity
        </motion.button>
      </div>
    </motion.div>
  );
}

export function TimelineItem({ activity, darkMode = true }) {
  const textPrimary = darkMode ? 'text-slate-100' : 'text-slate-900';
  const textMuted = darkMode ? 'text-slate-500' : 'text-slate-400';
  
  const IconComponent = activity.icon || activityIcons[activity.type] || FiActivity;
  const gradient = activityColors[activity.type] || activityColors.activity;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-4"
    >
      <div className="relative z-10">
        <motion.div 
          whileHover={{ scale: 1.1 }}
          className={`w-8 h-8 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center`}
        >
          <IconComponent className="w-4 h-4 text-white" />
        </motion.div>
      </div>
      
      <div className="flex-1">
        <div className={`text-sm ${textPrimary}`}>{activity.title}</div>
        <div className={`text-xs ${textMuted}`}>{activity.time}</div>
      </div>
    </motion.div>
  );
}