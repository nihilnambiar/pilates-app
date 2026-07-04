// src/pages/admin/QuizResultsAdmin.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, onSnapshot, orderBy, query, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Mail, RefreshCw, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const CLASS_COLORS = {
  reformer: '#c9a84c', mat: '#7db87a', barre: '#f472b6',
  power: '#e87a4a',    restore: '#38bdf8', prenatal: '#c084fc',
};
const CLASS_LABELS = {
  reformer: 'Reformer', mat: 'Mat Pilates', barre: 'Barre',
  power: 'Power',       restore: 'Core & Restore', prenatal: 'Prenatal',
};

export default function QuizResultsAdmin() {
  const [results, setResults]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [filter, setFilter]             = useState('all');
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'quizResults'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setResults(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  const deleteResult = async (id) => {
    try {
      await deleteDoc(doc(db, 'quizResults', id));
      toast.success('Record deleted');
      setConfirmDelete(null);
    } catch {
      toast.error('Delete failed');
    }
  };

  const filtered = filter === 'all' ? results : results.filter(r => r.topClass === filter);

  const counts = results.reduce((acc, r) => {
    acc[r.topClass] = (acc[r.topClass] || 0) + 1;
    return acc;
  }, {});

  const formatDate = (ts) => {
    if (!ts) return '—';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold text-[#2d2420]">Quiz Results</h1>
        <p className="font-body text-sm text-[#6b6b5e] mt-1">See what classes your website visitors are being matched with</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {Object.entries(CLASS_LABELS).map(([key, label]) => (
          <div key={key} className="bg-white rounded-2xl p-4 shadow-sm border border-[#f0ebe4]">
            <div className="w-3 h-3 rounded-full mb-2" style={{ background: CLASS_COLORS[key] }} />
            <p className="font-body text-xs text-[#6b6b5e] mb-1">{label}</p>
            <p className="font-display text-2xl font-semibold text-[#2d2420]">{counts[key] || 0}</p>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#f0ebe4] mb-6 inline-flex items-center gap-3">
        <span className="font-body text-sm text-[#6b6b5e]">Total responses:</span>
        <span className="font-display text-2xl font-semibold text-[#2d2420]">{results.length}</span>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl font-body text-sm font-medium transition-all
            ${filter === 'all' ? 'bg-[#2d2420] text-white' : 'bg-white text-[#6b6b5e] border border-[#e8e0d8] hover:border-[#2d2420]'}`}>
          All ({results.length})
        </button>
        {Object.entries(CLASS_LABELS).map(([key, label]) => (
          <button key={key} onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-xl font-body text-sm font-medium transition-all
              ${filter === key ? 'text-white' : 'bg-white text-[#6b6b5e] border border-[#e8e0d8]'}`}
            style={filter === key ? { background: CLASS_COLORS[key] } : {}}>
            {label} ({counts[key] || 0})
          </button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-[#f0ebe4]">
          <RefreshCw size={24} className="mx-auto text-[#6b6b5e] animate-spin mb-3" />
          <p className="font-body text-sm text-[#6b6b5e]">Loading results…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center border border-[#f0ebe4]">
          <p className="font-display text-xl text-[#2d2420] mb-2">No quiz results yet</p>
          <p className="font-body text-sm text-[#6b6b5e]">Results appear here when visitors complete the quiz and enter their email.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r, i) => {
            const color = CLASS_COLORS[r.topClass] || '#c9a84c';
            const label = CLASS_LABELS[r.topClass] || r.topClass;
            return (
              <motion.div key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-white rounded-2xl border border-[#f0ebe4] shadow-sm p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-display text-lg font-semibold text-white"
                      style={{ background: color }}>
                      {r.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="font-body font-semibold text-[#2d2420]">{r.name || '—'}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Mail size={12} className="text-[#6b6b5e]" />
                        <a href={`mailto:${r.email}`} className="font-body text-xs text-[#6b6b5e] hover:text-[#2d2420]">{r.email}</a>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-body font-semibold px-3 py-1.5 rounded-full text-white"
                      style={{ background: color }}>
                      {label}
                    </span>
                    <span className="font-body text-xs text-[#6b6b5e]">{formatDate(r.createdAt)}</span>
                    {confirmDelete === r.id ? (
                      <div className="flex gap-1">
                        <button onClick={() => deleteResult(r.id)}
                          className="px-3 py-1.5 rounded-xl font-body text-xs font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors">
                          Confirm
                        </button>
                        <button onClick={() => setConfirmDelete(null)}
                          className="px-3 py-1.5 rounded-xl font-body text-xs text-[#6b6b5e] border border-[#e8e0d8] bg-white hover:bg-[#faf7f2] transition-colors">
                          No
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmDelete(r.id)}
                        className="p-1.5 rounded-lg text-[#aaa] hover:text-red-500 hover:bg-red-50 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {r.analysis && (
                  <details className="mt-3">
                    <summary className="font-body text-xs text-[#6b6b5e] cursor-pointer hover:text-[#2d2420]">View AI analysis ↓</summary>
                    <p className="font-body text-sm text-[#6b6b5e] mt-2 leading-relaxed bg-[#faf7f2] rounded-xl p-3">
                      {r.analysis.replace(/\*\*/g, '')}
                    </p>
                  </details>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
