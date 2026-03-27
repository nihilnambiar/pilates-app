// src/services/slotService.js
// All slot and booking Firestore operations

import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  runTransaction,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { format, startOfMonth, endOfMonth } from 'date-fns';

// ─── Slots ─────────────────────────────────────────────────────

export const createSlot = async (slotData) => {
  return await addDoc(collection(db, 'slots'), {
    ...slotData,
    bookedCount: 0,
    isActive: true,
    createdAt: serverTimestamp(),
  });
};

export const updateSlot = async (slotId, data) => {
  await updateDoc(doc(db, 'slots', slotId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const deleteSlot = async (slotId) => {
  await deleteDoc(doc(db, 'slots', slotId));
};

export const getSlots = async (dateStr) => {
  // dateStr = 'YYYY-MM-DD'
  const q = dateStr
    ? query(
        collection(db, 'slots'),
        where('date', '==', dateStr),
        where('isActive', '==', true),
        orderBy('time', 'asc')
      )
    : query(
        collection(db, 'slots'),
        where('isActive', '==', true),
        orderBy('date', 'asc'),
        orderBy('time', 'asc')
      );

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getAllSlotsAdmin = async () => {
  const q = query(
    collection(db, 'slots'),
    orderBy('date', 'desc'),
    orderBy('time', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// ─── Bookings ──────────────────────────────────────────────────

export const bookSlot = async (userId, slotId) => {
  const slotRef = doc(db, 'slots', slotId);
  const bookingsRef = collection(db, 'bookings');

  return await runTransaction(db, async (tx) => {
    const slotSnap = await tx.get(slotRef);
    if (!slotSnap.exists()) throw new Error('Slot not found');

    const slot = slotSnap.data();
    if (slot.bookedCount >= slot.capacity) throw new Error('Class is fully booked');

    // Check duplicate
    const dupQ = query(
      bookingsRef,
      where('userId', '==', userId),
      where('slotId', '==', slotId),
      where('status', '==', 'confirmed')
    );
    const dupSnap = await getDocs(dupQ);
    if (!dupSnap.empty) throw new Error('You have already booked this class');

    // Create booking
    const bookingRef = doc(bookingsRef);
    tx.set(bookingRef, {
      userId,
      slotId,
      slotDate: slot.date,
      slotTime: slot.time,
      trainer: slot.trainer,
      className: slot.className,
      status: 'confirmed',
      bookedAt: serverTimestamp(),
    });

    // Increment bookedCount
    tx.update(slotRef, { bookedCount: slot.bookedCount + 1 });

    return bookingRef.id;
  });
};

export const cancelBooking = async (bookingId, slotId) => {
  const bookingRef = doc(db, 'bookings', bookingId);
  const slotRef = doc(db, 'slots', slotId);

  return await runTransaction(db, async (tx) => {
    const slotSnap = await tx.get(slotRef);

    tx.update(bookingRef, { status: 'cancelled', cancelledAt: serverTimestamp() });

    if (slotSnap.exists()) {
      const current = slotSnap.data().bookedCount;
      tx.update(slotRef, { bookedCount: Math.max(0, current - 1) });
    }
  });
};

export const getUserBookings = async (userId) => {
  const q = query(
    collection(db, 'bookings'),
    where('userId', '==', userId),
    orderBy('bookedAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getAllBookings = async () => {
  const q = query(collection(db, 'bookings'), orderBy('bookedAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getBookingsForSlot = async (slotId) => {
  const q = query(
    collection(db, 'bookings'),
    where('slotId', '==', slotId),
    where('status', '==', 'confirmed')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// ─── Attendance ────────────────────────────────────────────────

export const markAttendance = async (bookingId, userId, slotId, attended, adminId) => {
  // Upsert attendance record
  const attQ = query(
    collection(db, 'attendance'),
    where('bookingId', '==', bookingId)
  );
  const attSnap = await getDocs(attQ);

  if (attSnap.empty) {
    await addDoc(collection(db, 'attendance'), {
      bookingId,
      userId,
      slotId,
      attended,
      markedBy: adminId,
      markedAt: serverTimestamp(),
    });
  } else {
    await updateDoc(doc(db, 'attendance', attSnap.docs[0].id), {
      attended,
      markedBy: adminId,
      markedAt: serverTimestamp(),
    });
  }

  // Update booking status
  await updateDoc(doc(db, 'bookings', bookingId), {
    attended,
    attendanceMarked: true,
  });

  // Update user totalAttended
  if (attended) {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const current = userSnap.data().totalAttended || 0;
      await updateDoc(userRef, { totalAttended: current + 1 });
    }
  }
};

export const getUserAttendance = async (userId) => {
  const q = query(
    collection(db, 'attendance'),
    where('userId', '==', userId)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getMonthlyAttendance = async (userId) => {
  const now = new Date();
  const monthStr = format(now, 'yyyy-MM');

  const bookingsSnap = await getDocs(
    query(
      collection(db, 'bookings'),
      where('userId', '==', userId),
      where('status', '==', 'confirmed')
    )
  );

  const bookings = bookingsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return bookings.filter(
    (b) => b.slotDate && b.slotDate.startsWith(monthStr) && b.attended === true
  );
};

// ─── Announcements ─────────────────────────────────────────────

export const createAnnouncement = async (data) => {
  return await addDoc(collection(db, 'announcements'), {
    ...data,
    createdAt: serverTimestamp(),
    isActive: true,
  });
};

export const getAnnouncements = async () => {
  const q = query(
    collection(db, 'announcements'),
    where('isActive', '==', true),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const deleteAnnouncement = async (id) => {
  await updateDoc(doc(db, 'announcements', id), { isActive: false });
};

// ─── Leaderboard ───────────────────────────────────────────────

export const getLeaderboard = async () => {
  const now = new Date();
  const monthStr = format(now, 'yyyy-MM');

  // Get all confirmed + attended bookings this month
  const snap = await getDocs(
    query(
      collection(db, 'bookings'),
      where('status', '==', 'confirmed'),
      where('attended', '==', true)
    )
  );

  const bookings = snap.docs
    .map((d) => d.data())
    .filter((b) => b.slotDate && b.slotDate.startsWith(monthStr));

  // Tally per user
  const tally = {};
  bookings.forEach((b) => {
    tally[b.userId] = (tally[b.userId] || 0) + 1;
  });

  // Fetch user names
  const usersSnap = await getDocs(collection(db, 'users'));
  const users = {};
  usersSnap.docs.forEach((d) => {
    users[d.id] = d.data();
  });

  const board = Object.entries(tally)
    .map(([uid, count]) => ({
      uid,
      name: users[uid]?.name || 'Unknown',
      avatarUrl: users[uid]?.avatarUrl || '',
      count,
      streak: users[uid]?.streak || 0,
    }))
    .sort((a, b) => b.count - a.count);

  return board;
};

// ─── Users (admin) ─────────────────────────────────────────────

export const getAllUsers = async () => {
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const updateUserProfile = async (uid, data) => {
  await updateDoc(doc(db, 'users', uid), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const updateUserMembership = async (uid, plan, status) => {
  await updateDoc(doc(db, 'users', uid), {
    membershipPlan: plan,
    membershipStatus: status,
    updatedAt: serverTimestamp(),
  });
};
