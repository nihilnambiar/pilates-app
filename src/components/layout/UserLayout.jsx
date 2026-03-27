// src/components/layout/UserLayout.jsx
import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, LayoutDashboard, Calendar, Trophy, User, BookOpen } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../shared/Avatar';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';

const mobileNavItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { to: '/dashboard/book', icon: Calendar, label: 'Book' },
  { to: '/dashboard/attendance', icon: BookOpen, label: 'Progress' },
  { to: '/dashboard/leaderboard', icon: Trophy, label: 'Ranks' },
  { to: '/dashboard/profile', icon: User, label: 'Profile' },
];

export default function UserLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { userProfile } = useAuth();

  return (
    <div className="min-h-screen bg-[#fdf9f7] flex">
      <div className="hidden md:block flex-shrink-0">
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      </div>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />

      <motion.main
        animate={{ marginLeft: collapsed ? 72 : 240 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="flex-1 min-h-screen hidden md:block"
      >
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </motion.main>

      <div className="flex-1 min-h-screen md:hidden flex flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3 bg-white/90 backdrop-blur-xl border-b border-blush-50 flex-shrink-0">
          <button onClick={() => setMobileOpen(true)} className="p-2 rounded-xl hover:bg-blush-50 text-[#8a7b76]">
            <Menu size={20} />
          </button>
          <div className="flex-1">
            <span className="font-display text-lg font-semibold text-blush-700">Vigour</span>
          </div>
          <Avatar name={userProfile?.name} url={userProfile?.avatarUrl} size="sm" />
        </header>

        <div className="flex-1 p-4 pb-24 overflow-y-auto">
          <Outlet />
        </div>

        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-blush-50 flex">
          {mobileNavItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/dashboard'}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center gap-1 py-3 text-xs font-body font-medium transition-colors ${
                  isActive ? 'text-blush-600' : 'text-[#8a7b76]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={20} className={isActive ? 'text-blush-500' : ''} />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
