import { motion } from 'framer-motion';
import { FiMessageSquare, FiSend, FiShield, FiUser } from 'react-icons/fi';

export default function AdminConversationPanel({
  admin,
  messages,
  newMessage,
  setNewMessage,
  onSend,
  currentUserId,
  loading = false,
  title = 'Admin Conversation',
  subtitle = 'Direct support channel'
}) {
  return (
    <div className="glass-card overflow-hidden">
      <div className="border-b border-white/10 bg-white/5 px-6 py-5">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-400 via-blue-400 to-cyan-300 text-slate-950 shadow-lg shadow-cyan-300/20">
            <FiShield className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <p className="soft-label mb-1">{subtitle}</p>
            <h3 className="text-2xl font-bold text-white">{title}</h3>
            <p className="text-sm text-slate-300">
              {admin ? `${admin.firstName || 'Admin'} ${admin.lastName || ''}`.trim() || admin.email : 'Connecting to admin...'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-[0.36fr_0.64fr]">
        <div className="border-b border-white/10 bg-white/5 p-6 lg:border-b-0 lg:border-r">
          <div className="rounded-[28px] border border-white/10 bg-slate-950/20 p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/8 text-cyan-300">
                <FiUser className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold text-white">{admin?.email || 'Admin support'}</div>
                <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Official support</div>
              </div>
            </div>
            <p className="text-sm leading-7 text-slate-300">
              This channel is reserved for direct communication with the admin team. Recruiters and employees won’t see any other users here.
            </p>
          </div>
        </div>

        <div className="flex min-h-[560px] flex-col">
          <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5 md:px-6">
            {loading ? (
              <div className="flex h-full items-center justify-center text-slate-400">
                Loading conversation...
              </div>
            ) : messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/6 text-cyan-300">
                  <FiMessageSquare className="h-8 w-8" />
                </div>
                <h4 className="text-xl font-bold text-white">Start the conversation</h4>
                <p className="mt-2 max-w-sm text-sm text-slate-300">
                  Ask a question, follow up on approval, or reach the admin team directly from this dashboard.
                </p>
              </div>
            ) : (
              messages.map((msg, index) => {
                const isMe = msg.senderId === currentUserId;
                return (
                  <motion.div
                    key={msg._id || msg.tempId || index}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-md rounded-[24px] px-4 py-3 text-sm shadow-lg ${
                        isMe
                          ? 'bg-gradient-to-br from-indigo-500 to-cyan-400 text-slate-950'
                          : 'border border-white/10 bg-white/6 text-slate-100'
                      }`}
                    >
                      <p>{msg.content || msg.message}</p>
                      <p className={`mt-2 text-xs ${isMe ? 'text-slate-800/70' : 'text-slate-400'}`}>
                        {new Date(msg.createdAt || msg.timestamp || Date.now()).toLocaleTimeString()}
                      </p>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          <form onSubmit={onSend} className="border-t border-white/10 bg-white/5 p-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Message admin..."
                className="input-glass flex-1"
              />
              <button type="submit" className="btn-primary px-5" disabled={!newMessage.trim() || !admin}>
                <FiSend className="h-5 w-5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
