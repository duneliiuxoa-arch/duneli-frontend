// Authentication Hook - STRICT IMPLEMENTATION
import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { 
  onAuthChange, 
  getUserAnonymousId,
  getUserProfile,
  checkRedirectResult,
  isGuestUser,
} from '../services/authService';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [anonymousId, setAnonymousId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        // Check for redirect result first (from Google redirect fallback)
        await checkRedirectResult();
      } catch (error) {
        console.error('Error checking redirect result:', error);
      }

      // Set up auth state listener
      const unsubscribe = onAuthChange(async (authUser) => {
        if (!isMounted) return;

        setUser(authUser);

        if (authUser) {
          try {
            // Get anonymous ID
            const anonId = await getUserAnonymousId(authUser.uid);
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
      unsubscribePromise.then(unsubscribe => {
        if (unsubscribe) {
          unsubscribe();
        }
      });
    };
  }, []);

  return {
    user,
    anonymousId,
    loading,
    isGuest,
    isAuthenticated: !!user && !isGuestUser(user),
    initialized,
  };
};
