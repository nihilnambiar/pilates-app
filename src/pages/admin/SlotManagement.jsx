// src/pages/admin/SlotManagement.jsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Users, Clock } from 'lucide-react';
import { getAllSlotsAdmin, createSlot, updateSlot, deleteSlot } from '../../services/slotService';
import { formatDate, formatTime, isSlotPast } from '../../utils/helpers';
import Modal, { ConfirmModal } from '../../components/shared/Modal';
import { TableSkeleton } from '../../components/shared/Skeletons';
import EmptyState from '../../components/shared/EmptyState';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const CLASS_TYPES = ['Mat Pilates', 'Reformer Pilates', 'Barre Fusion', 'Core & Stretch', 'Power Pilates', 'Prenatal Pilates', 'Senior Flow'];
const TRAINERS = ['Aria Mehta', 'Sonia Patel', 'Leena Kapoor', 'Zara Sheikh', 'Mia Torres'];
const DURATIONS = [30, 45, 60, 75, 90];

const defaultForm = {
  className: 'Mat Pilates',
  trainer: 'Aria Mehta',
  date: format(new Date(), 'yyyy-MM-dd'),
  time: '07:00',
  duration: 60,
  capacity: 12,
  description: '',
};

export default function SlotManagement() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editing, setEditing] = useState(null); // slot or null
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('upcoming');

  const load = async () => {
    setLoading(true);
    try {
      const data = await getAllSlotsAdmin();
      setSlots(data);
    } catch {
      toast.error('Failed to load slots');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(defaultForm);
    setModalOpen(true);
  };

  const openEdit = (slot) => {
    setEditing(slot);
    setForm({
      className: slot.className,
      trainer: slot.trainer,
      date: slot.date,
      time: slot.time,
      duration: slot.duration || 60,
      capacity: slot.capacity,
      description: slot.description || '',
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) {
        await updateSlot(editing.id, form);
        toast.success('Slot updated!');
      } else {
        await createSlot(form);
        toast.success('Slot created!');
      }
      setModalOpen(false);
      await load();
    } catch {
      toast.error('Failed to save slot');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteSlot(deleteConfirm.id);
      toast.success('Slot deleted');
      setDeleteConfirm(null);
      await load();
    } catch {
      toast.error('Failed to delete slot');
    }
  };

  const today = format(new Date(), 'yyyy-MM-dd');
  const filtered = slots.filter((s) => {
    if (filter === 'upcoming') return s.date >= today;
    if (filter === 'past') return s.date < today;
    return true;
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="font-display text-3xl font-semibold text-white">Slot Management</h1>
          <p className="font-accent italic text-blush-300 mt-1">Create and manage class schedules</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Add Slot
        </button>
      </motion.div>

      {/* Filter */}
      <div className="flex gap-2">
        {['upcoming', 'past', 'all'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-2xl font-body text-sm font-medium transition-all ${
              filter === f
                ? 'bg-blush-500 text-white shadow-glow'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Slots grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-3xl p-6 space-y-3">
              <div className="skeleton h-4 w-2/3 rounded-full" />
              <div className="skeleton h-3 w-1/2 rounded-full" />
              <div className="skeleton h-3 w-3/4 rounded-full" />
              <div className="skeleton h-10 w-full rounded-2xl mt-2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-6">
          <EmptyState
            icon="🗓️"
            title="No slots found"
            subtitle="Create your first class slot to get started"
            action={<button onClick={openCreate} className="btn-primary">Create Slot</button>}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((slot, i) => {
            const past = isSlotPast(slot.date, slot.time);
            const full = slot.bookedCount >= slot.capacity;
            return (
              <motion.div
                key={slot.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`bg-white rounded-3xl p-6 shadow-card border border-white/60 ${past ? 'opacity-60' : ''}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-display font-semibold text-[#2d2420]">{slot.className}</h3>
                    <p className="font-body text-xs text-[#8a7b76] mt-0.5">{slot.trainer}</p>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => openEdit(slot)}
                      className="p-2 rounded-xl hover:bg-blush-50 text-[#8a7b76] hover:text-blush-600 transition-colors"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(slot)}
                      className="p-2 rounded-xl hover:bg-red-50 text-[#8a7b76] hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-xs font-body text-[#8a7b76] mb-4">
                  <p className="flex items-center gap-2">
                    <span className="text-blush-400">📅</span>
                    {formatDate(slot.date)} — {formatTime(slot.time)}
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock size={12} className="text-blush-400" />
                    {slot.duration || 60} minutes
                  </p>
                  <p className="flex items-center gap-2">
                    <Users size={12} className={full ? 'text-red-400' : 'text-sage-400'} />
                    <span className={full ? 'text-red-500 font-medium' : ''}>
                      {slot.bookedCount}/{slot.capacity} booked
                    </span>
                  </p>
                </div>

                {/* Occupancy bar */}
                <div className="progress-bar">
                  <div
                    className={`h-full rounded-full transition-all ${
                      full ? 'bg-red-400' : 'bg-gradient-to-r from-blush-400 to-blush-500'
                    }`}
                    style={{ width: `${Math.min((slot.bookedCount / slot.capacity) * 100, 100)}%` }}
                  />
                </div>

                <div className="flex gap-2 mt-3">
                  {past && <span className="badge-neutral text-[10px]">Past</span>}
                  {full && !past && <span className="badge bg-red-50 text-red-500 border-red-100 text-[10px]">Full</span>}
                  {!full && !past && <span className="badge-sage text-[10px]">Open</span>}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Class Slot' : 'Create New Slot'}
        maxWidth="max-w-xl"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Class Type</label>
              <select
                className="input-field"
                value={form.className}
                onChange={(e) => set('className', e.target.value)}
              >
                {CLASS_TYPES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Trainer</label>
              <select
                className="input-field"
                value={form.trainer}
                onChange={(e) => set('trainer', e.target.value)}
              >
                {TRAINERS.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Date</label>
              <input
                type="date"
                className="input-field"
                value={form.date}
                onChange={(e) => set('date', e.target.value)}
              />
            </div>
            <div>
              <label className="label">Time</label>
              <input
                type="time"
                className="input-field"
                value={form.time}
                onChange={(e) => set('time', e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Duration (minutes)</label>
              <select
                className="input-field"
                value={form.duration}
                onChange={(e) => set('duration', Number(e.target.value))}
              >
                {DURATIONS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Capacity</label>
              <input
                type="number"
                min={1}
                max={50}
                className="input-field"
                value={form.capacity}
                onChange={(e) => set('capacity', Number(e.target.value))}
              />
            </div>
          </div>
          <div>
            <label className="label">Description (optional)</label>
            <textarea
              className="input-field resize-none"
              rows={2}
              placeholder="Brief description of the class..."
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : editing ? 'Update Slot' : 'Create Slot'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Slot"
        message={`Delete "${deleteConfirm?.className}" on ${formatDate(deleteConfirm?.date)}? This cannot be undone.`}
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}
