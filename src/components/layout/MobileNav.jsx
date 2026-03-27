// src/components/layout/MobileNav.jsx
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink, useNavigate } from 'react-router-dom';
import { X, LayoutDashboard, Calendar, Trophy, User, BookOpen, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { logoutUser } from '../../services/authService';
import Avatar from '../shared/Avatar';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/dashboard/book', icon: Calendar, label: 'Book a Class' },
  { to: '/dashboard/attendance', icon: BookOpen, label: 'My Attendance' },
  { to: '/dashboard/leaderboard', icon: Trophy, label: 'Leaderboard' },
  { to: '/dashboard/profile', icon: User, label: 'Profile' },
];

export default function MobileNav({ open, onClose }) {
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/login');
    } catch {
      toast.error('Logout failed');
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            className="fixed left-0 top-0 h-full w-64 bg-white z-50 flex flex-col shadow-2xl md:hidden"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-blush-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blush-300 to-blush-500 flex items-center justify-center">
                  <span className="font-display text-white text-sm font-semibold">S</span>
                </div>
                <span className="font-display text-lg font-semibold text-blush-700">Vigour</span>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-blush-50 text-[#8a7b76]">
                <X size={18} />
              </button>
            </div>

            {/* User info */}
            <div className="flex items-center gap-3 px-5 py-4 bg-blush-50/50">
              <Avatar name={userProfile?.name} url={userProfile?.avatarUrl} size="md" />
              <div>
                <p className="font-body font-medium text-sm text-[#2d2420]">{userProfile?.name}</p>
                <p className="font-body text-xs text-[#8a7b76]">{userProfile?.membershipPlan} Member</p>
              </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {navItems.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/dashboard'}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `nav-item ${isActive ? 'active' : ''}`
                  }
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </NavLink>
              ))}
            </nav>

            {/* Logout */}
            <div className="p-3 border-t border-blush-50">
              <button
                onClick={handleLogout}
                className="nav-item w-full text-red-400 hover:text-red-500 hover:bg-red-50"
              >
                <LogOut size={18} />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
