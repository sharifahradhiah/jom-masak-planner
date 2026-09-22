import { request, ApiError } from './client';
import { readStore, writeStore } from '../storage';
import { generateId } from '../../utils/id';

const USERS_KEY = 'users';
const SESSION_KEY = 'session';

function getUsers() {
  return readStore(USERS_KEY, []);
}

function saveUsers(users) {
  writeStore(USERS_KEY, users);
}

/**
 * Mock auth: "login" upserts a user record by email, no password check.
 * Swap this file's internals for real REST calls later; call sites
 * (AuthContext) never touch localStorage directly.
 */
export function login({ email, name }) {
  return request(() => {
    if (!email || !email.includes('@')) {
      throw new ApiError('Please enter a valid email address.', 'INVALID_EMAIL');
    }
    const users = getUsers();
    let user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      user = {
        id: generateId('user'),
        email,
        name: name || email.split('@')[0],
        onboarded: false,
        preferences: {
          dietaryTags: [],
          cuisines: [],
          goals: [],
          householdSize: 2,
        },
        createdAt: new Date().toISOString(),
      };
      users.push(user);
      saveUsers(users);
    }
    writeStore(SESSION_KEY, { userId: user.id });
    return user;
  });
}

export function logout() {
  return request(() => {
    writeStore(SESSION_KEY, null);
    return true;
  }, { latency: 80 });
}

export function getCurrentUser() {
  return request(() => {
    const session = readStore(SESSION_KEY, null);
    if (!session) return null;
    const users = getUsers();
    return users.find((u) => u.id === session.userId) || null;
  }, { latency: 60 });
}

export function completeOnboarding(userId, preferences) {
  return request(() => {
    const users = getUsers();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx === -1) throw new ApiError('User not found.', 'NOT_FOUND');
    users[idx] = {
      ...users[idx],
      onboarded: true,
      preferences: { ...users[idx].preferences, ...preferences },
    };
    saveUsers(users);
    return users[idx];
  });
}

export function updatePreferences(userId, preferences) {
  return request(() => {
    const users = getUsers();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx === -1) throw new ApiError('User not found.', 'NOT_FOUND');
    users[idx] = { ...users[idx], preferences: { ...users[idx].preferences, ...preferences } };
    saveUsers(users);
    return users[idx];
  });
}
