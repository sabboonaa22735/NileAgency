import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  FiTrendingUp, FiUsers, FiBriefcase, FiDollarSign, FiCalendar,
  FiArrowUpRight, FiArrowDownRight, FiActivity
} from 'react-icons/fi';

export default function ChartsSection({ darkMode = true }) {
  const canvasRef = useRef(null);
  
  const textPrimary = darkMode ? 'text-slate-100' : 'text-slate-900';
  const textSecondary = darkMode ? 'text-slate-400' : 'text-slate-600';
  const textMuted = darkMode ? 'text-slate-500' : 'text-slate-400';
  const bgCard = darkMode ? 'bg-slate-800/50' : 'bg-white';
  const borderColor = darkMode ? 'border-slate-700/50' : 'border-slate-200';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    const width = rect.width;
    const height = rect.height;
    
    ctx.clearRect(0, 0, width, height);
    
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    if (darkMode) {
      gradient.addColorStop(0, 'rgba(99, 102, 241, 0.3)');
      gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');
    } else {
      gradient.addColorStop(0, 'rgba(99, 102, 241, 0.2)');
      gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');
    }
    
    const data = [30, 45, 35, 50, 40, 60, 55, 70, 65, 80, 75, 90];
    const maxVal = Math.max(...data);
    const step = width / (data.length - 1);
    const padding = 40;
    const chartHeight = height - padding * 2;
    
    ctx.beginPath();
    ctx.moveTo(padding, chartHeight + padding);
    
    data.forEach((val, i) => {
      const x = padding + i * step;
      const y = padding + chartHeight - (val / maxVal) * chartHeight;
      if (i === 0) {
        ctx.lineTo(x, y);
      } else {
        const prevX = padding + (i - 1) * step;
        const prevY = padding + chartHeight - (data[i - 1] / maxVal) * chartHeight;
        const cpX = (prevX + x) / 2;
        ctx.bezierCurveTo(cpX, prevY, cpX, y, x, y);
      }
    });
    
    ctx.lineTo(width - padding, chartHeight + padding);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();
    
    ctx.beginPath();
    data.forEach((val, i) => {
      const x = padding + i * step;
      const y = padding + chartHeight - (val / maxVal) * chartHeight;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        const prevX = padding + (i - 1) * step;
        const prevY = padding + chartHeight - (data[i - 1] / maxVal) * chartHeight;
        const cpX = (prevX + x) / 2;
        ctx.bezierCurveTo(cpX, prevY, cpX, y, x, y);
      }
    });
    
    const lineGradient = ctx.createLinearGradient(0, 0, width, 0);
    lineGradient.addColorStop(0, '#6366f1');
    lineGradient.addColorStop(1, '#8b5cf6');
    ctx.strokeStyle = lineGradient;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.stroke();
    
    data.forEach((val, i) => {
      const x = padding + i * step;
      const y = padding + chartHeight - (val / maxVal) * chartHeight;
      
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#6366f1';
      ctx.fill();
      
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = darkMode ? '#1e1b4b' : '#ffffff';
      ctx.fill();
    });
  }, [darkMode]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`lg:col-span-2 rounded-2xl border ${borderColor} ${bgCard} backdrop-blur-xl overflow-hidden`}
      >
        <div className={`p-5 border-b ${borderColor} flex items-center justify-between`}>
          <div>
            <h3 className={`text-lg font-semibold ${textPrimary}`}>Analytics Overview</h3>
            <p className={`text-sm ${textMuted}`}>Platform performance metrics</p>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${darkMode ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
            <FiTrendingUp className={`w-4 h-4 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
            <span className={`text-sm font-medium ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>+12.5%</span>
          </div>
        </div>
        
        <div className="p-5">
          <div className="flex items-center gap-4 mb-4">
            {[
              { label: 'Users', value: '12.5K', change: '+8.2%', up: true, icon: FiUsers },
              { label: 'Jobs', value: '3.2K', change: '+5.1%', up: true, icon: FiBriefcase },
              { label: 'Revenue', value: '$45.2K', change: '+15.3%', up: true, icon: FiDollarSign },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-2"
              >
                <div className={`w-8 h-8 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-slate-100'} flex items-center justify-center`}>
                  <stat.icon className={`w-4 h-4 ${textSecondary}`} />
                </div>
                <div>
                  <div className={`text-xs ${textMuted}`}>{stat.label}</div>
                  <div className={`text-sm font-semibold ${textPrimary}`}>{stat.value}</div>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="relative h-64">
            <canvas ref={canvasRef} className="w-full h-full" />
          </div>
          
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700/30">
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, i) => (
              <motion.span
                key={month}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className={`text-xs ${textMuted}`}
              >
                {month}
              </motion.span>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`rounded-2xl border ${borderColor} ${bgCard} backdrop-blur-xl overflow-hidden`}
      >
        <div className={`p-5 border-b ${borderColor}`}>
          <h3 className={`text-lg font-semibold ${textPrimary}`}>Distribution</h3>
          <p className={`text-sm ${textMuted}`}>User breakdown by role</p>
        </div>
        
        <div className="p-5 space-y-6">
          <div className="relative h-40 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-40 h-40 transform -rotate-90">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke={darkMode ? '#1e293b' : '#f1f5f9'}
                strokeWidth="12"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#8b5cf6"
                strokeWidth="12"
                strokeDasharray="100.53 150.79"
                strokeLinecap="round"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="12"
                strokeDasharray="75.4 150.79"
                strokeDashoffset="-100.53"
                strokeLinecap="round"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#10b981"
                strokeWidth="12"
                strokeDasharray="50.27 150.79"
                strokeDashoffset="-175.93"
                strokeLinecap="round"
              />
            </svg>
            <div className={`absolute text-center`}>
              <div className={`text-2xl font-bold ${textPrimary}`}>100%</div>
              <div className={`text-xs ${textMuted}`}>Total</div>
            </div>
          </div>
          
          <div className="space-y-3">
            {[
              { label: 'Employees', value: 65, color: '#8b5cf6' },
              { label: 'Recruiters', value: 25, color: '#06b6d4' },
              { label: 'Admins', value: 10, color: '#10b981' },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex items-center gap-3"
              >
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className={`flex-1 text-sm ${textSecondary}`}>{item.label}</span>
                <span className={`text-sm font-medium ${textPrimary}`}>{item.value}%</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}