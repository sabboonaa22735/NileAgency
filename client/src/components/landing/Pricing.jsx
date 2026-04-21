import { motion } from 'framer-motion';
import { FiCheck, FiArrowRight } from 'react-icons/fi';

const plans = [
  {
    name: 'Starter',
    price: 'Free',
    period: '',
    description: 'Perfect for individuals getting started',
    features: [
      '5 job postings per month',
      'Basic candidate search',
      'Standard profile',
      'Email support',
    ],
    popular: false,
    cta: 'Get Started',
  },
  {
    name: 'Professional',
    price: '$49',
    period: '/month',
    description: 'For growing teams and frequent hiring',
    features: [
      'Unlimited job postings',
      'Advanced candidate filters',
      'Priority support',
      'Analytics dashboard',
      'Custom branding',
      'API access',
    ],
    popular: true,
    cta: 'Start Free Trial',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large organizations with custom needs',
    features: [
      'Everything in Professional',
      'Dedicated account manager',
      'Custom integrations',
      'SLA guarantee',
      'On-premise deployment',
      '24/7 phone support',
    ],
    popular: false,
    cta: 'Contact Sales',
  },
];

export default function Pricing({ isDark = true }) {
  const textPrimary = isDark ? 'text-white' : 'text-slate-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-slate-600';
  const textTertiary = isDark ? 'text-gray-300' : 'text-slate-700';
  const cardBg = isDark ? 'bg-[#0f0f14] border border-white/10' : 'bg-white border border-slate-200';
  const popularCardBg = isDark 
    ? 'bg-gradient-to-b from-purple-500/20 to-indigo-500/10 border-purple-500/50' 
    : 'bg-gradient-to-b from-purple-50 to-indigo-50 border-purple-300/50';
  const btnPrimary = isDark
    ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:shadow-lg hover:shadow-purple-500/25'
    : 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:shadow-lg hover:shadow-purple-500/20';
  const btnSecondary = isDark
    ? 'bg-[#0f0f14] border border-white/10 text-white hover:bg-white/10'
    : 'bg-slate-100 border border-slate-300 text-slate-700 hover:bg-slate-200';
  const accentColor = isDark ? 'text-indigo-400' : 'text-indigo-600';

  return (
    <section id="pricing" className="py-24 px-6 relative overflow-hidden">
      {isDark && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-[120px]" />
        </div>
      )}

      <div className="max-w-7xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className={`text-sm font-medium uppercase tracking-wider ${accentColor}`}>Pricing</span>
          <h2 className={`text-4xl md:text-5xl font-bold mt-3 mb-4 ${textPrimary}`}>
            Simple, transparent pricing
          </h2>
          <p className={`text-lg ${textSecondary} max-w-2xl mx-auto`}>
            Choose the plan that fits your needs. All plans include a 14-day free trial.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              whileHover={{ y: -8 }}
              className={`relative p-8 rounded-3xl border transition-all duration-300 ${
                plan.popular ? popularCardBg : cardBg
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-xs font-semibold">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className={`text-xl font-semibold mb-2 ${textPrimary}`}>{plan.name}</h3>
                <p className={`text-sm ${textSecondary}`}>{plan.description}</p>
              </div>

              <div className="mb-6">
                <span className={`text-4xl font-bold ${textPrimary}`}>{plan.price}</span>
                <span className="text-gray-500 text-sm">{plan.period}</span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className={`flex items-center gap-3 ${textTertiary} text-sm`}>
                    <div className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                      <FiCheck className="w-3 h-3 text-purple-500" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all duration-300 ${
                  plan.popular ? btnPrimary : btnSecondary
                }`}
              >
                {plan.cta}
                <FiArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className={`mt-12 text-center text-sm ${isDark ? 'text-gray-500' : 'text-slate-500'}`}
        >
          All prices in USD. Taxes may apply. 
          <a href="#" className="text-purple-500 hover:underline ml-1">View full comparison</a>
        </motion.p>
      </div>
    </section>
  );
}