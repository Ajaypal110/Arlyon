import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Camera, Shield, Crown, MapPin, 
  Sparkles, Heart, Wine, Dumbbell, 
  Salad, Dog, MessageSquare, Plus,
  Info, Edit3, Settings
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import toast from 'react-hot-toast';

const radarData = [
  { trait: 'Openness', key: 'openness', defaultValue: 75 },
  { trait: 'Extraversion', key: 'extraversion', defaultValue: 85 },
  { trait: 'Ambition', key: 'conscientiousness', defaultValue: 70 },
  { trait: 'Agreeableness', key: 'agreeableness', defaultValue: 90 },
  { trait: 'Neuroticism', key: 'neuroticism', defaultValue: 80 },
];

export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const isOwnProfile = !id || id === currentUser?._id;
  const displayUser = isOwnProfile ? currentUser : profileUser;

  useEffect(() => {
    if (isOwnProfile) {
      if (currentUser) {
        setProfileUser(currentUser);
        setIsLoading(false);
      }
    } else {
      fetchProfile();
    }
  }, [id, currentUser, isOwnProfile]);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get(`/users/profile/${id}`);
      setProfileUser(data.user);
    } catch (error) {
      toast.error('User not found');
      navigate('/app');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 px-4 md:px-0">
      {/* Header Profile Card */}
      <div className="card overflow-hidden p-0 border-white/10 shadow-2xl relative">
        <div className="h-48 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-dark-950/80 to-transparent" />
          
          {/* Mobile Settings Icon */}
          <button 
            onClick={() => navigate('/app/settings')}
            className="absolute top-4 right-4 p-2.5 rounded-xl bg-dark-950/40 hover:bg-dark-950/60 text-white backdrop-blur-md border border-white/10 z-20 md:hidden shadow-lg"
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>
        
        <div className="px-6 md:px-10 pb-8 -mt-20 flex items-end justify-between relative z-10">
          <div className="flex items-center md:items-end gap-6 flex-col md:flex-row text-center md:text-left">
            <div className="relative">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl overflow-hidden border-4 border-dark-900 bg-dark-800 shadow-2xl">
                <img 
                  src={displayUser?.avatar || `https://ui-avatars.com/api/?name=${displayUser?.name}&background=7C3AED&color=fff`} 
                  alt={displayUser?.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              {displayUser?.isOnline && (
                <div className="absolute bottom-3 right-3 w-5 h-5 rounded-full bg-green-500 border-4 border-dark-900 shadow-lg" />
              )}
            </div>
            
            <div className="pb-0 md:pb-4">
              <div className="flex items-center justify-center md:justify-start gap-3">
                <h2 className="text-3xl md:text-4xl font-display font-bold text-white">{displayUser?.name}, {displayUser?.age}</h2>
                {displayUser?.isPhotoVerified && <Shield className="w-6 h-6 text-blue-400" />}
                {displayUser?.isPremium && <Crown className="w-6 h-6 text-amber-400" />}
              </div>
              <p className="text-sm md:text-base text-dark-300 mt-1.5 flex items-center justify-center md:justify-start gap-2 font-medium">
                <MapPin className="w-4 h-4 md:w-5 md:h-5 text-primary-400" /> {displayUser?.location?.city || 'Location unavailable'}
              </p>
            </div>
          </div>

          <div className="pb-0 md:pb-4 hidden md:block">
            {isOwnProfile ? (
              <div className="flex gap-4">
                <button 
                  onClick={() => navigate('/app/profile/edit')}
                  className="px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 hover:border-white/20 text-white text-sm font-semibold transition-all backdrop-blur-xl border border-white/5 shadow-lg flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4 text-primary-400" /> Edit Profile
                </button>
                {displayUser?.isPremium && (
                  <button 
                    onClick={() => navigate('/app/premium')}
                    className="px-6 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 hover:border-amber-500/40 text-amber-400 text-sm font-semibold transition-all backdrop-blur-xl shadow-lg shadow-amber-500/5 flex items-center gap-2"
                  >
                    <Crown className="w-4 h-4" /> Manage Premium
                  </button>
                )}
              </div>
            ) : (
              <div className="flex gap-3">
                <button className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all backdrop-blur-xl border border-white/10">
                  <Heart className="w-6 h-6" />
                </button>
                <button className="px-8 py-3 rounded-2xl bg-primary hover:bg-primary-600 text-sm font-bold transition-all shadow-lg shadow-primary/30">
                  Message
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Actions */}
      <div className="md:hidden pt-2">
        {isOwnProfile ? (
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => navigate('/app/profile/edit')}
              className="py-3.5 rounded-xl bg-primary hover:bg-primary-600 text-white text-sm font-bold shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
            >
              <Edit3 className="w-4 h-4" /> Edit Profile
            </button>
            {displayUser?.isPremium ? (
              <button 
                onClick={() => navigate('/app/premium')}
                className="py-3.5 rounded-xl bg-dark-800 border border-amber-500/20 text-amber-500 text-sm font-bold transition-all flex items-center justify-center gap-2"
              >
                <Crown className="w-4 h-4" /> Manage
              </button>
            ) : (
              <button 
                onClick={() => navigate('/app/premium')}
                className="py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Crown className="w-4 h-4" /> Upgrade
              </button>
            )}
          </div>
        ) : (
          <div className="flex gap-3">
            <button className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 text-sm font-bold">Like</button>
            <button className="flex-[2] py-4 rounded-2xl bg-primary text-sm font-bold">Message</button>
          </div>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Col: Info & Bio */}
        <div className="md:col-span-2 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
            <h3 className="font-semibold text-sm text-dark-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Info className="w-4 h-4" /> About Me
            </h3>
            <p className="text-sm leading-relaxed text-dark-300">
              {displayUser?.bio || (isOwnProfile ? 'You haven\'t added a bio yet. Tell people something about yourself!' : 'No bio provided yet.')}
            </p>
          </motion.div>

          {/* Photo Gallery */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card">
            <h3 className="font-semibold text-sm text-dark-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Camera className="w-4 h-4" /> Photo Gallery
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {displayUser?.photos?.map((photo, i) => (
                <div key={i} className="aspect-square rounded-xl overflow-hidden bg-dark-800 border border-white/5">
                  <img src={photo.url} alt="Gallery" className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer" />
                </div>
              ))}
              {isOwnProfile && displayUser?.photos?.length === 0 && (
                <button 
                  onClick={() => navigate('/app/profile/edit')}
                  className="aspect-square rounded-xl border-2 border-dashed border-dark-600 flex flex-col items-center justify-center text-dark-500 hover:border-primary/30 hover:text-primary-300 transition-all group"
                >
                  <Plus className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  <span className="text-xs mt-1">Add Photos</span>
                </button>
              )}
            </div>
            {displayUser?.photos?.length > 0 && isOwnProfile && (
              <p className="text-[10px] text-dark-500 mt-4 text-center italic">Manage your photos in the edit profile section.</p>
            )}
          </motion.div>

          {/* Interests */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card">
            <h3 className="font-semibold text-sm text-dark-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Heart className="w-4 h-4" /> Interests
            </h3>
            <div className="flex flex-wrap gap-2">
              {(displayUser?.interests || []).length > 0 ? (
                displayUser.interests.map(i => (
                  <span key={i} className="px-3 py-1 bg-primary/10 text-primary-300 text-xs rounded-full border border-primary/20">
                    {i}
                  </span>
                ))
              ) : (
                <p className="text-xs text-dark-500 italic">No interests selected yet.</p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Right Col: Stats & Personality */}
        <div className="space-y-6">
          {/* Stats Bar */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="card">
            <h3 className="font-semibold text-sm text-dark-400 uppercase tracking-wider mb-4">Profile Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-2xl bg-dark-900/50 border border-white/5">
                <p className="text-2xl font-display font-bold text-primary-400">{displayUser?.profileCompletion || 0}%</p>
                <p className="text-[10px] text-dark-500 uppercase font-medium">Completion</p>
              </div>
              <div className="p-3 rounded-2xl bg-dark-900/50 border border-white/5">
                <p className="text-2xl font-display font-bold text-green-400">{displayUser?.trustScore || 0}</p>
                <p className="text-[10px] text-dark-500 uppercase font-medium">Trust Score</p>
              </div>
            </div>
          </motion.div>

          {/* Personality Radar */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="card px-4">
            <h3 className="font-semibold text-sm text-dark-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" /> Personality
            </h3>
            <div className="space-y-4">
              {radarData.map((d, i) => {
                const value = displayUser?.personalityTraits?.[d.key] || d.defaultValue;
                return (
                  <div key={d.trait} className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] uppercase font-bold text-dark-400">
                      <span>{d.trait}</span>
                      <span className="text-primary-300">{value}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-dark-900 rounded-full overflow-hidden border border-white/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${value}%` }}
                        transition={{ delay: 0.6 + i * 0.1, duration: 1 }}
                        className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Lifestyle */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="card">
            <h3 className="font-semibold text-sm text-dark-400 uppercase tracking-wider mb-4">Lifestyle</h3>
            <div className="space-y-3">
              {[
                { label: 'Drinking', value: displayUser?.lifestyle?.drinking, icon: Wine },
                { label: 'Workout', value: displayUser?.lifestyle?.workout, icon: Dumbbell },
                { label: 'Diet', value: displayUser?.lifestyle?.diet, icon: Salad },
                { label: 'Pets', value: displayUser?.lifestyle?.pets, icon: Dog },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div className="flex items-center gap-3">
                    <item.icon className="w-4 h-4 text-dark-500" />
                    <span className="text-xs text-dark-400">{item.label}</span>
                  </div>
                  <span className="text-xs font-semibold text-dark-200 capitalize">{item.value || 'Not set'}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
