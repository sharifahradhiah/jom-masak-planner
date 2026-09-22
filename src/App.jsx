import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { MealPlanProvider } from './contexts/MealPlanContext';
import { ToastProvider } from './contexts/ToastContext';

import ProtectedRoute from './routes/ProtectedRoute';
import OnboardingRoute from './routes/OnboardingRoute';
import GuestRoute from './routes/GuestRoute';

import AppShell from './components/layout/AppShell';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import PlannerPage from './pages/PlannerPage';
import RecipesPage from './pages/RecipesPage';
import GroceryListPage from './pages/GroceryListPage';
import ProfilePage from './pages/ProfilePage';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <MealPlanProvider>
            <Routes>
              <Route path="/" element={<LandingPage />} />

              <Route element={<GuestRoute />}>
                <Route path="/login" element={<LoginPage />} />
              </Route>

              <Route element={<OnboardingRoute />}>
                <Route path="/onboarding" element={<OnboardingPage />} />
              </Route>

              <Route element={<ProtectedRoute />}>
                <Route element={<AppShell />}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/planner" element={<PlannerPage />} />
                  <Route path="/recipes" element={<RecipesPage />} />
                  <Route path="/groceries" element={<GroceryListPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </MealPlanProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
