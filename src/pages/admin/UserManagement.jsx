// src/pages/admin/UserManagement.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Edit2, Shield } from 'lucide-react';
import { getAllUsers, updateUserMembership } from '../../services/slotService';
import Avatar from '../../components/shared/Avatar';
import Modal from '../../components/shared/Modal';
import { TableSkeleton } from '../../components/shared/Skeletons';
import EmptyState from '../../components/shared/EmptyState';
import { getMembershipColor, formatTimestamp } from '../../utils/helpers';
import toast from 'react-hot-toast';

const PLANS = ['Basic', 'Standard', 'Premium', 'Elite'];

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({ membershipPlan: 'Basic', membershipStatus: 'active' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data.filter((u) => u.role !== 'admin'));
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleEditOpen = (user) => {
    setEditUser(user);
    setEditForm({
      membershipPlan: user.membershipPlan || 'Basic',
      membershipStatus: user.membershipStatus || 'active',
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateUserMembership(editUser.id, editForm.membershipPlan, editForm.membershipStatus);
      toast.success('Membership updated!');
      setEditUser(null);
      await load();
    } catch {
      toast.error('Failed to update');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-white">Members</h1>
          <p className="font-accent italic text-blush-300 mt-1">{users.length} registered members</p>
        </div>
      </motion.div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#bba8a4]" />
        <input
          className="input-field pl-10"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-card overflow-hidden">
        {loading ? (
          <div className="p-6"><TableSkeleton rows={6} /></div>
        ) : filtered.length === 0 ? (
          <EmptyState icon="👥" title="No members found" subtitle="Try a different search" />
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Email</th>
                  <th>Plan</th>
                  <th>Status</th>
                  <th>Sessions</th>
                  <th>Streak</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => (
                  <motion.tr
                    key={u.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <td>
                      <div className="flex items-center gap-3">
                        <Avatar name={u.name} url={u.avatarUrl} size="sm" />
                        <span className="font-medium text-[#2d2420]">{u.name}</span>
                      </div>
                    </td>
                    <td className="text-[#8a7b76] text-xs">{u.email}</td>
                    <td>
                      <span className={getMembershipColor(u.membershipPlan)}>{u.membershipPlan}</span>
                    </td>
                    <td>
                      <span className={u.membershipStatus === 'active' ? 'badge-sage' : 'badge-neutral'}>
                        {u.membershipStatus}
                      </span>
                    </td>
                    <td className="font-semibold text-blush-600">{u.totalAttended || 0}</td>
                    <td className="font-semibold text-amber-500">🔥 {u.streak || 0}</td>
                    <td>
                      <button
                        onClick={() => handleEditOpen(u)}
                        className="p-2 rounded-xl hover:bg-blush-50 text-[#8a7b76] hover:text-blush-600 transition-colors"
                      >
                        <Edit2 size={15} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Modal isOpen={!!editUser} onClose={() => setEditUser(null)} title="Edit Membership" maxWidth="max-w-sm">
        {editUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-blush-50 rounded-2xl mb-4">
              <Avatar name={editUser.name} url={editUser.avatarUrl} size="md" />
              <div>
                <p className="font-body font-semibold text-[#2d2420]">{editUser.name}</p>
                <p className="font-body text-xs text-[#8a7b76]">{editUser.email}</p>
              </div>
            </div>

            <div>
              <label className="label">Membership Plan</label>
              <select
                className="input-field"
                value={editForm.membershipPlan}
                onChange={(e) => setEditForm((f) => ({ ...f, membershipPlan: e.target.value }))}
              >
                {PLANS.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>

            <div>
              <label className="label">Status</label>
              <select
                className="input-field"
                value={editForm.membershipStatus}
                onChange={(e) => setEditForm((f) => ({ ...f, membershipStatus: e.target.value }))}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="paused">Paused</option>
              </select>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button onClick={() => setEditUser(null)} className="btn-secondary">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary">
                {saving ? 'Saving...' : 'Update'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
