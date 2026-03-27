// src/pages/user/Leaderboard.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { getLeaderboard } from '../../services/slotService';
import { useAuth } from '../../context/AuthContext';
import { getRankMedal, getStreakBadge } from '../../utils/helpers';
import { TableSkeleton } from '../../components/shared/Skeletons';
import Avatar from '../../components/shared/Avatar';
import EmptyState from '../../components/shared/EmptyState';
import toast from 'react-hot-toast';
import { Trophy, RefreshCw } from 'lucide-react';

export default function Leaderboard() {
  const { currentUser } = useAuth();
  const [board, setBoard] = useState([]);
  const [loading, setLoading] = useState(true);
  const month = format(new Date(), 'MMMM yyyy');

  const load = async () => {
    setLoading(true);
    try {
      const data = await getLeaderboard();
      setBoard(data);
    } catch {
      toast.error('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const top3 = board.slice(0, 3);
  const rest = board.slice(3);
  const myRank = board.findIndex((u) => u.uid === currentUser?.uid);

  // Podium order: 2nd, 1st, 3rd
  const podium = [top3[1], top3[0], top3[2]].filter(Boolean);
  const podiumHeights = ['h-24', 'h-32', 'h-20'];
  const podiumPositions = [2, 1, 3];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="section-title text-3xl flex items-center gap-2">
            <Trophy className="text-amber-400" size={28} />
            Leaderboard
          </h1>
          <p className="section-subtitle">{month} rankings</p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="btn-secondary flex items-center gap-2 text-sm"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </motion.div>

      {/* My rank banner */}
      {myRank !== -1 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="card bg-gradient-to-r from-blush-50 to-purple-50 border border-blush-100"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blush-100 flex items-center justify-center font-display text-xl font-bold text-blush-600">
              #{myRank + 1}
            </div>
            <div>
              <p className="font-display font-semibold text-[#2d2420]">Your Current Rank</p>
              <p className="font-body text-sm text-[#8a7b76]">
                {board[myRank]?.count || 0} classes attended this month
              </p>
            </div>
            <div className="ml-auto text-2xl">
              {getRankMedal(myRank + 1) || '🎯'}
            </div>
          </div>
        </motion.div>
      )}

      {/* Podium */}
      {!loading && top3.length >= 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card bg-gradient-to-br from-amber-50 via-cream-50 to-blush-50"
        >
          <h2 className="section-title text-center mb-8">🏆 Top Performers</h2>
          <div className="flex items-end justify-center gap-4">
            {podium.map((user, i) => {
              if (!user) return <div key={i} className="flex-1 max-w-[120px]" />;
              const rank = podiumPositions[i];
              const medal = getRankMedal(rank);
              const heights = ['h-24', 'h-32', 'h-20'];
              const bgColors = [
                'from-gray-100 to-gray-50',
                'from-amber-100 to-yellow-50',
                'from-orange-100 to-orange-50',
              ];
              const isCurrentUser = user.uid === currentUser?.uid;
              return (
                <div key={user.uid} className="flex flex-col items-center gap-2 flex-1 max-w-[140px]">
                  <div className={`relative ${isCurrentUser ? 'ring-2 ring-blush-400 ring-offset-2 rounded-full' : ''}`}>
                    <Avatar name={user.name} url={user.avatarUrl} size="lg" />
                    <span className="absolute -bottom-1 -right-1 text-xl">{medal}</span>
                  </div>
                  <div className="text-center">
                    <p className="font-body font-semibold text-sm text-[#2d2420] truncate max-w-[120px]">
                      {user.name.split(' ')[0]}
                    </p>
                    <p className="font-body text-xs text-[#8a7b76]">{user.count} classes</p>
                  </div>
                  <motion.div
                    className={`w-full rounded-t-2xl bg-gradient-to-t ${bgColors[i]} border border-white/80 flex items-center justify-center`}
                    initial={{ height: 0 }}
                    animate={{ height: heights[i].replace('h-', '') * 4 }}
                    transition={{ duration: 0.8, delay: 0.4 + i * 0.1, ease: 'easeOut' }}
                    style={{ minHeight: rank === 1 ? '128px' : rank === 2 ? '96px' : '80px' }}
                  >
                    <span className="font-display text-3xl font-bold text-[#8a7b76]/40">
                      {rank}
                    </span>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Full rankings */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="card"
      >
        <h2 className="section-title mb-5">Full Rankings</h2>

        {loading ? (
          <TableSkeleton rows={6} />
        ) : board.length === 0 ? (
          <EmptyState
            icon="🏅"
            title="No rankings yet"
            subtitle="Attend classes this month to appear on the leaderboard!"
          />
        ) : (
          <div className="space-y-2">
            {board.map((user, i) => {
              const rank = i + 1;
              const medal = getRankMedal(rank);
              const isMe = user.uid === currentUser?.uid;
              const badge = getStreakBadge(user.streak);

              return (
                <motion.div
                  key={user.uid}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.04 }}
                  className={`flex items-center gap-4 p-3.5 rounded-2xl transition-colors ${
                    isMe
                      ? 'bg-blush-50 border border-blush-200'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {/* Rank */}
                  <div className="w-8 text-center flex-shrink-0">
                    {medal ? (
                      <span className="text-xl">{medal}</span>
                    ) : (
                      <span className="font-display font-semibold text-[#8a7b76] text-sm">
                        #{rank}
                      </span>
                    )}
                  </div>

                  {/* Avatar */}
                  <Avatar name={user.name} url={user.avatarUrl} size="sm" />

                  {/* Name + badge */}
                  <div className="flex-1 min-w-0">
                    <p className="font-body font-semibold text-sm text-[#2d2420] flex items-center gap-2">
                      {user.name}
                      {isMe && <span className="text-[10px] text-blush-500 font-medium">(you)</span>}
                    </p>
                    {badge && (
                      <span className={`text-[10px] font-body ${badge.color} mt-0.5 inline-block px-2 py-0.5 rounded-full`}>
                        {badge.label}
                      </span>
                    )}
                  </div>

                  {/* Count */}
                  <div className="text-right flex-shrink-0">
                    <p className="font-display font-semibold text-lg text-blush-600">{user.count}</p>
                    <p className="font-body text-[10px] text-[#8a7b76]">classes</p>
                  </div>

                  {/* Progress bar */}
                  <div className="w-20 hidden sm:block">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${(user.count / (board[0]?.count || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
