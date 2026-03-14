import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Heart, MessageCircle, Star, Sparkles, Crown, X, Check, ChevronRight, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import toast from 'react-hot-toast';

const typeConfig = {
  match: { icon: Heart, color: 'text-pink-400 bg-pink-500/10' },
  superlike: { icon: Star, color: 'text-amber-400 bg-amber-500/10' },
  message: { icon: MessageCircle, color: 'text-blue-400 bg-blue-500/10' },
  system: { icon: Sparkles, color: 'text-purple-400 bg-purple-500/10' },
  boost: { icon: Crown, color: 'text-amber-400 bg-amber-500/10' },
  like: { icon: Heart, color: 'text-rose-400 bg-rose-500/10' },
  profile_view: { icon: User, color: 'text-slate-400 bg-slate-500/10' }
};

export default function NotificationsBox({ onClose, onMarkAllRead }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/notifications?limit=5');
      setNotifications(data.notifications);
    } catch (error) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      if (onMarkAllRead) onMarkAllRead();
      toast.success('Marked all as read');
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 10 }}
      className="absolute left-[270px] top-4 w-80 bg-dark-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[500px]"
    >
      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
        <h3 className="font-display font-bold text-sm flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary" /> Notifications
        </h3>
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
          <X className="w-4 h-4 text-dark-400" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-dark-500">Loading...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="w-8 h-8 text-dark-600 mx-auto mb-2 opacity-20" />
            <p className="text-sm text-dark-500">No notifications yet</p>
          </div>
        ) : (
          notifications.map((n, i) => {
            const config = typeConfig[n.type] || typeConfig.system;
            return (
              <motion.div
                key={n._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex items-start gap-3 p-3 hover:bg-white/5 transition-colors cursor-pointer relative ${!n.isRead ? 'bg-primary/5' : ''}`}
              >
                <div className={`w-8 h-8 rounded-lg ${config.color} flex items-center justify-center flex-shrink-0`}>
                  <config.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-white truncate">{n.title}</h4>
                  <p className="text-[11px] text-dark-400 mt-0.5 line-clamp-2">{n.body}</p>
                  <p className="text-[9px] text-dark-500 mt-1 uppercase tracking-wider">
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {!n.isRead && (
                  <div className="w-1.5 h-1.5 rounded-full bg-primary absolute top-4 right-4" />
                )}
              </motion.div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-white/5 bg-white/5 grid grid-cols-2 gap-2">
        <button
          onClick={handleMarkAllRead}
          className="py-2 text-[10px] font-bold uppercase tracking-wider text-dark-400 hover:text-white transition-colors flex items-center justify-center gap-1.5"
        >
          <Check className="w-3 h-3" /> Mark Read
        </button>
        <button
          onClick={() => { navigate('/app/notifications'); onClose(); }}
          className="py-2 text-[10px] font-bold uppercase tracking-wider text-primary hover:text-primary-300 transition-colors flex items-center justify-center gap-1.5 border-l border-white/5"
        >
          See All <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </motion.div>
  );
}
