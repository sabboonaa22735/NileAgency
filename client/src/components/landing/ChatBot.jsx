import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageCircle, FiX, FiSend, FiMinimize2 } from 'react-icons/fi';

const quickQuestions = [
  'How does hiring work?',
  'What are the pricing plans?',
  'Is it free to use?',
  'How do I post a job?',
];

const responses = {
  'How does hiring work?': 'Our platform connects companies with talented professionals through a streamlined process: post jobs, review candidates, chat in real-time, and hire seamlessly.',
  'What are we pricing plans?': 'We offer three plans: Free (for individuals), Professional ($49/month for growing teams), and Enterprise (custom pricing). All plans include a 14-day free trial!',
  'Is it free to use?': 'Yes! Our Starter plan is completely free with 5 job postings per month. You can upgrade anytime to unlock more features.',
  'How do I post a job?': 'Simply create an account, click "Post a Job", fill in the details, and publish. Your job will be visible to thousands of qualified candidates instantly.',
};

export default function ChatBot({ isDark = true }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, type: 'bot', text: 'Hi there! 👋 How can I help you today?' },
  ]);
  const [inputValue, setInputValue] = useState('');

  const handleSend = (text = inputValue) => {
    if (!text.trim()) return;
    
    const userMessage = { id: Date.now(), type: 'user', text };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');

    setTimeout(() => {
      const responseText = responses[text] || "Thanks for your message! Our team will get back to you shortly. You can also email us at support@nileagency.com";
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, type: 'bot', text: responseText },
      ]);
    }, 500);
  };

  const bgColor = isDark ? 'bg-[#0a0a0f]' : 'bg-white';
  const borderColor = isDark ? 'border-white/10' : 'border-slate-200';
  const headerBg = isDark ? 'bg-[#0f0f14]' : 'bg-slate-100';
  const textPrimary = isDark ? 'text-white' : 'text-slate-900';
  const textSecondary = isDark ? 'text-gray-300' : 'text-slate-700';
  const inputBg = isDark ? 'bg-[#0f0f14] border-white/10 text-white placeholder-gray-500' : 'bg-slate-100 border-slate-200 text-slate-900 placeholder-slate-400';
  const quickBtnBg = isDark ? 'bg-[#0f0f14] border-white/10 text-gray-400 hover:text-white hover:bg-white/10' : 'bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200';
  const closeBtn = isDark ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200';

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-24 right-6 w-80 md:w-96 ${bgColor} backdrop-blur-2xl rounded-3xl border ${borderColor} shadow-2xl ${isDark ? 'shadow-purple-500/10' : 'shadow-purple-500/20'} overflow-hidden z-50`}
          >
            <div className={`flex items-center justify-between px-5 py-4 border-b ${borderColor} ${headerBg}`}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">NA</span>
                </div>
                <div>
                  <div className={`text-sm font-semibold ${textPrimary}`}>Nile Assistant</div>
                  <div className="text-xs text-emerald-500">Online now</div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${closeBtn}`}
              >
                <FiMinimize2 className="w-4 h-4" />
              </button>
            </div>

            <div className="h-80 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                      msg.type === 'user'
                        ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white'
                        : isDark 
                          ? 'bg-[#0f0f14] text-gray-300' 
                          : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <div className={`p-4 border-t ${borderColor}`}>
              <div className="flex flex-wrap gap-2 mb-3">
                {quickQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    className={`px-3 py-1.5 rounded-full text-xs transition-colors ${quickBtnBg}`}
                  >
                    {q}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type a message..."
                  className={`flex-1 px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-purple-500/50 ${inputBg}`}
                />
                <button
                  onClick={() => handleSend()}
                  className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-white hover:shadow-lg hover:shadow-purple-500/25 transition-shadow"
                >
                  <FiSend className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-shadow z-50"
      >
        {isOpen ? <FiX className="w-6 h-6" /> : <FiMessageCircle className="w-6 h-6" />}
      </motion.button>
    </>
  );
}