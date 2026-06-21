// Authentication Hook — Supabase
import { useState, useEffect } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import {
  onAuthChange,
  getUserAnonymousId,
  checkRedirectResult,
  isGuestUser,
} from '../services/authService';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [anonymousId, setAnonymousId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      // Handle OAuth redirect result — anonymous users are filtered out inside
      try {
        await checkRedirectResult();
      } catch (error) {
        console.error('Error checking redirect result:', error);
      }

      const unsubscribe = onAuthChange(async (authUser, authSession) => {
        if (!isMounted) return;

        // authUser is always null for anonymous sessions (filtered in onAuthChange)
        setUser(authUser);
        setSession(authSession);

        if (authUser && !isGuestUser(authUser)) {
          try {
            const anonId = await getUserAnonymousId(authUser.id);
            if (isMounted) setAnonymousId(anonId);
          } catch (error) {
            console.error('Error fetching user data:', error);
            if (isMounted) setAnonymousId(null);
          }
        } else {
          if (isMounted) setAnonymousId(null);
        }

        if (isMounted) {
          setLoading(false);
          setInitialized(true);
        }
      });

      return unsubscribe;
    };

    const unsubscribePromise = initAuth();

    return () => {
      isMounted = false;
      unsubscribePromise.then(unsub => { if (unsub) unsub(); });
    };
  }, []);

  return {
    user,
    session,
    anonymousId,
    loading,
    isGuest: false,           // Guest login disabled — always false
    isAuthenticated: !!user && !isGuestUser(user),
    initialized,
  };
};
