import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (!getApps().length) {
  initializeApp({
    credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
  });
}

export const db = getFirestore();

// Trial slots: Mon–Sat mornings, 3 people per batch
export const TRIAL_SLOTS = ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM'];
export const TRIAL_CAPACITY = 3;

export async function getTrialAvailability(date) {
  const counts = {};
  TRIAL_SLOTS.forEach(t => { counts[t] = 0; });

  const [studioSnap, trialSnap] = await Promise.all([
    db.collection('studio_bookings').where('date', '==', date).where('status', '==', 'confirmed').get(),
    db.collection('trialBookings').where('date', '==', date).get(),
  ]);

  studioSnap.docs.forEach(d => {
    const { time } = d.data();
    if (time in counts) counts[time] += 1;
  });
  trialSnap.docs.forEach(d => {
    const { time, status } = d.data();
    if (status === 'cancelled') return;
    if (time in counts) counts[time] += 1;
  });

  const available = {};
  TRIAL_SLOTS.forEach(t => { available[t] = Math.max(0, TRIAL_CAPACITY - counts[t]); });
  return available;
}
