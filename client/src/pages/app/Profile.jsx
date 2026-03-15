import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Camera, Shield, Crown, MapPin, 
  Edit3, Save, Plus, Sparkles, Heart, Wine, 
  Dumbbell, Salad, Dog 
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
  const { user: currentUser, updateUser } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const isOwnProfile = !id || id === currentUser?._id;
  
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    age: '',
    city: '',
    interests: '',
    lifestyle: {
      drinking: '',
      workout: '',
      diet: '',
      pets: '',
    }
  });

  useEffect(() => {
    if (isOwnProfile) {
      if (currentUser) {
        setProfileUser(currentUser);
        syncFormData(currentUser);
        setIsLoading(false);
      }
    } else {
      fetchUserProfile();
    }
  }, [id, currentUser, isOwnProfile]);

  const syncFormData = (u) => {
    if (!u) return;
    setFormData({
      name: u.name || '',
      bio: u.bio || '',
      age: u.age || '',
      city: u.location?.city || '',
      interests: (u.interests || []).join(', '),
      lifestyle: {
        drinking: u.lifestyle?.drinking || '',
        workout: u.lifestyle?.workout || '',
        diet: u.lifestyle?.diet || '',
        pets: u.lifestyle?.pets || '',
      }
    });
  };

  const fetchUserProfile = async () => {
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

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const updatePayload = {
        name: formData.name,
        bio: formData.bio,
        age: Number(formData.age),
        location: { ...currentUser?.location, city: formData.city },
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
      setIsSaving(false);
    }
  };

  const handleLifestyleChange = (field, value) => {
    setFormData(prev => ({ ...prev, lifestyle: { ...prev.lifestyle, [field]: value } }));
  };

  if (isLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const displayUser = profileUser || currentUser;

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-2 md:px-0">
      {/* Hero Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card overflow-hidden relative">
        {/* Banner */}
        <div className="h-24 md:h-32 bg-gradient-to-r from-primary/30 via-secondary/20 to-accent/30 -mx-6 -mt-6 mb-4" />

        <div className="flex flex-col md:flex-row gap-6 items-start -mt-16 relative z-10 px-2">
          <div className="relative group">
            <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-primary via-secondary to-accent p-[3px]">
              <div className="w-full h-full rounded-2xl bg-card flex items-center justify-center text-5xl overflow-hidden">
                {displayUser?.avatar ? (
                  (displayUser.avatar.startsWith('http') || displayUser.avatar.startsWith('data:')) ? (
                    <img src={displayUser.avatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    displayUser.avatar
                  )
                ) : (
                  '😊'
                )}
              </div>
            </div>
            {isOwnProfile && (
              <button className="absolute bottom-1 right-1 w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-4 h-4" />
              </button>
            )}
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
                  <h1 className="text-xl md:text-2xl font-display font-bold">{displayUser?.name || 'Your Name'}</h1>
                  {displayUser?.isPhotoVerified && (
                    <span className="badge bg-blue-500/15 text-blue-400 border-blue-500/20">
                      <Shield className="w-3 h-3" /> Verified
                    </span>
                  )}
                  {displayUser?.isPremium && (
                    <span className="badge bg-amber-500/15 text-amber-400 border-amber-500/20 font-bold">
                      <Crown className="w-3 h-3" /> {displayUser.premiumTier?.toUpperCase() || 'PREMIUM'}
                    </span>
                  )}
                </div>
                <p className="text-dark-400 text-sm flex items-center gap-1">
                  {displayUser?.age || 25} years old
                  {displayUser?.location?.city && <><span className="mx-1">•</span><MapPin className="w-3 h-3" />{displayUser.location.city}</>}
                </p>
                <p className="text-dark-300 text-sm mt-2 max-w-lg">{displayUser?.bio || (isOwnProfile ? 'Add a bio to tell people about yourself' : '')}</p>
              </>
            )}
          </div>

          <div className="flex flex-col gap-2 min-w-[140px]">
            {isOwnProfile ? (
              isEditing ? (
                <>
                  <button onClick={handleSave} disabled={isSaving} className="btn-primary !py-2 !px-4 text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
                    <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save Changes'}
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
                  {!displayUser?.isPremium && (
                    <button onClick={() => navigate('/app/premium')} className="w-full py-2 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[11px] font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-amber-500/30 transition-all">
                      <Crown className="w-3.5 h-3.5" /> UPGRADE
                    </button>
                  )}
                </>
              )
            ) : (
              <button onClick={() => navigate(-1)} className="btn-secondary !py-2 !px-4 text-sm flex items-center justify-center gap-2 backdrop-blur-md">
                <ArrowLeft className="w-4 h-4" /> Go Back
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Subscription Status Card - Only shown on own profile */}
      {isOwnProfile && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card !bg-dark-900/50 border-amber-500/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-500" /> Subscription Status
            </h3>
            {displayUser?.isPremium ? (
               <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest bg-green-400/10 px-2 py-0.5 rounded-full border border-green-400/20">Active</span>
            ) : (
               <span className="text-[10px] font-bold text-dark-500 uppercase tracking-widest bg-dark-800 px-2 py-0.5 rounded-full">Free Plan</span>
            )}
          </div>
          
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="flex-1 space-y-1">
              <p className="text-sm text-dark-300">
                {displayUser?.isPremium ? (
                  <>You are currently on the <span className="text-amber-500 font-bold">{displayUser.premiumTier?.toUpperCase()}</span> plan.</>
                ) : (
                  <>Upgrade to Gold or Platinum to see who likes you and get unlimited swipes!</>
                )}
              </p>
              {displayUser?.premiumExpiry && (
                <p className="text-xs text-dark-500">Renews/Expires on: {new Date(displayUser.premiumExpiry).toLocaleDateString()}</p>
              )}
            </div>
            <div className="flex items-center gap-3">
               {displayUser?.isPremium ? (
                  <button onClick={() => navigate('/app/premium')} className="btn-ghost !text-xs !py-2">Manage Plan</button>
               ) : (
                  <button onClick={() => navigate('/app/premium')} className="btn-primary !text-xs !py-2 !px-6 bg-gradient-to-r from-amber-500 to-orange-500">Go Premium</button>
               )}
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card">
          <h3 className="font-display font-semibold mb-4">{isOwnProfile ? 'Profile Stats' : 'Stats'}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-xl bg-dark-800/50">
              <p className="text-2xl font-bold gradient-text">{displayUser?.profileCompletion || 0}%</p>
              <p className="text-xs text-dark-500">Completion</p>
            </div>
            <div className="p-3 rounded-xl bg-dark-800/50">
              <p className="text-2xl font-bold text-green-400">{displayUser?.trustScore || 0}</p>
              <p className="text-xs text-dark-500">Trust Score</p>
            </div>
            {isOwnProfile && (
              <>
                <div className="p-3 rounded-xl bg-dark-800/50">
                  <p className="text-2xl font-bold text-secondary">{displayUser?.matchesCount || 0}</p>
                  <p className="text-xs text-dark-500">Total Matches</p>
                </div>
                <div className="p-3 rounded-xl bg-dark-800/50">
                  <p className="text-2xl font-bold text-accent">{displayUser?.messagesCount || 0}</p>
                  <p className="text-xs text-dark-500">Messages Sent</p>
                </div>
              </>
            )}
          </div>
        </motion.div>

        {/* Personality Radar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card">
          <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" /> Personality Radar
          </h3>
          <div className="space-y-3">
            {radarData.map((d, i) => {
              const value = displayUser?.personalityTraits?.[d.key] || d.defaultValue;
              return (
                <div key={d.trait} className="flex items-center gap-3">
                  <span className="text-sm text-dark-400 w-24">{d.trait}</span>
                  <div className="flex-1 h-2 rounded-full bg-dark-700 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${value}%` }}
                      transition={{ delay: 0.5 + i * 0.1, duration: 0.8 }}
                      className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                    />
                  </div>
                  <span className="text-sm font-medium w-10 text-right">{value}%</span>
                </div>
              );
            })}
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
                {(displayUser?.interests || []).map(i => (
                  <span key={i} className="badge-primary">{i}</span>
                ))}
                {isOwnProfile && (
                  <button onClick={() => setIsEditing(true)} className="badge bg-dark-800 text-dark-400 border-dark-600 hover:border-primary/30 hover:text-primary-300 transition-all">
                    <Plus className="w-3 h-3" /> Add
                  </button>
                )}
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
                    <p className="text-sm font-medium capitalize truncate">{displayUser?.lifestyle?.[l.id] || 'Not specified'}</p>
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 md:gap-3">
            {(displayUser?.photos || []).map((p, i) => (
              <div key={i} className="aspect-square rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-white/5 flex items-center justify-center overflow-hidden hover:border-primary/30 transition-colors cursor-pointer">
                <img src={p.url || p} alt="Gallery" className="w-full h-full object-cover" />
              </div>
            ))}
            {isOwnProfile && (
              <button className="aspect-square rounded-xl border-2 border-dashed border-dark-600 flex flex-col items-center justify-center text-dark-500 hover:border-primary/30 hover:text-primary-300 transition-all">
                <Plus className="w-6 h-6" />
                <span className="text-xs mt-1">Add</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
