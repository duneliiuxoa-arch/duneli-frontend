// Real Supabase Authentication Service
import { supabase } from '../lib/supabase';

export interface SupabaseUserProfile {
  id: string;
  email?: string;
  name: string;
  avatar?: string;
  anonymousId: string;
  isGuest: boolean;
  provider: 'google' | 'phone' | 'guest' | 'email';
}

// Generate anonymous Duneli ID (e.g., Δ-4821)
export const generateAnonymousId = (seed?: string): string => {
  if (seed) {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash << 5) - hash + seed.charCodeAt(i);
      hash |= 0;
    }
    const num = Math.abs(hash % 9000) + 1000;
    const prefixes = ['Δ', 'Σ', 'Ω', 'Λ', 'Φ', 'Ψ', 'Ξ'];
    const prefix = prefixes[Math.abs(hash % prefixes.length)];
    return `${prefix}-${num}`;
  }
  const prefixes = ['Δ', 'Σ', 'Ω', 'Λ', 'Φ', 'Ψ', 'Ξ'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const number = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${number}`;
};

// Sign in with Google via Supabase OAuth
export const signInWithGoogle = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.protocol}//${window.location.host}`,
      },
    });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error signing in with Google via Supabase:', error);
    throw error;
  }
};

// Sign in with Phone Number (OTP)
export const signInWithPhone = async (phoneNumber: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      phone: phoneNumber,
    });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error sending OTP via Supabase:', error);
    throw error;
  }
};

// Verify Phone OTP
export const verifyPhoneCode = async (phone: string, token: string) => {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms',
    });
    if (error) throw error;
    return data.user;
  } catch (error) {
    console.error('Error verifying phone code via Supabase:', error);
    throw error;
  }
};

// Guest Mode - Anonymous Sign In
export const continueAsGuest = async () => {
  try {
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) throw error;
    return data.user;
  } catch (err) {
    console.warn('Supabase anonymous sign in fallback to local guest session:', err);
    const guestId = 'guest_' + Math.random().toString(36).substring(2, 9);
    const guestUser = {
      id: guestId,
      email: `guest_${guestId}@duneli.app`,
      user_metadata: { name: 'Guest User', is_guest: true, anonymous_id: generateAnonymousId(guestId) },
      is_anonymous: true,
    };
    localStorage.setItem('duneli_guest_user', JSON.stringify(guestUser));
    return guestUser;
  }
};

// Sign Out
export const logout = async (): Promise<void> => {
  try {
    localStorage.removeItem('duneli_guest_user');
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error signing out from Supabase:', error);
  } catch (error) {
    console.error('Logout error:', error);
  }
};

// Listen to Auth state changes in Supabase
export const onAuthChange = (callback: (user: any | null) => void) => {
  // Check initial session
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session?.user) {
      callback(session.user);
    } else {
      const guestUserStr = localStorage.getItem('duneli_guest_user');
      if (guestUserStr) {
        callback(JSON.parse(guestUserStr));
      } else {
        callback(null);
      }
    }
  });

  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user) {
      callback(session.user);
    } else {
      const guestUserStr = localStorage.getItem('duneli_guest_user');
      if (guestUserStr) {
        callback(JSON.parse(guestUserStr));
      } else {
        callback(null);
      }
    }
  });

  return () => subscription.unsubscribe();
};

// Map raw Supabase user to clean App user object
export const formatSupabaseUser = (rawUser: any): SupabaseUserProfile => {
  const isGuest = Boolean(rawUser.is_anonymous || rawUser.user_metadata?.is_guest || rawUser.id?.startsWith('guest_'));
  const name = rawUser.user_metadata?.full_name || rawUser.user_metadata?.name || (isGuest ? 'Guest User' : rawUser.email?.split('@')[0] || 'User');
  const avatar = rawUser.user_metadata?.avatar_url || '';
  const anonymousId = rawUser.user_metadata?.anonymous_id || generateAnonymousId(rawUser.id);
  const provider = isGuest ? 'guest' : rawUser.app_metadata?.provider || 'google';

  return {
    id: rawUser.id,
    email: rawUser.email,
    name,
    avatar,
    anonymousId,
    isGuest,
    provider,
  };
};

export const isGuestUser = (user: any | null): boolean => {
  if (!user) return false;
  return Boolean(user.is_anonymous || user.user_metadata?.is_guest || user.id?.startsWith('guest_'));
};
