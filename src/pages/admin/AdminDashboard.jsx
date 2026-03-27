// src/pages/admin/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Calendar, CheckSquare, TrendingUp, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { getAllUsers, getAllBookings, getAllSlotsAdmin, getLeaderboard } from '../../services/slotService';
import { CardSkeleton, TableSkeleton } from '../../components/shared/Skeletons';
import Avatar from '../../components/shared/Avatar';
import { formatDate, formatTime } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [users, bookings, slots, board] = await Promise.all([
          getAllUsers(),
          getAllBookings(),
          getAllSlotsAdmin(),
          getLeaderboard(),
        ]);

        const now = new Date();
        const monthStr = format(now, 'yyyy-MM');
        const todayStr = format(now, 'yyyy-MM-dd');

        const attended = bookings.filter((b) => b.attended === true);
        const thisMonthAttended = attended.filter((b) => b.slotDate?.startsWith(monthStr));
        const todaySlots = slots.filter((s) => s.date === todayStr);
        const totalOccupancy = slots.reduce((a, s) => a + (s.bookedCount || 0), 0);
        const totalCapacity = slots.reduce((a, s) => a + (s.capacity || 0), 0);

        setStats({
          totalUsers: users.filter((u) => u.role !== 'admin').length,
          totalBookings: bookings.filter((b) => b.status === 'confirmed').length,
          attendedThisMonth: thisMonthAttended.length,
          todaySlots: todaySlots.length,
          occupancyRate: totalCapacity ? Math.round((totalOccupancy / totalCapacity) * 100) : 0,
          activeUsers: users.filter((u) => u.membershipStatus === 'active').length,
        });

        setRecentBookings(bookings.slice(0, 8));
        setLeaderboard(board.slice(0, 5));
      } catch (e) {
        toast.error('Failed to load admin data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const statCards = stats ? [
    { label: 'Total Members', value: stats.totalUsers, icon: Users, color: 'from-blush-100 to-blush-50', textColor: 'text-blush-600', trend: '+3 this week' },
    { label: 'Active Bookings', value: stats.totalBookings, icon: Calendar, color: 'from-sage-100 to-sage-50', textColor: 'text-sage-600', trend: 'Confirmed' },
    { label: 'Attended This Month', value: stats.attendedThisMonth, icon: CheckSquare, color: 'from-amber-100 to-amber-50', textColor: 'text-amber-600', trend: format(new Date(), 'MMMM') },
    { label: 'Slot Occupancy', value: `${stats.occupancyRate}%`, icon: TrendingUp, color: 'from-purple-100 to-purple-50', textColor: 'text-purple-600', trend: 'Overall' },
  ] : [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-semibold text-white">Admin Overview</h1>
        <p className="font-accent italic text-blush-300 mt-1">
          {format(new Date(), 'EEEE, MMMM d yyyy')}
        </p>
      </motion.div>

      {/* Stats */}
      {loading ? (
        <CardSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className={`rounded-3xl p-6 bg-gradient-to-br ${s.color} shadow-card`}
            >
              <div className="flex items-center justify-between mb-3">
                <s.icon size={20} className={s.textColor} />
                <span className="font-body text-[10px] text-[#8a7b76] bg-white/70 px-2 py-1 rounded-full">
                  {s.trend}
                </span>
              </div>
              <p className={`font-display text-3xl font-semibold ${s.textColor}`}>{s.value}</p>
              <p className="font-body text-xs text-[#8a7b76] mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Bookings */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-white rounded-3xl shadow-card border border-white/60 p-6"
        >
          <h2 className="font-display text-xl font-semibold text-[#2d2420] mb-5">Recent Bookings</h2>
          {loading ? (
            <TableSkeleton rows={5} />
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Class</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((b) => (
                    <tr key={b.id}>
                      <td className="font-medium text-[#2d2420] text-xs">{b.userId?.slice(0, 8)}...</td>
                      <td>{b.className || 'Pilates Class'}</td>
                      <td>{formatDate(b.slotDate)} · {formatTime(b.slotTime)}</td>
                      <td>
                        <span className={b.status === 'confirmed' ? 'badge-sage' : 'badge-neutral'}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Top Members */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white rounded-3xl shadow-card border border-white/60 p-6"
        >
          <h2 className="font-display text-xl font-semibold text-[#2d2420] mb-5">Top Members</h2>
          {loading ? (
            <TableSkeleton rows={5} />
          ) : leaderboard.length === 0 ? (
            <p className="font-body text-sm text-[#8a7b76] text-center py-8">No data yet this month</p>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((u, i) => (
                <div key={u.uid} className="flex items-center gap-3">
                  <span className="font-display font-semibold text-sm text-[#8a7b76] w-5">
                    {['🥇','🥈','🥉','4.','5.'][i]}
                  </span>
                  <Avatar name={u.name} url={u.avatarUrl} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-body font-medium text-sm text-[#2d2420] truncate">{u.name}</p>
                    <p className="font-body text-xs text-[#8a7b76]">{u.count} classes</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Quick links */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4"
      >
        {[
          { to: '/admin/slots', label: 'Manage Slots', icon: '🗓️' },
          { to: '/admin/users', label: 'View Members', icon: '👥' },
          { to: '/admin/attendance', label: 'Mark Attendance', icon: '✅' },
          { to: '/admin/announcements', label: 'Post Update', icon: '📢' },
        ].map(({ to, label, icon }) => (
          <a
            key={to}
            href={to}
            className="bg-white rounded-3xl shadow-card border border-white/60 p-5 flex flex-col items-center gap-3 hover:shadow-card-hover transition-shadow group"
          >
            <span className="text-3xl group-hover:scale-110 transition-transform">{icon}</span>
            <p className="font-body text-sm font-medium text-[#2d2420] text-center">{label}</p>
          </a>
        ))}
      </motion.div>
    </div>
  );
}
