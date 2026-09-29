// src/App.jsx
import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, AdminRoute, PublicRoute } from './components/shared/ProtectedRoute';
import { Toaster } from 'react-hot-toast';

// Landing page loads eagerly — it's what nearly every first-time visitor
// hits, so there's no point deferring it behind an extra network round trip.
import LandingPage from './pages/LandingPage';

// Everything else is route-split: an anonymous visitor to "/" should never
// have to download the admin panel or user dashboard's JS, and vice versa.
const AuthPage             = lazy(() => import('./pages/AuthPage'));
const ReviewPage           = lazy(() => import('./pages/ReviewPage'));
const TermsPage            = lazy(() => import('./pages/TermsPage'));
const ComparePage          = lazy(() => import('./pages/ComparePage'));
const TestimonialsAdmin    = lazy(() => import('./pages/admin/TestimonialsAdmin'));
const TrialBookingsAdmin   = lazy(() => import('./pages/admin/TrialBookingsAdmin'));
const QuizResultsAdmin     = lazy(() => import('./pages/admin/QuizResultsAdmin'));
const Dashboard            = lazy(() => import('./pages/user/Dashboard'));
const BookClass            = lazy(() => import('./pages/user/BookClass'));
const Attendance           = lazy(() => import('./pages/user/Attendance'));
const Leaderboard          = lazy(() => import('./pages/user/Leaderboard'));
const Profile              = lazy(() => import('./pages/user/Profile'));
const AdminDashboard       = lazy(() => import('./pages/admin/AdminDashboard'));
const SlotManagement       = lazy(() => import('./pages/admin/SlotManagement'));
const UserManagement       = lazy(() => import('./pages/admin/UserManagement'));
const AttendanceManagement = lazy(() => import('./pages/admin/AttendanceManagement'));
const BookingsView         = lazy(() => import('./pages/admin/BookingsView'));
const Announcements        = lazy(() => import('./pages/admin/Announcements'));
const UserLayout           = lazy(() => import('./components/layout/UserLayout'));
const AdminLayout          = lazy(() => import('./components/layout/AdminLayout'));

// Minimal, brandless fallback — shown only for the brief gap while a
// lazy route chunk downloads, never on the landing page itself.
function RouteFallback() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0d0d0d' }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.15)', borderTopColor: '#1E80C2', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '14px',
            borderRadius: '16px',
            padding: '12px 16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          },
          success: {
            iconTheme: { primary: '#458361', secondary: '#fff' },
            style: { background: '#f2f7f4', color: '#2d2420', border: '1px solid #c2dacc' },
          },
          error: {
            iconTheme: { primary: '#c85a49', secondary: '#fff' },
            style: { background: '#fdf6f5', color: '#2d2420', border: '1px solid #f3cdc8' },
          },
        }}
      />

      <Suspense fallback={<RouteFallback />}>
        <Routes>
          {/* Landing page — public home */}
          <Route path="/" element={<LandingPage />} />

          {/* Review page — public, no auth required */}
          <Route path="/review" element={<ReviewPage />} />

          {/* Terms & Conditions */}
          <Route path="/terms" element={<TermsPage />} />

          {/* Pilates vs Gym vs Yoga */}
          <Route path="/compare" element={<ComparePage />} />

          {/* Auth */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<AuthPage />} />
          </Route>

          {/* User app */}
          <Route element={<ProtectedRoute />}>
            <Route element={<UserLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/book" element={<BookClass />} />
              <Route path="/dashboard/attendance" element={<Attendance />} />
              <Route path="/dashboard/leaderboard" element={<Leaderboard />} />
              <Route path="/dashboard/profile" element={<Profile />} />
            </Route>
          </Route>

          {/* Admin */}
          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/slots" element={<SlotManagement />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/attendance" element={<AttendanceManagement />} />
              <Route path="/admin/bookings" element={<BookingsView />} />
              <Route path="/admin/announcements" element={<Announcements />} />
              <Route path="/admin/testimonials" element={<TestimonialsAdmin />} />
              <Route path="/admin/trials" element={<TrialBookingsAdmin />} />
              <Route path="/admin/quiz-results" element={<QuizResultsAdmin />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}
