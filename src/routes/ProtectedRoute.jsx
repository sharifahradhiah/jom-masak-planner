import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ChefHat } from 'lucide-react';

function FullScreenLoader() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-cream-100">
      <div className="flex h-12 w-12 animate-pulse items-center justify-center rounded-2xl bg-terracotta-500 text-white">
        <ChefHat className="h-6 w-6" />
      </div>
      <p className="text-sm font-medium text-ink-500">Loading your kitchen…</p>
    </div>
  );
}

export default function ProtectedRoute() {
  const { user, initializing } = useAuth();

  if (initializing) return <FullScreenLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (!user.onboarded) return <Navigate to="/onboarding" replace />;

  return <Outlet />;
}

export { FullScreenLoader };
