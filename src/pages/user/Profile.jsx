// src/pages/user/Profile.jsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Save, Edit2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { updateUserProfile } from '../../services/slotService';
import { getMembershipColor, getStreakBadge } from '../../utils/helpers';
import Avatar from '../../components/shared/Avatar';
import toast from 'react-hot-toast';

const MEMBERSHIPS = ['Basic', 'Standard', 'Premium', 'Elite'];
const MEMBERSHIP_PERKS = {
  Basic: ['4 classes/month', 'Community access'],
  Standard: ['8 classes/month', 'Priority booking', 'Community access'],
  Premium: ['16 classes/month', 'Priority booking', 'Trainer notes', 'Guest pass'],
  Elite: ['Unlimited classes', 'Priority booking', 'Personal trainer', '2 guest passes', 'Exclusive workshops'],
};

export default function Profile() {
  const { userProfile, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: userProfile?.name || '',
    phone: userProfile?.phone || '',
    bio: userProfile?.bio || '',
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateUserProfile(userProfile.uid, form);
      await refreshProfile();
      toast.success('Profile updated!');
      setEditing(false);
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const streakBadge = getStreakBadge(userProfile?.streak || 0);

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="section-title text-3xl">My Profile</h1>
        <p className="section-subtitle">Your wellness identity</p>
      </motion.div>

      {/* Profile card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card"
      >
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="relative">
            <Avatar name={userProfile?.name} url={userProfile?.avatarUrl} size="xl" />
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-blush-500 rounded-full flex items-center justify-center cursor-pointer shadow-sm hover:bg-blush-600 transition-colors">
              <Camera size={14} className="text-white" />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="font-display text-2xl font-semibold text-[#2d2420]">
                {userProfile?.name}
              </h2>
              {streakBadge && (
                <span className={`${streakBadge.color} text-xs`}>{streakBadge.label}</span>
              )}
            </div>
            <p className="font-body text-sm text-[#8a7b76] mb-3">{userProfile?.email}</p>
            <div className="flex flex-wrap gap-2">
              <span className={getMembershipColor(userProfile?.membershipPlan)}>
                {userProfile?.membershipPlan} Member
              </span>
              <span className={`badge ${userProfile?.membershipStatus === 'active' ? 'badge-sage' : 'badge-neutral'}`}>
                {userProfile?.membershipStatus === 'active' ? '● Active' : '○ Inactive'}
              </span>
            </div>
          </div>

          <button
            onClick={() => setEditing(!editing)}
            className="btn-secondary flex items-center gap-2 text-sm flex-shrink-0"
          >
            <Edit2 size={14} />
            {editing ? 'Cancel' : 'Edit'}
          </button>
        </div>

        {/* Edit form */}
        {editing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 space-y-4 border-t border-blush-50 pt-6"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Full Name</label>
                <input
                  className="input-field"
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                />
              </div>
              <div>
                <label className="label">Phone</label>
                <input
                  className="input-field"
                  value={form.phone}
                  onChange={(e) => set('phone', e.target.value)}
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>
            <div>
              <label className="label">Bio</label>
              <textarea
                className="input-field resize-none"
                rows={3}
                value={form.bio}
                onChange={(e) => set('bio', e.target.value)}
                placeholder="Tell us a little about yourself..."
              />
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary flex items-center gap-2"
            >
              <Save size={15} />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </motion.div>
        )}

        {/* Bio display */}
        {!editing && userProfile?.bio && (
          <div className="mt-4 border-t border-blush-50 pt-4">
            <p className="font-body text-sm text-[#8a7b76] leading-relaxed italic">"{userProfile.bio}"</p>
          </div>
        )}
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-3 gap-4"
      >
        {[
          { label: 'Sessions', value: userProfile?.totalAttended || 0, icon: '🏃' },
          { label: 'Day Streak', value: userProfile?.streak || 0, icon: '🔥' },
          { label: 'Member Since', value: userProfile?.createdAt?.toDate?.() ? new Date(userProfile.createdAt.toDate()).getFullYear() : '2024', icon: '📅' },
        ].map((s) => (
          <div key={s.label} className="card text-center">
            <span className="text-2xl block mb-1">{s.icon}</span>
            <p className="font-display text-2xl font-semibold text-blush-600">{s.value}</p>
            <p className="font-body text-xs text-[#8a7b76]">{s.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Membership card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2d2420] to-[#4a3530] p-6 text-white"
      >
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-blush-500/20 blur-2xl" />
        <div className="absolute bottom-0 left-1/4 w-32 h-32 rounded-full bg-blush-300/10 blur-xl" />
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="font-body text-blush-200 text-xs uppercase tracking-wider mb-1">Membership</p>
              <h3 className="font-display text-2xl font-semibold">{userProfile?.membershipPlan} Plan</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <span className="font-display text-lg font-semibold">S</span>
            </div>
          </div>
          <p className="font-body text-blush-100 text-sm mb-4">{userProfile?.name}</p>
          <div className="grid grid-cols-2 gap-2">
            {(MEMBERSHIP_PERKS[userProfile?.membershipPlan] || MEMBERSHIP_PERKS.Basic).map((perk) => (
              <p key={perk} className="font-body text-xs text-blush-200 flex items-center gap-1.5">
                <span className="text-blush-400">✓</span> {perk}
              </p>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
