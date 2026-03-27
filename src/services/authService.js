// src/services/authService.js
// All authentication operations wrapped cleanly

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from './firebase';

// ─── Register new user ─────────────────────────────────────────
export const registerUser = async ({ name, email, password }) => {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });

  // Create user doc in Firestore
  await setDoc(doc(db, 'users', cred.user.uid), {
    uid: cred.user.uid,
    name,
    email,
    role: 'user',
    membershipPlan: 'Basic',
    membershipStatus: 'active',
    avatarUrl: '',
    streak: 0,
    totalAttended: 0,
    phone: '',
    bio: '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return cred.user;
};

// ─── Login ────────────────────────────────────────────────────
export const loginUser = async ({ email, password }) => {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
};

// ─── Google Sign-In ───────────────────────────────────────────
export const signInWithGoogle = async () => {
  const cred = await signInWithPopup(auth, googleProvider);
  const userRef = doc(db, 'users', cred.user.uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    await setDoc(userRef, {
      uid: cred.user.uid,
      name: cred.user.displayName || 'Member',
      email: cred.user.email,
      role: 'user',
      membershipPlan: 'Basic',
      membershipStatus: 'active',
      avatarUrl: cred.user.photoURL || '',
      streak: 0,
      totalAttended: 0,
      phone: '',
      bio: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  return cred.user;
};

// ─── Logout ───────────────────────────────────────────────────
export const logoutUser = () => signOut(auth);

// ─── Password Reset ───────────────────────────────────────────
export const resetPassword = (email) => sendPasswordResetEmail(auth, email);

// ─── Get user profile from Firestore ─────────────────────────
export const getUserProfile = async (uid) => {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
};
