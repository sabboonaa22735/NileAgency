import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiBriefcase, FiUsers, FiMessageSquare, FiShield, FiArrowRight, FiCheck } from 'react-icons/fi';

const features = [
  { icon: FiBriefcase, title: 'Post Jobs', desc: 'Easily post and manage job openings with our intuitive interface' },
  { icon: FiUsers, title: 'Find Talent', desc: 'Access thousands of qualified candidates from various fields' },
  { icon: FiMessageSquare, title: 'Real-time Chat', desc: 'Communicate instantly with candidates and recruiters' },
  { icon: FiShield, title: 'Secure Payments', desc: 'Integrated payment system for seamless transactions' }
];

const stats = [
  { number: '10K+', label: 'Active Jobs' },
  { number: '50K+', label: 'Candidates' },
  { number: '5K+', label: 'Companies' },
  { number: '98%', label: 'Satisfaction' }
];

export default function Landing() {
  return (
    <div className="min-h-screen">
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-brand-indigo flex items-center justify-center">
              <span className="text-white font-bold text-lg">N</span>
            </div>
            <span className="text-xl font-bold text-brand-dark">Nile Agency</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-brand-gray hover:text-brand-dark font-medium transition">Login</Link>
            <Link to="/register" className="btn-primary">Get Started</Link>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/50 to-transparent" />
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-brand-indigo/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto relative">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm text-brand-gray">Now hiring across multiple industries</span>
            </div>
            
            <h1 className="text-6xl font-bold text-brand-dark leading-tight mb-6">
              Find Your Next
              <span className="gradient-text block">Career Opportunity</span>
            </h1>
            
            <p className="text-xl text-brand-gray max-w-2xl mx-auto mb-10">
              Connect with top companies and talented professionals. 
              The modern recruitment platform built for the future of work.
            </p>
            
            <div className="flex items-center justify-center gap-4">
              <Link to="/register" className="btn-primary flex items-center gap-2 text-lg px-8 py-4">
                Start Hiring <FiArrowRight />
              </Link>
              <Link to="/login" className="btn-secondary">
                Browse Jobs
              </Link>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {stats.map((stat, i) => (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="text-center p-6 rounded-2xl glass card-hover"
              >
                <div className="text-4xl font-bold text-brand-indigo mb-2">{stat.number}</div>
                <div className="text-brand-gray">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-brand-dark mb-4">Why Choose Nile Agency</h2>
            <p className="text-xl text-brand-gray">Built with modern technology for seamless recruitment</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-2xl glass card-hover"
              >
                <div className="w-14 h-14 rounded-xl bg-brand-indigo/10 flex items-center justify-center mb-5">
                  <feature.icon className="w-7 h-7 text-brand-indigo" />
                </div>
                <h3 className="text-xl font-semibold text-brand-dark mb-2">{feature.title}</h3>
                <p className="text-brand-gray">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-brand-dark">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-white mb-6">
                For Recruiters
              </h2>
              <p className="text-gray-400 text-lg mb-8">
                Post jobs, manage applicants, and hire top talent. Our platform provides 
                all the tools you need to build your dream team.
              </p>
              <ul className="space-y-4">
                {['Easy job posting', 'Applicant tracking', 'Integrated messaging', 'Secure payments'].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-gray-300">
                    <FiCheck className="text-brand-indigo" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-8 rounded-2xl glass-dark"
            >
              <h2 className="text-4xl font-bold text-white mb-6">
                For Job Seekers
              </h2>
              <p className="text-gray-400 text-lg mb-8">
                Find your dream job, connect with top companies, and advance your career.
              </p>
              <ul className="space-y-4">
                {['Browse thousands of jobs', 'Apply with one click', 'Save favorite jobs', 'Direct messaging'].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-gray-300">
                    <FiCheck className="text-brand-indigo" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-brand-dark mb-4">Ready to Get Started?</h2>
            <p className="text-xl text-brand-gray mb-8">Join thousands of companies and job seekers today</p>
            <Link to="/register" className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4">
              Create Free Account <FiArrowRight />
            </Link>
          </motion.div>
        </div>
      </section>

      <footer className="py-12 px-6 bg-brand-dark border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-indigo flex items-center justify-center">
                <span className="text-white font-bold">N</span>
              </div>
              <span className="text-white font-semibold">Nile Agency</span>
            </div>
            <p className="text-gray-400 text-sm">© 2024 Nile Agency. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}