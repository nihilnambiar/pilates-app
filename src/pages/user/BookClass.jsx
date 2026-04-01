// src/pages/user/BookClass.jsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Users, Clock, User, CheckCircle, XCircle, BellPlus, BellOff } from 'lucide-react';
import { format, addDays, startOfToday } from 'date-fns';
import { getSlots, bookSlot, getUserBookings, cancelBooking, joinWaitlist, leaveWaitlist, getWaitlistPosition } from '../../services/slotService';
import { useAuth } from '../../context/AuthContext';
import { formatTime, isSlotPast } from '../../utils/helpers';
import { SlotSkeleton } from '../../components/shared/Skeletons';
import { ConfirmModal } from '../../components/shared/Modal';
import EmptyState from '../../components/shared/EmptyState';
import toast from 'react-hot-toast';

// Generate 14 days starting from today
const getDates = () =>
  Array.from({ length: 14 }, (_, i) => addDays(startOfToday(), i));

export default function BookClass() {
  const { currentUser } = useAuth();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [slots, setSlots] = useState([]);
  const [userBookings, setUserBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [confirm, setConfirm] = useState(null); // { type: 'book'|'cancel', slot, bookingId }
  const dates = getDates();
  const [dateOffset, setDateOffset] = useState(0);
  const visibleDates = dates.slice(dateOffset, dateOffset + 7);

  const loadSlots = async (date) => {
    setLoading(true);
    try {
      const [s, b] = await Promise.all([
        getSlots(date),
        getUserBookings(currentUser.uid),
      ]);
      setSlots(s);
      setUserBookings(b);
    } catch {
      toast.error('Failed to load slots');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSlots(selectedDate);
  }, [selectedDate]);

  const getUserBookingForSlot = (slotId) =>
    userBookings.find((b) => b.slotId === slotId && b.status === 'confirmed');

  const handleBook = async () => {
    if (!confirm) return;
    setActionLoading(confirm.slot.id);
    try {
      await bookSlot(currentUser.uid, confirm.slot.id);
      toast.success(`🌸 Booked: ${confirm.slot.className || 'Pilates Class'} at ${formatTime(confirm.slot.time)}`);
      await loadSlots(selectedDate);
    } catch (e) {
      toast.error(e.message || 'Booking failed');
    } finally {
      setActionLoading(null);
      setConfirm(null);
    }
  };

  const handleJoinWaitlist = async (slot) => {
    setActionLoading(slot.id);
    try {
      const position = await joinWaitlist(currentUser.uid, slot.id, {
        name: currentUser.displayName, email: currentUser.email, phone: currentUser.phoneNumber,
      });
      toast.success(`Added to waitlist — you are #${position} 🔔`);
      await loadSlots(selectedDate);
    } catch (e) {
      toast.error(e.message || 'Failed to join waitlist');
    } finally {
      setActionLoading(null);
    }
  };

  const handleLeaveWaitlist = async (slot) => {
    setActionLoading(slot.id);
    try {
      await leaveWaitlist(currentUser.uid, slot.id);
      toast.success('Removed from waitlist');
      await loadSlots(selectedDate);
    } catch (e) {
      toast.error(e.message || 'Failed to leave waitlist');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async () => {
    if (!confirm) return;
    setActionLoading(confirm.bookingId);
    try {
      await cancelBooking(confirm.bookingId, confirm.slot.id);
      toast.success('Booking cancelled');
      await loadSlots(selectedDate);
    } catch {
      toast.error('Cancellation failed');
    } finally {
      setActionLoading(null);
      setConfirm(null);
    }
  };

  const getSeatColor = (booked, capacity) => {
    const pct = booked / capacity;
    if (pct >= 1) return 'text-red-500';
    if (pct >= 0.8) return 'text-amber-500';
    return 'text-sage-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="section-title text-3xl">Book a Class</h1>
        <p className="section-subtitle">Choose your date and reserve your spot</p>
      </motion.div>

      {/* Date Picker Strip */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card"
      >
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setDateOffset(Math.max(0, dateOffset - 7))}
            disabled={dateOffset === 0}
            className="p-2 rounded-xl hover:bg-blush-50 text-[#8a7b76] disabled:opacity-30 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="flex-1 grid grid-cols-7 gap-1.5">
            {visibleDates.map((d) => {
              const dateStr = format(d, 'yyyy-MM-dd');
              const isSelected = dateStr === selectedDate;
              const isToday = dateStr === format(new Date(), 'yyyy-MM-dd');
              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`flex flex-col items-center py-2.5 px-1 rounded-2xl transition-all duration-200 ${
                    isSelected
                      ? 'bg-blush-500 text-white shadow-glow'
                      : 'hover:bg-blush-50 text-[#8a7b76]'
                  }`}
                >
                  <span className={`font-body text-[10px] uppercase tracking-wider mb-1 ${isSelected ? 'text-blush-100' : ''}`}>
                    {format(d, 'EEE')}
                  </span>
                  <span className={`font-display text-base font-semibold ${isSelected ? 'text-white' : isToday ? 'text-blush-500' : ''}`}>
                    {format(d, 'd')}
                  </span>
                  {isToday && !isSelected && (
                    <div className="w-1.5 h-1.5 rounded-full bg-blush-400 mt-1" />
                  )}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setDateOffset(Math.min(7, dateOffset + 7))}
            disabled={dateOffset + 7 >= dates.length}
            className="p-2 rounded-xl hover:bg-blush-50 text-[#8a7b76] disabled:opacity-30 transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <p className="font-body text-sm text-[#8a7b76] text-center">
          {format(new Date(selectedDate + 'T12:00:00'), 'EEEE, MMMM d yyyy')}
        </p>
      </motion.div>

      {/* Slots */}
      <AnimatePresence mode="wait">
        {loading ? (
          <SlotSkeleton count={4} />
        ) : slots.length === 0 ? (
          <EmptyState
            icon="🧘"
            title="No classes available"
            subtitle="There are no classes scheduled for this date. Try another day."
          />
        ) : (
          <motion.div
            key={selectedDate}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {slots.map((slot, i) => {
              const userBooking = getUserBookingForSlot(slot.id);
              const isFull = slot.bookedCount >= slot.capacity;
              const isPast = isSlotPast(slot.date, slot.time);
              const seatsLeft = slot.capacity - slot.bookedCount;

              return (
                <motion.div
                  key={slot.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className={`card relative overflow-hidden ${isPast ? 'opacity-60' : ''}`}
                >
                  {/* Status ribbon */}
                  {userBooking && (
                    <div className="absolute top-4 right-4">
                      <span className="badge-sage text-xs">✓ Booked</span>
                    </div>
                  )}
                  {isFull && !userBooking && (
                    <div className="absolute top-4 right-4">
                      <span className="badge bg-red-50 text-red-500 border-red-100 text-xs">Full</span>
                    </div>
                  )}

                  {/* Class info */}
                  <div className="mb-4">
                    <h3 className="font-display text-lg font-semibold text-[#2d2420] mb-1">
                      {slot.className || 'Pilates Class'}
                    </h3>
                    {slot.description && (
                      <p className="font-body text-xs text-[#8a7b76] leading-relaxed mb-3">{slot.description}</p>
                    )}
                    <div className="flex flex-wrap gap-3 text-xs font-body text-[#8a7b76]">
                      <span className="flex items-center gap-1">
                        <Clock size={13} />
                        {formatTime(slot.time)}
                        {slot.duration && ` · ${slot.duration} min`}
                      </span>
                      <span className="flex items-center gap-1">
                        <User size={13} />
                        {slot.trainer}
                      </span>
                      <span className={`flex items-center gap-1 font-medium ${getSeatColor(slot.bookedCount, slot.capacity)}`}>
                        <Users size={13} />
                        {seatsLeft} seat{seatsLeft !== 1 ? 's' : ''} left
                      </span>
                    </div>
                  </div>

                  {/* Seat bar */}
                  <div className="mb-4">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${(slot.bookedCount / slot.capacity) * 100}%` }}
                      />
                    </div>
                    <p className="font-body text-[10px] text-[#8a7b76] mt-1">
                      {slot.bookedCount}/{slot.capacity} booked
                    </p>
                  </div>

                  {/* Action */}
                  {isPast ? (
                    <p className="font-body text-xs text-[#bba8a4] italic">This class has passed</p>
                  ) : userBooking ? (
                    <button
                      onClick={() => setConfirm({ type: 'cancel', slot, bookingId: userBooking.id })}
                      disabled={actionLoading === userBooking.id}
                      className="btn-secondary w-full text-sm flex items-center justify-center gap-2 text-red-500 border-red-100 hover:bg-red-50"
                    >
                      <XCircle size={15} />
                      Cancel Booking
                    </button>
                  ) : isFull ? (() => {
                    const position = getWaitlistPosition(slot, currentUser.uid);
                    return position ? (
                      <div className="space-y-2">
                        <p className="font-body text-xs text-amber-600 font-medium text-center">
                          🔔 You are #{position} on the waitlist
                        </p>
                        <button
                          onClick={() => handleLeaveWaitlist(slot)}
                          disabled={actionLoading === slot.id}
                          className="btn-secondary w-full text-sm flex items-center justify-center gap-2 text-amber-600 border-amber-200 hover:bg-amber-50"
                        >
                          <BellOff size={15} />
                          Leave Waitlist
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="font-body text-xs text-[#8a7b76] text-center">Class is full</p>
                        <button
                          onClick={() => handleJoinWaitlist(slot)}
                          disabled={!!actionLoading}
                          className="btn-secondary w-full text-sm flex items-center justify-center gap-2 text-amber-600 border-amber-200 hover:bg-amber-50"
                        >
                          <BellPlus size={15} />
                          Join Waitlist
                        </button>
                      </div>
                    );
                  })() : (
                    <button
                      onClick={() => setConfirm({ type: 'book', slot })}
                      disabled={!!actionLoading}
                      className="btn-primary w-full text-sm flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={15} />
                      Reserve Spot
                    </button>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm Book */}
      <ConfirmModal
        isOpen={!!confirm && confirm.type === 'book'}
        onClose={() => setConfirm(null)}
        onConfirm={handleBook}
        title="Confirm Booking"
        message={`Reserve your spot in ${confirm?.slot?.className || 'Pilates Class'} at ${formatTime(confirm?.slot?.time || '')} on ${format(new Date((confirm?.slot?.date || selectedDate) + 'T12:00:00'), 'EEEE, MMM d')}?`}
        confirmLabel="Book Now 🌸"
        loading={!!actionLoading}
      />

      {/* Confirm Cancel */}
      <ConfirmModal
        isOpen={!!confirm && confirm.type === 'cancel'}
        onClose={() => setConfirm(null)}
        onConfirm={handleCancel}
        title="Cancel Booking"
        message="Are you sure you want to cancel this booking? Your spot will be released."
        confirmLabel="Yes, Cancel"
        danger
        loading={!!actionLoading}
      />
    </div>
  );
}
