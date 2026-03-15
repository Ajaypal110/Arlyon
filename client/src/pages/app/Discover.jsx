import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Heart, X, Star, MapPin, Sparkles, Filter, ChevronDown, User as UserIcon, Crown, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../lib/api';

function SwipeCard({ user, onSwipe, isTop }) {
  const navigate = useNavigate();
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0]);

  const handleDragEnd = (_, info) => {
    if (info.offset.x > 100) onSwipe('like');
    else if (info.offset.x < -100) onSwipe('pass');
  };

  if (!isTop) {
    return (
      <motion.div className="absolute inset-0 card bg-card" style={{ scale: 0.95, y: 10 }}>
        <div className="h-full flex items-center justify-center opacity-50">
          <div className="w-24 h-24 rounded-full bg-dark-700" />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      style={{ x, rotate }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      whileTap={{ scale: 0.98 }}
      className="absolute inset-0 card cursor-grab active:cursor-grabbing overflow-hidden"
    >
      {/* Like/Nope overlays */}
      <motion.div style={{ opacity: likeOpacity }} className="absolute top-6 left-6 z-20 px-4 py-2 rounded-xl border-2 border-green-400 text-green-400 font-bold text-xl -rotate-12">
        LIKE
      </motion.div>
      <motion.div style={{ opacity: nopeOpacity }} className="absolute top-6 right-6 z-20 px-4 py-2 rounded-xl border-2 border-red-400 text-red-400 font-bold text-xl rotate-12">
        NOPE
      </motion.div>

      {/* Photo area */}
      <div className="relative h-[55%] bg-gradient-to-br from-primary/20 via-dark-800 to-secondary/20 rounded-xl mb-4 flex items-center justify-center overflow-hidden">
        {user.avatar ? (
          (user.avatar.startsWith('http') || user.avatar.startsWith('data:')) ? (
            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-8xl">{user.avatar}</span>
          )
        ) : (
          <UserIcon className="w-24 h-24 text-dark-600" />
        )}

        {user.isPhotoVerified && (
          <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-blue-500/20 text-blue-400 text-xs font-medium flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" /></svg>
            Verified
          </div>
        )}
        {user.isPremium && (
          <div className="absolute top-3 left-3 px-2 py-1 rounded-lg bg-amber-500/80 text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-lg">
            <Crown className="w-3 h-3" /> {user.premiumTier || 'Premium'}
          </div>
        )}
        <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-xl glass text-sm font-semibold">
          <span className="gradient-text">{user.trustScore}%</span> trust score
        </div>
      </div>

      <div className="px-2" onClick={() => navigate(`/app/profile/${user._id}`)}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-display font-bold group-hover:text-primary transition-colors">{user.name}, {user.age}</h3>
          <div className="flex items-center gap-1 text-dark-400 text-sm">
            <MapPin className="w-3.5 h-3.5" /> {user.location.city}
          </div>
        </div>
        <p className="text-sm text-dark-400 mb-3 line-clamp-2">{user.bio}</p>
        <div className="flex flex-wrap gap-1.5">
          {(user.interests || []).slice(0, 4).map(i => (
            <span key={i} className="badge-primary text-[11px]">{i}</span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function Discover() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [limitReached, setLimitReached] = useState(null);
  const [filters, setFilters] = useState({
    minAge: 18,
    maxAge: 50,
    distance: '50'
  });

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        minAge: filters.minAge,
        maxAge: filters.maxAge,
        distance: filters.distance === 'Any' ? '99999' : filters.distance
      });
      const { data } = await api.get(`/users/discover?${params.toString()}`);
      setUsers(data.users);
    } catch (error) {
      toast.error('Failed to load profiles');
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (direction) => {
    if (users.length === 0) return;
    const current = users[0];
    
    // Optimistic UI update
    setUsers(prev => prev.slice(1));
    
    if (direction === 'like') {
      toast.success(`Liked ${current.name} 💖`, { id: `like-${current._id}`, duration: 1500 });
    }

    try {
      const { data } = await api.post(`/likes/${current._id}`, { type: direction });
      if (data.isMatch) {
        toast.success(`IT'S A MATCH WITH ${current.name.toUpperCase()}! 🎉`, { 
          icon: '🔥', duration: 4000, 
          style: { background: '#111827', color: '#fff', border: '1px solid #EC4899' }
        });
      }
    } catch (error) {
      if (error.response?.data?.code === 'LIMIT_REACHED') {
        const type = direction === 'like' ? 'daily swipes' : 'superlikes';
        setLimitReached(type);
      }
      console.error(error);
    }
  };

  const handleSuperLike = async () => {
    if (users.length === 0) return;
    const current = users[0];
    setUsers(prev => prev.slice(1));
    toast.success(`Super Liked ${current.name}! ⭐`, { icon: '⭐', duration: 1500 });

    try {
      const { data } = await api.post(`/likes/${current._id}`, { type: 'superlike' });
      if (data.isMatch) {
        toast.success(`IT'S A MATCH WITH ${current.name.toUpperCase()}! 🎉`, { 
          icon: '🔥', duration: 4000, 
          style: { background: '#111827', color: '#fff', border: '1px solid #3B82F6' }
        });
      }
    } catch (error) {
      if (error.response?.data?.code === 'LIMIT_REACHED') {
        setLimitReached('superlikes');
      }
      console.error(error);
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-4 md:space-y-6 px-2 md:px-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Discover</h1>
          <p className="text-sm text-dark-400">{users.length} people nearby</p>
        </div>
        <button onClick={() => setShowFilters(!showFilters)}
          className="btn-ghost flex items-center gap-2 border border-dark-700 !rounded-xl">
          <Filter className="w-4 h-4" /> Filters <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="card overflow-hidden">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-dark-400 mb-1 block">Age Range</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={filters.minAge}
                    onChange={(e) => setFilters(prev => ({ ...prev, minAge: e.target.value }))}
                    placeholder="18"
                    className="input-field text-sm !py-2"
                  />
                  <input
                    type="number"
                    value={filters.maxAge}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxAge: e.target.value }))}
                    placeholder="50"
                    className="input-field text-sm !py-2"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-dark-400 mb-1 block">Distance</label>
                <select
                  value={filters.distance}
                  onChange={(e) => setFilters(prev => ({ ...prev, distance: e.target.value }))}
                  className="input-field text-sm !py-2"
                >
                  <option value="50">50 km</option>
                  <option value="100">100 km</option>
                  <option value="250">250 km</option>
                  <option value="Any">Any</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Swipe Area */}
      <div className="relative h-[calc(100vh-18rem)] md:h-[520px]">
        {loading ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card h-full flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
            <h3 className="text-lg font-display font-semibold mb-2 text-dark-300">Finding people nearby...</h3>
          </motion.div>
        ) : users.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card h-full flex flex-col items-center justify-center text-center">
            <Sparkles className="w-16 h-16 text-dark-600 mb-4" />
            <h3 className="text-xl font-display font-semibold mb-2">No More Profiles</h3>
            <p className="text-dark-400 text-sm">Check back later or expand your filters</p>
          </motion.div>
        ) : (
          <AnimatePresence>
            {users.slice(0, 2).reverse().map((u, i) => (
              <SwipeCard key={u._id} user={u} onSwipe={handleSwipe} isTop={i === users.slice(0, 2).reverse().length - 1} />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Action Buttons */}
      {users.length > 0 && (
        <div className="flex items-center justify-center gap-5">
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleSwipe('pass')}
            className="w-14 h-14 rounded-full bg-dark-800 border border-dark-600 flex items-center justify-center text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition-all">
            <X className="w-6 h-6" />
          </motion.button>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handleSuperLike}
            className="w-12 h-12 rounded-full bg-dark-800 border border-dark-600 flex items-center justify-center text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/30 transition-all">
            <Star className="w-5 h-5" />
          </motion.button>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleSwipe('like')}
            className="w-14 h-14 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all">
            <Heart className="w-6 h-6" />
          </motion.button>
        </div>
      )}
      {/* Limit Reached Modal */}
      <AnimatePresence>
        {limitReached && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center px-6 bg-dark-950/80 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-sm bg-dark-900 border border-white/10 rounded-3xl p-8 text-center shadow-2xl">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-amber-500" />
              </div>
              <h2 className="text-2xl font-display font-bold mb-2">Limit Reached!</h2>
              <p className="text-dark-400 mb-8">
                You've used all your {limitReached} for today. Upgrade to Gold or Platinum for unlimited connections!
              </p>
              <div className="space-y-3">
                <button onClick={() => navigate('/app/premium')}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold hover:shadow-lg hover:shadow-amber-500/20 active:scale-95 transition-all">
                  Upgrade to Premium
                </button>
                <button onClick={() => setLimitReached(null)}
                  className="w-full py-4 rounded-xl btn-ghost !bg-transparent text-dark-500">
                  Maybe Later
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
