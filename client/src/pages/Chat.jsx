import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiMessageSquare, FiSend, FiArrowLeft, FiUser, FiCircle, FiPlus, FiSearch, 
  FiMoreVertical, FiPhone, FiVideo, FiSmile, FiPaperclip, FiCheck, FiCheckCircle,
  FiX, FiMenu, FiMoon, FiSun
} from 'react-icons/fi';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { chatApi } from '../services/api';

let socket;

const mockConversations = [
  { id: '1', user: { email: 'Sarah Chen', avatar: 'SC' }, lastMessage: 'Hey! How\'s the project going?', timestamp: new Date(), unread: 2, online: true },
  { id: '2', user: { email: 'Mike Johnson', avatar: 'MJ' }, lastMessage: 'Thanks for the update!', timestamp: new Date(Date.now() - 3600000), unread: 0, online: false },
  { id: '3', user: { email: 'Emily Davis', avatar: 'ED' }, lastMessage: 'Let\'s schedule a call tomorrow', timestamp: new Date(Date.now() - 7200000), unread: 1, online: true },
  { id: '4', user: { email: 'Alex Kim', avatar: 'AK' }, lastMessage: 'Got it, I\'ll review the PR', timestamp: new Date(Date.now() - 86400000), unread: 0, online: false },
];

const mockMessages = [
  { id: 1, senderId: 'other', content: 'Hey! How\'s the project going?', timestamp: new Date(Date.now() - 300000), status: 'read' },
  { id: 2, senderId: 'me', content: 'It\'s going great! Almost done with the main features.', timestamp: new Date(Date.now() - 240000), status: 'read' },
  { id: 3, senderId: 'other', content: 'That\'s awesome! Can\'t wait to see it.', timestamp: new Date(Date.now() - 180000), status: 'read' },
  { id: 4, senderId: 'me', content: 'I\'ll send you a preview link later today.', timestamp: new Date(Date.now() - 120000), status: 'delivered' },
  { id: 5, senderId: 'other', content: 'Perfect! Let me know when it\'s ready.', timestamp: new Date(Date.now() - 60000), status: 'read' },
];

const TypingIndicator = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex items-center gap-1 p-3 bg-white/10 rounded-2xl"
  >
    <motion.div
      className="w-2 h-2 bg-gray-400 rounded-full"
      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
    />
    <motion.div
      className="w-2 h-2 bg-gray-400 rounded-full"
      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
    />
    <motion.div
      className="w-2 h-2 bg-gray-400 rounded-full"
      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
    />
  </motion.div>
);

export default function Chat() {
  const { partnerId } = useParams();
  const [contacts, setContacts] = useState([]);
  const [conversations, setConversations] = useState(mockConversations);
  const [messages, setMessages] = useState(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState({});
  const [loading, setLoading] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);
  
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const userId = user?._id || user?.id || 'me';

  const loadContacts = useCallback(async () => {
    try {
      const res = await chatApi.getContacts();
      setContacts(res.data);
    } catch (err) {
      console.error('Error loading contacts:', err);
    }
  }, []);
  
  const loadConversations = useCallback(async () => {
    try {
      const res = await chatApi.getConversations();
      setConversations(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, []);

  const loadMessages = useCallback(async (id) => {
    if (!id || typeof id !== 'string' || id === 'undefined' || id === 'null' || id === '' || !id.trim()) return;
    try {
      const res = await chatApi.getMessages(id);
      setMessages(res.data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    if (!userId) return;
    
    try {
      socket = io('http://localhost:5001', { timeout: 5000 });
      
      socket.on('connect', () => {
        socket.emit('join', userId);
      });
      
      socket.on('userOnline', ({ userId: onlineUserId }) => {
        setOnlineUsers(prev => ({ ...prev, [onlineUserId]: true }));
      });
      
      socket.on('userOffline', ({ userId: offlineUserId }) => {
        setOnlineUsers(prev => ({ ...prev, [offlineUserId]: false }));
      });
      
      socket.on('newMessage', (msg) => {
        if (msg.senderId === partnerId || msg.receiverId === partnerId) {
          setMessages(prev => [...prev, {
            ...msg,
            content: msg.content || msg.message
          }]);
        }
      });
    } catch (err) {
      console.log('Socket connection skipped');
    }

    loadContacts();
    loadConversations();
    
    return () => {
      if (socket) socket.disconnect();
    };
  }, [userId, loadConversations, loadContacts, partnerId]);

  useEffect(() => {
    if (!partnerId || typeof partnerId !== 'string' || partnerId === 'undefined' || partnerId === 'null' || partnerId === '') {
      setMessages([]);
      return;
    }
    setMessages(mockMessages); 
    loadMessages(partnerId);
  }, [partnerId, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (messageInputRef.current) {
      messageInputRef.current.focus();
    }
  }, [partnerId]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    if (socket) {
      socket.emit('sendMessage', {
        senderId: userId,
        receiverId: partnerId,
        message: newMessage
      });
    }
    
    setMessages(prev => [...prev, {
      id: Date.now(),
      senderId: 'me',
      content: newMessage,
      timestamp: new Date(),
      status: 'sent'
    }]);
    
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setNewMessage('');
    }, 500);
  };

  const formatTime = (date) => {
    const now = new Date();
    const msgDate = new Date(date);
    const diffDays = Math.floor((now - msgDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return msgDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else {
      return msgDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getConversation = () => {
    return conversations.find(c => c.id === partnerId);
  };

  const filteredConversations = conversations.filter(c => 
    c.user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-dark-bg' : 'bg-gray-50'}`}>
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`fixed top-0 right-0 left-0 h-16 glass-morphism z-30 ${isDark ? 'dark:bg-dark-surface' : 'bg-white'}`}
        style={{ marginLeft: showSidebar ? 320 : 0 }}
      >
        <div className="flex items-center justify-between h-full px-4 md:px-6">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className={`flex items-center gap-2 ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
              <FiArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back</span>
            </Link>
            {partnerId && getConversation() && (
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-indigo to-brand-blue flex items-center justify-center">
                    <span className="text-white font-medium">{getConversation()?.user.avatar}</span>
                  </div>
                  {onlineUsers[partnerId] && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-800" />
                  )}
                </div>
                <div>
                  <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{getConversation()?.user.email}</h2>
                  <p className="text-xs text-emerald-400">Online</p>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button className={`p-2 rounded-lg ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}>
              <FiPhone className="w-5 h-5" />
            </button>
            <button className={`p-2 rounded-lg ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}>
              <FiVideo className="w-5 h-5" />
            </button>
            <button 
              onClick={toggleTheme}
              className={`p-2 rounded-lg ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
            >
              {isDark ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ x: -320 }}
        animate={{ x: showSidebar ? 0 : -320 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`fixed left-0 top-0 h-screen glass-morphism z-40 ${isDark ? 'dark:bg-dark-surface' : 'bg-white'}`}
        style={{ width: 320 }}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Messages</h2>
              <button
                onClick={() => setShowNewChat(!showNewChat)}
                className="p-2 rounded-lg bg-brand-indigo text-white hover:opacity-90 transition"
                title="New Conversation"
              >
                <FiPlus className="w-4 h-4" />
              </button>
            </div>
            <div className={`relative ${isDark ? 'bg-white/5' : 'bg-gray-100'} rounded-xl`}>
              <FiSearch className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 bg-transparent outline-none ${isDark ? 'text-white placeholder-gray-400' : 'text-gray-900 placeholder-gray-500'}`}
              />
            </div>
          </div>
          
          {showNewChat && (
            <div className={`p-4 border-b border-white/10 ${isDark ? 'bg-brand-indigo/10' : 'bg-blue-50'}`}>
              <p className={`text-xs font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Start a new conversation</p>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {contacts.map(contact => (
                  <button
                    key={contact._id}
                    onClick={() => {
                      navigate(`/chat/${contact._id}`);
                      setShowNewChat(false);
                    }}
                    className={`flex items-center gap-2 w-full p-2 rounded-lg transition text-left ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                  >
                    <div className="w-8 h-8 rounded-full bg-brand-indigo flex items-center justify-center">
                      <FiUser className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{contact.email}</p>
                      <p className={`text-xs capitalize ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{contact.role}</p>
                    </div>
                  </button>
                ))}
                {contacts.length === 0 && (
                  <p className={`text-sm text-center py-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>No contacts available</p>
                )}
              </div>
            </div>
          )}
          
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className={`p-4 text-center ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                No conversations yet
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <Link
                  key={conv.id}
                  to={`/chat/${conv.id}`}
                  className={`flex items-center gap-3 p-4 transition ${
                    partnerId === conv.id 
                      ? (isDark ? 'bg-brand-indigo/20' : 'bg-blue-50') 
                      : (isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50')
                  }`}
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-indigo to-brand-blue flex items-center justify-center">
                      <span className="text-white text-sm font-medium">{conv.user.avatar}</span>
                    </div>
                    {conv.online && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-800" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{conv.user.email}</p>
                      <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{formatTime(conv.timestamp)}</span>
                    </div>
                    <p className={`text-sm truncate ${conv.unread > 0 ? (isDark ? 'text-white' : 'text-gray-900') : (isDark ? 'text-gray-500' : 'text-gray-500')}`}>
                      {conv.lastMessage}
                    </p>
                  </div>
                  {conv.unread > 0 && (
                    <span className="w-5 h-5 rounded-full bg-brand-indigo text-white text-xs flex items-center justify-center">
                      {conv.unread}
                    </span>
                  )}
                </Link>
              ))
            )}
          </div>
        </div>
      </motion.div>

      <div className="pt-16" style={{ marginLeft: showSidebar ? 320 : 0 }}>
        {partnerId ? (
          <div className="flex flex-col h-[calc(100vh-4rem)]">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => (
                <motion.div
                  key={msg.id || i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.senderId === userId ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[75%] px-4 py-3 rounded-2xl ${
                    msg.senderId === userId
                      ? 'bg-brand-indigo text-white rounded-br-md'
                      : isDark 
                        ? 'bg-white/10 text-white rounded-bl-md' 
                        : 'bg-gray-200 text-gray-900 rounded-bl-md'
                  }`}>
                    <p>{msg.content}</p>
                    <div className={`flex items-center justify-end gap-1 mt-1 ${
                      msg.senderId === userId ? 'text-white/70' : 'text-gray-400'
                    }`}>
                      <span className="text-xs">{formatTime(msg.timestamp)}</span>
                      {msg.senderId === userId && msg.status === 'read' && (
                        <FiCheckCircle className="w-3 h-3" />
                      )}
                      {msg.senderId === userId && msg.status === 'delivered' && (
                        <FiCheck className="w-3 h-3" />
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <TypingIndicator />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className={`p-4 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className={`p-2 rounded-lg ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
                >
                  <FiPaperclip className="w-5 h-5" />
                </button>
                <input
                  type="text"
                  ref={messageInputRef}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className={`flex-1 px-4 py-3 rounded-full outline-none transition-all ${
                    isDark 
                      ? 'bg-white/10 text-white placeholder-gray-400 focus:bg-white/20' 
                      : 'bg-gray-100 text-gray-900 placeholder-gray-500 focus:bg-gray-200'
                  }`}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className={`p-3 rounded-full transition-colors ${
                    newMessage.trim() 
                      ? 'bg-brand-indigo text-white hover:opacity-90' 
                      : (isDark ? 'bg-white/10 text-gray-500' : 'bg-gray-200 text-gray-400')
                  }`}
                >
                  <FiSend className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className={`w-20 h-20 rounded-2xl ${isDark ? 'bg-white/10' : 'bg-gray-100'} flex items-center justify-center mx-auto mb-4`}>
                <FiMessageSquare className={`w-10 h-10 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              </div>
              <p className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Your Messages</p>
              <p className={`text-sm mt-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Select a conversation to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}