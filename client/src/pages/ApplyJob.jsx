import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiMapPin, FiClock, FiDollarSign, FiUpload, FiFile, FiCheck } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { jobsApi, usersApi, applicationsApi } from '../services/api';

export default function ApplyJob() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [job, setJob] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    coverLetter: '',
    resume: null
  });

  useEffect(() => {
    loadData();
  }, [jobId]);

  const loadData = async () => {
    try {
      const [jobRes, profileRes] = await Promise.all([
        jobsApi.getById(jobId),
        usersApi.getProfile()
      ]);
      setJob(jobRes.data);
      setProfile(profileRes.data);
      
      if (profileRes.data) {
        setFormData(prev => ({
          ...prev,
          firstName: profileRes.data.firstName || '',
          middleName: profileRes.data.middleName || '',
          lastName: profileRes.data.lastName || '',
          email: user?.email || '',
          phone: profileRes.data.phone || '',
          city: profileRes.data.city || ''
        }));
      }
    } catch (err) {
      console.error('Error loading job:', err);
    }
    setLoading(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf' && !file.name.endsWith('.doc') && !file.name.endsWith('.docx')) {
        alert('Please upload a PDF, DOC, or DOCX file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      setFormData({ ...formData, resume: file });
    }
  };

  const isResumeRequired = () => {
    if (!job?.educationLevel) return false;
    const eduLevel = job.educationLevel?.toLowerCase() || '';
    const aboveDiplomaLevels = ['phd', 'doctorate', 'masters', 'master', 'degree', 'bachelor'];
    return aboveDiplomaLevels.some(level => eduLevel.includes(level));
  };

  const resumeRequired = isResumeRequired();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (resumeRequired && !formData.resume) {
      alert('Please upload your CV/Resume - it is required for this job position');
      return;
    }
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.city) {
      alert('Please fill in all required fields');
      return;
    }
    setSubmitting(true);
    try {
      await applicationsApi.applyWithResume({
        jobId,
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        city: formData.city,
        coverLetter: formData.coverLetter,
        resume: formData.resume
      });
      alert('Application submitted successfully!');
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Application failed');
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-200 border-t-indigo-600"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-brand-dark mb-4">Job not found</h2>
          <Link to="/dashboard" className="btn-primary">Go to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-brand-gray hover:text-brand-dark mb-6 transition">
          <FiArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6 mb-6"
        >
          <h1 className="text-2xl font-bold text-brand-dark mb-2">{job.title}</h1>
          <p className="text-brand-gray mb-4">{job.recruiterId?.companyName}</p>
          <div className="flex flex-wrap gap-4 text-sm text-brand-gray">
            <span className="flex items-center gap-1"><FiMapPin /> {job.location || 'Remote'}</span>
            <span className="flex items-center gap-1"><FiClock /> {job.jobType}</span>
            <span className="flex items-center gap-1"><FiDollarSign /> {job.salary?.negotiable ? 'Salary Negotiable' : 'Not specified'}</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-6"
        >
          <h2 className="text-xl font-bold text-brand-dark mb-6">Job Application</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-brand-dark mb-2">First Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="input-glass w-full"
                  placeholder="First name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-dark mb-2">Middle Name</label>
                <input
                  type="text"
                  value={formData.middleName}
                  onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                  className="input-glass w-full"
                  placeholder="Middle name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-dark mb-2">Last Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="input-glass w-full"
                  placeholder="Last name"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-brand-dark mb-2">Email <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-glass w-full"
                  placeholder="your@email.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-dark mb-2">Phone Number <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input-glass w-full"
                  placeholder="+1 234 567 8900"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-dark mb-2">City <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="input-glass w-full"
                placeholder="Your city"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-dark mb-2">
                CV/Resume {resumeRequired ? <span className="text-red-500">*</span> : <span className="text-gray-400 text-xs">(Optional for this position)</span>}
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-brand-indigo transition">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                  id="resume-upload"
                />
                <label htmlFor="resume-upload" className="cursor-pointer">
                  <FiUpload className="w-10 h-10 mx-auto text-brand-gray mb-2" />
                  {formData.resume ? (
                    <div className="flex items-center justify-center gap-2 text-brand-indigo">
                      <FiFile className="w-5 h-5" />
                      <span className="font-medium">{formData.resume.name}</span>
                    </div>
                  ) : (
                    <div>
                      <p className="text-brand-dark font-medium">Click to upload CV/Resume</p>
                      <p className="text-sm text-brand-gray">PDF, DOC, or DOCX (max 5MB)</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-dark mb-2">Cover Letter (Optional)</label>
              <textarea
                value={formData.coverLetter}
                onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
                className="input-glass w-full h-32"
                placeholder="Tell the employer why you're a great fit for this position..."
              />
            </div>

            <button
              type="submit"
              disabled={submitting || (resumeRequired && !formData.resume)}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}