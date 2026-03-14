import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Camera, Edit3, MapPin, Heart, Shield, Star, Sparkles, Calendar, Wine, Dumbbell, Salad, Dog, Plus, Save, X, Crown } from 'lucide-react';
import { useState } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

const radarData = [
  { trait: 'Openness', value: 0 },
  { trait: 'Social', value: 0 },
  { trait: 'Ambition', value: 0 },
  { trait: 'Kindness', value: 0 },
  { trait: 'Humor', value: 0 },
];

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    age: user?.age || '',
    city: user?.location?.city || '',
    interests: (user?.interests || []).join(', '),
    lifestyle: {
      drinking: user?.lifestyle?.drinking || '',
      workout: user?.lifestyle?.workout || '',
      diet: user?.lifestyle?.diet || '',
      pets: user?.lifestyle?.pets || '',
    }
  });

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const updatePayload = {
        name: formData.name,
        bio: formData.bio,
        age: Number(formData.age),
        location: { ...user?.location, city: formData.city },
        interests: formData.interests.split(',').map(i => i.trim()).filter(Boolean),
        lifestyle: formData.lifestyle
      };

      const { data } = await api.put('/users/profile', updatePayload);
      updateUser(data.user);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLifestyleChange = (field, value) => {
    setFormData(prev => ({ ...prev, lifestyle: { ...prev.lifestyle, [field]: value } }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Hero Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card overflow-hidden relative">
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-primary/30 via-secondary/20 to-accent/30 -mx-6 -mt-6 mb-4" />

        <div className="flex flex-col md:flex-row gap-6 items-start -mt-16 relative z-10 px-2">
          <div className="relative group">
            <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-primary via-secondary to-accent p-[3px]">
              <div className="w-full h-full rounded-2xl bg-card flex items-center justify-center text-5xl overflow-hidden">
                {user?.avatar ? (
                  (user.avatar.startsWith('http') || user.avatar.startsWith('data:')) ? (
                    <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    user.avatar
                  )
                ) : (
                  '😊'
                )}
              </div>
            </div>
            <button className="absolute bottom-1 right-1 w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-3">
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Your Name" className="input-field max-w-sm" />
                <div className="flex items-center gap-2">
                  <input type="number" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} placeholder="Age" className="input-field w-24" />
                  <input type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} placeholder="City" className="input-field max-w-[200px]" />
                </div>
                <textarea value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} placeholder="Tell people about yourself..." className="input-field h-24 resize-none" />
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-display font-bold">{user?.name || 'Your Name'}</h1>
                  {user?.isPhotoVerified && (
                    <span className="badge bg-blue-500/15 text-blue-400 border-blue-500/20">
                      <Shield className="w-3 h-3" /> Verified
                    </span>
                  )}
                  {user?.isPremium && (
                    <span className="badge bg-amber-500/15 text-amber-400 border-amber-500/20 font-bold">
                      <Crown className="w-3 h-3" /> {user.premiumTier?.toUpperCase() || 'PREMIUM'}
                    </span>
                  )}
                </div>
                <p className="text-dark-400 text-sm flex items-center gap-1">
                  {user?.age || 25} years old
                  {user?.location?.city && <><span className="mx-1">•</span><MapPin className="w-3 h-3" />{user.location.city}</>}
                </p>
                <p className="text-dark-300 text-sm mt-2 max-w-lg">{user?.bio || 'Add a bio to tell people about yourself'}</p>
              </>
            )}
          </div>

          <div className="flex flex-col gap-2 min-w-[140px]">
            {isEditing ? (
              <>
                <button onClick={handleSave} disabled={isLoading} className="btn-primary !py-2 !px-4 text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
                  <Save className="w-4 h-4" /> {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
                <button onClick={() => setIsEditing(false)} className="btn-ghost !py-2 !px-3 text-sm flex items-center justify-center gap-2 text-dark-400 hover:text-white">
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setIsEditing(true)} className="btn-secondary !py-2 !px-4 text-sm flex items-center justify-center gap-2 backdrop-blur-md">
                  <Edit3 className="w-4 h-4" /> Edit Profile
                </button>
                {!user?.isPremium && (
                  <button onClick={() => window.location.href='/app/premium'} className="w-full py-2 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[11px] font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-amber-500/30 transition-all">
                    <Crown className="w-3.5 h-3.5" /> UPGRADE
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Subscription Status Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card !bg-dark-900/50 border-amber-500/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-500" /> Subscription Status
          </h3>
          {user?.isPremium ? (
             <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest bg-green-400/10 px-2 py-0.5 rounded-full border border-green-400/20">Active</span>
          ) : (
             <span className="text-[10px] font-bold text-dark-500 uppercase tracking-widest bg-dark-800 px-2 py-0.5 rounded-full">Free Plan</span>
          )}
        </div>
        
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="flex-1 space-y-1">
            <p className="text-sm text-dark-300">
              {user?.isPremium ? (
                <>You are currently on the <span className="text-amber-500 font-bold">{user.premiumTier?.toUpperCase()}</span> plan.</>
              ) : (
                <>Upgrade to Gold or Platinum to see who likes you and get unlimited swipes!</>
              )}
            </p>
            {user?.premiumExpiry && (
              <p className="text-xs text-dark-500">Renews/Expires on: {new Date(user.premiumExpiry).toLocaleDateString()}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
             {user?.isPremium ? (
                <button onClick={() => window.location.href='/app/premium'} className="btn-ghost !text-xs !py-2">Manage Plan</button>
             ) : (
                <button onClick={() => window.location.href='/app/premium'} className="btn-primary !text-xs !py-2 !px-6 bg-gradient-to-r from-amber-500 to-orange-500">Go Premium</button>
             )}
          </div>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card">
          <h3 className="font-display font-semibold mb-4">Profile Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-xl bg-dark-800/50">
              <p className="text-2xl font-bold gradient-text">{user?.profileCompletion || 60}%</p>
              <p className="text-xs text-dark-500">Completion</p>
            </div>
            <div className="p-3 rounded-xl bg-dark-800/50">
              <p className="text-2xl font-bold text-green-400">{user?.trustScore || 0}</p>
              <p className="text-xs text-dark-500">Trust Score</p>
            </div>
            <div className="p-3 rounded-xl bg-dark-800/50">
              <p className="text-2xl font-bold text-secondary">0</p>
              <p className="text-xs text-dark-500">Total Matches</p>
            </div>
            <div className="p-3 rounded-xl bg-dark-800/50">
              <p className="text-2xl font-bold text-accent">0</p>
              <p className="text-xs text-dark-500">Messages Sent</p>
            </div>
          </div>
        </motion.div>

        {/* Personality Radar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card">
          <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" /> Personality Radar
          </h3>
          <div className="space-y-3">
            {radarData.map((d, i) => (
              <div key={d.trait} className="flex items-center gap-3">
                <span className="text-sm text-dark-400 w-20">{d.trait}</span>
                <div className="flex-1 h-2 rounded-full bg-dark-700 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${d.value}%` }}
                    transition={{ delay: 0.5 + i * 0.1, duration: 0.8 }}
                    className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                  />
                </div>
                <span className="text-sm font-medium w-10 text-right">{d.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Interests */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card">
          <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
            <Heart className="w-4 h-4 text-secondary" /> Interests
          </h3>
          <div className="flex flex-wrap gap-2">
            {isEditing ? (
              <input type="text" value={formData.interests} onChange={e => setFormData({...formData, interests: e.target.value})} placeholder="Travel, Photography, Gaming..." className="input-field" />
            ) : (
              <>
                {(user?.interests || []).map(i => (
                  <span key={i} className="badge-primary">{i}</span>
                ))}
                <button onClick={() => setIsEditing(true)} className="badge bg-dark-800 text-dark-400 border-dark-600 hover:border-primary/30 hover:text-primary-300 transition-all">
                  <Plus className="w-3 h-3" /> Add
                </button>
              </>
            )}
          </div>
        </motion.div>

        {/* Lifestyle */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="card">
          <h3 className="font-display font-semibold mb-4">Lifestyle</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'drinking', icon: Wine, label: 'Drinking', value: formData.lifestyle.drinking, options: ['never', 'socially', 'regularly'] },
              { id: 'workout', icon: Dumbbell, label: 'Workout', value: formData.lifestyle.workout, options: ['never', 'sometimes', 'often', 'daily'] },
              { id: 'diet', icon: Salad, label: 'Diet', value: formData.lifestyle.diet, options: ['omnivore', 'vegetarian', 'vegan', 'other'] },
              { id: 'pets', icon: Dog, label: 'Pets', value: formData.lifestyle.pets, options: ['dog', 'cat', 'both', 'none', 'other'] },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-2 p-3 rounded-xl bg-dark-800/50">
                <l.icon className="w-4 h-4 text-dark-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-dark-500">{l.label}</p>
                  {isEditing ? (
                    <select value={l.value} onChange={(e) => handleLifestyleChange(l.id, e.target.value)} className="bg-transparent text-sm font-medium w-full outline-none capitalize">
                      <option value="">Select...</option>
                      {l.options.map(opt => <option key={opt} value={opt} className="bg-dark-900">{opt}</option>)}
                    </select>
                  ) : (
                    <p className="text-sm font-medium capitalize truncate">{user?.lifestyle?.[l.id] || 'Not specified'}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Photo Gallery */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="md:col-span-2 card">
          <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
            <Camera className="w-4 h-4 text-accent" /> Photo Gallery
          </h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {(user?.photos || []).map((p, i) => (
              <div key={i} className="aspect-square rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-white/5 flex items-center justify-center overflow-hidden hover:border-primary/30 transition-colors cursor-pointer">
                <img src={p.url || p} alt="Gallery" className="w-full h-full object-cover" />
              </div>
            ))}
            <button className="aspect-square rounded-xl border-2 border-dashed border-dark-600 flex flex-col items-center justify-center text-dark-500 hover:border-primary/30 hover:text-primary-300 transition-all">
              <Plus className="w-6 h-6" />
              <span className="text-xs mt-1">Add</span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
