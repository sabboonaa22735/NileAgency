import { motion } from 'framer-motion';
import { FiArrowRight, FiMapPin, FiClock, FiDollarSign } from 'react-icons/fi';

const showcaseItems = [
  {
    id: 1,
    title: 'Senior Product Designer',
    company: 'TechCorp Inc.',
    location: 'San Francisco, CA',
    type: 'Full-time',
    salary: '$120k - $180k',
    tags: ['Design', 'Remote', 'Senior'],
    color: '#8b5cf6',
  },
  {
    id: 2,
    title: 'Full Stack Developer',
    company: 'InnovateLabs',
    location: 'New York, NY',
    type: 'Full-time',
    salary: '$140k - $200k',
    tags: ['Engineering', 'Hybrid', 'Urgent'],
    color: '#06b6d4',
  },
  {
    id: 3,
    title: 'Marketing Manager',
    company: 'GrowthHub',
    location: 'Austin, TX',
    type: 'Full-time',
    salary: '$90k - $130k',
    tags: ['Marketing', 'On-site', 'Mid-level'],
    color: '#f472b6',
  },
  {
    id: 4,
    title: 'Data Scientist',
    company: 'DataDriven AI',
    location: 'Seattle, WA',
    type: 'Contract',
    salary: '$80 - $120/hr',
    tags: ['AI/ML', 'Remote', 'Contract'],
    color: '#10b981',
  },
];

export default function Showcase({ isDark = true }) {
  const textPrimary = isDark ? 'text-white' : 'text-slate-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-slate-600';
  const textMuted = isDark ? 'text-gray-500' : 'text-slate-500';
  const cardBg = isDark ? 'bg-[#0f0f14] border border-white/10' : 'bg-white border border-slate-200';
  const hoverBorder = isDark ? 'hover:border-purple-500/30' : 'hover:border-purple-400/50';
  const titleHover = isDark ? 'group-hover:text-purple-400' : 'group-hover:text-purple-600';
  const borderColor = isDark ? 'border-white/5' : 'border-slate-200';

  return (
    <section id="showcase" className="py-24 px-6 relative">
      {isDark && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px]" />
        </div>
      )}

      <div className="max-w-7xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end md:justify-between mb-16 gap-6"
        >
          <div>
            <span className={`text-sm font-medium ${isDark ? 'text-purple-400' : 'text-purple-600'} uppercase tracking-wider`}>Showcase</span>
            <h2 className={`text-4xl md:text-5xl font-bold ${textPrimary} mt-3`}>
              Featured Opportunities
            </h2>
            <p className={`text-lg ${textSecondary} mt-4 max-w-xl`}>
              Explore curated roles from top companies actively hiring now.
            </p>
          </div>
          <button className={`group px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all ${
            isDark 
              ? 'bg-[#0f0f14] border border-white/10 text-white hover:bg-white/10' 
              : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
          }`}>
            View All Jobs
            <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {showcaseItems.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.01 }}
              className={`group p-6 rounded-3xl ${cardBg} ${hoverBorder} transition-all duration-300 cursor-pointer`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold"
                    style={{ 
                      background: `linear-gradient(135deg, ${item.color}20, ${item.color}10)`,
                      color: item.color 
                    }}
                  >
                    {item.company[0]}
                  </div>
                  <div>
                    <h3 className={`text-lg font-semibold ${textPrimary} ${titleHover} transition-colors`}>
                      {item.title}
                    </h3>
                    <p className={`text-sm ${textSecondary}`}>{item.company}</p>
                  </div>
                </div>
                <span 
                  className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{ 
                    background: `${item.color}20`,
                    color: item.color 
                  }}
                >
                  {item.type}
                </span>
              </div>

              <div className="flex flex-wrap gap-3 mb-5">
                <span className={`flex items-center gap-1 text-xs ${textMuted}`}>
                  <FiMapPin className="w-3 h-3" />
                  {item.location}
                </span>
                <span className={`flex items-center gap-1 text-xs ${textMuted}`}>
                  <FiDollarSign className="w-3 h-3" />
                  {item.salary}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <span 
                    key={tag}
                    className={`px-3 py-1 rounded-full text-xs ${
                      isDark ? 'bg-[#0f0f14] text-gray-400 border border-white/10' : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className={`mt-5 pt-4 ${borderColor} flex items-center justify-between`}>
                <span className={`text-xs ${textMuted} flex items-center gap-1`}>
                  <FiClock className="w-3 h-3" />
                  Posted 2 days ago
                </span>
                <span className={`text-sm font-medium ${isDark ? 'text-purple-400' : 'text-purple-600'} group-hover:underline`}>
                  Apply Now
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}