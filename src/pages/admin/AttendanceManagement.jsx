// src/pages/admin/AttendanceManagement.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format, addDays, startOfToday } from 'date-fns';
import { ChevronLeft, ChevronRight, CheckCircle, XCircle } from 'lucide-react';
import { getSlots, getBookingsForSlot, markAttendance } from '../../services/slotService';
import { useAuth } from '../../context/AuthContext';
import { formatTime, formatDate } from '../../utils/helpers';
import { TableSkeleton } from '../../components/shared/Skeletons';
import EmptyState from '../../components/shared/EmptyState';
import toast from 'react-hot-toast';

export default function AttendanceManagement() {
  const { currentUser } = useAuth();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [markingId, setMarkingId] = useState(null);

  const today = startOfToday();
  const dates = Array.from({ length: 7 }, (_, i) => addDays(today, i - 3));

  // Load slots for selected date
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setSelectedSlot(null);
      setBookings([]);
      try {
        const data = await getSlots(selectedDate);
        setSlots(data);
      } catch {
        toast.error('Failed to load slots');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [selectedDate]);

  // Load bookings for selected slot
  const loadBookings = async (slot) => {
    setSelectedSlot(slot);
    setBookingsLoading(true);
    try {
      const data = await getBookingsForSlot(slot.id);
      setBookings(data);
    } catch {
      toast.error('Failed to load bookings');
    } finally {
      setBookingsLoading(false);
    }
  };

  const handleMark = async (booking, attended) => {
    setMarkingId(booking.id);
    try {
      await markAttendance(booking.id, booking.userId, booking.slotId, attended, currentUser.uid);
      // Update local state
      setBookings((prev) =>
        prev.map((b) =>
          b.id === booking.id ? { ...b, attended, attendanceMarked: true } : b
        )
      );
      toast.success(attended ? '✅ Marked as attended' : '❌ Marked as absent');
    } catch {
      toast.error('Failed to mark attendance');
    } finally {
      setMarkingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-semibold text-white">Attendance</h1>
        <p className="font-accent italic text-blush-300 mt-1">Mark and manage class attendance</p>
      </motion.div>

      {/* Date strip */}
      <div className="bg-white rounded-3xl p-4 shadow-card flex items-center gap-2">
        {dates.map((d) => {
          const dateStr = format(d, 'yyyy-MM-dd');
          const isSelected = dateStr === selectedDate;
          const isTodayDate = dateStr === format(new Date(), 'yyyy-MM-dd');
          return (
            <button
              key={dateStr}
              onClick={() => setSelectedDate(dateStr)}
              className={`flex-1 flex flex-col items-center py-2.5 rounded-2xl transition-all ${
                isSelected ? 'bg-blush-500 text-white shadow-glow' : 'hover:bg-blush-50 text-[#8a7b76]'
              }`}
            >
              <span className={`font-body text-[10px] uppercase tracking-wider ${isSelected ? 'text-blush-100' : ''}`}>
                {format(d, 'EEE')}
              </span>
              <span className={`font-display text-base font-semibold ${isTodayDate && !isSelected ? 'text-blush-500' : ''}`}>
                {format(d, 'd')}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Slots column */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="font-display text-lg font-semibold text-white">Classes on {formatDate(selectedDate)}</h2>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="bg-white rounded-2xl h-20 skeleton" />)}
            </div>
          ) : slots.length === 0 ? (
            <div className="bg-white rounded-3xl p-6">
              <EmptyState icon="🗓️" title="No classes" subtitle="No slots for this date" />
            </div>
          ) : (
            slots.map((slot) => (
              <button
                key={slot.id}
                onClick={() => loadBookings(slot)}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                  selectedSlot?.id === slot.id
                    ? 'border-blush-500 bg-blush-50'
                    : 'border-transparent bg-white hover:border-blush-200'
                } shadow-card`}
              >
                <p className="font-display font-semibold text-[#2d2420]">{slot.className}</p>
                <p className="font-body text-xs text-[#8a7b76] mt-1">
                  {formatTime(slot.time)} · {slot.trainer}
                </p>
                <p className="font-body text-xs text-blush-500 mt-1">
                  {slot.bookedCount}/{slot.capacity} booked
                </p>
              </button>
            ))
          )}
        </div>

        {/* Bookings / Attendance column */}
        <div className="lg:col-span-3">
          {!selectedSlot ? (
            <div className="bg-white rounded-3xl p-8 h-full flex items-center justify-center">
              <EmptyState
                icon="👈"
                title="Select a class"
                subtitle="Choose a class from the left to view and mark attendance"
              />
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-card p-6">
              <div className="mb-5">
                <h3 className="font-display text-xl font-semibold text-[#2d2420]">
                  {selectedSlot.className}
                </h3>
                <p className="font-body text-sm text-[#8a7b76]">
                  {formatDate(selectedSlot.date)} · {formatTime(selectedSlot.time)} · {selectedSlot.trainer}
                </p>
                <div className="flex gap-3 mt-2 text-xs font-body">
                  <span className="badge-sage">
                    ✓ {bookings.filter((b) => b.attended).length} attended
                  </span>
                  <span className="badge bg-red-50 text-red-500 border-red-100">
                    ✗ {bookings.filter((b) => b.attendanceMarked && !b.attended).length} absent
                  </span>
                  <span className="badge-neutral">
                    ? {bookings.filter((b) => !b.attendanceMarked).length} unmarked
                  </span>
                </div>
              </div>

              {bookingsLoading ? (
                <TableSkeleton rows={4} />
              ) : bookings.length === 0 ? (
                <EmptyState icon="🪑" title="No bookings" subtitle="No one booked this class yet" />
              ) : (
                <div className="space-y-2">
                  {bookings.map((b, i) => (
                    <motion.div
                      key={b.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-body font-medium text-sm text-[#2d2420]">
                          User: {b.userId?.slice(0, 10)}...
                        </p>
                        <p className="font-body text-xs text-[#8a7b76]">
                          Booked at {b.bookedAt?.toDate ? format(b.bookedAt.toDate(), 'MMM d, h:mm a') : '—'}
                        </p>
                      </div>

                      {/* Attendance status */}
                      {b.attendanceMarked ? (
                        <div className="flex items-center gap-2">
                          {b.attended ? (
                            <span className="badge-sage flex items-center gap-1">
                              <CheckCircle size={12} /> Attended
                            </span>
                          ) : (
                            <span className="badge bg-red-50 text-red-500 border-red-100 flex items-center gap-1">
                              <XCircle size={12} /> Absent
                            </span>
                          )}
                          {/* Allow re-mark */}
                          <button
                            onClick={() => handleMark(b, !b.attended)}
                            disabled={markingId === b.id}
                            className="text-[#8a7b76] hover:text-blush-600 text-xs font-body underline"
                          >
                            Change
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleMark(b, true)}
                            disabled={markingId === b.id}
                            className="btn-sage text-xs px-3 py-2 flex items-center gap-1"
                          >
                            <CheckCircle size={13} />
                            Present
                          </button>
                          <button
                            onClick={() => handleMark(b, false)}
                            disabled={markingId === b.id}
                            className="btn-danger text-xs px-3 py-2 flex items-center gap-1"
                          >
                            <XCircle size={13} />
                            Absent
                          </button>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
