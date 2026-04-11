import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMessageSquare, FiSend, FiArrowLeft, FiUser, FiCircle, FiPlus } from 'react-icons/fi';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { chatApi } from '../services/api';

let socket;

export default function Chat() {
  const { partnerId } = useParams();
  const [contacts, setContacts] = useState([]);
  const [conversations, setConversations] = useState({});
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [showNewChat, setShowNewChat] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?._id || user?.id;

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
    
    socket = io('http://localhost:5001');
    
    socket.emit('join', userId);
    
    socket.on('userOnline', ({ userId: onlineUserId }) => {
      setOnlineUsers(prev => ({ ...prev, [onlineUserId]: true }));
    });
    
    socket.on('userOffline', ({ userId: offlineUserId }) => {
      setOnlineUsers(prev => ({ ...prev, [offlineUserId]: false }));
    });
    
    socket.on('newMessage', (msg) => {
      if (msg.senderId === partnerId || msg.receiverId === partnerId) {
        setMessages(prev => {
          if (prev.some(m => m._id === msg._id || m.tempId === msg.tempId)) {
            return prev;
          }
          return [...prev, {
            ...msg,
            content: msg.content || msg.message
          }];
        });
      }
      loadConversations();
    });

    loadContacts();
    loadConversations();
    
    return () => {
      socket.disconnect();
    };
  }, [userId, loadConversations, loadContacts]);

  useEffect(() => {
    if (!partnerId || typeof partnerId !== 'string' || partnerId === 'undefined' || partnerId === 'null' || partnerId === '') {
      setMessages([]);
      return;
    }
    setMessages([]); 
    loadMessages(partnerId);
  }, [partnerId, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !partnerId) return;
    
    socket.emit('sendMessage', {
      senderId: userId,
      receiverId: partnerId,
      message: newMessage
    });
    
    setMessages(prev => [...prev, {
      senderId: userId,
      receiverId: partnerId,
      content: newMessage,
      createdAt: new Date()
    }]);
    
    setNewMessage('');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-indigo border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <nav className="glass sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/dashboard" className="flex items-center gap-2">
              <FiArrowLeft className="w-5 h-5 text-brand-dark" />
              <span className="text-brand-dark font-medium">Back</span>
            </Link>
            <div className="flex items-center gap-2">
              <FiMessageSquare className="w-5 h-5 text-brand-indigo" />
              <span className="text-brand-dark font-semibold">Messages</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="glass rounded-2xl overflow-hidden h-[calc(100vh-12rem)]">
          <div className="flex h-full">
            <div className={`${partnerId ? 'hidden md:block' : 'block'} w-full md:w-1/3 border-r border-gray-200`}>
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-brand-dark">Messages</h2>
                <button
                  onClick={() => setShowNewChat(!showNewChat)}
                  className="p-2 rounded-lg bg-brand-indigo text-white hover:bg-indigo-600 transition"
                  title="New Conversation"
                >
                  <FiPlus className="w-4 h-4" />
                </button>
              </div>
              
              {showNewChat && (
                <div className="p-2 border-b border-gray-200 bg-indigo-50">
                  <p className="text-xs font-medium text-brand-gray mb-2 px-2">Start a new conversation</p>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {contacts.map(contact => (
                      <button
                        key={contact._id}
                        onClick={() => {
                          navigate(`/chat/${contact._id}`);
                          setShowNewChat(false);
                        }}
                        className="flex items-center gap-2 w-full p-2 rounded-lg hover:bg-white transition text-left"
                      >
                        <div className="w-8 h-8 rounded-full bg-brand-indigo flex items-center justify-center">
                          <FiUser className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-brand-dark font-medium truncate">{contact.email}</p>
                          <p className="text-xs text-brand-gray capitalize">{contact.role}</p>
                        </div>
                      </button>
                    ))}
                    {contacts.length === 0 && (
                      <p className="text-sm text-brand-gray text-center py-2">No contacts available</p>
                    )}
                  </div>
                </div>
              )}
              
              <div className="overflow-y-auto h-[calc(100%-8rem)]">
                {Object.keys(conversations).length === 0 ? (
                  <div className="p-4 text-center text-brand-gray">
                    No conversations yet
                  </div>
                ) : (
                  Object.entries(conversations).map(([id, data]) => (
                    <Link
                      key={id}
                      to={`/chat/${id}`}
                      className={`flex items-center gap-3 p-4 hover:bg-gray-50 transition ${
                        partnerId === id ? 'bg-indigo-50' : ''
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-brand-indigo flex items-center justify-center relative">
                        <FiUser className="w-5 h-5 text-white" />
                        {onlineUsers[id] && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-brand-dark font-medium truncate">{data.user?.email || `User ${id.slice(-4)}`}</p>
                        <p className="text-brand-gray text-sm truncate">{data.lastMessage}</p>
                      </div>
                      {data.unread > 0 && (
                        <span className="w-5 h-5 rounded-full bg-brand-indigo text-white text-xs flex items-center justify-center">
                          {data.unread}
                        </span>
                      )}
                    </Link>
                  ))
                )}
              </div>
            </div>

            <div className={`${partnerId ? 'block' : 'hidden md:block'} flex-1 flex flex-col`}>
              {partnerId ? (
                <>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.senderId === userId ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl ${
                          msg.senderId === userId
                            ? 'bg-brand-indigo text-white'
                            : 'glass'
                        }`}>
                          <p>{msg.content}</p>
                          <p className={`text-xs mt-1 ${
                            msg.senderId === userId
                              ? 'text-indigo-200'
                              : 'text-gray-400'
                          }`}>
                            {new Date(msg.createdAt || msg.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                  <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="input-glass flex-1"
                      />
                      <button
                        type="submit"
                        className="btn-primary"
                        disabled={!newMessage.trim()}
                      >
                        <FiSend className="w-5 h-5" />
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-brand-gray">
                  <div className="text-center">
                    <FiMessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Select a conversation to start chatting</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}