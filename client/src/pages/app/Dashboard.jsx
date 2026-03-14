import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Heart, MessageCircle, Eye, TrendingUp, Sparkles, Users, Crown, Zap } from 'lucide-react';

const stats = [
  { label: 'Profile Views', value: '0', change: '0%', icon: Eye, color: 'from-primary to-violet-500' },
  { label: 'Matches', value: '0', change: '0', icon: Heart, color: 'from-secondary to-pink-400' },
  { label: 'Messages', value: '0', change: '0', icon: MessageCircle, color: 'from-accent to-cyan-400' },
  { label: 'Compatibility Avg', value: '0%', change: '0%', icon: TrendingUp, color: 'from-green-500 to-emerald-400' },
];

const recentMatches = [];
const activities = [];

export default function Dashboard() {
  const { user } = useAuth();

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
            <span className="badge-primary"><Users className="w-3 h-3" /> {recentMatches.length} new</span>
          </div>
          <div className="space-y-4">
            {recentMatches.map((m, i) => (
              <motion.div
                key={m.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                    {m.avatar}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{m.name}, {m.age}</p>
                    <p className="text-xs text-dark-500">{m.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-primary-300">{m.compatibility}%</p>
                    <p className="text-xs text-dark-500">match</p>
                  </div>
                  <div className="w-12 h-1.5 rounded-full bg-dark-700 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-primary to-secondary" style={{ width: `${m.compatibility}%` }} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="card">
          <h2 className="font-display font-semibold text-lg mb-6">Activity</h2>
          <div className="space-y-4">
            {activities.map((a, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="flex items-start gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-dark-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <a.icon className={`w-4 h-4 ${a.color}`} />
                </div>
                <div>
                  <p className="text-sm">{a.text}</p>
                  <p className="text-xs text-dark-500 mt-0.5">{a.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Profile Completion */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
        className="card bg-gradient-to-r from-primary/5 via-card to-secondary/5 border-primary/10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-semibold text-lg mb-1">Complete Your Profile</h3>
            <p className="text-sm text-dark-400">A complete profile gets 3x more matches</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold gradient-text">{user?.profileCompletion || 60}%</p>
            <p className="text-xs text-dark-500">completed</p>
          </div>
        </div>
        <div className="w-full h-2 rounded-full bg-dark-700 mt-4 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${user?.profileCompletion || 60}%` }}
            transition={{ delay: 0.8, duration: 1, ease: 'easeOut' }}
            className="h-full rounded-full bg-gradient-to-r from-primary via-secondary to-accent"
          />
        </div>
      </motion.div>
    </div>
  );
}
