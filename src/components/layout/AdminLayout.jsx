// src/components/layout/AdminLayout.jsx
import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, Calendar, ClipboardList,
  Megaphone, BarChart2, ChevronLeft, LogOut, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { logoutUser } from '../../services/authService';
import Avatar from '../shared/Avatar';
import toast from 'react-hot-toast';

const adminNav = [
  { to: '/admin', icon: LayoutDashboard, label: 'Overview' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/slots', icon: Calendar, label: 'Slot Management' },
  { to: '/admin/bookings', icon: ClipboardList, label: 'Bookings' },
  { to: '/admin/attendance', icon: BarChart2, label: 'Attendance' },
  { to: '/admin/announcements', icon: Megaphone, label: 'Announcements' },
];

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
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
    <div className="min-h-screen bg-[#f8f5f2] flex">
      {/* Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 248 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed left-0 top-0 h-full z-40 flex flex-col bg-[#2d2420] overflow-hidden shadow-2xl"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-6 border-b border-white/10 flex-shrink-0">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blush-400 to-blush-600 flex items-center justify-center flex-shrink-0">
            <ShieldCheck size={18} className="text-white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <h1 className="font-display text-lg font-semibold text-white leading-none">Vigour</h1>
                <p className="font-body text-[10px] text-blush-300 tracking-widest uppercase mt-0.5">Admin Portal</p>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors flex-shrink-0"
          >
            <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.3 }}>
              <ChevronLeft size={16} />
            </motion.div>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto no-scrollbar">
          {adminNav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-2xl font-body text-sm font-medium transition-all duration-200 cursor-pointer
                ${isActive
                  ? 'bg-blush-500 text-white shadow-glow'
                  : 'text-white/60 hover:text-white hover:bg-white/10'}
                ${collapsed ? 'justify-center px-2' : ''}`
              }
            >
              <Icon size={18} className="flex-shrink-0" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-white/10 p-3 flex-shrink-0">
          <div className={`flex items-center gap-3 p-2 rounded-2xl mb-1 ${collapsed ? 'justify-center' : ''}`}>
            <Avatar name={userProfile?.name} url={userProfile?.avatarUrl} size="sm" />
            <AnimatePresence>
              {!collapsed && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 min-w-0">
                  <p className="font-body text-sm font-medium text-white truncate">{userProfile?.name}</p>
                  <p className="font-body text-xs text-blush-300">Administrator</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 px-3 py-2.5 w-full rounded-2xl font-body text-sm text-red-400 hover:text-red-300 hover:bg-white/10 transition-colors ${collapsed ? 'justify-center px-2' : ''}`}
          >
            <LogOut size={18} />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main */}
      <motion.main
        animate={{ marginLeft: collapsed ? 72 : 248 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="flex-1 min-h-screen"
      >
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </motion.main>
    </div>
  );
}
