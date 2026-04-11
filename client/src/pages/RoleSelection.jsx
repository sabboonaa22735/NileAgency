import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiBriefcase, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

export default function RoleSelection() {
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { selectRole, user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selected) return;
    
    setLoading(true);
    try {
      await selectRole(selected);
      if (selected === 'employee') {
        navigate('/employee-registration');
      } else {
        navigate('/recruiter-registration');
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const roles = [
    {
      id: 'employee',
      icon: FiUser,
      title: 'Register as Employee',
      desc: 'Find your dream job, apply to positions, and connect with recruiters',
      features: ['Browse jobs', 'Apply for positions', 'Save favorites', 'Chat with recruiters']
    },
    {
      id: 'recruiter',
      icon: FiBriefcase,
      title: 'Register as Recruiter',
      desc: 'Post jobs, manage applicants, and hire top talent for your company',
      features: ['Post job listings', 'Review applicants', 'Hire candidates', 'Manage team']
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-20">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/30" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-brand-indigo/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl relative"
      >
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-brand-dark mb-4">Choose Your Path</h1>
          <p className="text-xl text-brand-gray">Select how you want to use Nile Agency</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {roles.map((role, i) => (
              <motion.div
                key={role.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setSelected(role.id)}
                className={`glass rounded-2xl p-8 cursor-pointer transition-all ${
                  selected === role.id 
                    ? 'ring-2 ring-brand-indigo shadow-lg shadow-brand-indigo/20' 
                    : 'hover:shadow-lg'
                }`}
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 ${
                  selected === role.id 
                    ? 'bg-brand-indigo' 
                    : 'bg-brand-indigo/10'
                }`}>
                  <role.icon className={`w-8 h-8 ${selected === role.id ? 'text-white' : 'text-brand-indigo'}`} />
                </div>
                <h3 className="text-xl font-semibold text-brand-dark mb-2">{role.title}</h3>
                <p className="text-brand-gray mb-4">{role.desc}</p>
                <ul className="space-y-2">
                  {role.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-brand-gray">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        selected === role.id ? 'bg-brand-indigo' : 'bg-gray-300'
                      }`} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          <button
            type="submit"
            disabled={!selected || loading}
            className={`btn-primary w-full flex items-center justify-center gap-2 ${
              !selected || loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Continuing...' : 'Continue'} <FiArrowRight />
          </button>
        </form>
      </motion.div>
    </div>
  );
}