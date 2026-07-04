import { getTrialAvailability, TRIAL_SLOTS } from './_firebaseAdmin.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { date } = req.query;
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: 'Invalid date' });
  }

  // Studio closed Sundays
  const day = new Date(date + 'T00:00:00').getDay();
  if (day === 0) return res.status(200).json({ slots: {}, closed: true });

  const slots = await getTrialAvailability(date);
  res.status(200).json({ slots, order: TRIAL_SLOTS, closed: false });
}
