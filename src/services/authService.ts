// Authentication Service — Supabase (replaces Firebase auth)
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
// The handle_new_user trigger in Supabase handles this automatically on INSERT.
// This function is a fallback for manual upserts if needed.
const upsertUserProfile = async (user: User): Promise<void> => {
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

// ─── Sign in with Google ──────────────────────────────────────────────────────
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
  // Supabase redirects the browser — no return value needed
};

// ─── Check for OAuth redirect result (call on app init) ──────────────────────
export const checkRedirectResult = async (): Promise<User | null> => {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.error('Error getting session:', error.message);
    return null;
  }

  if (data.session?.user) {
    await upsertUserProfile(data.session.user);
    return data.session.user;
  }

  return null;
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
export const onAuthChange = (
  callback: (user: User | null, session: Session | null) => void
): (() => void) => {
  const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null, session ?? null);
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
    // Row might not exist yet — create one with a new anonymousId
    if (error.code === 'PGRST116') {
      const { data: session } = await supabase.auth.getSession();
      const user = session?.session?.user;
      if (!user) return null;

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

// ─── Guest: anonymous session via Supabase ────────────────────────────────────
// NOTE: Supabase does not have built-in anonymous auth like Firebase.
// We create a temporary in-memory guest marker instead.
// If you enable Supabase anonymous sign-in (Auth > Settings), swap this.
export const continueAsGuest = async (): Promise<User> => {
  const { data, error } = await supabase.auth.signInAnonymously();

  if (error || !data.user) {
    console.error('Guest sign-in error:', error?.message);
    throw error ?? new Error('Anonymous sign-in failed');
  }

  return data.user;
};

// ─── Check if user is a guest (anonymous) ────────────────────────────────────
export const isGuestUser = (user: User | null): boolean => {
  if (!user) return false;
  // Supabase anonymous users have is_anonymous = true in user metadata
  return user.is_anonymous === true;
};

// ─── Phone auth (Supabase OTP) ────────────────────────────────────────────────
export const signInWithPhone = async (phone: string): Promise<void> => {
  const { error } = await supabase.auth.signInWithOtp({ phone });

  if (error) {
    console.error('Phone OTP send error:', error.message);
    throw error;
  }
};

export const verifyPhoneCode = async (phone: string, token: string): Promise<User> => {
  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: 'sms',
  });

  if (error || !data.user) {
    console.error('Phone OTP verify error:', error?.message);
    throw error ?? new Error('OTP verification failed');
  }

  await upsertUserProfile(data.user);
  return data.user;
};
