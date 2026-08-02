// Authentication Service - STRICT IMPLEMENTATION
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithPhoneNumber,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  User,
  ConfirmationResult,
  RecaptchaVerifier,
  AuthError,
  browserLocalPersistence,
  setPersistence,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { logEvent } from 'firebase/analytics';
import { auth, db, googleProvider, setupRecaptcha, analytics } from '../lib/firebase';

// Generate anonymous ID
const generateAnonymousId = (): string => {
  const prefixes = ['Δ', 'Σ', 'Ω', 'Λ', 'Φ', 'Ψ', 'Ξ'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const number = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${number}`;
};

// Create or update user profile
const createOrUpdateUserProfile = async (
  user: User,
  provider: 'google' | 'phone' | 'guest'
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      // Create new user with anonymous ID
      await setDoc(userRef, {
        anonymousId: generateAnonymousId(),
        provider,
        createdAt: serverTimestamp(),
        lastActiveAt: serverTimestamp(),
      });
    } else {
      // Update last active
      await updateDoc(userRef, {
        lastActiveAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('Error creating/updating user profile:', error);
    throw error;
  }
};

// Set auth persistence (survives refresh)
const initAuthPersistence = async (): Promise<void> => {
  try {
    await setPersistence(auth, browserLocalPersistence);
  } catch (error) {
    console.error('Error setting auth persistence:', error);
  }
};

// Initialize persistence on module load
initAuthPersistence();

// Sign in with Google - WITH POPUP BLOCKED FALLBACK
export const signInWithGoogle = async (): Promise<User> => {
  try {
    // Ensure persistence is set
    await setPersistence(auth, browserLocalPersistence);

    // Try popup first
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Create/update profile
      await createOrUpdateUserProfile(user, 'google');

      // Log analytics
      if (analytics) {
        logEvent(analytics, 'google_login_success', {
          method: 'google',
          uid: user.uid,
        });
      }

      return user;
    } catch (popupError) {
      const error = popupError as AuthError;
      
      // If popup blocked, try redirect
      if (
        error.code === 'auth/popup-blocked' ||
        error.code === 'auth/popup-closed-by-user' ||
        error.code === 'auth/cancelled-popup-request'
      ) {
        console.warn('Popup blocked, falling back to redirect');
        await signInWithRedirect(auth, googleProvider);
        
        // signInWithRedirect doesn't return immediately
        // The user will be redirected and come back
        // We need to handle this in checkRedirectResult
        throw new Error('REDIRECT_IN_PROGRESS');
      }

      // Re-throw other errors
      throw popupError;
    }
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

// Check for redirect result (call on app init)
export const checkRedirectResult = async (): Promise<User | null> => {
  try {
    const result = await getRedirectResult(auth);
    
    if (result && result.user) {
      const user = result.user;

      // Create/update profile
      await createOrUpdateUserProfile(user, 'google');

      // Log analytics
      if (analytics) {
        logEvent(analytics, 'google_login_success', {
          method: 'google_redirect',
          uid: user.uid,
        });
      }

      return user;
    }

    return null;
  } catch (error) {
    console.error('Error checking redirect result:', error);
    throw error;
  }
};

// Sign in with Phone Number - STRICT IMPLEMENTATION
let recaptchaVerifier: RecaptchaVerifier | null = null;

export const initializeRecaptcha = (containerId: string): RecaptchaVerifier => {
  try {
    // Clean up existing verifier
    if (recaptchaVerifier) {
      recaptchaVerifier.clear();
      recaptchaVerifier = null;
    }

    // Create new verifier
    recaptchaVerifier = setupRecaptcha(containerId);
    
    return recaptchaVerifier;
  } catch (error) {
    console.error('Error initializing recaptcha:', error);
    throw error;
  }
};

export const signInWithPhone = async (
  phoneNumber: string
): Promise<ConfirmationResult> => {
  try {
    if (!recaptchaVerifier) {
      throw new Error('Recaptcha not initialized. Call initializeRecaptcha first.');
    }

    // Ensure persistence
    await setPersistence(auth, browserLocalPersistence);

    // Send OTP
    const confirmationResult = await signInWithPhoneNumber(
      auth,
      phoneNumber,
      recaptchaVerifier
    );

    return confirmationResult;
  } catch (error) {
    console.error('Error sending OTP:', error);
    
    // Reset recaptcha on error
    if (recaptchaVerifier) {
      try {
        recaptchaVerifier.clear();
      } catch (e) {
        // Ignore clear errors
      }
      recaptchaVerifier = null;
    }
    
    throw error;
  }
};

export const verifyPhoneCode = async (
  confirmationResult: ConfirmationResult,
  code: string
): Promise<User> => {
  try {
    const result = await confirmationResult.confirm(code);
    const user = result.user;

    // Create/update profile
    await createOrUpdateUserProfile(user, 'phone');

    // Log analytics
    if (analytics) {
      logEvent(analytics, 'phone_login_success', {
        method: 'phone',
        uid: user.uid,
      });
    }

    // Clean up recaptcha
    if (recaptchaVerifier) {
      try {
        recaptchaVerifier.clear();
      } catch (e) {
        // Ignore
      }
      recaptchaVerifier = null;
    }

    return user;
  } catch (error) {
    console.error('Error verifying phone code:', error);
    throw error;
  }
};

// Guest mode - USES FIREBASE ANONYMOUS AUTH
export const continueAsGuest = async (): Promise<User> => {
  try {
    // Ensure persistence
    await setPersistence(auth, browserLocalPersistence);

    // Sign in anonymously
    const result = await signInAnonymously(auth);
    const user = result.user;

    // Create guest profile
    await createOrUpdateUserProfile(user, 'guest');

    // Log analytics
    if (analytics) {
      logEvent(analytics, 'guest_login', {
        method: 'guest',
        uid: user.uid,
      });
    }

    return user;
  } catch (error) {
    console.error('Error signing in as guest:', error);
    throw error;
  }
};

// Sign out - FULLY CLEAR SESSION
export const logout = async (): Promise<void> => {
  try {
    // Clean up recaptcha
    if (recaptchaVerifier) {
      try {
        recaptchaVerifier.clear();
      } catch (e) {
        // Ignore
      }
      recaptchaVerifier = null;
    }

    // Sign out from Firebase
    await signOut(auth);

    // Clear any local storage
    localStorage.removeItem('duneli_user');
    sessionStorage.clear();
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Auth state listener - PERSISTENT ACROSS REFRESH
export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Get user anonymous ID
export const getUserAnonymousId = async (userId: string): Promise<string | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      return userDoc.data().anonymousId || null;
    }

    return null;
  } catch (error) {
    console.error('Error getting user anonymous ID:', error);
    return null;
  }
};

// Get user profile
export const getUserProfile = async (userId: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      return userDoc.data();
    }

    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

// Check if user is guest
export const isGuestUser = (user: User | null): boolean => {
  return user?.isAnonymous || false;
};

// Cleanup function for recaptcha
export const cleanupRecaptcha = (): void => {
  if (recaptchaVerifier) {
    try {
      recaptchaVerifier.clear();
    } catch (e) {
      // Ignore
    }
    recaptchaVerifier = null;
  }
};
