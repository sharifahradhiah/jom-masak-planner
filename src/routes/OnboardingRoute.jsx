import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FullScreenLoader } from './ProtectedRoute';

export default function OnboardingRoute() {
  const { user, initializing } = useAuth();

  if (initializing) return <FullScreenLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.onboarded) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}
