import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { FiMenu, FiX, FiArrowRight, FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';

const navLinks = [
  { name: 'Features', href: '#features' },
  { name: 'How it Works', href: '#how-it-works' },
  { name: 'Showcase', href: '#showcase' },
  { name: 'Pricing', href: '#pricing' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isDark = theme === 'dark';

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? isDark 
            ? 'bg-[#0a0a0f] border-b border-white/5'
            : 'bg-white border-b border-black/5'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className={`flex items-center justify-between rounded-2xl px-6 py-3 transition-all duration-300 ${
          isScrolled 
            ? isDark 
              ? 'bg-[#0f0f14] border border-white/10' 
              : 'bg-slate-100 border border-black/10'
            : 'bg-transparent'
        }`}>
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/25 group-hover:shadow-purple-500/40 transition-shadow duration-300">
                <span className="text-white font-bold text-lg">N</span>
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity" />
            </div>
            <div>
              <span className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Nile Agency</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`text-sm transition-colors duration-200 relative group ${
                  isDark ? 'text-gray-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-indigo-500 group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                isDark 
                  ? 'bg-[#0f0f14] border border-white/10 text-white hover:bg-white/10'
                  : 'bg-slate-200 border border-black/10 text-slate-700 hover:bg-slate-300'
              }`}
            >
              {isDark ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
            </button>
            <Link to="/login" className={`text-sm font-medium transition-colors ${
              isDark ? 'text-gray-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}>
              Sign In
            </Link>
            <Link
              to="/register"
              className="group relative px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-sm font-semibold overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                Get Started
                <FiArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`md:hidden w-10 h-10 rounded-xl flex items-center justify-center ${
              isDark ? 'bg-[#0f0f14] text-white' : 'bg-slate-200 text-slate-900'
            }`}
          >
            {isOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`md:hidden mx-4 mt-2 rounded-2xl border overflow-hidden ${
              isDark 
                ? 'bg-[#0a0a0f] border-white/10'
                : 'bg-white border-black/10'
            }`}
          >
            <div className="p-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`block transition-colors py-2 ${
                    isDark ? 'text-gray-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <div className={`border-t pt-4 space-y-3 ${isDark ? 'border-white/10' : 'border-black/10'}`}>
                <button
                  onClick={toggleTheme}
                  className={`flex items-center gap-3 w-full transition-colors py-2 ${
                    isDark ? 'text-gray-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {isDark ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
                  {isDark ? 'Light Mode' : 'Dark Mode'}
                </button>
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className={`block transition-colors py-2 ${
                    isDark ? 'text-gray-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center px-5 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}