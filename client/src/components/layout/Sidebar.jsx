import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useSocket } from '../../context/SocketContext';
import {
  LayoutDashboard, Compass, Heart, MessageCircle, User, Settings,
  Crown, Bell, Shield, Sun, Moon, LogOut, Sparkles, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../../lib/api';

const navItems = [
  { to: '/app', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/app/discover', icon: Compass, label: 'Discover' },
  { to: '/app/matches', icon: Heart, label: 'Matches' },
  { to: '/app/chat', icon: MessageCircle, label: 'Chat' },
  { to: '/app/profile', icon: User, label: 'Profile' },
  // Notifications handled separately
  { to: '/app/premium', icon: Crown, label: 'Premium' },
  { to: '/app/settings', icon: Settings, label: 'Settings' },
];

const adminItems = [
  { to: '/admin', icon: Shield, label: 'Admin Panel', end: true },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnreadCount();
  }, [user]);

  useEffect(() => {
    if (!socket) return;
    
    socket.on('new_notification', () => {
      fetchUnreadCount();
    });

    return () => socket.off('new_notification');
  }, [socket]);

  const fetchUnreadCount = async () => {
    if (!user) return;
    try {
      const { data } = await api.get('/notifications');
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Failed to fetch unread count');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <motion.aside
      initial={{ x: -280 }}
      animate={{ x: 0, width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="fixed left-0 top-0 h-screen z-40 flex flex-col glass border-r border-white/5"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-display font-bold text-lg gradient-text">
            ARLYON
          </motion.span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto p-1 rounded-lg hover:bg-white/5 text-dark-400 hover:text-white transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
              ${isActive ? 'bg-primary/10 text-primary-300 border border-primary/20' : 'text-dark-400 hover:bg-white/5 hover:text-white'}`
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
            {!collapsed && item.label === 'Premium' && !user?.isPremium && (
              <span className="ml-auto px-2 py-0.5 text-[10px] rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold">
                PRO
              </span>
            )}
          </NavLink>
        ))}

        {/* Notifications */}
        <NavLink
          to="/app/notifications"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
            ${isActive ? 'bg-primary/10 text-primary-300 border border-primary/20' : 'text-dark-400 hover:bg-white/5 hover:text-white'}`
          }
        >
          <div className="relative flex-shrink-0">
            <Bell className="w-5 h-5 flex-shrink-0" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-[10px] text-white font-bold flex items-center justify-center rounded-full ring-2 ring-dark-900 animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
          {!collapsed && <span>Notifications</span>}
        </NavLink>

        {user?.role === 'admin' && (
          <>
            <div className="my-3 border-t border-white/5" />
            {adminItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${isActive ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'text-dark-400 hover:bg-white/5 hover:text-white'}`
                }
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-white/5 space-y-2">
        <button onClick={toggleTheme} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-dark-400 hover:bg-white/5 hover:text-white transition-all">
          {theme === 'dark' ? <Sun className="w-5 h-5 flex-shrink-0" /> : <Moon className="w-5 h-5 flex-shrink-0" />}
          {!collapsed && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>

        <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-all">
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>

        {/* User avatar */}
        {!collapsed && user && (
          <div className="flex items-center gap-3 px-3 py-2 mt-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xs font-bold text-white">
              {user.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-dark-500 truncate">{user.email}</p>
            </div>
          </div>
        )}
      </div>
    </motion.aside>
  );
}
