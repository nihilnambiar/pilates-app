// src/components/layout/TopBar.jsx
import { useState, useRef, useEffect } from 'react';
import { Bell, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../shared/Avatar';
import { NavLink, useNavigate } from 'react-router-dom';
import { logoutUser } from '../../services/authService';
import toast from 'react-hot-toast';

export default function TopBar({ onMenuToggle, title }) {
  const { userProfile } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/login');
    } catch {
      toast.error('Logout failed');
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center gap-4 px-4 py-3 bg-white/80 backdrop-blur-xl border-b border-blush-50 md:hidden">
      <button
        onClick={onMenuToggle}
        className="p-2 rounded-xl hover:bg-blush-50 text-[#8a7b76]"
      >
        <Menu size={20} />
      </button>

      <div className="flex-1">
        <h1 className="font-display text-lg font-semibold text-blush-700">Vigour</h1>
      </div>

      <div className="relative" ref={menuRef}>
        <button onClick={() => setMenuOpen(!menuOpen)}>
          <Avatar name={userProfile?.name} url={userProfile?.avatarUrl} size="sm" />
        </button>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 top-12 w-48 bg-white rounded-2xl shadow-card-hover border border-blush-50 overflow-hidden z-50"
            >
              <div className="px-4 py-3 border-b border-blush-50">
                <p className="font-body font-medium text-sm text-[#2d2420]">{userProfile?.name}</p>
                <p className="font-body text-xs text-[#8a7b76]">{userProfile?.membershipPlan} Member</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 font-body text-sm text-red-500 hover:bg-red-50 transition-colors"
              >
                Sign Out
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
