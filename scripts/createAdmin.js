// scripts/createAdmin.js
// ─────────────────────────────────────────────────────────────────────────────
//  Run this ONCE to promote an existing user to admin.
//  Prerequisites:
//    1. Install firebase-admin: npm install firebase-admin
//    2. Download your Firebase service account key from:
//       Firebase Console → Project Settings → Service Accounts → Generate Key
//    3. Save it as scripts/serviceAccountKey.json
//    4. Replace USER_UID below with the uid of the user to promote.
// ─────────────────────────────────────────────────────────────────────────────

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// ─── CONFIGURE THIS ────────────────────────────────────────────────────────
const USER_UID = 'PASTE_THE_USER_UID_HERE'; // From Firebase Auth console
const ADMIN_NAME = 'Studio Admin';
// ──────────────────────────────────────────────────────────────────────────

async function promoteToAdmin() {
  const ref = db.collection('users').doc(USER_UID);
  const snap = await ref.get();

  if (!snap.exists) {
    // Create the doc if it doesn't exist yet (e.g. created via Firebase Auth console)
    await ref.set({
      uid: USER_UID,
      name: ADMIN_NAME,
      email: 'admin@yoursite.com',
      role: 'admin',
      membershipPlan: 'Elite',
      membershipStatus: 'active',
      avatarUrl: '',
      streak: 0,
      totalAttended: 0,
      phone: '',
      bio: 'Studio administrator',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`✅ Admin user document created for uid: ${USER_UID}`);
  } else {
    await ref.update({
      role: 'admin',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`✅ User ${USER_UID} promoted to admin successfully.`);
  }

  process.exit(0);
}

promoteToAdmin().catch((err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
