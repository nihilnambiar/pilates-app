import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { collection, addDoc, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Star } from 'lucide-react';

const C = {
  forest: '#1a2e1e', gold: '#c9a84c', ivory: '#f5f0e8',
  black: '#0d0d0d', muted: '#6b5b55', border: '#e5ddd5',
};

export default function ReviewPage() {
  const [params]        = useSearchParams();
  const bookingId       = params.get('bookingId');
  const [booking, setBooking]     = useState(null);
  const [rating, setRating]       = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  useEffect(() => {
    if (!bookingId) return;
    getDoc(doc(db, 'bookings', bookingId))
      .then(snap => { if (snap.exists()) setBooking({ id: snap.id, ...snap.data() }); })
      .catch(() => {});
  }, [bookingId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { setError('Please select a rating'); return; }
    setLoading(true);
    setError('');
    try {
      await addDoc(collection(db, 'testimonials'), {
        bookingId,
        userId:     booking?.userId    || null,
        userName:   booking?.userName  || 'Member',
        className:  booking?.className || 'Pilates Class',
        rating,
        reviewText,
        status:    'pending',
        createdAt: serverTimestamp(),
      });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setError('Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const card = {
    background: '#fff', borderRadius: '20px', padding: '48px 40px',
    maxWidth: '500px', width: '100%',
    boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
  };

  if (submitted) return (
    <div style={{ minHeight:'100vh', background:C.ivory, display:'flex', alignItems:'center', justifyContent:'center', padding:'24px' }}>
      <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} style={{ ...card, textAlign:'center' }}>
        <div style={{ fontSize:'56px', marginBottom:'16px' }}>🙏</div>
        <h2 style={{ fontFamily:"'Playfair Display', serif", fontSize:'28px', color:C.forest, marginBottom:'12px' }}>
          Thank you!
        </h2>
        <p style={{ color:C.muted, fontSize:'14px', lineHeight:'1.7', marginBottom:'28px' }}>
          Your review has been submitted and is awaiting approval.<br/>
          It means the world to us — and helps other members find Vigour. 🌟
        </p>
        <Link to="/" style={{ display:'inline-block', background:C.forest, color:C.gold, padding:'12px 28px', borderRadius:'10px', textDecoration:'none', fontWeight:600, fontSize:'14px' }}>
          Back to Home
        </Link>
      </motion.div>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:C.ivory, display:'flex', alignItems:'center', justifyContent:'center', padding:'24px' }}>
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} style={card}>

        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:'32px' }}>
          <div style={{ fontSize:'40px', marginBottom:'12px' }}>⭐</div>
          <h1 style={{ fontFamily:"'Playfair Display', serif", fontSize:'26px', color:C.forest, marginBottom:'8px' }}>
            How was your class?
          </h1>
          {booking && (
            <p style={{ color:C.muted, fontSize:'14px' }}>
              {booking.className} · {booking.slotDate || booking.date || ''}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit}>

          {/* Star rating */}
          <div style={{ textAlign:'center', marginBottom:'28px' }}>
            <p style={{ color:C.black, fontWeight:600, fontSize:'14px', marginBottom:'12px' }}>Your rating</p>
            <div style={{ display:'flex', justifyContent:'center', gap:'8px' }}>
              {[1,2,3,4,5].map(n => {
                const filled = (hoverRating || rating) >= n;
                return (
                  <button key={n} type="button"
                    onClick={() => setRating(n)}
                    onMouseEnter={() => setHoverRating(n)}
                    onMouseLeave={() => setHoverRating(0)}
                    style={{ background:'none', border:'none', cursor:'pointer', padding:'4px', transition:'transform 0.15s', transform: filled ? 'scale(1.12)' : 'scale(1)' }}>
                    <Star size={34} fill={filled ? C.gold : 'none'} color={filled ? C.gold : '#ccc'} strokeWidth={1.5}/>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Review text */}
          <div style={{ marginBottom:'24px' }}>
            <label style={{ display:'block', fontWeight:600, fontSize:'14px', color:C.black, marginBottom:'8px' }}>
              Tell us more <span style={{ color:C.muted, fontWeight:400 }}>(optional)</span>
            </label>
            <textarea
              value={reviewText}
              onChange={e => setReviewText(e.target.value)}
              rows={4}
              placeholder="What did you love? How did the class make you feel?"
              style={{ width:'100%', padding:'14px 16px', borderRadius:'12px', border:`1px solid ${C.border}`, fontFamily:'DM Sans, sans-serif', fontSize:'14px', color:C.black, outline:'none', resize:'none', boxSizing:'border-box', lineHeight:'1.6' }}
              onFocus={e => e.target.style.borderColor = C.gold}
              onBlur={e => e.target.style.borderColor = C.border}
            />
          </div>

          {error && (
            <p style={{ color:'#c85a49', fontSize:'13px', marginBottom:'12px' }}>{error}</p>
          )}

          <button type="submit" disabled={loading || rating === 0}
            style={{ width:'100%', padding:'14px', background: rating === 0 ? '#ddd' : C.forest, color: rating === 0 ? '#999' : C.gold, border:'none', borderRadius:'12px', fontFamily:'DM Sans, sans-serif', fontWeight:700, fontSize:'15px', cursor: rating === 0 ? 'not-allowed' : 'pointer', transition:'all 0.2s' }}>
            {loading ? 'Submitting…' : 'Submit Review ✓'}
          </button>

          <p style={{ textAlign:'center', color:C.muted, fontSize:'12px', marginTop:'12px' }}>
            Your review will appear on our website after approval.
          </p>
        </form>
      </motion.div>
    </div>
  );
}
