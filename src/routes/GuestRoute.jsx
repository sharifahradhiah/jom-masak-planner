import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FullScreenLoader } from './ProtectedRoute';

/** For routes only a signed-out visitor should see (e.g. /login). */
export default function GuestRoute() {
  const { user, initializing } = useAuth();

  if (initializing) return <FullScreenLoader />;
  if (user) return <Navigate to={user.onboarded ? '/dashboard' : '/onboarding'} replace />;

  return <Outlet />;
}
