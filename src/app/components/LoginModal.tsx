import { X, LogIn } from 'lucide-react';
import { Theme } from '../types';
import { themes } from '../config/themes';
import { motion, AnimatePresence } from 'motion/react';

interface LoginModalProps {
  isOpen: boolean;
  currentTheme: Theme;
  onClose: () => void;
  onLogin: () => void;
}

export function LoginModal({ isOpen, currentTheme, onClose, onLogin }: LoginModalProps) {
  const theme = themes[currentTheme];
  const isDuneli = currentTheme === 'duneli';

  const handleLogin = () => {
    onLogin();
    onClose();
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
            <div className={`rounded-3xl p-8 max-w-md w-full ${
              isDuneli
                ? 'bg-white border border-blue-100 shadow-2xl shadow-blue-100'
                : theme.cardStyle
            }`}>
              {isDuneli && (
                <div className="h-1 -mt-8 mb-6 rounded-t-3xl"
                  style={{ background: 'linear-gradient(90deg, #3B5BF6, #7C3AED, #F97316)' }} />
              )}
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl font-black ${isDuneli ? 'text-[#1A1A2E]' : theme.textColor}`}
                  style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '-0.02em' }}>
                  Login Required
                </h2>
                <button
                  onClick={onClose}
                  className={`p-2 rounded-full transition-colors ${isDuneli ? 'hover:bg-blue-50' : 'hover:bg-white/10'}`}
                >
                  <X className={`w-5 h-5 ${isDuneli ? 'text-[#1A1A2E]/50' : theme.textColor}`} />
                </button>
              </div>

              {/* Message */}
              <p className={`mb-6 text-sm leading-relaxed ${isDuneli ? 'text-[#1A1A2E]/60' : `${theme.textColor} opacity-70`}`}>
                To participate in discussions, show interest, or save topics, please log in to your account.
              </p>

              {/* Login Options */}
              <div className="space-y-3">
                <button
                  onClick={handleLogin}
                  className={`w-full px-6 py-4 rounded-2xl font-semibold text-sm transition-all hover:scale-105 flex items-center justify-center gap-3 text-white shadow-lg shadow-blue-200 ${isDuneli ? '' : theme.buttonClass}`}
                  style={isDuneli ? { background: 'linear-gradient(135deg, #3B5BF6, #7C3AED)' } : {}}
                >
                  <LogIn className="w-5 h-5" />
                  <span>Login with Google</span>
                </button>
                
                <button
                  onClick={handleLogin}
                  className={`w-full px-6 py-4 rounded-2xl font-semibold text-sm transition-all hover:scale-105 flex items-center justify-center gap-3 ${isDuneli ? 'bg-blue-50 border border-blue-100 text-[#3B5BF6] hover:bg-blue-100' : `${theme.cardStyle} hover:bg-white/10 ${theme.textColor}`}`}
                >
                  <LogIn className="w-5 h-5" />
                  <span>Login with Mobile Number</span>
                </button>
              </div>

              <button
                onClick={onClose}
                className={`w-full mt-4 px-6 py-3 text-sm ${theme.textColor} opacity-60 hover:opacity-100 transition-opacity`}
              >
                Continue browsing as guest
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
