import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiTwitter, FiLinkedin, FiGithub, FiMail, FiArrowRight } from 'react-icons/fi';

const footerLinks = {
  Product: ['Features', 'Pricing', 'Integrations', 'API', 'Changelog'],
  Company: ['About', 'Blog', 'Careers', 'Press', 'Partners'],
  Resources: ['Documentation', 'Help Center', 'Community', 'Webinars', 'Contact'],
  Legal: ['Privacy', 'Terms', 'Security', 'Cookies', 'GDPR'],
};

const socialLinks = [
  { icon: FiTwitter, href: '#', label: 'Twitter' },
  { icon: FiLinkedin, href: '#', label: 'LinkedIn' },
  { icon: FiGithub, href: '#', label: 'GitHub' },
  { icon: FiMail, href: '#', label: 'Email' },
];

export default function Footer({ isDark = true }) {
  const textPrimary = isDark ? 'text-white' : 'text-slate-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-slate-600';
  const textMuted = isDark ? 'text-gray-500' : 'text-slate-500';
  const borderColor = isDark ? 'border-white/5' : 'border-slate-200';
  const socialBg = isDark ? 'bg-[#0f0f14] text-gray-400 hover:text-white hover:bg-white/10' : 'bg-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-300';

  return (
    <footer className={`py-16 px-6 border-t ${borderColor} ${isDark ? 'bg-[#0a0a0f]' : 'bg-slate-100'}`}>
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-10 mb-12">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 flex items-center justify-center">
                  <span className="text-white font-bold">N</span>
                </div>
              </div>
              <span className={`text-lg font-bold ${textPrimary}`}>Nile Agency</span>
            </Link>
            <p className={`${textSecondary} mb-6 max-w-xs text-sm leading-relaxed`}>
              The premium hiring platform that brings together top companies and exceptional talent.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${socialBg}`}
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className={`font-semibold mb-4 text-sm ${textPrimary}`}>{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <Link
                      to={`/${link.toLowerCase().replace(' ', '-')}`}
                      className={`${textMuted} hover:text-purple-500 transition-colors text-sm`}
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className={`pt-8 border-t ${borderColor} flex flex-col md:flex-row items-center justify-between gap-4`}>
          <p className={`${textMuted} text-sm`}>
            © {new Date().getFullYear()} Nile Agency. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm">
            <Link to="/privacy" className={`${textMuted} hover:text-purple-500 transition-colors`}>
              Privacy Policy
            </Link>
            <Link to="/terms" className={`${textMuted} hover:text-purple-500 transition-colors`}>
              Terms of Service
            </Link>
            <Link to="/cookies" className={`${textMuted} hover:text-purple-500 transition-colors`}>
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}