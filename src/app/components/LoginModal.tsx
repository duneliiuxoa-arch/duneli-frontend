import { X } from 'lucide-react';
import { Theme } from '../types';
import { themes } from '../config/themes';
import { motion, AnimatePresence } from 'motion/react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface LoginModalProps {
  isOpen: boolean;
  currentTheme: Theme;
  onClose: () => void;
  onLogin: () => void;
}

export function LoginModal({ isOpen, currentTheme, onClose, onLogin }: LoginModalProps) {
  const theme = themes[currentTheme];

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      console.error('Google login error:', error.message);
    }
    // Supabase will redirect — onLogin() called after redirect via auth listener
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className={`${theme.cardStyle} rounded-3xl p-5 sm:p-8 max-w-md w-full`}>
              {/* Header */}
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2
                  className={`text-xl sm:text-2xl font-bold ${theme.textColor}`}
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  Join Duneli
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className={`w-5 h-5 ${theme.textColor}`} />
                </button>
              </div>

              {/* Message */}
              <p className={`${theme.textColor} opacity-70 mb-4 sm:mb-6 text-sm sm:text-base`}>
                Sign in to participate in discussions, vote on topics, and more.
              </p>

              {/* Google Login */}
              <button
                onClick={handleGoogleLogin}
                className={`w-full ${theme.buttonClass} px-6 py-3 sm:py-4 rounded-2xl font-medium transition-all hover:scale-105 flex items-center justify-center gap-3`}
              >
                {/* Google icon */}
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
