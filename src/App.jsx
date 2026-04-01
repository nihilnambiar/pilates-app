// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, AdminRoute, PublicRoute } from './components/shared/ProtectedRoute';
import { Toaster } from 'react-hot-toast';

import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import ReviewPage from './pages/ReviewPage';
import TestimonialsAdmin from './pages/admin/TestimonialsAdmin';
import Dashboard from './pages/user/Dashboard';
import BookClass from './pages/user/BookClass';
import Attendance from './pages/user/Attendance';
import Leaderboard from './pages/user/Leaderboard';
import Profile from './pages/user/Profile';
import AdminDashboard from './pages/admin/AdminDashboard';
import SlotManagement from './pages/admin/SlotManagement';
import UserManagement from './pages/admin/UserManagement';
import AttendanceManagement from './pages/admin/AttendanceManagement';
import BookingsView from './pages/admin/BookingsView';
import Announcements from './pages/admin/Announcements';
import UserLayout from './components/layout/UserLayout';
import AdminLayout from './components/layout/AdminLayout';

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

      <Routes>
        {/* Landing page — public home */}
        <Route path="/" element={<LandingPage />} />

        {/* Review page — public, no auth required */}
        <Route path="/review" element={<ReviewPage />} />

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
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
