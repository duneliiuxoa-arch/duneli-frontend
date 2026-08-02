// Supabase Real Authentication Hook
import { useState, useEffect } from 'react';
import { 
  onAuthChange, 
  formatSupabaseUser,
  SupabaseUserProfile,
  isGuestUser,
} from '../services/authService';

export const useAuth = () => {
  const [userProfile, setUserProfile] = useState<SupabaseUserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthChange((rawUser) => {
      if (!isMounted) return;

      if (rawUser) {
        const formatted = formatSupabaseUser(rawUser);
        setUserProfile(formatted);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  return {
    user: userProfile,
    anonymousId: userProfile?.anonymousId || null,
    loading,
    isGuest: userProfile ? userProfile.isGuest : false,
    isAuthenticated: !!userProfile && !userProfile.isGuest,
  };
};
