import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Bell, Shield, Eye, Globe, Moon, Sun, Trash2, LogOut, ChevronRight, Lock, Mail, User } from 'lucide-react';
import { useState } from 'react';

export default function Settings() {
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [toggles, setToggles] = useState({ visibility: true, receipts: true, online: true, matches: true, messages: true, likes: true });
  const toggle = (k) => setToggles(t => ({ ...t, [k]: !t[k] }));

  const Toggle = ({ k }) => (
    <button onClick={() => toggle(k)} className="relative w-11 h-6 rounded-full transition-colors" style={{ backgroundColor: toggles[k] ? '#7C3AED' : '#374151' }}>
      <motion.div animate={{ x: toggles[k] ? 22 : 2 }} className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm" />
    </button>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div><h1 className="text-2xl font-display font-bold">Settings</h1><p className="text-sm text-dark-400 mt-1">Manage your account preferences</p></div>

      <div className="card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {theme === 'dark' ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-amber-400" />}
            <div><p className="font-medium text-sm">Appearance</p><p className="text-xs text-dark-500">{theme} mode</p></div>
          </div>
          <button onClick={toggleTheme} className="relative w-14 h-7 rounded-full transition-colors" style={{ backgroundColor: theme === 'dark' ? '#374151' : '#7C3AED' }}>
            <motion.div animate={{ x: theme === 'dark' ? 2 : 28 }} className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-md" />
          </button>
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold text-sm text-dark-400 uppercase tracking-wider mb-4">Account</h3>
        {[{ icon: User, label: 'Edit Profile' }, { icon: Mail, label: 'Email' }, { icon: Lock, label: 'Password' }].map(i => (
          <div key={i.label} className="flex items-center justify-between py-3 px-2 rounded-xl hover:bg-white/5 cursor-pointer">
            <div className="flex items-center gap-3"><i.icon className="w-5 h-5 text-dark-400" /><span className="text-sm">{i.label}</span></div>
            <ChevronRight className="w-4 h-4 text-dark-500" />
          </div>
        ))}
      </div>

      <div className="card">
        <h3 className="font-semibold text-sm text-dark-400 uppercase tracking-wider mb-4">Privacy</h3>
        {[{ k: 'visibility', label: 'Profile Visibility', icon: Eye }, { k: 'receipts', label: 'Read Receipts', icon: Shield }, { k: 'online', label: 'Online Status', icon: Globe }].map(i => (
          <div key={i.k} className="flex items-center justify-between py-3 px-2">
            <div className="flex items-center gap-3"><i.icon className="w-5 h-5 text-dark-400" /><span className="text-sm">{i.label}</span></div>
            <Toggle k={i.k} />
          </div>
        ))}
      </div>

      <div className="card">
        <h3 className="font-semibold text-sm text-dark-400 uppercase tracking-wider mb-4">Notifications</h3>
        {['matches', 'messages', 'likes'].map(k => (
          <div key={k} className="flex items-center justify-between py-3 px-2">
            <div className="flex items-center gap-3"><Bell className="w-5 h-5 text-dark-400" /><span className="text-sm capitalize">{k}</span></div>
            <Toggle k={k} />
          </div>
        ))}
      </div>

      <div className="card border-red-500/10">
        <h3 className="font-semibold text-sm text-red-400 uppercase tracking-wider mb-4">Danger Zone</h3>
        <button onClick={logout} className="flex items-center gap-3 w-full px-2 py-3 rounded-xl text-red-400 hover:bg-red-500/10"><LogOut className="w-5 h-5" /><span className="text-sm">Log Out</span></button>
        <button className="flex items-center gap-3 w-full px-2 py-3 rounded-xl text-red-400 hover:bg-red-500/10"><Trash2 className="w-5 h-5" /><span className="text-sm">Delete Account</span></button>
      </div>
    </div>
  );
}
