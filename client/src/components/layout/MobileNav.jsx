import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Compass, Heart, MessageCircle, User } from 'lucide-react';

const mobileNavItems = [
  { to: '/app', icon: LayoutDashboard, label: 'Home', end: true },
  { to: '/app/discover', icon: Compass, label: 'Discover' },
  { to: '/app/matches', icon: Heart, label: 'Matches' },
  { to: '/app/chat', icon: MessageCircle, label: 'Chat' },
  { to: '/app/profile', icon: User, label: 'Profile' },
];

export default function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-dark-900/95 backdrop-blur-xl border-t border-white/10"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center justify-around h-16">
        {mobileNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-all duration-200 relative ${
                isActive
                  ? 'text-primary'
                  : 'text-dark-500 active:text-dark-300'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-gradient-to-r from-primary to-secondary" />
                )}
                <item.icon className={`w-5 h-5 ${isActive ? 'drop-shadow-[0_0_8px_rgba(124,58,237,0.5)]' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
