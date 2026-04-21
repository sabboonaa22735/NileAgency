import { motion } from 'framer-motion';
import { FiMessageSquare } from 'react-icons/fi';

const testimonials = [
  {
    id: 1,
    quote: "Nile Agency transformed how we hire. The quality of candidates and speed of matching is unmatched. We've cut our hiring time by 60%.",
    name: 'Sarah Chen',
    role: 'Head of Talent',
    company: 'TechVentures',
    avatar: 'SC',
    color: '#8b5cf6',
  },
  {
    id: 2,
    quote: "As a designer, I was skeptical about job platforms. Nile Agency changed my mind - the profiles look professional and I found my dream job in weeks.",
    name: 'Marcus Johnson',
    role: 'Senior Product Designer',
    company: 'DesignHub',
    avatar: 'MJ',
    color: '#06b6d4',
  },
  {
    id: 3,
    quote: "The best recruitment platform we've used. The real-time messaging and transparent process made hiring remote talent seamless.",
    name: 'Emily Rodriguez',
    role: 'CEO',
    company: 'StartupLabs',
    avatar: 'ER',
    color: '#f472b6',
  },
];

export default function Testimonials({ isDark = true }) {
  const textPrimary = isDark ? 'text-white' : 'text-slate-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-slate-600';
  const textTertiary = isDark ? 'text-gray-300' : 'text-slate-700';
  const textMuted = isDark ? 'text-gray-500' : 'text-slate-500';
  const cardBg = isDark ? 'bg-[#0f0f14] border border-white/10' : 'bg-white border border-slate-200';
  const hoverBorder = isDark ? 'hover:border-purple-500/30' : 'hover:border-purple-400/50';
  const accentColor = isDark ? 'text-purple-400' : 'text-purple-600';

  return (
    <section className="py-24 px-6 relative overflow-hidden">
      {isDark && (
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/10 to-transparent" />
      )}
      
      <div className="max-w-7xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className={`text-sm font-medium uppercase tracking-wider ${accentColor}`}>Testimonials</span>
          <h2 className={`text-4xl md:text-5xl font-bold mt-3 mb-4 ${textPrimary}`}>
            Loved by companies & talent
          </h2>
          <p className={`text-lg ${textSecondary} max-w-2xl mx-auto`}>
            Join thousands of satisfied companies and professionals who found their perfect match.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.6 }}
              whileHover={{ y: -8 }}
              className={`p-8 rounded-3xl ${cardBg} ${hoverBorder} transition-all duration-300`}
            >
              <FiMessageSquare className={`w-8 h-8 mb-4 ${isDark ? 'text-purple-500/30' : 'text-purple-500/40'}`} />
              
              <p className={`${textTertiary} leading-relaxed mb-6`}>
                "{testimonial.quote}"
              </p>
              
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold"
                  style={{ 
                    background: `linear-gradient(135deg, ${testimonial.color}20, ${testimonial.color}10)`,
                    color: testimonial.color 
                  }}
                >
                  {testimonial.avatar}
                </div>
                <div>
                  <div className={`font-semibold ${textPrimary}`}>{testimonial.name}</div>
                  <div className={`text-sm ${textMuted}`}>{testimonial.role}, {testimonial.company}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-16 flex flex-wrap items-center justify-center gap-8"
        >
          {['4.9/5 rating', '500+ reviews', '95% would recommend'].map((item) => (
            <div key={item} className={`flex items-center gap-2 ${textSecondary}`}>
              <div className="w-2 h-2 rounded-full bg-purple-500" />
              <span className="text-sm">{item}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}