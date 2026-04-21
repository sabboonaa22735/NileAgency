import { useEffect, useState, useRef } from 'react';
import { motion, useSpring, useMotionValue, useTransform } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  FiUsers, FiBriefcase, FiDollarSign, FiActivity, FiTrendingUp, FiTrendingDown,
  FiArrowUpRight, FiArrowDownRight, FiCheckCircle, FiClock, FiAlertCircle
} from 'react-icons/fi';
import * as THREE from 'three';

const cardConfigs = [
  { 
    key: 'totalUsers', 
    label: 'Total Users', 
    icon: FiUsers, 
    gradient: 'from-blue-500 via-cyan-500 to-teal-500',
    bgGradient: 'from-blue-500/20 via-cyan-500/10 to-teal-500/5',
    glow: 'shadow-blue-500/20'
  },
  { 
    key: 'totalJobs', 
    label: 'Total Jobs', 
    icon: FiBriefcase, 
    gradient: 'from-purple-500 via-pink-500 to-rose-500',
    bgGradient: 'from-purple-500/20 via-pink-500/10 to-rose-500/5',
    glow: 'shadow-purple-500/20'
  },
  { 
    key: 'activeJobs', 
    label: 'Active Jobs', 
    icon: FiActivity, 
    gradient: 'from-emerald-500 via-green-500 to-teal-500',
    bgGradient: 'from-emerald-500/20 via-green-500/10 to-teal-500/5',
    glow: 'shadow-green-500/20'
  },
  { 
    key: 'revenue', 
    label: 'Total Revenue', 
    icon: FiDollarSign, 
    gradient: 'from-amber-500 via-orange-500 to-red-500',
    bgGradient: 'from-amber-500/20 via-orange-500/10 to-red-500/5',
    glow: 'shadow-amber-500/20',
    isCurrency: true
  },
];

function AnimatedNumber({ value, isCurrency = false }) {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [value]);
  
  return (
    <span className="font-bold">
      {isCurrency ? '$' : ''}{displayValue.toLocaleString()}{!isCurrency ? '' : ''}
    </span>
  );
}

function AnimatedOrb({ color, delay = 0, position = 'right' }) {
  const ref = useRef();
  
  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime + delay;
      ref.current.position.x = Math.sin(t * 0.5) * 0.3;
      ref.current.position.y = Math.cos(t * 0.3) * 0.3;
    }
  });

  return (
    <mesh ref={ref} position={position === 'right' ? [1.5, 0.5, 0] : [-1.5, 0.5, 0]}>
      <sphereGeometry args={[0.4, 32, 32]} />
      <meshBasicMaterial color={color} transparent opacity={0.15} />
    </mesh>
  );
}

function GlowEffect({ color }) {
  return (
    <div className="absolute inset-0 rounded-2xl">
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className={`absolute ${color === 'indigo' ? '-top-20 -right-20' : '-bottom-20 -left-20'} w-32 h-32 rounded-full blur-[60px] opacity-40`} style={{ background: `var(--${color}-glow)` }} />
    </div>
  );
}

function CardGlow({ gradient }) {
  const colors = {
    'from-blue-500 via-cyan-500 to-teal-500': '#3b82f6',
    'from-purple-500 via-pink-500 to-rose-500': '#a855f7',
    'from-emerald-500 via-green-500 to-teal-500': '#10b981',
    'from-amber-500 via-orange-500 to-red-500': '#f59e0b',
  };
  
  return (
    <div className="absolute inset-0 rounded-2xl overflow-hidden">
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
        style={{
          background: `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${colors[gradient] || '#3b82f6'}15, transparent 40%)`
        }}
      />
    </div>
  );
}

export default function StatCards({ stats = {}, darkMode = true, onCardClick }) {
  const statsData = [
    { key: 'totalUsers', value: stats?.totalUsers || 0, change: 12, trend: 'up' },
    { key: 'totalJobs', value: stats?.totalJobs || 0, change: 8, trend: 'up' },
    { key: 'activeJobs', value: stats?.activeJobs || 0, change: -3, trend: 'down' },
    { key: 'revenue', value: stats?.totalRevenue || 0, change: 24, trend: 'up' },
  ];

  const cardRefs = useRef([]);

  const handleMouseMove = (e, index) => {
    const card = cardRefs.current[index];
    if (card) {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mouse-x', `${x}%`);
      card.style.setProperty('--mouse-y', `${y}%`);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
      {statsData.map((stat, index) => {
        const config = cardConfigs.find(c => c.key === stat.key);
        const IconComponent = config?.icon || FiUsers;
        
        return (
          <motion.div
            key={stat.key}
            ref={el => cardRefs.current[index] = el}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, type: 'spring', damping: 20 }}
            whileHover={{ y: -4, scale: 1.02 }}
            onClick={() => onCardClick?.(stat.key)}
            onMouseMove={(e) => handleMouseMove(e, index)}
            className={`group relative p-5 lg:p-6 rounded-2xl cursor-pointer transition-all duration-500 overflow-hidden ${
              darkMode 
                ? `bg-gradient-to-br from-slate-800/80 via-slate-800/60 to-slate-900/80 border border-slate-700/50 hover:border-slate-600/50 shadow-xl shadow-black/20` 
                : `bg-gradient-to-br from-white via-white to-slate-50 border border-slate-200/50 hover:border-slate-300/50 shadow-lg shadow-indigo-500/10 ${config?.glow}`
            } backdrop-blur-xl`}
            style={{ '--mouse-x': '50%', '--mouse-y': '50%' }}
          >
            <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${config?.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            <CardGlow gradient={config?.gradient} />
            
            <motion.div
              className="absolute top-0 right-0 w-24 h-24 rounded-full blur-[40px]"
              style={{
                background: config?.gradient?.split(' ')[1]?.replace('via-', '') || 'indigo',
                opacity: 0.15
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.2, 0.1]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.3
              }}
            />
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config?.gradient} flex items-center justify-center shadow-lg`}
                >
                  <IconComponent className="w-6 h-6 text-white" />
                </motion.div>
                
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    stat.trend === 'up' 
                      ? darkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600'
                      : darkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600'
                  }`}
                >
                  {stat.trend === 'up' ? (
                    <FiArrowUpRight className="w-3 h-3" />
                  ) : (
                    <FiArrowDownRight className="w-3 h-3" />
                  )}
                  {Math.abs(stat.change)}%
                </motion.div>
              </div>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.1 }}
              >
                <div className={`text-3xl lg:text-4xl font-bold bg-gradient-to-r ${config?.gradient} bg-clip-text text-transparent mb-1`}>
                  <AnimatedNumber 
                    value={config?.isCurrency ? stat.value : stat.value} 
                    isCurrency={config?.isCurrency}
                  />
                </div>
                <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  {config?.label || stat.key}
                </div>
              </motion.div>
              
              <div className={`flex items-center gap-2 mt-4 pt-4 border-t ${darkMode ? 'border-slate-700/50' : 'border-slate-100'}`}>
                <FiTrendingUp className={`w-4 h-4 ${stat.trend === 'up' ? 'text-emerald-500' : 'text-red-500'}`} />
                <span className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  vs last month
                </span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export function OverviewCards({ stats = {}, darkMode = true }) {
  const overviewCards = [
    { 
      key: 'employees', 
      label: 'Employees', 
      value: stats?.totalEmployees || 0, 
      gradient: 'from-blue-500 to-cyan-400',
      iconColor: 'text-blue-500',
      bgGlow: 'bg-blue-500'
    },
    { 
      key: 'recruiters', 
      label: 'Recruiters', 
      value: stats?.totalRecruiters || 0, 
      gradient: 'from-purple-500 to-pink-400',
      iconColor: 'text-purple-500',
      bgGlow: 'bg-purple-500'
    },
    { 
      key: 'pendingApps', 
      label: 'Pending Applications', 
      value: stats?.pendingApplications || 0, 
      gradient: 'from-amber-500 to-orange-400',
      iconColor: 'text-amber-500',
      bgGlow: 'bg-amber-500'
    },
    { 
      key: 'revenue', 
      label: 'Revenue', 
      value: `$${stats?.totalRevenue || 0}`, 
      gradient: 'from-emerald-500 to-teal-400',
      iconColor: 'text-emerald-500',
      bgGlow: 'bg-emerald-500'
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {overviewCards.map((card, index) => (
        <motion.div
          key={card.key}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: index * 0.1, type: 'spring', damping: 20 }}
          whileHover={{ 
            scale: 1.03, 
            rotate: index % 2 === 0 ? 1 : -1,
            boxShadow: darkMode 
              ? '0 20px 40px rgba(0,0,0,0.3)' 
              : '0 20px 40px rgba(99,102,241,0.2)'
          }}
          className={`group relative p-5 rounded-2xl border overflow-hidden ${
            darkMode 
              ? 'bg-gradient-to-br from-slate-800/60 via-slate-800/40 to-slate-800/60 border-slate-700/30 hover:border-slate-600/50 shadow-xl' 
              : 'bg-gradient-to-br from-white to-indigo-50 border-slate-200 hover:border-indigo-200 shadow-lg'
          } transition-all duration-300`}
        >
          <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500" 
            style={{
              background: `linear-gradient(135deg, ${card.bgGlow}10, transparent)`
            }} 
          />
          <motion.div 
            className={`absolute -right-8 -top-8 w-24 h-24 rounded-full blur-2xl ${card.bgGlow} opacity-0 group-hover:opacity-30 transition-opacity duration-500`}
          />
          
          <div className={`text-3xl font-bold bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent mb-2`}>
            {card.value}
          </div>
          <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            {card.label}
          </div>
          
          <motion.div 
            className={`absolute bottom-2 right-2 w-8 h-8 rounded-full ${card.bgGlow} opacity-20`}
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              delay: index * 0.3
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}