// scripts/seedData.js
// ─────────────────────────────────────────────────────────────────────────────
//  Seeds Firestore with sample slots and announcements for development.
//  Run: node scripts/seedData.js
// ─────────────────────────────────────────────────────────────────────────────

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
const { addDays, format } = require('date-fns');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const ts = admin.firestore.FieldValue.serverTimestamp;

const CLASS_TYPES = ['Mat Pilates', 'Reformer Pilates', 'Barre Fusion', 'Core & Stretch', 'Power Pilates'];
const TRAINERS = ['Aria Mehta', 'Sonia Patel', 'Leena Kapoor', 'Zara Sheikh'];
const TIMES = ['07:00', '08:00', '09:30', '11:00', '17:00', '18:30', '19:30'];

const DESCRIPTIONS = {
  'Mat Pilates': 'A classic mat-based session focusing on core strength, flexibility, and body alignment.',
  'Reformer Pilates': 'Full-body resistance training using the reformer machine for deep muscle engagement.',
  'Barre Fusion': 'Ballet-inspired movement fused with Pilates for a graceful, sculpting workout.',
  'Core & Stretch': 'Targeted core activation followed by deep stretching for recovery and mobility.',
  'Power Pilates': 'High-intensity Pilates for those looking to challenge their strength and endurance.',
};

async function seed() {
  const today = new Date();
  const slotsRef = db.collection('slots');
  const annRef = db.collection('announcements');

  // ─── Slots (next 14 days) ─────────────────────────────────
  const batch = db.batch();

  for (let d = -2; d <= 14; d++) {
    const date = format(addDays(today, d), 'yyyy-MM-dd');
    // 2-3 slots per day
    const dailySlots = Math.floor(Math.random() * 2) + 2;

    for (let s = 0; s < dailySlots; s++) {
      const className = CLASS_TYPES[Math.floor(Math.random() * CLASS_TYPES.length)];
      const trainer = TRAINERS[Math.floor(Math.random() * TRAINERS.length)];
      const time = TIMES[Math.floor(Math.random() * TIMES.length)];
      const capacity = [8, 10, 12, 15][Math.floor(Math.random() * 4)];
      const bookedCount = Math.floor(Math.random() * (capacity * 0.7));

      const ref = slotsRef.doc();
      batch.set(ref, {
        className,
        trainer,
        date,
        time,
        duration: [45, 60, 75][Math.floor(Math.random() * 3)],
        capacity,
        bookedCount,
        description: DESCRIPTIONS[className] || '',
        isActive: true,
        createdAt: ts(),
      });
    }
  }

  // ─── Announcements ─────────────────────────────────────────
  const announcements = [
    {
      title: 'Welcome to Vigour! 🌸',
      message: 'We\'re so glad you\'re here. Explore our class schedule, book your first session, and start your wellness journey today.',
      type: 'general',
    },
    {
      title: 'New Class: Prenatal Pilates',
      message: 'We\'re excited to announce Prenatal Pilates classes starting next week with trainer Leena Kapoor. Safe, gentle, and nurturing for every stage.',
      type: 'event',
    },
    {
      title: 'Studio Closure – Republic Day',
      message: 'The studio will be closed on January 26th. Classes resume January 27th. Happy Republic Day! 🇮🇳',
      type: 'reminder',
    },
    {
      title: 'Monthly Leaderboard Reset',
      message: 'A new month, a fresh start! Leaderboard rankings have been reset. Let the consistency games begin — who will top the charts?',
      type: 'general',
    },
  ];

  for (const a of announcements) {
    const ref = annRef.doc();
    batch.set(ref, { ...a, isActive: true, createdAt: ts() });
  }

  await batch.commit();
  console.log('✅ Seed data committed successfully!');
  console.log(`   Slots: ~${(14 + 2) * 2.5} created across 16 days`);
  console.log(`   Announcements: ${announcements.length} created`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
