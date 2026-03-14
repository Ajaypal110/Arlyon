import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { ChevronRight, ChevronLeft, Sparkles, User, Heart, MapPin, Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/api';

const allInterests = ['Travel', 'Music', 'Fitness', 'Cooking', 'Photography', 'Art', 'Reading', 'Gaming', 'Movies', 'Dancing', 'Hiking', 'Yoga', 'Technology', 'Fashion', 'Foodie', 'Sports', 'Nature', 'Meditation', 'Writing', 'Comedy'];

const steps = ['Basics', 'Interests', 'Preferences', 'Photos'];

export default function Onboarding() {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', dateOfBirth: '', gender: '', bio: '',
    interests: [], genderPreference: 'everyone', lookingFor: '',
    location: { city: '', country: '' },
    avatar: '',
  });

  const next = () => { if (step < steps.length - 1) setStep(step + 1); };
  const prev = () => { if (step > 0) setStep(step - 1); };

  const toggleInterest = (interest) => {
    setForm(f => ({
      ...f,
      interests: f.interests.includes(interest)
        ? f.interests.filter(i => i !== interest)
        : f.interests.length < 8 ? [...f.interests, interest] : f.interests,
    }));
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/users/onboarding', form);
      
      if (form.avatar) {
        await api.post('/users/avatar', { avatar: form.avatar });
      }

      updateUser({ ...data.user, avatar: form.avatar || data.user.avatar });
      toast.success('Profile set up! 🎉');
      navigate('/app');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      return toast.error('Image must be less than 5MB');
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm({ ...form, avatar: reader.result });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/15 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-secondary/15 rounded-full blur-[80px]" />

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg relative z-10">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-xl gradient-text">ARLYON</span>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s} className="flex-1">
              <div className={`h-1.5 rounded-full transition-all duration-500 ${i <= step ? 'bg-gradient-to-r from-primary to-secondary' : 'bg-dark-700'}`} />
              <p className={`text-xs mt-2 ${i <= step ? 'text-primary-300' : 'text-dark-600'}`}>{s}</p>
            </div>
          ))}
        </div>

        <div className="card">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              {step === 0 && (
                <div className="space-y-5">
                  <h3 className="text-xl font-display font-bold flex items-center gap-2"><User className="w-5 h-5 text-primary" /> Basic Info</h3>
                  <div><label className="block text-sm font-medium text-dark-300 mb-2">Name</label><input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="input-field" placeholder="Your name" /></div>
                  <div><label className="block text-sm font-medium text-dark-300 mb-2">Date of Birth</label><input type="date" value={form.dateOfBirth} onChange={(e) => setForm({...form, dateOfBirth: e.target.value})} className="input-field" /></div>
                  <div><label className="block text-sm font-medium text-dark-300 mb-2">Gender</label>
                    <div className="grid grid-cols-3 gap-3">
                      {['male', 'female', 'non-binary'].map(g => (
                        <button key={g} onClick={() => setForm({...form, gender: g})} className={`py-2.5 rounded-xl text-sm font-medium transition-all ${form.gender === g ? 'bg-primary/20 text-primary-300 border border-primary/30' : 'bg-dark-800 text-dark-400 border border-dark-700 hover:border-dark-500'}`}>
                          {g.charAt(0).toUpperCase() + g.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div><label className="block text-sm font-medium text-dark-300 mb-2">Bio</label><textarea value={form.bio} onChange={(e) => setForm({...form, bio: e.target.value})} className="input-field h-24 resize-none" placeholder="Tell us about yourself..." maxLength={500} /><p className="text-xs text-dark-600 mt-1">{form.bio.length}/500</p></div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-5">
                  <h3 className="text-xl font-display font-bold flex items-center gap-2"><Heart className="w-5 h-5 text-secondary" /> Your Interests</h3>
                  <p className="text-sm text-dark-400">Pick up to 8 interests that define you</p>
                  <div className="flex flex-wrap gap-2">
                    {allInterests.map(i => (
                      <button key={i} onClick={() => toggleInterest(i)} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${form.interests.includes(i) ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/20' : 'bg-dark-800 text-dark-400 border border-dark-700 hover:border-dark-500'}`}>
                        {i}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-dark-500">{form.interests.length}/8 selected</p>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5">
                  <h3 className="text-xl font-display font-bold flex items-center gap-2"><MapPin className="w-5 h-5 text-accent" /> Preferences</h3>
                  <div><label className="block text-sm font-medium text-dark-300 mb-2">I'm interested in</label>
                    <div className="grid grid-cols-3 gap-3">
                      {['male', 'female', 'everyone'].map(g => (
                        <button key={g} onClick={() => setForm({...form, genderPreference: g})} className={`py-2.5 rounded-xl text-sm font-medium transition-all ${form.genderPreference === g ? 'bg-primary/20 text-primary-300 border border-primary/30' : 'bg-dark-800 text-dark-400 border border-dark-700'}`}>
                          {g.charAt(0).toUpperCase() + g.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div><label className="block text-sm font-medium text-dark-300 mb-2">Looking for</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['relationship', 'casual', 'friendship', 'marriage'].map(l => (
                        <button key={l} onClick={() => setForm({...form, lookingFor: l})} className={`py-2.5 rounded-xl text-sm font-medium transition-all ${form.lookingFor === l ? 'bg-primary/20 text-primary-300 border border-primary/30' : 'bg-dark-800 text-dark-400 border border-dark-700'}`}>
                          {l.charAt(0).toUpperCase() + l.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div><label className="block text-sm font-medium text-dark-300 mb-2">City</label><input type="text" value={form.location.city} onChange={(e) => setForm({...form, location: {...form.location, city: e.target.value}})} className="input-field" placeholder="Mumbai" /></div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5">
                  <h3 className="text-xl font-display font-bold flex items-center gap-2"><Camera className="w-5 h-5 text-primary" /> Profile Photo</h3>
                  <p className="text-sm text-dark-400">Add a photo to complete your profile. You can always add more later!</p>
                  
                  <input 
                    type="file" 
                    id="avatar-upload" 
                    className="hidden" 
                    accept="image/jpeg, image/png, image/webp"
                    onChange={handleImageUpload}
                  />
                  
                  <label htmlFor="avatar-upload" className="block border-2 border-dashed border-dark-600 rounded-2xl p-1 relative overflow-hidden text-center hover:border-primary/30 transition-colors cursor-pointer group">
                    {form.avatar ? (
                      <div className="relative aspect-square w-full max-w-[200px] mx-auto rounded-xl overflow-hidden">
                        <img src={form.avatar} alt="Profile preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <p className="text-white text-sm font-medium">Change Photo</p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-11">
                        <Camera className="w-12 h-12 text-dark-500 mx-auto mb-3 group-hover:text-primary transition-colors" />
                        <p className="text-dark-400 text-sm">Click to upload a photo</p>
                        <p className="text-dark-600 text-xs mt-1">JPG, PNG up to 5MB</p>
                      </div>
                    )}
                  </label>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-dark-700">
            <button onClick={prev} disabled={step === 0} className="btn-ghost flex items-center gap-1 disabled:opacity-30">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            {step < steps.length - 1 ? (
              <button onClick={next} className="btn-primary flex items-center gap-1">
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={handleComplete} disabled={loading} className="btn-primary flex items-center gap-1">
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Complete <Sparkles className="w-4 h-4" /></>}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
