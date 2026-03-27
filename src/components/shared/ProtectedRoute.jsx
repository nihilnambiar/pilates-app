// src/components/shared/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingScreen from './LoadingScreen';

export function ProtectedRoute() {
  const { currentUser, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return currentUser ? <Outlet /> : <Navigate to="/login" replace />;
}

export function AdminRoute() {
  const { currentUser, userProfile, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!currentUser) return <Navigate to="/login" replace />;
  if (userProfile?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

export function PublicRoute() {
  const { currentUser, userProfile, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!currentUser) return <Outlet />;
  return userProfile?.role === 'admin'
    ? <Navigate to="/admin" replace />
    : <Navigate to="/dashboard" replace />;
}
