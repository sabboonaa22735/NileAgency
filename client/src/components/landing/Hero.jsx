import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiPlay, FiCheck, FiTrendingUp, FiUsers, FiMessageSquare } from 'react-icons/fi';

const stats = [
  { value: '10k+', label: 'Open Roles', icon: FiTrendingUp },
  { value: '50k+', label: 'Active Talent', icon: FiUsers },
  { value: '5k+', label: 'Companies', icon: FiCheck },
  { value: '98%', label: 'Satisfaction', icon: FiMessageSquare },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export default function Hero({ isDark = true }) {
  const textPrimary = isDark ? 'text-white' : 'text-slate-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-slate-600';
  const textTertiary = isDark ? 'text-gray-300' : 'text-slate-700';
  const bgGlass = isDark ? 'bg-[#0f0f14] border border-white/10' : 'bg-slate-200 border border-slate-300';
  const bgCard = isDark ? 'bg-[#0f0f14] border border-white/10' : 'bg-white border border-slate-200';
  const scrollBg = isDark ? 'bg-white/10 border border-white/20' : 'bg-slate-300 border border-slate-400';

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {isDark && (
        <>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/10 to-transparent" />
          <div className="absolute top-1/4 -left-40 w-72 h-72 md:w-96 md:h-96 bg-purple-500/20 rounded-full blur-[100px] md:blur-[120px]" />
          <div className="absolute bottom-1/4 -right-40 w-72 h-72 md:w-96 md:h-96 bg-indigo-500/20 rounded-full blur-[100px] md:blur-[120px]" />
        </>
      )}
      
      {!isDark && (
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-purple-100/30 to-slate-50" />
      )}
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-6xl mx-auto text-center relative z-10 w-full"
      >
        <motion.div variants={itemVariants} className="mb-6 sm:mb-8">
          <div className={`inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-6 sm:mb-8 ${bgGlass}`}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className={`text-xs sm:text-sm font-medium ${textTertiary}`}>Now live across 50+ countries</span>
          </div>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className={`text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold leading-[0.95] mb-4 sm:mb-6 tracking-tight ${textPrimary}`}
        >
          Connect with
          <span className="block mt-2 sm:mt-3 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 bg-clip-text text-transparent">
            exceptional talent
          </span>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className={`text-base sm:text-lg md:text-xl ${textSecondary} max-w-xl sm:max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed px-2 sm:px-0`}
        >
          The premium hiring platform that brings together top companies and outstanding professionals. 
          Build your dream team with confidence.
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-12 sm:mb-16 w-full px-4 sm:px-0"
        >
          <Link
            to="/register"
            className="group relative px-6 sm:px-8 py-3 sm:py-4 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold overflow-hidden w-full sm:w-auto"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              Start Hiring
              <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </Link>
          <Link
            to="/login"
            className={`group px-6 sm:px-8 py-3 sm:py-4 rounded-xl border font-medium flex items-center justify-center gap-2 transition-all duration-300 w-full sm:w-auto ${
              isDark 
                ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' 
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <FiPlay className="w-4 h-4" />
            Watch Demo
          </Link>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="grid grid-cols-2 gap-3 sm:gap-4 max-w-2xl sm:max-w-3xl mx-auto"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              whileHover={{ scale: 1.03, y: -4 }}
              className={`p-4 sm:p-5 rounded-xl sm:rounded-2xl ${bgCard}`}
            >
              <stat.icon className="w-4 sm:w-5 h-4 sm:h-5 text-purple-500 mb-1 sm:mb-2 mx-auto" />
              <div className={`text-xl sm:text-2xl md:text-3xl font-bold ${textPrimary}`}>{stat.value}</div>
              <div className={`text-xs uppercase tracking-wider mt-0.5 sm:mt-1 ${textSecondary}`}>{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className={`w-6 h-10 rounded-full flex items-start justify-center p-2 ${scrollBg}`}
        >
          <motion.div
            animate={{ opacity: [1, 0.3, 1], y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-2 rounded-full bg-purple-500"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}