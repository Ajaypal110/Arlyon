import { motion } from 'framer-motion';
import { Users, Heart, Flag, DollarSign, TrendingUp, Shield, Eye, Ban, Search, ChevronRight, BarChart3 } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [statsData, setStatsData] = useState({ totalUsers: 0, activeUsers: 0, premiumUsers: 0, totalMatches: 0, pendingReports: 0, totalRevenue: 0 });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, reportsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users?limit=5'),
        api.get('/admin/reports?limit=5')
      ]);
      setStatsData(statsRes.data.stats);
      setRecentUsers(usersRes.data.users);
      setRecentReports(reportsRes.data.reports);
    } catch (error) {
      toast.error('Failed to load admin dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}/ban`);
      toast.success('User banned successfully');
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to ban user');
    }
  };

  const stats = [
    { label: 'Total Users', value: statsData.totalUsers.toString(), change: '+12%', icon: Users, color: 'from-primary to-violet-500' },
    { label: 'Active Matches', value: statsData.totalMatches.toString(), change: '+8%', icon: Heart, color: 'from-secondary to-pink-400' },
    { label: 'Pending Reports', value: statsData.pendingReports.toString(), change: '-2%', icon: Flag, color: 'from-red-500 to-orange-500' },
    { label: 'Revenue (Total)', value: `₹${statsData.totalRevenue}`, change: '+15%', icon: DollarSign, color: 'from-green-500 to-emerald-400' },
  ];

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-3xl font-display font-bold flex items-center gap-2">
          <Shield className="w-7 h-7 text-primary" /> Admin Dashboard
        </h1>
        <p className="text-dark-400 mt-1">Platform overview and management</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="card-hover">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center`}><s.icon className="w-5 h-5 text-white" /></div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${s.change.startsWith('+') ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10'}`}>{s.change}</span>
            </div>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-sm text-dark-400">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold">Recent Users</h2>
            <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="input-field text-sm !py-2 !pl-9 w-48" /></div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-dark-700 text-dark-500 text-left"><th className="pb-3 font-medium">User</th><th className="pb-3 font-medium">Joined</th><th className="pb-3 font-medium">Status</th><th className="pb-3 font-medium">Actions</th></tr></thead>
              <tbody>
                {recentUsers.filter(u => u.name.toLowerCase().includes(search.toLowerCase())).map(u => (
                  <tr key={u._id} className="border-b border-dark-800 hover:bg-white/5">
                    <td className="py-3"><p className="font-medium">{u.name}{u.isPremium && <span className="ml-2 text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full">PRO</span>}</p><p className="text-xs text-dark-500">{u.email}</p></td>
                    <td className="py-3 text-dark-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="py-3"><span className={`badge text-xs ${!u.isBanned ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>{u.isBanned ? 'Banned' : 'Active'}</span></td>
                    <td className="py-3"><button className="btn-ghost text-xs !py-1 !px-2"><Eye className="w-3 h-3" /></button><button onClick={() => !u.isBanned && handleBanUser(u._id)} disabled={u.isBanned || u.role === 'admin'} className="btn-ghost text-xs !py-1 !px-2 text-red-400 disabled:opacity-30"><Ban className="w-3 h-3" /></button></td>
                  </tr>
                ))}
                {loading && <tr><td colSpan="4" className="py-8 text-center text-dark-500">Loading users...</td></tr>}
                {!loading && recentUsers.length === 0 && <tr><td colSpan="4" className="py-8 text-center text-dark-500">No recent users.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h2 className="font-display font-semibold mb-4 flex items-center gap-2"><Flag className="w-4 h-4 text-red-400" /> Recent Reports</h2>
          <div className="space-y-3">
            {recentReports.map((r, i) => (
              <div key={r._id} className="p-3 rounded-xl bg-dark-800/50 hover:bg-dark-800 transition-colors cursor-pointer">
                <div className="flex items-center justify-between mb-1"><p className="text-sm font-medium">{r.reason}</p><span className={`text-[10px] px-2 py-0.5 rounded-full ${r.status === 'pending' ? 'bg-amber-500/10 text-amber-400' : 'bg-green-500/10 text-green-400'}`}>{r.status}</span></div>
                <p className="text-xs text-dark-500">{r.reporter?.name} → {r.reported?.name} • {new Date(r.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
            {loading && <div className="py-4 text-center text-dark-500 text-sm">Loading reports...</div>}
            {!loading && recentReports.length === 0 && <div className="py-4 text-center text-dark-500 text-sm">No recent reports! 🎉</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
