import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMapPin, FiDollarSign, FiClock, FiBriefcase, FiArrowLeft, FiBookmark, FiUser, FiPhone, FiMail, FiGlobe, FiUsers } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { jobsApi, usersApi } from '../services/api';

export default function JobDetails() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    loadJob();
  }, [id]);

  const loadJob = async () => {
    try {
      const res = await jobsApi.getById(id);
      setJob(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    try {
      await usersApi.bookmarkJob(id);
      alert('Job saved!');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-indigo border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-brand-gray mb-4">Job not found</p>
          <Link to="/dashboard" className="btn-primary">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <nav className="glass sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2">
              <FiArrowLeft className="w-5 h-5 text-brand-dark" />
              <span className="text-brand-dark font-medium">Back</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="text-brand-dark font-semibold">Job Details</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-8"
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-brand-dark mb-2">{job.title}</h1>
              <p className="text-xl text-brand-gray">{job.companyName || job.recruiterId?.companyName}</p>
            </div>
            {user?.role === 'employee' && (
              <div className="flex gap-2">
                <button onClick={handleSave} className="btn-secondary">
                  <FiBookmark className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-4 mb-8 text-brand-gray">
            <span className="flex items-center gap-2">
              <FiMapPin className="w-5 h-5" />
              {job.location || 'Remote'}
            </span>
            {job.state && (
              <span className="flex items-center gap-2">
                <FiMapPin className="w-5 h-5" />
                {job.state}
              </span>
            )}
            {job.city && (
              <span className="flex items-center gap-2">
                <FiMapPin className="w-5 h-5" />
                {job.city}
              </span>
            )}
            {job.country && (
              <span className="flex items-center gap-2">
                <FiGlobe className="w-5 h-5" />
                {job.country}
              </span>
            )}
            <span className="flex items-center gap-2">
              <FiClock className="w-5 h-5" />
              {job.jobType}
            </span>
            <span className="flex items-center gap-2">
              <FiBriefcase className="w-5 h-5" />
              {job.experienceLevel}
            </span>
            {job.educationLevel && (
              <span className="flex items-center gap-2">
                <FiBriefcase className="w-5 h-5" />
                Education: {job.educationLevel}
              </span>
            )}
            {job.state && (
              <span className="flex items-center gap-2">
                <FiMapPin className="w-5 h-5" />
                {job.state}
              </span>
            )}
            <span className="flex items-center gap-2">
              <FiDollarSign className="w-5 h-5" />
              {job.salary?.negotiable ? 'Salary Negotiable' : 'Not specified'}
            </span>
            {job.gender && job.gender !== 'both' && (
              <span className="flex items-center gap-2">
                <FiUsers className="w-5 h-5" />
                {job.gender === 'male' ? 'Male Only' : 'Female Only'}
              </span>
            )}
            {job.gender === 'both' && (
              <span className="flex items-center gap-2">
                <FiUsers className="w-5 h-5" />
                Male & Female
              </span>
            )}
          </div>

          {(job.phone || job.email) && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-brand-dark mb-4">Contact Information</h2>
              <div className="flex flex-wrap gap-4 text-brand-gray">
                {job.phone && (
                  <span className="flex items-center gap-2">
                    <FiPhone className="w-5 h-5" />
                    {job.phone}
                  </span>
                )}
                {job.email && (
                  <span className="flex items-center gap-2">
                    <FiMail className="w-5 h-5" />
                    {job.email}
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-brand-dark mb-4">Job Description</h2>
            <p className="text-brand-gray whitespace-pre-line">{job.description}</p>
          </div>

          {job.skills?.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-brand-dark mb-4">Required Skills</h2>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill, i) => (
                  <span key={i} className="px-3 py-1 rounded-full bg-brand-indigo/10 text-brand-indigo text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {job.requirements?.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-brand-dark mb-4">Requirements</h2>
              <ul className="space-y-2">
                {job.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-2 text-brand-gray">
                    <span className="w-2 h-2 rounded-full bg-brand-indigo mt-2" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {user?.role === 'employee' && (
            <div className="border-t border-gray-200 pt-8">
              <button
                onClick={() => navigate(`/apply/${id}`)}
                className="btn-primary flex items-center gap-2"
              >
                Apply Now
              </button>
            </div>
          )}

          {user?.role === 'recruiter' && (
            <div className="border-t border-gray-200 pt-8">
              <h2 className="text-xl font-semibold text-brand-dark mb-4">Company Information</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-brand-gray mb-1">Company</p>
                  <p className="text-brand-dark font-medium">{job.recruiterId?.companyName}</p>
                </div>
                <div>
                  <p className="text-sm text-brand-gray mb-1">Industry</p>
                  <p className="text-brand-dark font-medium">{job.recruiterId?.industry}</p>
                </div>
                <div>
                  <p className="text-sm text-brand-gray mb-1">Company Size</p>
                  <p className="text-brand-dark font-medium">{job.recruiterId?.companySize}</p>
                </div>
                <div>
                  <p className="text-sm text-brand-gray mb-1">Location</p>
                  <p className="text-brand-dark font-medium">{job.recruiterId?.location}</p>
                </div>
              </div>
              {job.recruiterId?.companyDescription && (
                <div className="mt-4">
                  <p className="text-sm text-brand-gray mb-1">About Company</p>
                  <p className="text-brand-gray">{job.recruiterId.companyDescription}</p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}