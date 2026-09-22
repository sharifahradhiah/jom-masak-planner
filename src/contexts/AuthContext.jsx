import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as authService from '../services/api/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    authService.getCurrentUser().then((u) => {
      setUser(u);
      setInitializing(false);
    });
  }, []);

  const login = useCallback(async (credentials) => {
    const loggedInUser = await authService.login(credentials);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const finishOnboarding = useCallback(async (preferences) => {
    const updated = await authService.completeOnboarding(user.id, preferences);
    setUser(updated);
    return updated;
  }, [user]);

  const savePreferences = useCallback(async (preferences) => {
    const updated = await authService.updatePreferences(user.id, preferences);
    setUser(updated);
    return updated;
  }, [user]);

  const value = useMemo(
    () => ({ user, initializing, login, logout, finishOnboarding, savePreferences }),
    [user, initializing, login, logout, finishOnboarding, savePreferences]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
