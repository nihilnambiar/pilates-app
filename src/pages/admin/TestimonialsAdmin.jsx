import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { CheckCircle, XCircle, Star, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_TABS = ['pending', 'published', 'rejected'];

function StarRow({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(n => (
        <Star key={n} size={13}
          fill={n <= rating ? '#c9a84c' : 'none'}
          color={n <= rating ? '#c9a84c' : '#ccc'}
          strokeWidth={1.5}/>
      ))}
    </div>
  );
}

export default function TestimonialsAdmin() {
  const [testimonials, setTestimonials] = useState([]);
  const [tab, setTab]                   = useState('pending');
  const [acting, setActing]             = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'testimonials'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setTestimonials(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const setStatus = async (id, status) => {
    setActing(id);
    try {
      await updateDoc(doc(db, 'testimonials', id), { status });
      toast.success(status === 'published' ? '✓ Published' : 'Rejected');
    } catch {
      toast.error('Failed to update');
    } finally {
      setActing(null);
    }
  };

  const filtered  = testimonials.filter(t => t.status === tab);
  const counts    = Object.fromEntries(STATUS_TABS.map(s => [s, testimonials.filter(t => t.status === s).length]));

  const tabColor = { pending: '#c9a84c', published: '#458361', rejected: '#c85a49' };
  const tabBg    = { pending: '#fdf8ec', published: '#eef6f0', rejected: '#fdf2f1' };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}>
        <h1 className="section-title text-3xl">Testimonials</h1>
        <p className="section-subtitle">Review and approve member testimonials before they go live</p>
      </motion.div>

      {/* Tab bar */}
      <div className="card">
        <div className="flex gap-3 flex-wrap">
          {STATUS_TABS.map(s => (
            <button key={s} onClick={() => setTab(s)}
              className="px-4 py-2 rounded-xl font-body text-sm font-medium transition-all"
              style={{
                background: tab === s ? tabBg[s] : 'transparent',
                color: tab === s ? tabColor[s] : '#8a7b76',
                border: `1px solid ${tab === s ? tabColor[s] + '40' : 'transparent'}`,
              }}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
              <span className="ml-2 px-1.5 py-0.5 rounded-full text-xs"
                style={{ background: tab === s ? tabColor[s] + '20' : '#f0ebe8', color: tab === s ? tabColor[s] : '#8a7b76' }}>
                {counts[s]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Testimonial cards */}
      <AnimatePresence mode="wait">
        {filtered.length === 0 ? (
          <motion.div key="empty" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="card text-center py-16">
            <div className="text-4xl mb-3">💬</div>
            <p className="font-body text-[#8a7b76]">No {tab} testimonials</p>
          </motion.div>
        ) : (
          <motion.div key={tab} initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((t, i) => (
              <motion.div key={t.id}
                initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay: i * 0.05 }}
                className="card relative">

                {/* Meta */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="font-body font-semibold text-sm text-[#2d2420]">{t.userName || 'Member'}</p>
                    <p className="font-body text-xs text-[#8a7b76]">{t.className || 'Pilates Class'}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <StarRow rating={t.rating || 5}/>
                    <span className="font-body text-[10px] text-[#8a7b76] flex items-center gap-1">
                      <Clock size={10}/>
                      {t.createdAt?.toDate ? t.createdAt.toDate().toLocaleDateString('en-IN') : '—'}
                    </span>
                  </div>
                </div>

                {/* Review text */}
                <p className="font-body text-sm text-[#4a3f3b] leading-relaxed mb-4 line-clamp-4">
                  "{t.reviewText || '(No written review)'}"
                </p>

                {/* Actions */}
                {t.status === 'pending' && (
                  <div className="flex gap-2">
                    <button onClick={() => setStatus(t.id, 'published')} disabled={acting === t.id}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-body text-sm font-semibold transition-all"
                      style={{ background:'#eef6f0', color:'#458361', border:'1px solid #c2dacc' }}>
                      <CheckCircle size={14}/> Approve
                    </button>
                    <button onClick={() => setStatus(t.id, 'rejected')} disabled={acting === t.id}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-body text-sm font-semibold transition-all"
                      style={{ background:'#fdf2f1', color:'#c85a49', border:'1px solid #f3cdc8' }}>
                      <XCircle size={14}/> Reject
                    </button>
                  </div>
                )}
                {t.status === 'published' && (
                  <div className="flex gap-2">
                    <span className="font-body text-xs px-3 py-1 rounded-full"
                      style={{ background:'#eef6f0', color:'#458361' }}>✓ Live on website</span>
                    <button onClick={() => setStatus(t.id, 'rejected')} disabled={acting === t.id}
                      className="font-body text-xs px-3 py-1 rounded-full transition-all"
                      style={{ background:'#fdf2f1', color:'#c85a49' }}>Remove</button>
                  </div>
                )}
                {t.status === 'rejected' && (
                  <div className="flex gap-2">
                    <button onClick={() => setStatus(t.id, 'published')} disabled={acting === t.id}
                      className="font-body text-xs px-3 py-1 rounded-full transition-all"
                      style={{ background:'#eef6f0', color:'#458361' }}>Restore & Publish</button>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
