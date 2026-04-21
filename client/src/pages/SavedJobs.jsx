import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiBookmark, FiMapPin, FiDollarSign, FiClock, FiTrash2, FiX } from 'react-icons/fi';
import { usersApi, jobsApi } from '../services/api';

export default function SavedJobs() {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const fetchSavedJobs = async () => {
    try {
      setLoading(true);
      const res = await usersApi.getSavedJobs();
      setSavedJobs(res.data || []);
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeSavedJob = async (jobId) => {
    try {
      await usersApi.removeBookmark(jobId);
      setSavedJobs(prev => prev.filter(job => job._id !== jobId));
    } catch (error) {
      console.error('Error removing saved job:', error);
    }
  };

  const getTimeAgo = (date) => {
    if (!date) return '';
    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffHours / 24);
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return past.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Saved Jobs</h1>
          <p className="text-slate-400">{savedJobs.length} jobs saved</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500/20 border-t-indigo-500"></div>
          </div>
        ) : savedJobs.length === 0 ? (
          <div className="text-center py-20">
            <FiBookmark className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No saved jobs</h3>
            <p className="text-slate-400 mb-4">Jobs you save will appear here</p>
            <Link
              to="/jobs"
              className="inline-block px-6 py-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600"
            >
              Browse Jobs
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {savedJobs.map((job, index) => (
              <motion.div
                key={job._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 md:p-6 hover:border-slate-600 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-lg">{job.recruiterId?.companyName?.[0] || 'C'}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">{job.title}</h3>
                        <p className="text-slate-400">{job.recruiterId?.companyName || 'Company'}</p>
                      </div>
                      <button
                        onClick={() => removeSavedJob(job._id)}
                        className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                      >
                        <FiTrash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mb-3">
                      {job.location && (
                        <span className="flex items-center gap-1">
                          <FiMapPin className="w-4 h-4" />
                          {job.location}
                        </span>
                      )}
                      {job.salary && (
                        <span className="flex items-center gap-1">
                          <FiDollarSign className="w-4 h-4" />
                          {job.salary}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <FiClock className="w-4 h-4" />
                        Saved {getTimeAgo(job.createdAt)}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {job.skills?.slice(0, 5).map(skill => (
                        <span key={skill} className="px-3 py-1 text-xs bg-indigo-500/20 text-indigo-300 rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col gap-2 flex-shrink-0">
                    <Link
                      to={`/jobs/${job._id}`}
                      className="px-6 py-2 bg-indigo-500 text-white rounded-xl text-center font-medium hover:bg-indigo-600 transition-colors"
                    >
                      View
                    </Link>
                    <Link
                      to={`/apply/${job._id}`}
                      className="px-6 py-2 bg-slate-700 text-white rounded-xl text-center font-medium hover:bg-slate-600 transition-colors"
                    >
                      Apply
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}