import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Heart, MessageCircle, Eye, TrendingUp, Sparkles, Users, Crown, Zap, Clock } from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      profileViews: 0,
      matches: 0,
      messages: 0,
      compatibilityAvg: '0%',
      profileCompletion: 0
    },
    recentMatches: [],
    activities: []
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/users/stats');
        if (data.success) {
          setDashboardData({
            stats: data.stats,
            recentMatches: data.recentMatches,
            activities: data.activities
          });
        }
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err);
        toast.error('Could not load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const stats = [
    { label: 'Profile Views', value: dashboardData.stats.profileViews, change: '+12%', icon: Eye, color: 'from-primary to-violet-500' },
    { label: 'Matches', value: dashboardData.stats.matches, change: 'new', icon: Heart, color: 'from-secondary to-pink-400' },
    { label: 'Messages', value: dashboardData.stats.messages, change: 'unread', icon: MessageCircle, color: 'from-accent to-cyan-400' },
    { label: 'Compatibility Avg', value: dashboardData.stats.compatibilityAvg, change: 'Top 10%', icon: TrendingUp, color: 'from-green-500 to-emerald-400' },
  ];

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div>
        <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-display font-bold">
          Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0] || 'there'}</span> 👋
        </motion.h1>
        <p className="text-dark-400 mt-1">Here's what's happening with your dating journey</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card-hover group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <s.icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-medium text-green-400 bg-green-500/10 px-2 py-1 rounded-full">{s.change}</span>
            </div>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-sm text-dark-400">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Matches */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-semibold text-lg">Recent Matches</h2>
            <span className="badge-primary"><Users className="w-3 h-3" /> {dashboardData.recentMatches.length} new</span>
          </div>
          <div className="space-y-4">
            {dashboardData.recentMatches.length > 0 ? (
              dashboardData.recentMatches.map((m, i) => (
                <motion.div
                  key={m._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    {m.avatar ? (
                      <img src={m.avatar} alt={m.name} className="w-11 h-11 rounded-full object-cover border border-white/10 group-hover:scale-110 transition-transform" />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center text-sm group-hover:scale-110 transition-transform">
                        {m.name[0]}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-sm">{m.name}, {m.age}</p>
                      <p className="text-xs text-dark-500">
                        {new Date(m.time).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-primary-300">{m.compatibility}%</p>
                      <p className="text-xs text-dark-500">match</p>
                    </div>
                    <div className="w-12 h-1.5 rounded-full bg-dark-700 overflow-hidden hidden md:block">
                      <div className="h-full rounded-full bg-gradient-to-r from-primary to-secondary" style={{ width: `${m.compatibility}%` }} />
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-dark-500 italic">No matches yet. Keep exploring!</p>
              </div>
            )}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="card">
          <h2 className="font-display font-semibold text-lg mb-6">Activity</h2>
          <div className="space-y-6">
            {dashboardData.activities.map((a, i) => {
              const Icon = a.icon === 'Heart' ? Heart : MessageCircle;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-dark-800 flex items-center justify-center flex-shrink-0 mt-0.5 border border-white/5">
                    <Icon className={`w-4 h-4 ${a.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-dark-200">{a.text}</p>
                    <p className="text-xs text-dark-500 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {a.time}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Profile Completion */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
        className="card bg-gradient-to-r from-primary/10 via-card to-secondary/10 border-primary/20 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-lg mb-0.5">Complete Your Profile</h3>
              <p className="text-sm text-dark-400">A complete profile gets 3x more matches</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold gradient-text">{dashboardData.stats.profileCompletion}%</p>
            <p className="text-xs text-dark-500 font-medium tracking-wider uppercase">completed</p>
          </div>
        </div>
        <div className="w-full h-2.5 rounded-full bg-dark-800 mt-6 overflow-hidden p-0.5 border border-white/5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${dashboardData.stats.profileCompletion}%` }}
            transition={{ delay: 0.8, duration: 1.5, ease: 'circOut' }}
            className="h-full rounded-full bg-gradient-to-r from-primary via-secondary to-accent shadow-[0_0_10px_rgba(124,58,237,0.5)]"
          />
        </div>
      </motion.div>
    </div>
  );
}
