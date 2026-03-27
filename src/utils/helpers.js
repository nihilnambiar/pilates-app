// src/utils/helpers.js
import { format, formatDistanceToNow, parseISO, isToday, isTomorrow, isPast } from 'date-fns';

export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = parseISO(dateStr);
  if (isToday(d)) return 'Today';
  if (isTomorrow(d)) return 'Tomorrow';
  return format(d, 'EEE, MMM d');
};

export const formatTime = (timeStr) => {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
};

export const formatTimestamp = (ts) => {
  if (!ts) return '';
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  return formatDistanceToNow(date, { addSuffix: true });
};

export const formatFullDate = (dateStr) => {
  if (!dateStr) return '';
  return format(parseISO(dateStr), 'EEEE, MMMM d yyyy');
};

export const isSlotPast = (dateStr, timeStr) => {
  const dt = new Date(`${dateStr}T${timeStr}:00`);
  return isPast(dt);
};

export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const getMembershipColor = (plan) => {
  const map = {
    Basic: 'badge-neutral',
    Standard: 'badge-blush',
    Premium: 'badge-gold',
    Elite: 'badge-sage',
  };
  return map[plan] || 'badge-neutral';
};

export const getAttendancePercentage = (attended, total) => {
  if (!total) return 0;
  return Math.round((attended / total) * 100);
};

export const getRankMedal = (rank) => {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return null;
};

export const getStreakBadge = (streak) => {
  if (streak >= 30) return { label: '🔥 30-Day Legend', color: 'badge-gold' };
  if (streak >= 14) return { label: '💪 2-Week Warrior', color: 'badge-sage' };
  if (streak >= 7) return { label: '⚡ Week Streak', color: 'badge-blush' };
  if (streak >= 3) return { label: '✨ On a Roll', color: 'badge-neutral' };
  return null;
};

export const motivationalQuotes = [
  { quote: 'Movement is the song of the body.', author: 'Vanda Scaravelli' },
  { quote: 'Pilates is not just a workout — it\'s a way of living.', author: 'Joseph Pilates' },
  { quote: 'In 10 sessions you will feel the difference. In 20 you will see the difference.', author: 'Joseph Pilates' },
  { quote: 'Change happens through movement, and movement heals.', author: 'Joseph Pilates' },
  { quote: 'The mind, when housed within a healthful body, possesses a glorious sense of power.', author: 'Joseph Pilates' },
  { quote: 'Physical fitness is the first requisite of happiness.', author: 'Joseph Pilates' },
  { quote: 'It is the mind itself which builds the body.', author: 'Friedrich Schiller' },
  { quote: 'Every day is a new opportunity to grow stronger.', author: 'Vigour Studio' },
];

export const getDailyQuote = () => {
  const idx = new Date().getDate() % motivationalQuotes.length;
  return motivationalQuotes[idx];
};
