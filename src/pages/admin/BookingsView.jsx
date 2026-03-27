// src/pages/admin/BookingsView.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { getAllBookings } from '../../services/slotService';
import { formatDate, formatTime } from '../../utils/helpers';
import { TableSkeleton } from '../../components/shared/Skeletons';
import EmptyState from '../../components/shared/EmptyState';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function BookingsView() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getAllBookings();
        setBookings(data);
      } catch {
        toast.error('Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = bookings.filter((b) => {
    const matchSearch =
      b.userId?.toLowerCase().includes(search.toLowerCase()) ||
      b.className?.toLowerCase().includes(search.toLowerCase()) ||
      b.trainer?.toLowerCase().includes(search.toLowerCase());

    const matchFilter =
      filter === 'all' ? true :
      filter === 'confirmed' ? b.status === 'confirmed' :
      filter === 'cancelled' ? b.status === 'cancelled' :
      filter === 'attended' ? b.attended === true :
      filter === 'missed' ? (b.attendanceMarked && !b.attended) : true;

    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-semibold text-white">All Bookings</h1>
        <p className="font-accent italic text-blush-300 mt-1">{bookings.length} total bookings</p>
      </motion.div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#bba8a4]" />
          <input
            className="input-field pl-10"
            placeholder="Search by user, class, trainer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1 bg-white/10 p-1 rounded-2xl">
          {['all', 'confirmed', 'attended', 'missed', 'cancelled'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl font-body text-xs font-medium transition-all ${
                filter === f ? 'bg-blush-500 text-white' : 'text-white/70 hover:text-white'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-card overflow-hidden">
        {loading ? (
          <div className="p-6"><TableSkeleton rows={8} /></div>
        ) : filtered.length === 0 ? (
          <EmptyState icon="📋" title="No bookings found" />
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Class</th>
                  <th>Date & Time</th>
                  <th>Trainer</th>
                  <th>Booked At</th>
                  <th>Booking</th>
                  <th>Attendance</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b, i) => (
                  <motion.tr
                    key={b.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                  >
                    <td className="font-mono text-xs text-[#8a7b76]">{b.userId?.slice(0, 10)}...</td>
                    <td className="font-medium text-[#2d2420]">{b.className || 'Pilates Class'}</td>
                    <td>
                      {formatDate(b.slotDate)}
                      <br />
                      <span className="text-xs text-[#8a7b76]">{formatTime(b.slotTime)}</span>
                    </td>
                    <td>{b.trainer || '—'}</td>
                    <td className="text-xs text-[#8a7b76]">
                      {b.bookedAt?.toDate ? format(b.bookedAt.toDate(), 'MMM d, h:mm a') : '—'}
                    </td>
                    <td>
                      <span className={b.status === 'confirmed' ? 'badge-sage' : 'badge-neutral'}>
                        {b.status}
                      </span>
                    </td>
                    <td>
                      {!b.attendanceMarked ? (
                        <span className="badge-neutral">Pending</span>
                      ) : b.attended ? (
                        <span className="badge-sage">✓ Attended</span>
                      ) : (
                        <span className="badge bg-red-50 text-red-500 border-red-100">✗ Missed</span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
