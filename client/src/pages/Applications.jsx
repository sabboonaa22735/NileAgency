import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiFileText, FiClock, FiCheck, FiX, FiXCircle } from 'react-icons/fi';
import { applicationsApi } from '../services/api';

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await applicationsApi.myApplications();
      setApplications(res.data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredApps = applications.filter(app => {
    if (filter === 'all') return true;
    return app.status === filter;
  });

  const statusCounts = {
    all: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    accepted: applications.filter(a => a.status === 'accepted').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">My Applications</h1>
          <p className="text-slate-400">{applications.length} total applications</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {['all', 'pending', 'accepted', 'rejected'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                filter === status
                  ? 'bg-indigo-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)} ({statusCounts[status]})
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500/20 border-t-indigo-500"></div>
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="text-center py-20">
            <FiXCircle className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No applications found</h3>
            <p className="text-slate-400">
              {filter === 'all' 
                ? "You haven't applied to any jobs yet" 
                : `No ${filter} applications`}
            </p>
            <Link
              to="/jobs"
              className="inline-block mt-4 px-6 py-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600"
            >
              Browse Jobs
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredApps.map((app, index) => (
              <motion.div
                key={app._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 md:p-6 hover:border-slate-600 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <FiFileText className="w-6 h-6 text-white" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">
                          {app.jobId?.title || 'Job Title'}
                        </h3>
                        <p className="text-slate-400">
                          {app.jobId?.recruiterId?.companyName || 'Company'} • {app.jobId?.location || 'Location'}
                        </p>
                      </div>
                      <span className={`px-3 py-1 text-sm font-medium rounded-full flex-shrink-0 ${
                        app.status === 'accepted'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : app.status === 'rejected'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {app.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                      <span className="flex items-center gap-1">
                        <FiClock className="w-4 h-4" />
                        Applied: {formatDate(app.createdAt)}
                      </span>
                      {app.jobId?.jobType && (
                        <span>{app.jobId.jobType}</span>
                      )}
                      {app.jobId?.salary && (
                        <span>{app.jobId.salary}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    <Link
                      to={`/jobs/${app.jobId?._id}`}
                      className="px-4 py-2 bg-slate-700 text-white rounded-xl text-sm font-medium hover:bg-slate-600"
                    >
                      View Job
                    </Link>
                    {app.resume && (
                      <a
                        href={app.resume}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-indigo-500 text-white rounded-xl text-sm font-medium hover:bg-indigo-600"
                      >
                        View Resume
                      </a>
                    )}
                  </div>
                </div>

                {app.timeline && app.timeline.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-700">
                    <p className="text-xs text-slate-500 mb-2">Application Timeline</p>
                    <div className="space-y-2">
                      {app.timeline.slice(-3).map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          {item.status === 'accepted' ? (
                            <FiCheck className="w-4 h-4 text-emerald-400" />
                          ) : item.status === 'rejected' ? (
                            <FiX className="w-4 h-4 text-red-400" />
                          ) : (
                            <FiClock className="w-4 h-4 text-amber-400" />
                          )}
                          <span className="text-slate-300">{item.status}</span>
                          <span className="text-slate-500">• {formatDate(item.date)}</span>
                          {item.note && <span className="text-slate-400">- {item.note}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}