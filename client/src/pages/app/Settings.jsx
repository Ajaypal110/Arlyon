import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  Bell, Shield, Eye, Globe, Moon, Sun, 
  Trash2, LogOut, ChevronRight, Lock, 
  Mail, User as UserIcon, Loader2
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function Settings() {
  const navigate = useNavigate();
  const { user: currentUser, logout, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  const [toggles, setToggles] = useState({
    profileVisibility: true,
    readReceipts: true,
    onlineStatus: true,
    matches: true,
    messages: true,
    likes: true
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentUser?.settings) {
      setToggles({
        ...currentUser.settings.privacy,
        ...currentUser.settings.notifications
      });
    }
  }, [currentUser]);

  const handleToggle = async (category, setting) => {
    const newValue = !toggles[setting];
    
    // Optimistic update
    setToggles(prev => ({ ...prev, [setting]: newValue }));

    try {
      const { data } = await api.put('/users/settings', { category, setting, value: newValue });
      updateUser(data.user);
    } catch (error) {
      toast.error('Failed to update setting');
      // Rollback
      setToggles(prev => ({ ...prev, [setting]: !newValue }));
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to deactivate your account? This action can be reversed by logging in again (if reactivation is implemented) or contacting support.')) {
      try {
        setIsLoading(true);
        await api.delete('/users/account');
        toast.success('Account deactivated');
        logout();
        navigate('/login');
      } catch (error) {
        toast.error('Failed to deactivate account');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const Toggle = ({ category, setting }) => (
    <button 
      onClick={() => handleToggle(category, setting)} 
      className="relative w-11 h-6 rounded-full transition-colors" 
      style={{ backgroundColor: toggles[setting] ? '#7C3AED' : '#374151' }}
    >
      <motion.div 
        animate={{ x: toggles[setting] ? 22 : 2 }} 
        className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm" 
      />
    </button>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20 px-4 md:px-0">
      <div className="pt-4 md:pt-0">
        <h1 className="text-2xl md:text-3xl font-display font-bold">Settings</h1>
        <p className="text-sm text-dark-400 mt-1">Manage your account preferences</p>
      </div>

      {/* Appearance */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {theme === 'dark' ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-amber-400" />}
            <div>
              <p className="font-medium text-sm">Appearance</p>
              <p className="text-xs text-dark-500">{theme.charAt(0).toUpperCase() + theme.slice(1)} mode</p>
            </div>
          </div>
          <button onClick={toggleTheme} className="relative w-14 h-7 rounded-full transition-colors" style={{ backgroundColor: theme === 'dark' ? '#374151' : '#7C3AED' }}>
            <motion.div animate={{ x: theme === 'dark' ? 2 : 28 }} className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-md" />
          </button>
        </div>
      </div>

      {/* Account */}
      <div className="card">
        <h3 className="font-semibold text-sm text-dark-400 uppercase tracking-wider mb-4">Account</h3>
        <div onClick={() => navigate('/app/profile/edit')} className="flex items-center justify-between py-3.5 px-2 rounded-xl hover:bg-white/5 cursor-pointer active:bg-white/10 transition-colors">
          <div className="flex items-center gap-3"><UserIcon className="w-5 h-5 text-dark-400" /><span className="text-sm font-medium text-dark-100">Edit Profile</span></div>
          <ChevronRight className="w-4 h-4 text-dark-500" />
        </div>
        <div className="flex items-center justify-between py-3.5 px-2 rounded-xl text-dark-600 cursor-not-allowed opacity-50">
          <div className="flex items-center gap-3"><Mail className="w-5 h-5 text-dark-400" /><span className="text-sm font-medium">Email ({currentUser?.email})</span></div>
          <Lock className="w-3.5 h-3.5" />
        </div>
        <div className="flex items-center justify-between py-3.5 px-2 rounded-xl text-dark-600 cursor-not-allowed opacity-50">
          <div className="flex items-center gap-3"><Lock className="w-5 h-5 text-dark-400" /><span className="text-sm font-medium">Change Password</span></div>
          <Lock className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Privacy */}
      <div className="card">
        <h3 className="font-semibold text-sm text-dark-400 uppercase tracking-wider mb-4">Privacy</h3>
        <div className="flex items-center justify-between py-3.5 px-2">
          <div className="flex items-center gap-3"><Eye className="w-5 h-5 text-dark-400" /><span className="text-sm font-medium text-dark-100">Profile Visibility</span></div>
          <Toggle category="privacy" setting="profileVisibility" />
        </div>
        <div className="flex items-center justify-between py-3.5 px-2">
          <div className="flex items-center gap-3"><Shield className="w-5 h-5 text-dark-400" /><span className="text-sm font-medium text-dark-100">Read Receipts</span></div>
          <Toggle category="privacy" setting="readReceipts" />
        </div>
        <div className="flex items-center justify-between py-3.5 px-2">
          <div className="flex items-center gap-3"><Globe className="w-5 h-5 text-dark-400" /><span className="text-sm font-medium text-dark-100">Online Status</span></div>
          <Toggle category="privacy" setting="onlineStatus" />
        </div>
      </div>

      {/* Notifications */}
      <div className="card">
        <h3 className="font-semibold text-sm text-dark-400 uppercase tracking-wider mb-4">Notifications</h3>
        <div className="flex items-center justify-between py-3.5 px-2">
          <div className="flex items-center gap-3"><Bell className="w-5 h-5 text-dark-400" /><span className="text-sm font-medium text-dark-100">New Matches</span></div>
          <Toggle category="notifications" setting="matches" />
        </div>
        <div className="flex items-center justify-between py-3.5 px-2">
          <div className="flex items-center gap-3"><Bell className="w-5 h-5 text-dark-400" /><span className="text-sm font-medium text-dark-100">New Messages</span></div>
          <Toggle category="notifications" setting="messages" />
        </div>
        <div className="flex items-center justify-between py-3.5 px-2">
          <div className="flex items-center gap-3"><Bell className="w-5 h-5 text-dark-400" /><span className="text-sm font-medium text-dark-100">Likes & Super Likes</span></div>
          <Toggle category="notifications" setting="likes" />
        </div>
      </div>

      {/* Danger Zone */}
      <div className="card border-red-500/10">
        <h3 className="font-semibold text-sm text-red-400 uppercase tracking-wider mb-4">Danger Zone</h3>
        <button onClick={logout} className="flex items-center gap-4 w-full px-3 py-4 rounded-2xl text-red-400 hover:bg-red-500/10 active:bg-red-500/20 transition-all font-semibold">
          <LogOut className="w-5 h-5" />
          <span className="text-sm">Log Out</span>
        </button>
        <button 
          onClick={handleDeleteAccount} 
          disabled={isLoading}
          className="flex items-center gap-4 w-full px-3 py-4 rounded-2xl text-red-400 hover:bg-red-500/10 active:bg-red-500/20 transition-all disabled:opacity-50 font-semibold mt-2"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
          <span className="text-sm text-left">Deactivate Account</span>
        </button>
      </div>
    </div>
  );
}
