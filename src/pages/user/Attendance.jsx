// src/pages/user/Attendance.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { getUserBookings } from '../../services/slotService';
import { useAuth } from '../../context/AuthContext';
import { formatDate, formatTime, getAttendancePercentage, getStreakBadge } from '../../utils/helpers';
import { TableSkeleton } from '../../components/shared/Skeletons';
import EmptyState from '../../components/shared/EmptyState';
import toast from 'react-hot-toast';

const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function Attendance() {
  const { userProfile } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const load = async () => {
      if (!userProfile) return;
      try {
        const b = await getUserBookings(userProfile.uid);
        setBookings(b);
      } catch {
        toast.error('Failed to load attendance');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userProfile]);

  const now = new Date();
  const monthStr = format(now, 'yyyy-MM');

  const attended = bookings.filter((b) => b.attended === true);
  const missed = bookings.filter((b) => b.attendanceMarked && !b.attended);
  const upcoming = bookings.filter((b) => !b.attendanceMarked && b.status === 'confirmed');
  const thisMonthAttended = attended.filter((b) => b.slotDate?.startsWith(monthStr));

  const totalConfirmed = bookings.filter((b) => b.status === 'confirmed').length;
  const pct = getAttendancePercentage(attended.length, totalConfirmed);

  const filtered = filter === 'all'
    ? bookings
    : filter === 'attended'
    ? attended
    : filter === 'missed'
    ? missed
    : upcoming;

  const streakBadge = getStreakBadge(userProfile?.streak || 0);

  // Monthly bars data (last 6 months)
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const str = format(d, 'yyyy-MM');
    const count = attended.filter((b) => b.slotDate?.startsWith(str)).length;
    return { label: monthNames[d.getMonth()], count, str };
  });
  const maxCount = Math.max(...monthlyData.map((m) => m.count), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="section-title text-3xl">My Attendance</h1>
        <p className="section-subtitle">Track your wellness journey</p>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Attended', value: attended.length, icon: '✅', color: 'text-sage-500' },
          { label: 'This Month', value: thisMonthAttended.length, icon: '📅', color: 'text-blush-500' },
          { label: 'Missed Classes', value: missed.length, icon: '❌', color: 'text-red-400' },
          { label: 'Consistency', value: `${pct}%`, icon: '💪', color: 'text-amber-500' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="card text-center"
          >
            <span className="text-2xl block mb-2">{s.icon}</span>
            <p className={`font-display text-3xl font-semibold ${s.color}`}>{s.value}</p>
            <p className="font-body text-xs text-[#8a7b76] mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Monthly chart + streak */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Bar chart */}
        <motion.div
          className="card lg:col-span-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="section-title mb-1">Monthly Attendance</h2>
          <p className="section-subtitle mb-6">Last 6 months</p>
          <div className="flex items-end gap-3 h-32">
            {monthlyData.map((m, i) => (
              <div key={m.str} className="flex-1 flex flex-col items-center gap-2">
                <span className="font-body text-xs font-medium text-blush-600">{m.count || ''}</span>
                <div className="w-full bg-blush-50 rounded-xl relative overflow-hidden" style={{ height: '80px' }}>
                  <motion.div
                    className={`absolute bottom-0 w-full rounded-xl ${
                      m.str === monthStr
                        ? 'bg-gradient-to-t from-blush-500 to-blush-300'
                        : 'bg-gradient-to-t from-blush-300 to-blush-100'
                    }`}
                    initial={{ height: 0 }}
                    animate={{ height: `${(m.count / maxCount) * 100}%` }}
                    transition={{ duration: 0.8, delay: 0.4 + i * 0.1, ease: 'easeOut' }}
                  />
                </div>
                <span className="font-body text-[10px] text-[#8a7b76]">{m.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Streak + badge */}
        <motion.div
          className="card flex flex-col gap-5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <div className="text-center">
            <div className="text-5xl mb-2">🔥</div>
            <p className="font-display text-4xl font-semibold text-amber-500">{userProfile?.streak || 0}</p>
            <p className="font-body text-sm text-[#8a7b76] mt-1">Day Streak</p>
          </div>
          {streakBadge && (
            <div className={`${streakBadge.color} text-center py-2 px-4 rounded-2xl font-body text-sm font-medium`}>
              {streakBadge.label}
            </div>
          )}
          <div className="divider" />
          <div className="space-y-2">
            <div className="flex justify-between font-body text-sm">
              <span className="text-[#8a7b76]">All-time sessions</span>
              <span className="font-semibold text-[#2d2420]">{userProfile?.totalAttended || 0}</span>
            </div>
            <div className="flex justify-between font-body text-sm">
              <span className="text-[#8a7b76]">Consistency rate</span>
              <span className="font-semibold text-blush-600">{pct}%</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Session History Table */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="section-title">Session History</h2>
            <p className="section-subtitle">{bookings.length} total bookings</p>
          </div>
          {/* Filter tabs */}
          <div className="flex gap-1 bg-blush-50 p-1 rounded-2xl">
            {['all', 'attended', 'missed', 'upcoming'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-xl font-body text-xs font-medium transition-all ${
                  filter === f ? 'bg-white shadow-sm text-blush-600' : 'text-[#8a7b76] hover:text-blush-500'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <TableSkeleton rows={5} />
        ) : filtered.length === 0 ? (
          <EmptyState icon="📋" title="No sessions found" subtitle="Nothing matches this filter" />
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Class</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Trainer</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr key={b.id}>
                    <td className="font-medium text-[#2d2420]">{b.className || 'Pilates Class'}</td>
                    <td>{formatDate(b.slotDate)}</td>
                    <td>{formatTime(b.slotTime)}</td>
                    <td>{b.trainer || '—'}</td>
                    <td>
                      {b.attendanceMarked ? (
                        b.attended ? (
                          <span className="badge-sage">✓ Attended</span>
                        ) : (
                          <span className="badge bg-red-50 text-red-500 border-red-100">✗ Missed</span>
                        )
                      ) : b.status === 'cancelled' ? (
                        <span className="badge-neutral">Cancelled</span>
                      ) : (
                        <span className="badge-blush">Upcoming</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
