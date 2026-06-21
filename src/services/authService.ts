// Authentication Service — Supabase
import { supabase } from '../lib/supabase';
import type { User, Session, AuthError } from '@supabase/supabase-js';

// ─── Generate anonymous display ID ───────────────────────────────────────────
const generateAnonymousId = (): string => {
  const prefixes = ['Δ', 'Σ', 'Ω', 'Λ', 'Φ', 'Ψ', 'Ξ'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const number = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${number}`;
};

// ─── Create or update public.users row after auth ────────────────────────────
const upsertUserProfile = async (user: User): Promise<void> => {
  // Never upsert anonymous/guest users into the users table
  if (user.is_anonymous === true) return;

  const { error } = await supabase.from('users').upsert(
    {
      id: user.id,
      name:
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split('@')[0] ||
        'User',
      email: user.email!,
      avatarUrl: user.user_metadata?.avatar_url ?? null,
      updatedAt: new Date().toISOString(),
    },
    { onConflict: 'id', ignoreDuplicates: false }
  );

  if (error) {
    console.error('Error upserting user profile:', error.message);
  }
};

// ─── Sign in with Google (only supported login method) ───────────────────────
export const signInWithGoogle = async (): Promise<void> => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    console.error('Google sign-in error:', error.message);
    throw error;
  }
};

// ─── Check for OAuth redirect result (call on app init) ──────────────────────
export const checkRedirectResult = async (): Promise<User | null> => {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.error('Error getting session:', error.message);
    return null;
  }

  const sessionUser = data.session?.user;

  // Reject anonymous/guest sessions — only real Google users pass through
  if (!sessionUser || sessionUser.is_anonymous === true) return null;

  await upsertUserProfile(sessionUser);
  return sessionUser;
};

// ─── Sign out ─────────────────────────────────────────────────────────────────
export const logout = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Sign-out error:', error.message);
    throw error;
  }

  localStorage.removeItem('duneli_user');
  sessionStorage.clear();
};

// ─── Auth state listener ──────────────────────────────────────────────────────
// Only fires callback for real (non-anonymous) users.
// Anonymous sessions are silently ignored so the app stays on the EntryScreen.
export const onAuthChange = (
  callback: (user: User | null, session: Session | null) => void
): (() => void) => {
  const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
    const user = session?.user ?? null;

    // Block anonymous users — treat them as "not logged in"
    if (user?.is_anonymous === true) {
      callback(null, null);
      return;
    }

    callback(user, session ?? null);
  });

  return () => listener.subscription.unsubscribe();
};

// ─── Get anonymous display ID from public.users ───────────────────────────────
export const getUserAnonymousId = async (userId: string): Promise<string | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('anonymousId')
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      const { data: session } = await supabase.auth.getSession();
      const user = session?.session?.user;
      if (!user || user.is_anonymous === true) return null;

      const newAnonId = generateAnonymousId();
      await supabase.from('users').upsert({
        id: userId,
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        email: user.email!,
        avatarUrl: user.user_metadata?.avatar_url ?? null,
        anonymousId: newAnonId,
        updatedAt: new Date().toISOString(),
      });
      return newAnonId;
    }
    console.error('Error fetching anonymousId:', error.message);
    return null;
  }

  return (data as any)?.anonymousId ?? null;
};

// ─── Get user profile from public.users ──────────────────────────────────────
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error.message);
    return null;
  }

  return data;
};

// ─── Check if user is a guest (anonymous) ────────────────────────────────────
export const isGuestUser = (user: User | null): boolean => {
  if (!user) return false;
  return user.is_anonymous === true;
};

// ─── continueAsGuest — DISABLED ──────────────────────────────────────────────
// Guest login is not supported. Only Google sign-in is allowed.
// This function is kept as a stub to avoid import errors elsewhere.
export const continueAsGuest = async (): Promise<never> => {
  throw new Error('Guest login is disabled. Please sign in with Google.');
};
