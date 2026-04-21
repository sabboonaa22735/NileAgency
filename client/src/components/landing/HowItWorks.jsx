import { motion } from 'framer-motion';
import { FiArrowRight, FiCheck, FiUserPlus, FiSearch, FiMessageCircle, FiZap } from 'react-icons/fi';

const steps = [
  {
    number: '01',
    title: 'Create Account',
    desc: 'Sign up in seconds. Choose your path as a recruiter or job seeker.',
    icon: FiUserPlus,
    color: '#8b5cf6',
  },
  {
    number: '02',
    title: 'Build Profile',
    desc: 'Showcase your brand or skills with our premium profile templates.',
    icon: FiSearch,
    color: '#06b6d4',
  },
  {
    number: '03',
    title: 'Connect & Chat',
    desc: 'Discover perfect matches and communicate in real-time.',
    icon: FiMessageCircle,
    color: '#f472b6',
  },
  {
    number: '04',
    title: 'Hire Fast',
    desc: 'Complete transactions smoothly with our integrated system.',
    icon: FiZap,
    color: '#10b981',
  },
];

export default function HowItWorks({ isDark = true }) {
  const textPrimary = isDark ? 'text-white' : 'text-slate-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-slate-600';
  const textMuted = isDark ? 'text-gray-500' : 'text-slate-500';
  const cardBg = isDark ? 'bg-[#0f0f14] border border-white/10 hover:border-white/20' : 'bg-white border border-slate-200 hover:border-slate-300';
  const accentColor = isDark ? 'text-indigo-400' : 'text-indigo-600';

  return (
    <section id="how-it-works" className="py-24 px-6 relative overflow-hidden">
      {isDark && (
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-900/10 to-transparent" />
      )}
      
      <div className="max-w-7xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className={`text-sm font-medium uppercase tracking-wider ${accentColor}`}>How It Works</span>
          <h2 className={`text-4xl md:text-5xl font-bold mt-3 mb-4 ${textPrimary}`}>
            From sign-up to success in 4 steps
          </h2>
          <p className={`text-lg ${textSecondary} max-w-2xl mx-auto`}>
            A streamlined journey designed to get you hiring or hired as quickly as possible.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="relative"
            >
              <div className={`p-6 rounded-3xl ${cardBg} transition-all duration-300 h-full`}>
                <div className="flex items-center justify-between mb-6">
                  <span 
                    className="text-5xl font-bold"
                    style={{ color: `${step.color}30` }}
                  >
                    {step.number}
                  </span>
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${step.color}20` }}
                  >
                    <step.icon className="w-5 h-5" style={{ color: step.color }} />
                  </div>
                </div>
                <h3 className={`text-xl font-semibold mb-3 ${textPrimary}`}>{step.title}</h3>
                <p className={`${textSecondary} text-sm leading-relaxed`}>{step.desc}</p>
              </div>
              
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                  <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <FiArrowRight className="w-3 h-3 text-purple-400" />
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-16 flex flex-wrap items-center justify-center gap-8"
        >
          {[
            'Free to start',
            'No credit card required',
            'Cancel anytime',
          ].map((item) => (
            <div key={item} className={`flex items-center gap-2 ${textSecondary}`}>
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <FiCheck className="w-3 h-3 text-emerald-400" />
              </div>
              <span className="text-sm">{item}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}