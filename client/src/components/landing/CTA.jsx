import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiCheck } from 'react-icons/fi';

export default function CTA({ isDark = true }) {
  const textPrimary = isDark ? 'text-white' : 'text-slate-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-slate-600';
  const textTertiary = isDark ? 'text-gray-300' : 'text-slate-700';
  const badgeBg = isDark ? 'bg-[#0f0f14] border border-white/10' : 'bg-slate-200 border border-slate-300';
  const btnSecondary = isDark 
    ? 'bg-[#0f0f14] border border-white/10 text-white hover:bg-white/10' 
    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100';

  return (
    <section className="py-24 px-6 relative overflow-hidden">
      {isDark && (
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-blue-500/10 rounded-full blur-[120px]" />
          <div className="absolute top-20 right-20 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px]" />
          <div className="absolute bottom-20 left-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px]" />
        </div>
      )}

      {!isDark && (
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-purple-50/30 to-slate-50" />
      )}

      <div className="max-w-4xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 ${badgeBg}`}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
            <span className={`text-sm ${textTertiary}`}>No credit card required</span>
          </motion.div>

          <h2 className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-6 ${textPrimary}`}>
            Ready to transform
            <span className="block mt-2 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 bg-clip-text text-transparent">
              your hiring?
            </span>
          </h2>

          <p className={`text-lg ${textSecondary} max-w-2xl mx-auto mb-10`}>
            Join thousands of companies and professionals already using Nile Agency.
            Start for free today.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="group relative px-10 py-5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                Create Free Account
                <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </Link>
            <Link
              to="/login"
              className={`px-10 py-5 rounded-xl font-medium hover:bg-white/10 transition-all duration-300 ${btnSecondary}`}
            >
              Sign In
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-6"
          >
            {[
              'Free 14-day trial',
              'No credit card required',
              'Cancel anytime',
            ].map((item) => (
              <div key={item} className={`flex items-center gap-2 ${textSecondary}`}>
                <FiCheck className="w-4 h-4 text-emerald-500" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}