import { supabase } from '../supabaseClient';
import { ApiError } from './client';

function mapProfile(authUser, profile) {
  return {
    id: authUser.id,
    email: authUser.email,
    name: profile.name,
    onboarded: profile.onboarded,
    preferences: {
      dietaryTags: profile.dietary_tags || [],
      cuisines: profile.cuisines || [],
      goals: profile.goals || [],
      householdSize: profile.household_size,
    },
    createdAt: profile.created_at,
  };
}

async function fetchProfile(authUser) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authUser.id)
    .single();
  if (error) throw new ApiError(error.message, 'PROFILE_NOT_FOUND');
  return mapProfile(authUser, data);
}

function assertValidCredentials(email, password) {
  if (!email || !email.includes('@')) {
    throw new ApiError('Please enter a valid email address.', 'INVALID_EMAIL');
  }
  if (!password || password.length < 6) {
    throw new ApiError('Password must be at least 6 characters.', 'INVALID_PASSWORD');
  }
}

/** Sign in a returning user. Throws NO_ACCOUNT if there's no matching account yet. */
export async function signIn({ email, password }) {
  assertValidCredentials(email, password);

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.code === 'invalid_credentials') {
      throw new ApiError('No account found for that email and password.', 'NO_ACCOUNT');
    }
    throw new ApiError(error.message, 'AUTH_ERROR');
  }

  return fetchProfile(data.user);
}

/** Create a brand-new account. Throws ALREADY_REGISTERED if the email is already taken. */
export async function signUp({ name, email, password }) {
  assertValidCredentials(email, password);
  if (!name || !name.trim()) {
    throw new ApiError('Please enter your name.', 'INVALID_NAME');
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name: name.trim() } },
  });
  if (error) throw new ApiError(error.message, 'AUTH_ERROR');

  // Supabase returns a user with no identities when the email is already registered,
  // instead of an error, to avoid leaking which emails exist.
  if (data.user && data.user.identities && data.user.identities.length === 0) {
    throw new ApiError('That account already exists. Check your password and try again.', 'ALREADY_REGISTERED');
  }

  return fetchProfile(data.user);
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new ApiError(error.message, 'AUTH_ERROR');
  return true;
}

export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  return fetchProfile(user);
}

export async function completeOnboarding(userId, preferences) {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      onboarded: true,
      dietary_tags: preferences.dietaryTags,
      cuisines: preferences.cuisines,
      goals: preferences.goals,
      household_size: preferences.householdSize,
    })
    .eq('id', userId)
    .select()
    .single();
  if (error) throw new ApiError(error.message, 'UPDATE_FAILED');
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return mapProfile(user, data);
}

export async function updatePreferences(userId, preferences) {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      dietary_tags: preferences.dietaryTags,
      cuisines: preferences.cuisines,
      goals: preferences.goals,
      household_size: preferences.householdSize,
    })
    .eq('id', userId)
    .select()
    .single();
  if (error) throw new ApiError(error.message, 'UPDATE_FAILED');
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return mapProfile(user, data);
}
