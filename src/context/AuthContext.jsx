// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';
import { getUserProfile } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const profile = await getUserProfile(user.uid);
          setUserProfile(profile);
        } catch (err) {
          console.error('Failed to load user profile:', err);
          // Still set loading to false so app doesn't get stuck
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    }, (error) => {
      // Auth error handler — also unblock loading
      console.error('Auth state error:', error);
      setLoading(false);
    });

    // Safety timeout — if Firebase never responds (bad config), unblock after 8s
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 8000);

    return () => {
      unsub();
      clearTimeout(timeout);
    };
  }, []);

  const refreshProfile = async () => {
    if (currentUser) {
      try {
        const profile = await getUserProfile(currentUser.uid);
        setUserProfile(profile);
      } catch (err) {
        console.error('Failed to refresh profile:', err);
      }
    }
  };

  const isAdmin = userProfile?.role === 'admin';

  return (
    <AuthContext.Provider value={{ currentUser, userProfile, loading, isAdmin, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
