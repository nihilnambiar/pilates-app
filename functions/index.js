'use strict';

const {
  onDocumentCreated,
  onDocumentUpdated,
  onDocumentDeleted,
} = require('firebase-functions/v2/firestore');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { defineSecret } = require('firebase-functions/params');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const fetch = require('node-fetch');

admin.initializeApp();
const db = admin.firestore();

// ─── Secrets (set via: firebase functions:secrets:set SECRET_NAME) ────────────
const MSG91_API_KEY      = defineSecret('MSG91_API_KEY');
const MSG91_WA_NUMBER    = defineSecret('MSG91_WA_NUMBER');     // Your MSG91 integrated WhatsApp number
const GMAIL_USER         = defineSecret('GMAIL_USER');          // Gmail address
const GMAIL_APP_PASSWORD = defineSecret('GMAIL_APP_PASSWORD'); // Gmail App Password (not account password)
const GOOGLE_CAL_SA_KEY  = defineSecret('GOOGLE_CAL_SA_KEY');  // Stringified JSON of service account key
const STUDIO_ADMIN_EMAIL = defineSecret('STUDIO_ADMIN_EMAIL'); // Studio owner email for new-booking alerts
const STUDIO_ADMIN_PHONE = defineSecret('STUDIO_ADMIN_PHONE'); // Studio owner WhatsApp for alerts

// ─── Constants ────────────────────────────────────────────────────────────────
const STUDIO_NAME    = 'Vigour Pilates Studio';
const STUDIO_ADDRESS = 'Vigour Pilates Studio, Pune, Maharashtra';
const STUDIO_WEBSITE = 'https://vigourfitnessstudio.com';

// ─── Core Helpers ─────────────────────────────────────────────────────────────

function getMailTransporter(user, pass) {
  return nodemailer.createTransport({ service: 'gmail', auth: { user, pass } });
}

function formatPhone(phone) {
  if (!phone) return null;
  const cleaned = String(phone).replace(/\D/g, '');
  if (cleaned.startsWith('91') && cleaned.length === 12) return cleaned;
  if (cleaned.length === 10) return `91${cleaned}`;
  return cleaned;
}

async function sendWhatsApp(phone, message, apiKey, waNumber) {
  const to = formatPhone(phone);
  if (!to) { console.error('Invalid phone:', phone); return; }

  const res = await fetch(
    'https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/',
    {
      method: 'POST',
      headers: { authkey: apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        integrated_number: waNumber,
        content_type: 'text',
        payload: { to, type: 'text', text: { body: message } },
      }),
    }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(`MSG91 error: ${JSON.stringify(data)}`);
  console.log('WhatsApp sent to', to);
  return data;
}

async function sendEmail(transporter, { to, subject, html, text }) {
  const info = await transporter.sendMail({
    from: `"${STUDIO_NAME}" <${transporter.options.auth.user}>`,
    to, subject, html, text,
  });
  console.log('Email sent:', info.messageId);
  return info;
}

// ─── Email HTML Templates ─────────────────────────────────────────────────────

const baseStyle = `
  <style>
    body{font-family:'Segoe UI',Arial,sans-serif;background:#f5f0e8;margin:0;padding:20px}
    .wrap{max-width:580px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)}
    .hd{background:#1a2e1e;padding:36px 32px;text-align:center}
    .hd h1{color:#c9a84c;font-size:22px;margin:0;letter-spacing:1px}
    .hd p{color:rgba(255,255,255,.65);margin:8px 0 0;font-size:13px}
    .bd{padding:32px}
    .msg{color:#6b5b55;font-size:14px;line-height:1.7;margin-bottom:20px}
    .tbl{background:#f9f6ef;border-radius:12px;padding:18px 22px;margin-bottom:20px}
    .row{display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid #ede8dc;font-size:13px}
    .row:last-child{border-bottom:none}
    .lbl{color:#8a7b76}.val{color:#2d2420;font-weight:600}
    .badge{display:inline-block;background:#e8f4ef;color:#1a2e1e;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700}
    .hi{background:#e8f4ef;border-left:4px solid #458361;padding:14px 18px;border-radius:8px;margin-bottom:20px;color:#1a2e1e;font-weight:600;font-size:14px}
    .cta{display:inline-block;background:#c9a84c;color:#1a2e1e;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;margin-top:12px}
    .ft{background:#f9f6ef;padding:18px 32px;text-align:center}
    .ft p{color:#8a7b76;font-size:11px;margin:3px 0}
  </style>
`;

function tplConfirm(b) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/>${baseStyle}</head><body>
  <div class="wrap">
    <div class="hd"><h1>${STUDIO_NAME.toUpperCase()}</h1><p>Your booking is confirmed ✓</p></div>
    <div class="bd">
      <p class="msg"><strong>Hi ${b.userName || 'there'}! 👋</strong><br/>
      Your spot is reserved. Here are your details:</p>
      <div class="tbl">
        <div class="row"><span class="lbl">Class</span><span class="val">${b.className || 'Pilates Class'}</span></div>
        <div class="row"><span class="lbl">Date</span><span class="val">${b.date || '—'}</span></div>
        <div class="row"><span class="lbl">Time</span><span class="val">${b.time || '—'}</span></div>
        <div class="row"><span class="lbl">Instructor</span><span class="val">${b.instructorName || '—'}</span></div>
        <div class="row"><span class="lbl">Location</span><span class="val">${STUDIO_ADDRESS}</span></div>
        <div class="row"><span class="lbl">Status</span><span class="val"><span class="badge">✓ Confirmed</span></span></div>
      </div>
      <p class="msg">Please arrive 5 minutes early. Wear comfortable clothes — we provide all equipment.</p>
      <center><a href="${STUDIO_WEBSITE}" class="cta">Visit Our Website</a></center>
    </div>
    <div class="ft"><p>${STUDIO_NAME} · Pune, Maharashtra</p><p>Questions? Reply to this email.</p></div>
  </div></body></html>`;
}

function tplCancel(b) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/>${baseStyle}</head><body>
  <div class="wrap">
    <div class="hd"><h1>${STUDIO_NAME.toUpperCase()}</h1><p>Booking Cancelled</p></div>
    <div class="bd">
      <p class="msg"><strong>Hi ${b.userName || 'there'},</strong><br/>
      Your booking for <strong>${b.className || 'Pilates Class'}</strong> on
      <strong>${b.date || '—'}</strong> at <strong>${b.time || '—'}</strong> has been cancelled.</p>
      <p class="msg">We hope to see you again soon. Book another class whenever you're ready 🧘‍♀️</p>
      <center><a href="${STUDIO_WEBSITE}/dashboard/book" class="cta">Book Another Class</a></center>
    </div>
    <div class="ft"><p>${STUDIO_NAME} · Pune, Maharashtra</p></div>
  </div></body></html>`;
}

function tplWaitlistPromoted(b) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/>${baseStyle}</head><body>
  <div class="wrap">
    <div class="hd"><h1>${STUDIO_NAME.toUpperCase()}</h1><p>Great news — a spot opened up! 🎉</p></div>
    <div class="bd">
      <p class="msg"><strong>Hi ${b.userName || 'there'}!</strong></p>
      <div class="hi">🎉 A spot just opened in <strong>${b.className}</strong> on ${b.date} at ${b.time}. Your booking is now <strong>confirmed!</strong></div>
      <p class="msg"><strong>Location:</strong> ${STUDIO_ADDRESS}<br/><strong>Instructor:</strong> ${b.instructorName || '—'}</p>
      <center><a href="${STUDIO_WEBSITE}/dashboard" class="cta">View My Booking</a></center>
    </div>
    <div class="ft"><p>${STUDIO_NAME} · Pune, Maharashtra</p></div>
  </div></body></html>`;
}

function tplReviewRequest(b, reviewUrl) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/>${baseStyle}</head><body>
  <div class="wrap">
    <div class="hd"><h1>${STUDIO_NAME.toUpperCase()}</h1><p>How was your class today?</p></div>
    <div class="bd" style="text-align:center">
      <div style="font-size:40px;margin-bottom:12px">⭐⭐⭐⭐⭐</div>
      <p class="msg">Hi <strong>${b.userName || 'there'}</strong>! We hope you loved your
      <strong>${b.className || 'class'}</strong> today. Your feedback helps us improve and helps
      new members discover Vigour Pilates.</p>
      <a href="${reviewUrl}" class="cta">Leave a Review — 2 minutes ✍️</a>
    </div>
    <div class="ft"><p>${STUDIO_NAME} · Pune, Maharashtra</p><p>You can also reply to this email with your thoughts.</p></div>
  </div></body></html>`;
}

// ─── Notification Dispatchers ─────────────────────────────────────────────────

async function notifyConfirmed(booking, s) {
  const { apiKey, waNumber, gmailUser, gmailPass } = s;
  const t = getMailTransporter(gmailUser, gmailPass);
  const n = booking.userName || 'Member';

  if (booking.userEmail) {
    await sendEmail(t, {
      to: booking.userEmail,
      subject: `✓ Booking Confirmed — ${booking.className} | ${STUDIO_NAME}`,
      html: tplConfirm(booking),
      text: `Hi ${n}, your booking for ${booking.className} on ${booking.date} at ${booking.time} is confirmed!`,
    }).catch(e => console.error('Confirm email error:', e.message));
  }

  if (booking.userPhone && apiKey && waNumber) {
    const msg = `Hi ${n}! 🙏 Your booking at *${STUDIO_NAME}* is confirmed!\n\n📌 *${booking.className || 'Pilates Class'}*\n📅 ${booking.date || '—'}\n⏰ ${booking.time || '—'}\n👤 Instructor: ${booking.instructorName || '—'}\n📍 ${STUDIO_ADDRESS}\n\nSee you soon! 🧘‍♀️`;
    await sendWhatsApp(booking.userPhone, msg, apiKey, waNumber)
      .catch(e => console.error('Confirm WhatsApp error:', e.message));
  }
}

async function notifyCancelled(booking, s) {
  const { apiKey, waNumber, gmailUser, gmailPass } = s;
  const t = getMailTransporter(gmailUser, gmailPass);
  const n = booking.userName || 'Member';

  if (booking.userEmail) {
    await sendEmail(t, {
      to: booking.userEmail,
      subject: `Booking Cancelled — ${booking.className} | ${STUDIO_NAME}`,
      html: tplCancel(booking),
      text: `Hi ${n}, your booking for ${booking.className} has been cancelled. We hope to see you soon!`,
    }).catch(e => console.error('Cancel email error:', e.message));
  }

  if (booking.userPhone && apiKey && waNumber) {
    const msg = `Hi ${n}, your booking for *${booking.className || 'Pilates Class'}* on ${booking.date} has been cancelled.\n\nWe hope to see you again soon! 🙏\nBook again: ${STUDIO_WEBSITE}/dashboard/book`;
    await sendWhatsApp(booking.userPhone, msg, apiKey, waNumber)
      .catch(e => console.error('Cancel WhatsApp error:', e.message));
  }
}

async function notifyWaitlistPromoted(entry, slot, bookingId, s) {
  const { apiKey, waNumber, gmailUser, gmailPass } = s;
  const t = getMailTransporter(gmailUser, gmailPass);
  const b = {
    id: bookingId, userName: entry.userName, userEmail: entry.userEmail,
    userPhone: entry.userPhone, className: slot.className,
    date: slot.date, time: slot.time, instructorName: slot.trainer,
  };

  if (entry.userEmail) {
    await sendEmail(t, {
      to: entry.userEmail,
      subject: `🎉 Spot Available! Confirmed — ${slot.className} | ${STUDIO_NAME}`,
      html: tplWaitlistPromoted(b),
      text: `Great news ${entry.userName}! A spot opened in ${slot.className}. Your booking is confirmed!`,
    }).catch(e => console.error('Waitlist email error:', e.message));
  }

  if (entry.userPhone && apiKey && waNumber) {
    const msg = `🎉 Great news ${entry.userName}! A spot just opened in *${slot.className}* on ${slot.date} at ${slot.time}. *Your booking is now confirmed!*\n\n📍 ${STUDIO_ADDRESS}\n\nSee you there! 🧘‍♀️`;
    await sendWhatsApp(entry.userPhone, msg, apiKey, waNumber)
      .catch(e => console.error('Waitlist WhatsApp error:', e.message));
  }
}

async function notifyAdmin(subject, body, s) {
  const { gmailUser, gmailPass, adminEmail, adminPhone, apiKey, waNumber } = s;
  const t = getMailTransporter(gmailUser, gmailPass);

  if (adminEmail) {
    await sendEmail(t, { to: adminEmail, subject, html: `<p>${body.replace(/\n/g, '<br/>')}</p>`, text: body })
      .catch(e => console.error('Admin email error:', e.message));
  }
  if (adminPhone && apiKey && waNumber) {
    await sendWhatsApp(adminPhone, body, apiKey, waNumber)
      .catch(e => console.error('Admin WhatsApp error:', e.message));
  }
}

// ─── Google Calendar Helpers ──────────────────────────────────────────────────

async function getCalendar(saKeyJson) {
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(saKeyJson),
    scopes: ['https://www.googleapis.com/auth/calendar'],
  });
  return google.calendar({ version: 'v3', auth });
}

function slotToEvent(slot) {
  const [y, m, d]   = (slot.date || '').split('-').map(Number);
  const [hr, min]   = (slot.time || '00:00').split(':').map(Number);
  const duration    = slot.duration || 60;
  const start       = new Date(y, m - 1, d, hr, min);
  const end         = new Date(start.getTime() + duration * 60000);
  return {
    summary: `${slot.className || 'Pilates Class'} — ${STUDIO_NAME}`,
    location: STUDIO_ADDRESS,
    description: `Instructor: ${slot.trainer || '—'}\nCapacity: ${slot.capacity}`,
    start: { dateTime: start.toISOString(), timeZone: 'Asia/Kolkata' },
    end:   { dateTime: end.toISOString(),   timeZone: 'Asia/Kolkata' },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// SYSTEM 1 — AUTO CONFIRM + NOTIFICATIONS (bookings/{bookingId})
// ─────────────────────────────────────────────────────────────────────────────

exports.onBookingCreated = onDocumentCreated(
  {
    document: 'bookings/{bookingId}',
    secrets: [MSG91_API_KEY, MSG91_WA_NUMBER, GMAIL_USER, GMAIL_APP_PASSWORD, STUDIO_ADMIN_EMAIL, STUDIO_ADMIN_PHONE],
  },
  async (event) => {
    const bookingId = event.params.bookingId;
    const raw       = event.data.data();
    try {
      // Fetch user data to enrich booking
      let user = {};
      if (raw.userId) {
        const snap = await db.collection('users').doc(raw.userId).get();
        if (snap.exists) user = snap.data();
      }

      const booking = {
        id:             bookingId,
        userName:       raw.userName       || user.name  || 'Member',
        userEmail:      raw.userEmail      || user.email || null,
        userPhone:      raw.userPhone      || user.phone || null,
        className:      raw.className      || 'Pilates Class',
        date:           raw.date           || raw.slotDate || '—',
        time:           raw.time           || raw.slotTime || '—',
        instructorName: raw.instructorName || raw.trainer  || '—',
        status:         raw.status,
      };

      // Auto-confirm if pending
      if (raw.status === 'pending') {
        await db.collection('bookings').doc(bookingId).update({ status: 'confirmed' });
        booking.status = 'confirmed';
      }

      if (booking.status === 'confirmed' || raw.status === 'pending') {
        const s = {
          apiKey: MSG91_API_KEY.value(), waNumber: MSG91_WA_NUMBER.value(),
          gmailUser: GMAIL_USER.value(), gmailPass: GMAIL_APP_PASSWORD.value(),
        };
        await notifyConfirmed(booking, s);

        // Alert admin
        const adminBody = `New booking:\nName: ${booking.userName}\nClass: ${booking.className}\nDate: ${booking.date}\nTime: ${booking.time}\nEmail: ${booking.userEmail || '—'}\nPhone: ${booking.userPhone || '—'}`;
        await notifyAdmin(`New Booking: ${booking.userName} — ${booking.className}`, adminBody, {
          ...s, adminEmail: STUDIO_ADMIN_EMAIL.value(), adminPhone: STUDIO_ADMIN_PHONE.value(),
        });
      }
    } catch (err) {
      console.error('onBookingCreated error:', err);
    }
  }
);

// Trial form submissions (public, unauthenticated → trialBookings collection)
exports.onTrialBookingCreated = onDocumentCreated(
  {
    document: 'trialBookings/{id}',
    secrets: [MSG91_API_KEY, MSG91_WA_NUMBER, GMAIL_USER, GMAIL_APP_PASSWORD, STUDIO_ADMIN_EMAIL, STUDIO_ADMIN_PHONE],
  },
  async (event) => {
    const id  = event.params.id;
    const raw = event.data.data();
    try {
      await db.collection('trialBookings').doc(id).update({ status: 'confirmed' });

      const booking = {
        id, userName: raw.name, userEmail: raw.email, userPhone: raw.phone,
        className: 'Trial Session', date: raw.date || 'Date to be confirmed',
        time: '—', instructorName: 'Our Team', status: 'confirmed',
      };

      const s = {
        apiKey: MSG91_API_KEY.value(), waNumber: MSG91_WA_NUMBER.value(),
        gmailUser: GMAIL_USER.value(), gmailPass: GMAIL_APP_PASSWORD.value(),
      };
      await notifyConfirmed(booking, s);

      const adminBody = `New trial request:\nName: ${raw.name}\nEmail: ${raw.email}\nPhone: ${raw.phone}\nDate: ${raw.date || '—'}\nNotes: ${raw.message || '—'}`;
      await notifyAdmin(`New Trial Request: ${raw.name}`, adminBody, {
        ...s, adminEmail: STUDIO_ADMIN_EMAIL.value(), adminPhone: STUDIO_ADMIN_PHONE.value(),
      });
    } catch (err) {
      console.error('onTrialBookingCreated error:', err);
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// SYSTEM 1b — CANCELLATIONS + SYSTEM 2 WAITLIST CHECK
// ─────────────────────────────────────────────────────────────────────────────

exports.onBookingUpdated = onDocumentUpdated(
  {
    document: 'bookings/{bookingId}',
    secrets: [MSG91_API_KEY, MSG91_WA_NUMBER, GMAIL_USER, GMAIL_APP_PASSWORD],
  },
  async (event) => {
    const before = event.data.before.data();
    const after  = event.data.after.data();

    // Only act on cancellation transitions
    if (before.status === after.status || after.status !== 'cancelled') return;

    const bookingId = event.params.bookingId;
    try {
      let user = {};
      if (after.userId) {
        const snap = await db.collection('users').doc(after.userId).get();
        if (snap.exists) user = snap.data();
      }

      const booking = {
        id: bookingId,
        userName:  after.userName  || user.name  || 'Member',
        userEmail: after.userEmail || user.email || null,
        userPhone: after.userPhone || user.phone || null,
        className: after.className || 'Pilates Class',
        date: after.date || after.slotDate || '—',
        time: after.time || after.slotTime || '—',
      };

      const s = {
        apiKey: MSG91_API_KEY.value(), waNumber: MSG91_WA_NUMBER.value(),
        gmailUser: GMAIL_USER.value(), gmailPass: GMAIL_APP_PASSWORD.value(),
      };

      await notifyCancelled(booking, s);

      // ── SYSTEM 2: Waitlist check ───────────────────────────────────────────
      const slotId = after.slotId;
      if (!slotId) return;

      const slotRef  = db.collection('slots').doc(slotId);
      const slotSnap = await slotRef.get();
      if (!slotSnap.exists) return;

      const slot      = slotSnap.data();
      const waitlist  = slot.waitlist || [];
      if (waitlist.length === 0) return;

      // Promote the first person on the waitlist
      const promoted    = waitlist[0];
      const newWaitlist = waitlist.slice(1);
      const newRef      = db.collection('bookings').doc();

      await db.runTransaction(async (tx) => {
        tx.set(newRef, {
          userId:    promoted.userId || null,
          userName:  promoted.userName,
          userEmail: promoted.userEmail,
          userPhone: promoted.userPhone,
          slotId,
          slotDate:  slot.date,
          slotTime:  slot.time,
          trainer:   slot.trainer,
          className: slot.className,
          status:    'confirmed',
          fromWaitlist: true,
          bookedAt:  admin.firestore.FieldValue.serverTimestamp(),
        });
        // Remove from waitlist; keep bookedCount stable (cancel decremented, we now re-fill the seat)
        tx.update(slotRef, {
          waitlist: newWaitlist,
          bookedCount: Math.min((slot.bookedCount || 0) + 1, slot.capacity),
        });
      });

      await notifyWaitlistPromoted(promoted, slot, newRef.id, s);
      console.log(`Waitlist: promoted ${promoted.userName} → booking ${newRef.id}`);
    } catch (err) {
      console.error('onBookingUpdated error:', err);
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// SYSTEM 3 — GOOGLE CALENDAR SYNC (slots/{slotId})
// ─────────────────────────────────────────────────────────────────────────────

exports.onSlotCreated = onDocumentCreated(
  { document: 'slots/{slotId}', secrets: [GOOGLE_CAL_SA_KEY] },
  async (event) => {
    const saKey = GOOGLE_CAL_SA_KEY.value();
    if (!saKey || saKey === 'NOT_SET') return;

    const slotId = event.params.slotId;
    const slot   = event.data.data();
    try {
      const cal = await getCalendar(saKey);

      // Get instructor calendar if exists
      let calendarId = 'primary';
      if (slot.instructorId) {
        const inst = await db.collection('instructors').doc(slot.instructorId).get();
        if (inst.exists && inst.data().calendarId) calendarId = inst.data().calendarId;
      }

      const res = await cal.events.insert({ calendarId, requestBody: slotToEvent(slot) });
      await db.collection('slots').doc(slotId).update({
        googleEventId: res.data.id,
        googleCalendarId: calendarId,
      });
      console.log(`Calendar event created: ${res.data.id}`);
    } catch (err) {
      console.error('onSlotCreated calendar error:', err.message);
    }
  }
);

exports.onSlotUpdated = onDocumentUpdated(
  { document: 'slots/{slotId}', secrets: [GOOGLE_CAL_SA_KEY] },
  async (event) => {
    const saKey = GOOGLE_CAL_SA_KEY.value();
    if (!saKey || saKey === 'NOT_SET') return;

    const before = event.data.before.data();
    const after  = event.data.after.data();

    // Only sync if class-relevant fields changed
    const fields = ['date', 'time', 'className', 'trainer', 'duration'];
    if (!fields.some(k => before[k] !== after[k])) return;

    const { googleEventId, googleCalendarId = 'primary' } = after;
    if (!googleEventId) return;

    try {
      const cal = await getCalendar(saKey);
      await cal.events.patch({ calendarId: googleCalendarId, eventId: googleEventId, requestBody: slotToEvent(after) });
      console.log(`Calendar event updated: ${googleEventId}`);
    } catch (err) {
      console.error('onSlotUpdated calendar error:', err.message);
    }
  }
);

exports.onSlotDeleted = onDocumentDeleted(
  { document: 'slots/{slotId}', secrets: [GOOGLE_CAL_SA_KEY] },
  async (event) => {
    const saKey = GOOGLE_CAL_SA_KEY.value();
    if (!saKey || saKey === 'NOT_SET') return;

    const { googleEventId, googleCalendarId = 'primary' } = event.data.data();
    if (!googleEventId) return;

    try {
      const cal = await getCalendar(saKey);
      await cal.events.delete({ calendarId: googleCalendarId, eventId: googleEventId });
      console.log(`Calendar event deleted: ${googleEventId}`);
    } catch (err) {
      console.error('onSlotDeleted calendar error:', err.message);
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// SYSTEM 4 — REVIEW REQUESTS (scheduled daily 8 PM IST = 14:30 UTC)
// ─────────────────────────────────────────────────────────────────────────────

exports.sendReviewRequests = onSchedule(
  {
    schedule: '30 14 * * *',
    timeZone: 'Asia/Kolkata',
    secrets: [MSG91_API_KEY, MSG91_WA_NUMBER, GMAIL_USER, GMAIL_APP_PASSWORD],
  },
  async () => {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    try {
      const snap = await db.collection('bookings')
        .where('slotDate', '==', today)
        .where('status',   '==', 'confirmed')
        .where('reviewRequested', '!=', true)
        .get();

      if (snap.empty) { console.log('No review requests needed for', today); return; }

      const s = {
        apiKey: MSG91_API_KEY.value(), waNumber: MSG91_WA_NUMBER.value(),
        gmailUser: GMAIL_USER.value(), gmailPass: GMAIL_APP_PASSWORD.value(),
      };
      const t       = getMailTransporter(s.gmailUser, s.gmailPass);
      const batch   = db.batch();

      for (const docSnap of snap.docs) {
        const raw = { id: docSnap.id, ...docSnap.data() };

        let user = {};
        if (raw.userId) {
          const u = await db.collection('users').doc(raw.userId).get();
          if (u.exists) user = u.data();
        }

        const name       = raw.userName  || user.name  || 'there';
        const email      = raw.userEmail || user.email || null;
        const phone      = raw.userPhone || user.phone || null;
        const reviewUrl  = `${STUDIO_WEBSITE}/review?bookingId=${raw.id}`;
        const booking    = { ...raw, userName: name };

        if (email) {
          await sendEmail(t, {
            to: email,
            subject: `How was your class today? 🌟 | ${STUDIO_NAME}`,
            html: tplReviewRequest(booking, reviewUrl),
            text: `Hi ${name}! How was your ${raw.className || 'class'} today? Leave a review: ${reviewUrl}`,
          }).catch(e => console.error('Review email error:', e.message));
        }

        if (phone && s.apiKey && s.waNumber) {
          const msg = `Hi ${name}! 🙏 How was your *${raw.className || 'class'}* today at Vigour?\n\nLeave us a quick review (2 mins):\n👉 ${reviewUrl}\n\nThank you! 🧘‍♀️`;
          await sendWhatsApp(phone, msg, s.apiKey, s.waNumber)
            .catch(e => console.error('Review WhatsApp error:', e.message));
        }

        batch.update(docSnap.ref, { reviewRequested: true });
      }

      await batch.commit();
      console.log(`Review requests sent for ${snap.size} bookings on ${today}`);
    } catch (err) {
      console.error('sendReviewRequests error:', err);
    }
  }
);
