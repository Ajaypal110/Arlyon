import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Heart, MessageCircle, Star, Sparkles, Crown, Check, Trash2, X, ChevronRight, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import toast from 'react-hot-toast';

const typeConfig = {
  match: { icon: Heart, color: 'text-pink-400 bg-pink-500/10', path: '/app/chat' },
  superlike: { icon: Star, color: 'text-amber-400 bg-amber-500/10', path: '/app/matches' },
  message: { icon: MessageCircle, color: 'text-blue-400 bg-blue-500/10', path: '/app/chat' },
  system: { icon: Sparkles, color: 'text-purple-400 bg-purple-500/10', path: '/app' },
  boost: { icon: Crown, color: 'text-amber-400 bg-amber-500/10', path: '/app/premium' },
  like: { icon: Heart, color: 'text-rose-400 bg-rose-500/10', path: '/app/matches' },
  profile_view: { icon: User, color: 'text-slate-400 bg-slate-500/10', path: '/app/profile' }
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/notifications');
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
      toast.success('All marked as read');
    } catch (error) {
      toast.error('Failed to update notifications');
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('Clear all notifications?')) return;
    try {
      await api.delete('/notifications');
      setNotifications([]);
      toast.success('Notifications cleared');
    } catch (error) {
      toast.error('Failed to clear notifications');
    }
  };

  const handleDeleteOne = async (e, id) => {
    e.stopPropagation();
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const handleNotificationClick = (n) => {
    const config = typeConfig[n.type] || typeConfig.system;
    navigate(config.path);
  };

  return (
    <div className="max-w-3xl mx-auto px-1 py-4 md:px-4 md:py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-white flex items-center gap-2 md:gap-3">
            <div className="p-2 rounded-xl bg-primary/20 text-primary">
              <Bell className="w-6 h-6" />
            </div>
            Notifications
          </h1>
          <p className="text-dark-400 mt-1">Stay updated with your latest activities</p>
        </div>
        
        <div className="flex items-center gap-2">
          {notifications.length > 0 && (
            <>
              <button 
                onClick={handleMarkAllRead}
                className="btn-ghost !py-2 !px-4 text-xs flex items-center gap-2 hover:bg-primary/10 hover:text-primary transition-all rounded-xl"
              >
                <Check className="w-4 h-4" /> Mark all read
              </button>
              <button 
                onClick={handleDeleteAll}
                className="btn-ghost !py-2 !px-4 text-xs flex items-center gap-2 hover:bg-red-500/10 hover:text-red-400 transition-all rounded-xl text-dark-400"
              >
                <Trash2 className="w-4 h-4" /> Clear all
              </button>
            </>
          )}
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {loading ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="glass p-5 rounded-2xl flex gap-4 animate-pulse">
              <div className="w-14 h-14 rounded-2xl bg-white/5" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 bg-white/5 rounded-full w-1/4" />
                <div className="h-3 bg-white/5 rounded-full w-3/4" />
              </div>
            </div>
          ))
        ) : notifications.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-3xl p-12 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
              <Bell className="w-10 h-10 text-dark-600" />
            </div>
            <h3 className="text-xl font-display font-bold text-white mb-2">Clean slate!</h3>
            <p className="text-dark-400 max-w-sm mx-auto">
              No notifications yet. We'll let you know when there's a new match or message for you.
            </p>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            {notifications.map((n, i) => {
              const config = typeConfig[n.type] || typeConfig.system;
              return (
                <motion.div 
                  key={n._id} 
                  layout
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => handleNotificationClick(n)}
                  className={`group relative glass p-5 rounded-2xl transition-all cursor-pointer border hover:border-primary/30 active:scale-[0.98] ${
                    !n.isRead ? 'bg-primary/5 border-primary/20 shadow-xl shadow-primary/5' : 'border-white/5 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon or Avatar */}
                    <div className="relative flex-shrink-0">
                      {n.fromUser?.avatar ? (
                        <img 
                          src={n.fromUser.avatar} 
                          alt={n.fromUser.name} 
                          className="w-14 h-14 rounded-2xl object-cover shadow-sm ring-1 ring-white/10"
                        />
                      ) : (
                        <div className={`w-14 h-14 rounded-2xl ${config.color} flex items-center justify-center shadow-lg`}>
                          <config.icon className="w-7 h-7" />
                        </div>
                      )}
                      {!n.isRead && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary border-4 border-dark-900 shadow-md" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pr-8">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white truncate group-hover:text-primary transition-colors">
                          {n.title}
                        </h3>
                        <span className="text-xs text-dark-500 whitespace-nowrap">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm text-dark-400 mt-1 line-clamp-2 leading-relaxed">
                        {n.body}
                      </p>
                      
                      {/* Action Hint */}
                      <div className="flex items-center gap-1 mt-3 text-[10px] font-bold uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">
                        View Details <ChevronRight className="w-3 h-3" />
                      </div>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="absolute top-5 right-5 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => handleDeleteOne(e, n._id)}
                      className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-lg"
                      title="Remove"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Footer Info */}
      {notifications.length > 10 && (
        <p className="text-center text-dark-500 text-xs mt-8">
          Showing the latest {notifications.length} notifications
        </p>
      )}
    </div>
  );
}

