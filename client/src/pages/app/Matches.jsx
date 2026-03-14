import { motion } from 'framer-motion';
import { Heart, MessageCircle, Search, Sparkles, MoreHorizontal, User as UserIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function Matches() {
  const [search, setSearch] = useState('');
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/matches');
      setMatches(data.matches);
    } catch (error) {
      toast.error('Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

  const newMatches = matches.filter(m => !m.lastMessage);
  const activeConversations = matches.filter(m => m.lastMessage);
  
  const filtered = activeConversations.filter(m => m.otherUser?.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          </h1>
          <p className="text-sm text-dark-400 mt-1">{matches.length} connections</p>
        </div>
      </div>

      {/* New Matches */}
      {newMatches.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-semibold text-dark-300 mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" /> New Matches
          </h3>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {newMatches.map((m, i) => (
              <Link to={`/app/chat?match=${m._id}`} key={m._id}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex flex-col items-center gap-2 min-w-[80px] cursor-pointer group"
                >
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary via-secondary to-accent p-[2px]">
                      <div className="w-full h-full rounded-full bg-card flex items-center justify-center text-2xl group-hover:scale-110 transition-all overflow-hidden">
                        {m.otherUser?.avatar ? (
                          (m.otherUser.avatar.startsWith('http') || m.otherUser.avatar.startsWith('data:')) ? (
                            <img src={m.otherUser.avatar} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            m.otherUser.avatar
                          )
                        ) : (
                          <UserIcon className="w-8 h-8 text-dark-600" />
                        )}
                      </div>
                    </div>
                    {m.otherUser?.isOnline && <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 border-2 border-card" />}
                  </div>
                  <span className="text-xs text-dark-300 font-medium">{m.otherUser?.name?.split(' ')[0]}</span>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
        <input type="text" placeholder="Search matches..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field !pl-11 text-sm" />
      </div>

      {/* Match List */}
      <div className="space-y-2">
        {loading ? (
          <div className="flex justify-center p-8"><div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" /></div>
        ) : filtered.map((m, i) => (
          <motion.div
            key={m._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link to={`/app/chat?match=${m._id}`} className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-all group cursor-pointer">
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center text-xl overflow-hidden">
                  {m.otherUser?.avatar ? (
                    (m.otherUser.avatar.startsWith('http') || m.otherUser.avatar.startsWith('data:')) ? (
                      <img src={m.otherUser.avatar} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      m.otherUser.avatar
                    )
                  ) : (
                    <UserIcon className="w-6 h-6 text-dark-600" />
                  )}
                </div>
                {m.otherUser?.isOnline && <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-dark-900" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-sm">{m.otherUser?.name}, {m.otherUser?.age}</h3>
                  <span className="text-xs text-dark-500">{new Date(m.updatedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-sm text-dark-400 truncate pr-4">{m.lastMessage?.text || 'Sent a photo'}</p>
                  {m.unreadCount > 0 && (
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
                      {m.unreadCount}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs gradient-text font-semibold">{m.compatibility}%</span>
                <MoreHorizontal className="w-4 h-4 text-dark-500" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {!loading && matches.length === 0 && (
        <div className="card text-center py-12">
          <Heart className="w-12 h-12 text-dark-600 mx-auto mb-3" />
          <h3 className="font-display font-semibold mb-1">No matches found</h3>
          <p className="text-sm text-dark-400">Keep swiping to find your person!</p>
        </div>
      )}
    </div>
  );
}
