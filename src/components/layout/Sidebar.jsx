// src/components/layout/Sidebar.jsx
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Calendar, Trophy, User, LogOut,
  ChevronLeft, Menu, Bell, Settings, BookOpen
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { logoutUser } from '../../services/authService';
import Avatar from '../shared/Avatar';
import toast from 'react-hot-toast';
import { useState } from 'react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/dashboard/book', icon: Calendar, label: 'Book a Class' },
  { to: '/dashboard/attendance', icon: BookOpen, label: 'My Attendance' },
  { to: '/dashboard/leaderboard', icon: Trophy, label: 'Leaderboard' },
  { to: '/dashboard/profile', icon: User, label: 'Profile' },
];

export default function Sidebar({ collapsed, setCollapsed }) {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logoutUser();
      navigate('/login');
    } catch {
      toast.error('Logout failed');
      setLoggingOut(false);
    }
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed left-0 top-0 h-full z-40 flex flex-col bg-white/90 backdrop-blur-xl border-r border-blush-50 shadow-card overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-6 border-b border-blush-50 flex-shrink-0">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blush-300 to-blush-500 flex items-center justify-center shadow-glow flex-shrink-0">
          <span className="font-display text-white text-base font-semibold">S</span>
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <h1 className="font-display text-lg font-semibold text-blush-700 leading-none">Vigour</h1>
              <p className="font-body text-[10px] text-[#8a7b76] tracking-widest uppercase mt-0.5">Pilates Studio</p>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto p-1.5 rounded-lg hover:bg-blush-50 text-[#8a7b76] hover:text-blush-600 transition-colors flex-shrink-0"
        >
          <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.3 }}>
            <ChevronLeft size={16} />
          </motion.div>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto no-scrollbar">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/dashboard'}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-2' : ''}`
            }
          >
            <Icon size={18} className="flex-shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="text-sm"
                >
                  {label}
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="border-t border-blush-50 p-3 flex-shrink-0">
        <div className={`flex items-center gap-3 p-2 rounded-2xl hover:bg-blush-50 transition-colors ${collapsed ? 'justify-center' : ''}`}>
          <Avatar name={userProfile?.name} url={userProfile?.avatarUrl} size="sm" />
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 min-w-0"
              >
                <p className="font-body text-sm font-medium text-[#2d2420] truncate">{userProfile?.name}</p>
                <p className="font-body text-xs text-[#8a7b76] truncate">{userProfile?.membershipPlan} Member</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className={`nav-item w-full mt-1 text-red-400 hover:text-red-500 hover:bg-red-50 ${collapsed ? 'justify-center px-2' : ''}`}
        >
          <LogOut size={18} className="flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm"
              >
                {loggingOut ? 'Signing out...' : 'Sign Out'}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}
