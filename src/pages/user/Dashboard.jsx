// src/pages/user/Dashboard.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, TrendingUp, Award, Clock, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getUserBookings, getAnnouncements, getMonthlyAttendance } from '../../services/slotService';
import { formatDate, formatTime, getDailyQuote, getStreakBadge } from '../../utils/helpers';
import { format } from 'date-fns';
import { CardSkeleton } from '../../components/shared/Skeletons';
import EmptyState from '../../components/shared/EmptyState';
import toast from 'react-hot-toast';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.4 } }),
};

export default function Dashboard() {
  const { userProfile } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [monthlyCount, setMonthlyCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const quote = getDailyQuote();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  useEffect(() => {
    const load = async () => {
      if (!userProfile) return;
      try {
        const [b, a, m] = await Promise.all([
          getUserBookings(userProfile.uid),
          getAnnouncements(),
          getMonthlyAttendance(userProfile.uid),
        ]);
        const upcoming = b
          .filter((bk) => bk.status === 'confirmed' && bk.slotDate >= format(new Date(), 'yyyy-MM-dd'))
          .slice(0, 3);
        setBookings(upcoming);
        setAnnouncements(a.slice(0, 3));
        setMonthlyCount(m.length);
      } catch (e) {
        toast.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userProfile]);

  const streakBadge = getStreakBadge(userProfile?.streak || 0);

  const stats = [
    {
      icon: '🏃',
      label: 'Total Sessions',
      value: userProfile?.totalAttended || 0,
      color: 'from-blush-100 to-blush-50',
      textColor: 'text-blush-600',
    },
    {
      icon: '📅',
      label: 'This Month',
      value: monthlyCount,
      color: 'from-sage-100 to-sage-50',
      textColor: 'text-sage-600',
    },
    {
      icon: '🔥',
      label: 'Day Streak',
      value: userProfile?.streak || 0,
      color: 'from-amber-100 to-amber-50',
      textColor: 'text-amber-600',
    },
    {
      icon: '⭐',
      label: 'Membership',
      value: userProfile?.membershipPlan || 'Basic',
      color: 'from-purple-100 to-purple-50',
      textColor: 'text-purple-600',
      isText: true,
    },
  ];

  return (
    <div className="space-y-8">
      {/* ─── Welcome Hero ────────────────────── */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="relative overflow-hidden rounded-4xl bg-gradient-to-br from-blush-400 via-blush-500 to-[#a84535] p-8 text-white shadow-glow"
      >
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/10 blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-1/2 w-48 h-48 rounded-full bg-blush-300/20 blur-2xl" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <p className="font-body text-blush-100 text-sm mb-1 font-medium">
              {greeting} ✨
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold mb-3">
              {userProfile?.name?.split(' ')[0] || 'Beautiful'}
            </h1>
            <p className="font-accent italic text-blush-100 text-base leading-relaxed max-w-xs">
              "{quote.quote}"
            </p>
            <p className="font-body text-blush-200 text-xs mt-1">— {quote.author}</p>

            {streakBadge && (
              <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-body font-medium">
                {streakBadge.label}
              </div>
            )}
          </div>

          <Link
            to="/dashboard/book"
            className="flex-shrink-0 flex items-center gap-2 bg-white text-blush-600 font-body font-semibold px-6 py-3.5 rounded-2xl hover:bg-blush-50 transition-colors shadow-card self-start sm:self-auto"
          >
            <Calendar size={18} />
            Book a Class
            <ArrowRight size={16} />
          </Link>
        </div>
      </motion.div>

      {/* ─── Stats Grid ────────────────────── */}
      {loading ? (
        <CardSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              variants={fadeUp}
              custom={i}
              initial="hidden"
              animate="show"
              className={`card bg-gradient-to-br ${s.color}`}
            >
              <span className="text-2xl mb-2 block">{s.icon}</span>
              <div className={`font-display text-3xl font-semibold ${s.textColor} mb-1`}>
                {s.isText ? (
                  <span className="text-xl">{s.value}</span>
                ) : (
                  s.value
                )}
              </div>
              <p className="font-body text-xs text-[#8a7b76] font-medium">{s.label}</p>
            </motion.div>
          ))}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ─── Upcoming Classes ────────────────────── */}
        <motion.div
          variants={fadeUp}
          custom={4}
          initial="hidden"
          animate="show"
          className="lg:col-span-2 card"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="section-title">Upcoming Classes</h2>
              <p className="section-subtitle">Your reserved sessions</p>
            </div>
            <Link to="/dashboard/book" className="btn-ghost text-sm flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>

          {bookings.length === 0 ? (
            <EmptyState
              icon="🗓️"
              title="No upcoming classes"
              subtitle="Book your first class to get started on your wellness journey"
              action={
                <Link to="/dashboard/book" className="btn-primary">
                  Book a Class
                </Link>
              }
            />
          ) : (
            <div className="space-y-3">
              {bookings.map((b, i) => (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-blush-50/60 hover:bg-blush-50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-2xl bg-blush-100 flex flex-col items-center justify-center text-blush-600 flex-shrink-0">
                    <span className="font-display text-base font-semibold leading-none">
                      {new Date(b.slotDate).getDate()}
                    </span>
                    <span className="font-body text-[9px] uppercase tracking-wider text-blush-400">
                      {format(new Date(b.slotDate + 'T12:00:00'), 'MMM')}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body font-semibold text-[#2d2420] text-sm">{b.className || 'Pilates Class'}</p>
                    <p className="font-body text-xs text-[#8a7b76] mt-0.5">
                      {formatDate(b.slotDate)} · {formatTime(b.slotTime)} · {b.trainer}
                    </p>
                  </div>
                  <span className="badge-sage text-xs flex-shrink-0">Confirmed</span>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* ─── Announcements ────────────────────── */}
        <motion.div
          variants={fadeUp}
          custom={5}
          initial="hidden"
          animate="show"
          className="card"
        >
          <div className="flex items-center gap-2 mb-5">
            <Sparkles size={18} className="text-blush-400" />
            <h2 className="section-title">Studio News</h2>
          </div>

          {announcements.length === 0 ? (
            <EmptyState icon="📢" title="No announcements" subtitle="Check back soon for studio news" />
          ) : (
            <div className="space-y-4">
              {announcements.map((a, i) => (
                <div key={a.id} className="border-l-2 border-blush-200 pl-4">
                  <p className="font-body font-semibold text-sm text-[#2d2420] mb-1">{a.title}</p>
                  <p className="font-body text-xs text-[#8a7b76] leading-relaxed">{a.message}</p>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* ─── Attendance Progress ────────────────────── */}
      <motion.div
        variants={fadeUp}
        custom={6}
        initial="hidden"
        animate="show"
        className="card"
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="section-title">Monthly Progress</h2>
            <p className="section-subtitle">
              {format(new Date(), 'MMMM yyyy')} attendance
            </p>
          </div>
          <Link to="/dashboard/attendance" className="btn-ghost text-sm flex items-center gap-1">
            Full report <ArrowRight size={14} />
          </Link>
        </div>

        <div className="flex items-center gap-6">
          {/* Circle progress */}
          <div className="relative w-24 h-24 flex-shrink-0">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
              <circle cx="48" cy="48" r="40" fill="none" stroke="#fce4e1" strokeWidth="8" />
              <motion.circle
                cx="48" cy="48" r="40"
                fill="none"
                stroke="url(#progressGrad)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={251}
                initial={{ strokeDashoffset: 251 }}
                animate={{ strokeDashoffset: 251 - (251 * Math.min(monthlyCount / 20, 1)) }}
                transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
              />
              <defs>
                <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#e9a09a" />
                  <stop offset="100%" stopColor="#c85a49" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-2xl font-semibold text-blush-600">{monthlyCount}</span>
              <span className="font-body text-[10px] text-[#8a7b76]">classes</span>
            </div>
          </div>

          <div className="flex-1 space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-body text-[#8a7b76]">Monthly goal (20 classes)</span>
                <span className="font-body font-medium text-blush-600">{Math.round((monthlyCount / 20) * 100)}%</span>
              </div>
              <div className="progress-bar">
                <motion.div
                  className="progress-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((monthlyCount / 20) * 100, 100)}%` }}
                  transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
                />
              </div>
            </div>
            <div className="flex gap-4 mt-2">
              <div className="text-center">
                <p className="font-display text-xl font-semibold text-sage-500">{monthlyCount}</p>
                <p className="font-body text-xs text-[#8a7b76]">Attended</p>
              </div>
              <div className="w-px bg-blush-100" />
              <div className="text-center">
                <p className="font-display text-xl font-semibold text-blush-500">{userProfile?.streak || 0}</p>
                <p className="font-body text-xs text-[#8a7b76]">Day Streak</p>
              </div>
              <div className="w-px bg-blush-100" />
              <div className="text-center">
                <p className="font-display text-xl font-semibold text-amber-500">{userProfile?.totalAttended || 0}</p>
                <p className="font-body text-xs text-[#8a7b76]">All Time</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
