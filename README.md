# 🌸 Vigour — Premium Pilates Studio App

A full-stack Pilates booking application with user authentication, class booking, attendance tracking, a monthly leaderboard, and a powerful admin panel.

**Stack:** React + Vite · Tailwind CSS · Framer Motion · Firebase (Auth + Firestore)

---

## ✨ Features

### User Side
- 🔐 Email/password + Google sign-in, forgot password
- 📊 Dashboard with stats, upcoming classes, announcements
- 🗓️ Date-picker class booking (14-day window)
- ✅ Overbooking prevention & duplicate booking prevention
- 📋 Attendance history with monthly bar chart
- 🏆 Live leaderboard with podium + medals
- 👤 Profile page with editable bio, membership card
- 🔥 Streak tracking + achievement badges
- 💬 Motivational daily quotes
- 📱 Fully responsive — mobile bottom nav, desktop sidebar

### Admin Side
- 🛡️ Role-based access (admin routes fully protected)
- 📈 Overview dashboard: total members, bookings, attendance, occupancy rate
- 🗓️ Slot management: create / edit / delete class slots
- 👥 User management: view all members, update membership plan/status
- 📋 Bookings view: filterable table of all bookings
- ✅ Attendance marking: per-session present/absent marking
- 📢 Announcements: post/delete studio-wide updates
- 🔍 Search across users and bookings

---

## 📁 Project Structure

```
vigour-pilates/
├── public/
│   └── favicon.svg
├── scripts/
│   ├── createAdmin.js          # One-time admin promotion script
│   └── seedData.js             # Sample data seeder
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AdminLayout.jsx     # Admin dark sidebar + layout
│   │   │   ├── MobileNav.jsx       # Mobile slide-out drawer
│   │   │   ├── Sidebar.jsx         # Desktop collapsible sidebar
│   │   │   ├── TopBar.jsx          # Mobile top bar
│   │   │   └── UserLayout.jsx      # User layout wrapper
│   │   └── shared/
│   │       ├── Avatar.jsx          # Avatar with initials fallback
│   │       ├── EmptyState.jsx      # Empty state component
│   │       ├── LoadingScreen.jsx   # Full-page loading splash
│   │       ├── Modal.jsx           # Modal + ConfirmModal
│   │       ├── ProtectedRoute.jsx  # Auth guards
│   │       └── Skeletons.jsx       # Loading skeleton components
│   ├── context/
│   │   └── AuthContext.jsx         # Global auth + profile state
│   ├── hooks/
│   │   └── useBookings.js          # Bookings data hook
│   ├── pages/
│   │   ├── AuthPage.jsx            # Login / Signup / Forgot
│   │   ├── admin/
│   │   │   ├── AdminDashboard.jsx  # Admin overview + stats
│   │   │   ├── Announcements.jsx   # Post/manage announcements
│   │   │   ├── AttendanceManagement.jsx
│   │   │   ├── BookingsView.jsx    # All bookings table
│   │   │   ├── SlotManagement.jsx  # CRUD class slots
│   │   │   └── UserManagement.jsx  # View/edit members
│   │   └── user/
│   │       ├── Attendance.jsx      # User attendance + progress
│   │       ├── BookClass.jsx       # Slot browser + booking UI
│   │       ├── Dashboard.jsx       # User home dashboard
│   │       ├── Leaderboard.jsx     # Monthly rankings + podium
│   │       └── Profile.jsx         # Profile + membership card
│   ├── services/
│   │   ├── authService.js          # Firebase Auth operations
│   │   ├── firebase.js             # Firebase initialization
│   │   └── slotService.js          # All Firestore operations
│   ├── utils/
│   │   └── helpers.js              # Date formatting, badges, quotes
│   ├── App.jsx                     # Route definitions
│   ├── index.css                   # Tailwind + custom design system
│   └── main.jsx                    # React entry point
├── firestore.rules                 # Security rules
├── tailwind.config.js
├── vite.config.js
└── package.json
```

---

## 🚀 Setup & Installation

### Step 1 — Clone / download the project

```bash
cd vigour-pilates
npm install
```

### Step 2 — Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com) → **Add project**
2. Enable **Authentication** → Sign-in methods:
   - ✅ Email/Password
   - ✅ Google (optional)
3. Enable **Firestore Database** → Start in **test mode** (apply rules after)
4. Go to **Project Settings → General → Your apps → Add app (Web)**
5. Copy the `firebaseConfig` object

### Step 3 — Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local` and paste your Firebase values:

```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123:web:abc
```

### Step 4 — Apply Firestore Security Rules

In Firebase Console → Firestore → **Rules** tab, paste the contents of `firestore.rules`.

### Step 5 — Run the dev server

```bash
npm run dev
```

App runs at: http://localhost:5173

---

## 👑 Creating the First Admin User

The admin role must be set **server-side** (never from the browser) to prevent privilege escalation.

### Method A — Admin Script (Recommended)

```bash
# 1. Install firebase-admin in the scripts folder
cd scripts && npm init -y && npm install firebase-admin date-fns

# 2. Download service account key:
#    Firebase Console → Project Settings → Service Accounts → Generate Key
#    Save it as scripts/serviceAccountKey.json

# 3. Find the user's UID:
#    Firebase Console → Authentication → Users → copy the UID

# 4. Edit scripts/createAdmin.js — paste the UID
#    const USER_UID = 'PASTE_UID_HERE';

# 5. Run the script
node createAdmin.js
```

### Method B — Firebase Console (Quick)

1. Go to Firebase Console → **Firestore → users collection**
2. Find the document with your user's UID (it's created automatically on signup)
3. Edit the `role` field from `"user"` to `"admin"`
4. Save — the user now has admin access on next login

---

## 🌱 Seeding Sample Data

To populate slots and announcements for development:

```bash
cd scripts
node seedData.js
```

This creates ~35 class slots spread over the next 14 days (plus 2 past) and 4 sample announcements.

---

## 🗄️ Firestore Data Model

### `users/{uid}`
```
uid             string
name            string
email           string
role            'user' | 'admin'
membershipPlan  'Basic' | 'Standard' | 'Premium' | 'Elite'
membershipStatus 'active' | 'inactive' | 'paused'
avatarUrl       string
streak          number
totalAttended   number
phone           string
bio             string
createdAt       timestamp
updatedAt       timestamp
```

### `slots/{id}`
```
className    string      ('Mat Pilates', etc.)
trainer      string
date         string      ('YYYY-MM-DD')
time         string      ('HH:MM')
duration     number      (minutes)
capacity     number
bookedCount  number
description  string
isActive     boolean
createdAt    timestamp
```

### `bookings/{id}`
```
userId          string    (uid ref)
slotId          string    (slot ref)
slotDate        string    ('YYYY-MM-DD')
slotTime        string    ('HH:MM')
trainer         string
className       string
status          'confirmed' | 'cancelled'
attended        boolean | undefined
attendanceMarked boolean
bookedAt        timestamp
cancelledAt     timestamp | undefined
```

### `attendance/{id}`
```
bookingId   string
userId      string
slotId      string
attended    boolean
markedBy    string    (admin uid)
markedAt    timestamp
```

### `announcements/{id}`
```
title     string
message   string
type      'general' | 'urgent' | 'event' | 'reminder'
isActive  boolean
createdAt timestamp
```

---

## 🔐 Security Rules Summary

| Collection    | Read                      | Write                     |
|---------------|---------------------------|---------------------------|
| users         | Any logged-in user        | Owner or admin            |
| slots         | Any logged-in user        | Admin only                |
| bookings      | Owner or admin            | Owner (create) / admin    |
| attendance    | Owner or admin            | Admin only                |
| announcements | Any logged-in user        | Admin only                |

---

## 🎨 Design System

The app uses a custom Tailwind design system defined in `tailwind.config.js` and `index.css`:

| Token          | Value / Usage                          |
|----------------|----------------------------------------|
| `blush-500`    | `#c85a49` — primary brand color        |
| `sage-500`     | `#458361` — success / attendance green |
| `cream`        | Warm neutral backgrounds               |
| `font-display` | Playfair Display — headings            |
| `font-body`    | DM Sans — UI text                      |
| `font-accent`  | Cormorant Garamond — italic accents    |
| `.card`        | White/80 glass card with soft shadow   |
| `.btn-primary` | Blush brand button with glow           |
| `.badge-*`     | Status badges (blush/sage/gold/neutral)|

---

## 🔧 Production Build

```bash
npm run build
# Output in dist/ — deploy to Vercel, Netlify, Firebase Hosting, etc.
```

### Deploy to Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting   # point to dist/
firebase deploy
```

---

## 📋 TODO / Possible Enhancements

- [ ] Firebase Storage for profile photo uploads
- [ ] Push notifications via FCM for class reminders
- [ ] Recurring slot creation in admin
- [ ] Waitlist for fully booked classes
- [ ] In-app payment (Razorpay) for membership purchase
- [ ] Calendar view (month grid) for bookings
- [ ] CSV export of attendance data
- [ ] Trainer-specific dashboards
- [ ] Dark mode toggle

---

## 📝 License

MIT — built for Vigour Pilates Studio.
