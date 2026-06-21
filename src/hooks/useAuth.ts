// Authentication Hook — Supabase (replaces Firebase version)
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
  const [isGuest, setIsGuest] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      // Handle OAuth redirect result on first load
      try {
        await checkRedirectResult();
      } catch (error) {
        console.error('Error checking redirect result:', error);
      }

      // Subscribe to auth state changes
      const unsubscribe = onAuthChange(async (authUser, authSession) => {
        if (!isMounted) return;

        setUser(authUser);
        setSession(authSession);

        if (authUser) {
          try {
            const anonId = await getUserAnonymousId(authUser.id);
            if (isMounted) {
              setAnonymousId(anonId);
              setIsGuest(isGuestUser(authUser));
            }
          } catch (error) {
            console.error('Error fetching user data:', error);
            if (isMounted) {
              setAnonymousId(null);
              setIsGuest(false);
            }
          }
        } else {
          if (isMounted) {
            setAnonymousId(null);
            setIsGuest(false);
          }
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
      unsubscribePromise.then((unsubscribe) => {
        if (unsubscribe) unsubscribe();
      });
    };
  }, []);

  return {
    user,
    session,
    anonymousId,
    loading,
    isGuest,
    isAuthenticated: !!user && !isGuestUser(user),
    initialized,
  };
};
