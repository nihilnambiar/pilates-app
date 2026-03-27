// src/pages/admin/Announcements.jsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Megaphone } from 'lucide-react';
import { createAnnouncement, getAnnouncements, deleteAnnouncement } from '../../services/slotService';
import { ConfirmModal } from '../../components/shared/Modal';
import { formatTimestamp } from '../../utils/helpers';
import EmptyState from '../../components/shared/EmptyState';
import toast from 'react-hot-toast';

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [form, setForm] = useState({ title: '', message: '', type: 'general' });

  const load = async () => {
    setLoading(true);
    try {
      const data = await getAnnouncements();
      setAnnouncements(data);
    } catch {
      toast.error('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!form.title.trim() || !form.message.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    setSaving(true);
    try {
      await createAnnouncement(form);
      toast.success('Announcement posted!');
      setForm({ title: '', message: '', type: 'general' });
      setCreating(false);
      await load();
    } catch {
      toast.error('Failed to post announcement');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteAnnouncement(deleteConfirm.id);
      toast.success('Announcement removed');
      setDeleteConfirm(null);
      await load();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const typeColors = {
    general: 'badge-blush',
    urgent: 'badge bg-red-50 text-red-500 border-red-100',
    event: 'badge-sage',
    reminder: 'badge-gold',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="font-display text-3xl font-semibold text-white">Announcements</h1>
          <p className="font-accent italic text-blush-300 mt-1">Post studio updates and news</p>
        </div>
        <button onClick={() => setCreating(!creating)} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Post Announcement
        </button>
      </motion.div>

      {/* Create form */}
      <AnimatePresence>
        {creating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-3xl shadow-card p-6 overflow-hidden"
          >
            <h2 className="font-display text-lg font-semibold text-[#2d2420] mb-4">New Announcement</h2>
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Title</label>
                  <input
                    className="input-field"
                    placeholder="Announcement title..."
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="label">Type</label>
                  <select
                    className="input-field"
                    value={form.type}
                    onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                  >
                    <option value="general">General</option>
                    <option value="urgent">Urgent</option>
                    <option value="event">Event</option>
                    <option value="reminder">Reminder</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Message</label>
                <textarea
                  className="input-field resize-none"
                  rows={4}
                  placeholder="Write your announcement..."
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setCreating(false)} className="btn-secondary">Cancel</button>
                <button onClick={handleCreate} disabled={saving} className="btn-primary flex items-center gap-2">
                  <Megaphone size={15} />
                  {saving ? 'Posting...' : 'Post Announcement'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Announcements list */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-3xl p-6 space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="space-y-2">
                <div className="skeleton h-4 w-1/3 rounded-full" />
                <div className="skeleton h-3 w-full rounded-full" />
                <div className="skeleton h-3 w-3/4 rounded-full" />
              </div>
            ))}
          </div>
        ) : announcements.length === 0 ? (
          <div className="bg-white rounded-3xl p-6">
            <EmptyState
              icon="📢"
              title="No announcements yet"
              subtitle="Post your first announcement to keep members informed"
              action={<button onClick={() => setCreating(true)} className="btn-primary">Post Now</button>}
            />
          </div>
        ) : (
          announcements.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-white rounded-3xl shadow-card p-6 flex gap-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-blush-50 flex items-center justify-center flex-shrink-0 text-xl">
                {a.type === 'urgent' ? '🚨' : a.type === 'event' ? '🎉' : a.type === 'reminder' ? '⏰' : '📢'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-display font-semibold text-[#2d2420]">{a.title}</h3>
                  <span className={typeColors[a.type] || 'badge-blush'}>{a.type}</span>
                </div>
                <p className="font-body text-sm text-[#8a7b76] leading-relaxed">{a.message}</p>
                <p className="font-body text-xs text-[#bba8a4] mt-2">
                  {a.createdAt ? formatTimestamp(a.createdAt) : 'Just now'}
                </p>
              </div>
              <button
                onClick={() => setDeleteConfirm(a)}
                className="p-2 rounded-xl hover:bg-red-50 text-[#bba8a4] hover:text-red-500 transition-colors flex-shrink-0 self-start"
              >
                <Trash2 size={15} />
              </button>
            </motion.div>
          ))
        )}
      </div>

      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Announcement"
        message={`Remove "${deleteConfirm?.title}"? Members will no longer see this.`}
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}
