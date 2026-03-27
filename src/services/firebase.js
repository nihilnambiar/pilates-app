// src/services/firebase.js
// ─────────────────────────────────────────────────────────────
//  REPLACE the firebaseConfig values with your project's config
//  from: Firebase Console → Project Settings → Your Apps
// ─────────────────────────────────────────────────────────────

import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  connectAuthEmulator,
} from 'firebase/auth';
import {
  getFirestore,
  connectFirestoreEmulator,
} from 'firebase/firestore';
import {
  getStorage,
  connectStorageEmulator,
} from 'firebase/storage';

// ─── YOUR FIREBASE CONFIG ──────────────────────────────────────
// Values are read from .env.local (recommended) OR you can paste
// them directly here for quick testing.
//
// To use .env.local:
//   1. Copy .env.example → .env.local
//   2. Fill in your Firebase project values
//   3. Restart the dev server
//
// To paste directly (not recommended for production):
//   Replace import.meta.env.VITE_* with your actual values.
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY            || "YOUR_API_KEY",
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN        || "YOUR_AUTH_DOMAIN",
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID         || "YOUR_PROJECT_ID",
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET     || "YOUR_STORAGE_BUCKET",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID|| "YOUR_MESSAGING_SENDER_ID",
  appId:             import.meta.env.VITE_FIREBASE_APP_ID             || "YOUR_APP_ID",
};
// ──────────────────────────────────────────────────────────────

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Firestore
export const db = getFirestore(app);

// Storage
export const storage = getStorage(app);

// ─── OPTIONAL: Connect to local emulators during development ──
// Uncomment these when running firebase emulators locally:
//
// if (import.meta.env.DEV) {
//   connectAuthEmulator(auth, 'http://localhost:9099');
//   connectFirestoreEmulator(db, 'localhost', 8080);
//   connectStorageEmulator(storage, 'localhost', 9199);
// }

export default app;
