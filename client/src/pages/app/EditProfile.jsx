import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Camera, Plus, X, Loader2, Save, ArrowLeft, 
  User, Briefcase, GraduationCap, MapPin, 
  Calendar, Heart, Sparkles, Languages
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function EditProfile() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const avatarInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    age: user?.age || '',
    gender: user?.gender || '',
    genderPreference: user?.genderPreference || 'everyone',
    lookingFor: user?.lookingFor || '',
    interests: user?.interests?.join(', ') || '',
    lifestyle: user?.lifestyle || {
      drinking: '',
      smoking: '',
      workout: '',
      diet: '',
      pets: ''
    }
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      return toast.error('Image must be less than 5MB');
    }

    try {
      setIsUploadingAvatar(true);
      const reader = new FileReader();
      const uploadPromise = new Promise((resolve, reject) => {
        reader.onloadend = async () => {
          try {
            const { data } = await api.post('/users/avatar', { avatar: reader.result });
            updateUser(data.user);
            resolve();
          } catch (err) {
            reject(err);
          }
        };
        reader.readAsDataURL(file);
      });

      await toast.promise(uploadPromise, {
        loading: 'Uploading avatar...',
        success: 'Avatar updated!',
        error: 'Upload failed'
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleGalleryUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsUploadingGallery(true);
      const reader = new FileReader();
      const uploadPromise = new Promise((resolve, reject) => {
        reader.onloadend = async () => {
          try {
            const { data } = await api.post('/users/photos', { photo: reader.result });
            updateUser(data.user);
            resolve();
          } catch (err) {
            reject(err);
          }
        };
        reader.readAsDataURL(file);
      });

      await toast.promise(uploadPromise, {
        loading: 'Adding photo...',
        success: 'Photo added!',
        error: 'Upload failed'
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploadingGallery(false);
    }
  };

  const removePhoto = async (publicId) => {
    try {
      const { data } = await api.delete('/users/photos', { 
        params: { publicId } 
      });
      updateUser(data.user);
      toast.success('Photo removed');
    } catch (err) {
      toast.error('Failed to remove photo');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const payload = {
        ...formData,
        age: Number(formData.age),
        interests: formData.interests.split(',').map(i => i.trim()).filter(Boolean)
      };

      const { data } = await api.put('/users/profile', payload);
      updateUser(data.user);
      toast.success('Profile updated successfully!');
      navigate('/app/profile');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-white/5 text-dark-400">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-display font-bold">Edit Profile</h1>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="btn btn-primary flex items-center gap-2"
        >
          {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Col: Media */}
        <div className="space-y-6">
          {/* Avatar Area */}
          <div className="card text-center">
            <div className="relative inline-block mx-auto mb-4 group">
              <div className="w-40 h-40 rounded-3xl overflow-hidden border-4 border-dark-700 bg-dark-800">
                <img 
                  src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=7C3AED&color=fff`} 
                  alt={user?.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <button 
                onClick={() => avatarInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-3xl"
              >
                {isUploadingAvatar ? <Loader2 className="w-8 h-8 animate-spin text-white" /> : <Camera className="w-8 h-8 text-white" />}
              </button>
              <input 
                type="file" 
                ref={avatarInputRef} 
                onChange={handleAvatarUpload} 
                className="hidden" 
                accept="image/*" 
              />
            </div>
            <p className="text-xs text-dark-500">Click to change profile picture</p>
          </div>

          {/* Gallery Area */}
          <div className="card">
            <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" /> Photo Gallery
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {user?.photos?.map((photo) => (
                <div key={photo.publicId} className="relative aspect-square rounded-xl overflow-hidden group">
                  <img src={photo.url} alt="Gallery" className="w-full h-full object-cover" />
                  <button 
                    onClick={() => removePhoto(photo.publicId)}
                    className="absolute top-1 right-1 p-1.5 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <div className="relative">
                <button 
                  onClick={() => galleryInputRef.current?.click()}
                  disabled={isUploadingGallery}
                  className="w-full h-full aspect-square rounded-xl border-2 border-dashed border-dark-700 flex flex-col items-center justify-center text-dark-500 hover:border-primary/50 hover:text-primary transition-all"
                >
                  {isUploadingGallery ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-6 h-6" />}
                  <span className="text-[10px] mt-1 font-medium">Add Photo</span>
                </button>
                <input 
                  type="file" 
                  ref={galleryInputRef} 
                  onChange={handleGalleryUpload} 
                  className="hidden" 
                  accept="image/*" 
                />
              </div>
            </div>
            <p className="text-[10px] text-dark-500 mt-3 italic text-center">Add up to 6 high-quality photos to stand out.</p>
          </div>
        </div>

        {/* Right Col: Form */}
        <div className="md:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="card space-y-4">
            <h3 className="font-semibold text-sm text-dark-400 uppercase tracking-wider">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-dark-400 px-1">Display Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                  <input 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-dark-800 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-dark-400 px-1">Age</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                  <input 
                    name="age"
                    type="number"
                    value={formData.age}
                    onChange={handleChange}
                    className="w-full bg-dark-800 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-dark-400 px-1">Bio</label>
              <textarea 
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell them something interesting about yourself..."
                rows={4}
                className="w-full bg-dark-800 border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary/50 transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-dark-400 px-1">Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className="w-full bg-dark-800 border-none rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary/50">
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non-binary">Non-binary</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-dark-400 px-1">Show Me</label>
                <select name="genderPreference" value={formData.genderPreference} onChange={handleChange} className="w-full bg-dark-800 border-none rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary/50">
                  <option value="everyone">Everyone</option>
                  <option value="male">Men</option>
                  <option value="female">Women</option>
                </select>
              </div>
            </div>
          </div>

          {/* Lifestyle */}
          <div className="card space-y-4">
            <h3 className="font-semibold text-sm text-dark-400 uppercase tracking-wider">Lifestyle</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-dark-400 px-1">Drinking</label>
                <select name="lifestyle.drinking" value={formData.lifestyle.drinking} onChange={handleChange} className="w-full bg-dark-800 border-none rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary/50">
                  <option value="">Choose...</option>
                  <option value="never">Never</option>
                  <option value="socially">Socially</option>
                  <option value="regularly">Regularly</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-dark-400 px-1">Smoking</label>
                <select name="lifestyle.smoking" value={formData.lifestyle.smoking} onChange={handleChange} className="w-full bg-dark-800 border-none rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary/50">
                  <option value="">Choose...</option>
                  <option value="never">Never</option>
                  <option value="socially">Socially</option>
                  <option value="regularly">Regularly</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-dark-400 px-1">Workout</label>
                <select name="lifestyle.workout" value={formData.lifestyle.workout} onChange={handleChange} className="w-full bg-dark-800 border-none rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary/50">
                  <option value="">Choose...</option>
                  <option value="never">Never</option>
                  <option value="sometimes">Sometimes</option>
                  <option value="often">Often</option>
                  <option value="daily">Daily</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-dark-400 px-1">Pets</label>
                <select name="lifestyle.pets" value={formData.lifestyle.pets} onChange={handleChange} className="w-full bg-dark-800 border-none rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary/50">
                  <option value="">Choose...</option>
                  <option value="dog">Dog(s)</option>
                  <option value="cat">Cat(s)</option>
                  <option value="both">Both</option>
                  <option value="none">No pets</option>
                </select>
              </div>
            </div>
          </div>

          {/* Interests */}
          <div className="card space-y-4">
            <h3 className="font-semibold text-sm text-dark-400 uppercase tracking-wider">Interests</h3>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-dark-400 px-1">Tags (comma separated)</label>
              <input 
                name="interests"
                value={formData.interests}
                onChange={handleChange}
                placeholder="Travel, Painting, Music, Fitness..."
                className="w-full bg-dark-800 border-none rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.interests.split(',').map((it, idx) => it.trim() && (
                <span key={idx} className="px-3 py-1 bg-primary/10 text-primary-300 text-xs rounded-full border border-primary/20">
                  {it.trim()}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
