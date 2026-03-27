// src/hooks/useBookings.js
import { useState, useEffect, useCallback } from 'react';
import { getUserBookings } from '../services/slotService';
import { useAuth } from '../context/AuthContext';

export const useBookings = () => {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const data = await getUserBookings(currentUser.uid);
      setBookings(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => { fetch(); }, [fetch]);

  return { bookings, loading, refetch: fetch };
};
