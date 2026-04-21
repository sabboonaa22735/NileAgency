import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSearch, FiMapPin, FiDollarSign, FiClock, FiFilter, FiGrid, FiList, FiBookmark, FiArrowRight, FiX } from 'react-icons/fi';
import { jobsApi, usersApi } from '../services/api';

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [savedJobs, setSavedJobs] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    jobType: '',
    experienceLevel: '',
    location: ''
  });

  useEffect(() => {
    fetchJobs();
    fetchSavedJobs();
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchJobs();
    }, 500);
    return () => clearTimeout(debounce);
  }, [searchQuery, filters]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = { limit: 50 };
      if (searchQuery) params.search = searchQuery;
      if (filters.jobType) params.jobType = filters.jobType;
      if (filters.location) params.location = filters.location;
      
      const res = await jobsApi.getAll(params);
      setJobs(res.data.jobs || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedJobs = async () => {
    try {
      const res = await usersApi.getSavedJobs();
      setSavedJobs(res.data.map(j => j._id) || []);
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
    }
  };

  const toggleSaveJob = async (jobId) => {
    try {
      if (savedJobs.includes(jobId)) {
        await usersApi.removeBookmark(jobId);
        setSavedJobs(prev => prev.filter(id => id !== jobId));
      } else {
        await usersApi.bookmarkJob(jobId);
        setSavedJobs(prev => [...prev, jobId]);
      }
    } catch (error) {
      console.error('Error toggling save job:', error);
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Find Jobs</h1>
            <p className="text-slate-400">{jobs.length} jobs available</p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
          >
            <FiFilter className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
          </button>
        </div>

        <div className="relative mb-6">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search jobs by title, company, or skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 p-4 bg-slate-800/30 rounded-xl border border-slate-700"
          >
            <select
              value={filters.jobType}
              onChange={(e) => setFilters(prev => ({ ...prev, jobType: e.target.value }))}
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
            >
              <option value="">All Job Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
            </select>
            <select
              value={filters.experienceLevel}
              onChange={(e) => setFilters(prev => ({ ...prev, experienceLevel: e.target.value }))}
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
            >
              <option value="">All Levels</option>
              <option value="Entry">Entry Level</option>
              <option value="Mid">Mid Level</option>
              <option value="Senior">Senior</option>
            </select>
            <input
              type="text"
              placeholder="Location..."
              value={filters.location}
              onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500"
            />
          </motion.div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500/20 border-t-indigo-500"></div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20">
            <FiX className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No jobs found</h3>
            <p className="text-slate-400">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {jobs.map((job, index) => (
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
                        onClick={() => toggleSaveJob(job._id)}
                        className={`p-2 rounded-lg transition-colors ${
                          savedJobs.includes(job._id)
                            ? 'bg-indigo-500 text-white'
                            : 'bg-slate-700 text-slate-400 hover:text-indigo-400'
                        }`}
                      >
                        <FiBookmark className="w-5 h-5" />
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
                        {getTimeAgo(job.createdAt)}
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