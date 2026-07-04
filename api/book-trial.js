import { db, TRIAL_SLOTS, TRIAL_CAPACITY } from './_firebaseAdmin.js';
import { FieldValue } from 'firebase-admin/firestore';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, email, phone, date, time, message } = req.body || {};
  if (!name || !email || !date || !time) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  if (!TRIAL_SLOTS.includes(time)) {
    return res.status(400).json({ error: 'Invalid time slot' });
  }
  const day = new Date(date + 'T00:00:00').getDay();
  if (day === 0) return res.status(400).json({ error: 'Studio is closed on Sundays' });

  try {
    const trialRef = db.collection('trialBookings').doc();
    const studioRef = db.collection('studio_bookings').doc();

    await db.runTransaction(async (tx) => {
      const [studioSnap, trialSnap] = await Promise.all([
        tx.get(db.collection('studio_bookings').where('date', '==', date).where('time', '==', time).where('status', '==', 'confirmed')),
        tx.get(db.collection('trialBookings').where('date', '==', date).where('time', '==', time)),
      ]);

      const studioCount = studioSnap.size;
      const trialCount = trialSnap.docs.filter(d => d.data().status !== 'cancelled').length;

      if (studioCount + trialCount >= TRIAL_CAPACITY) {
        throw new Error('SLOT_FULL');
      }

      tx.set(trialRef, {
        name, email, phone: phone || '', date, time,
        message: message || '',
        status: 'pending',
        createdAt: FieldValue.serverTimestamp(),
      });

      tx.set(studioRef, {
        name, memberName: name, email,
        date, time,
        status: 'confirmed',
        isTrial: true,
        createdAt: FieldValue.serverTimestamp(),
      });
    });

    res.status(200).json({ success: true });
  } catch (err) {
    if (err.message === 'SLOT_FULL') {
      return res.status(409).json({ error: 'This slot just filled up. Please pick another time.' });
    }
    console.error('book-trial error:', err);
    res.status(500).json({ error: 'Booking failed. Please try again.' });
  }
}
