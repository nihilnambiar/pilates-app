// src/pages/admin/TrialBookingsAdmin.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, onSnapshot, orderBy, query, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Phone, Mail, Calendar, MessageSquare, Clock, CheckCircle, XCircle, RefreshCw, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  pending:   { label: 'Pending',   bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200' },
  contacted: { label: 'Contacted', bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200' },
  confirmed: { label: 'Confirmed', bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200' },
  cancelled: { label: 'Cancelled', bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200' },
};

export default function TrialBookingsAdmin() {
  const [bookings, setBookings]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [filter, setFilter]             = useState('all');
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'trialBookings'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setBookings(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await updateDoc(doc(db, 'trialBookings', id), { status });
      toast.success(`Marked as ${status}`);
    } catch {
      toast.error('Update failed');
    }
  };

  const deleteBooking = async (id) => {
    try {
      await deleteDoc(doc(db, 'trialBookings', id));
      toast.success('Booking deleted');
      setConfirmDelete(null);
    } catch {
      toast.error('Delete failed');
    }
  };

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  const counts = bookings.reduce((acc, b) => {
    acc[b.status] = (acc[b.status] || 0) + 1;
    return acc;
  }, {});

  const formatDate = (ts) => {
    if (!ts) return '—';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold text-[#2d2420]">Trial Bookings</h1>
        <p className="font-body text-sm text-[#6b6b5e] mt-1">Manage and respond to trial session enquiries from the website</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total',     value: bookings.length,        color: 'text-[#2d2420]' },
          { label: 'Pending',   value: counts.pending   || 0,  color: 'text-amber-600' },
          { label: 'Contacted', value: counts.contacted || 0,  color: 'text-blue-600'  },
          { label: 'Confirmed', value: counts.confirmed || 0,  color: 'text-green-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-[#f0ebe4]">
            <p className="font-body text-xs text-[#6b6b5e] uppercase tracking-widest mb-1">{s.label}</p>
            <p className={`font-display text-3xl font-semibold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['all', 'pending', 'contacted', 'confirmed', 'cancelled'].map(tab => (
          <button key={tab} onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-xl font-body text-sm font-medium transition-all capitalize
              ${filter === tab
                ? 'bg-[#2d2420] text-white shadow-sm'
                : 'bg-white text-[#6b6b5e] border border-[#e8e0d8] hover:border-[#2d2420]'}`}>
            {tab === 'all' ? `All (${bookings.length})` : `${tab} (${counts[tab] || 0})`}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-[#f0ebe4]">
          <RefreshCw size={24} className="mx-auto text-[#6b6b5e] animate-spin mb-3" />
          <p className="font-body text-sm text-[#6b6b5e]">Loading bookings…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center border border-[#f0ebe4]">
          <p className="font-display text-xl text-[#2d2420] mb-2">No bookings yet</p>
          <p className="font-body text-sm text-[#6b6b5e]">Trial form submissions will appear here in real time.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((b, i) => {
            const cfg = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending;
            return (
              <motion.div key={b.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-white rounded-2xl border border-[#f0ebe4] shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    {/* Left: identity */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-[#f5f0e8] flex items-center justify-center flex-shrink-0
                          font-display text-lg font-semibold text-[#2d2420]">
                          {b.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <h3 className="font-body font-semibold text-[#2d2420] text-base leading-tight">{b.name || '—'}</h3>
                          <span className={`inline-block text-xs font-body font-medium px-2.5 py-0.5 rounded-full border mt-0.5
                            ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                            {cfg.label}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="flex items-center gap-2 text-sm font-body text-[#6b6b5e]">
                          <Mail size={14} className="flex-shrink-0 text-[#c9a84c]" />
                          <a href={`mailto:${b.email}`} className="hover:text-[#2d2420] transition-colors truncate">{b.email || '—'}</a>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-body text-[#6b6b5e]">
                          <Phone size={14} className="flex-shrink-0 text-[#c9a84c]" />
                          <a href={`tel:${b.phone}`} className="hover:text-[#2d2420] transition-colors">{b.phone || '—'}</a>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-body text-[#6b6b5e]">
                          <Calendar size={14} className="flex-shrink-0 text-[#c9a84c]" />
                          <span>Preferred: {b.date || 'Not specified'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-body text-[#6b6b5e]">
                          <Clock size={14} className="flex-shrink-0 text-[#c9a84c]" />
                          <span>{formatDate(b.createdAt)}</span>
                        </div>
                      </div>

                      {b.message && (
                        <div className="mt-3 flex gap-2 p-3 rounded-xl bg-[#faf7f2] border border-[#f0ebe4]">
                          <MessageSquare size={14} className="flex-shrink-0 text-[#c9a84c] mt-0.5" />
                          <p className="font-body text-sm text-[#6b6b5e] leading-relaxed">{b.message}</p>
                        </div>
                      )}
                    </div>

                    {/* Right: actions */}
                    <div className="flex flex-col gap-2 min-w-[140px]">
                      {b.status !== 'contacted' && (
                        <button onClick={() => updateStatus(b.id, 'contacted')}
                          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border font-body text-sm
                            font-medium text-blue-700 border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors">
                          <Phone size={14} /> Mark Contacted
                        </button>
                      )}
                      {b.status !== 'confirmed' && (
                        <button onClick={() => updateStatus(b.id, 'confirmed')}
                          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border font-body text-sm
                            font-medium text-green-700 border-green-200 bg-green-50 hover:bg-green-100 transition-colors">
                          <CheckCircle size={14} /> Confirm Trial
                        </button>
                      )}
                      {b.status !== 'cancelled' && (
                        <button onClick={() => updateStatus(b.id, 'cancelled')}
                          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border font-body text-sm
                            font-medium text-red-600 border-red-200 bg-red-50 hover:bg-red-100 transition-colors">
                          <XCircle size={14} /> Cancel
                        </button>
                      )}
                      {b.email && (
                        <a href={`mailto:${b.email}?subject=Your Trial Session at Vigour Pilates Studio`}
                          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border font-body text-sm
                            font-medium text-[#2d2420] border-[#e8e0d8] bg-white hover:bg-[#faf7f2] transition-colors">
                          <Mail size={14} /> Reply by Email
                        </a>
                      )}
                      {confirmDelete === b.id ? (
                        <div className="flex gap-1">
                          <button onClick={() => deleteBooking(b.id)}
                            className="flex-1 flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl border font-body text-xs
                              font-semibold text-white bg-red-500 border-red-500 hover:bg-red-600 transition-colors">
                            Confirm
                          </button>
                          <button onClick={() => setConfirmDelete(null)}
                            className="px-3 py-2.5 rounded-xl border font-body text-xs text-[#6b6b5e] border-[#e8e0d8] bg-white hover:bg-[#faf7f2] transition-colors">
                            No
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => setConfirmDelete(b.id)}
                          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border font-body text-sm
                            font-medium text-[#6b6b5e] border-[#e8e0d8] bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors">
                          <Trash2 size={14} /> Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
