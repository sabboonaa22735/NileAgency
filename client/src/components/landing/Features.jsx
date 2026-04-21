import { motion } from 'framer-motion';
import { 
  FiBriefcase, 
  FiUsers, 
  FiMessageSquare, 
  FiShield, 
  FiZap, 
  FiTrendingUp,
  FiArrowRight
} from 'react-icons/fi';

const features = [
  {
    icon: FiBriefcase,
    title: 'Fluid Hiring Pipelines',
    desc: 'Post openings, review talent, and move candidates forward inside a calmer workspace.',
    color: '#8b5cf6',
    gradient: 'from-purple-500/20 to-purple-500/5',
  },
  {
    icon: FiUsers,
    title: 'Profiles with Presence',
    desc: 'Candidates and recruiters both get a richer, more premium first impression.',
    color: '#06b6d4',
    gradient: 'from-cyan-500/20 to-cyan-500/5',
  },
  {
    icon: FiMessageSquare,
    title: 'Live Conversation Flow',
    desc: 'Messages feel faster, clearer, and more connected to the actual hiring process.',
    color: '#f472b6',
    gradient: 'from-pink-500/20 to-pink-500/5',
  },
  {
    icon: FiShield,
    title: 'Trust-Forward Onboarding',
    desc: 'Applications, approvals, and payments now sit inside a more polished visual system.',
    color: '#10b981',
    gradient: 'from-emerald-500/20 to-emerald-500/5',
  },
  {
    icon: FiZap,
    title: 'Smart Matching',
    desc: 'AI-powered matching connects you with the perfect candidates instantly.',
    color: '#f59e0b',
    gradient: 'from-amber-500/20 to-amber-500/5',
  },
  {
    icon: FiTrendingUp,
    title: 'Advanced Analytics',
    desc: 'Track performance with detailed insights and make data-driven decisions.',
    color: '#6366f1',
    gradient: 'from-indigo-500/20 to-indigo-500/5',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export default function Features({ isDark = true }) {
  const textPrimary = isDark ? 'text-white' : 'text-slate-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-slate-600';
  const cardBg = isDark ? 'bg-[#0f0f14] border border-white/10' : 'bg-white border border-slate-200';
  const hoverBorder = isDark ? 'hover:border-purple-500/30' : 'hover:border-purple-400/50';
  const accentColor = isDark ? 'text-purple-400' : 'text-purple-600';

  return (
    <section id="features" className="py-24 px-6 relative">
      {isDark && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-purple-500/5 rounded-full blur-[120px]" />
        </div>
      )}

      <div className="max-w-7xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className={`text-sm font-medium uppercase tracking-wider ${accentColor}`}>Features</span>
          <h2 className={`text-4xl md:text-5xl font-bold mt-3 mb-4 ${textPrimary}`}>
            Everything you need to hire better
          </h2>
          <p className={`text-lg ${textSecondary} max-w-2xl mx-auto`}>
            A complete suite of tools designed to streamline your hiring process 
            and help you find the perfect match.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              whileHover={{ 
                scale: 1.02, 
                y: -6,
                transition: { duration: 0.3 }
              }}
              className={`group relative p-8 rounded-3xl ${cardBg} ${hoverBorder} transition-all duration-300 cursor-pointer overflow-hidden`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              <div className="relative z-10">
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110"
                  style={{ 
                    background: `linear-gradient(135deg, ${feature.color}20, ${feature.color}10)`,
                    boxShadow: `0 0 30px ${feature.color}15`
                  }}
                >
                  <feature.icon 
                    className="w-7 h-7" 
                    style={{ color: feature.color }}
                  />
                </div>
                <h3 className={`text-xl font-semibold mb-3 ${textPrimary}`}>
                  {feature.title}
                </h3>
                <p className={`${textSecondary} leading-relaxed`}>
                  {feature.desc}
                </p>
                <div className={`mt-4 flex items-center gap-2 text-sm font-medium ${accentColor} opacity-0 group-hover:opacity-100 transition-opacity`}>
                  Learn more <FiArrowRight className="w-4 h-4" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}