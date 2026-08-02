import { useState } from 'react';
import { X, LogIn, Phone, ShieldCheck } from 'lucide-react';
import { Theme } from '../types';
import { themes } from '../config/themes';
import { motion, AnimatePresence } from 'motion/react';
import { signInWithGoogle, signInWithPhone, verifyPhoneCode, continueAsGuest } from '../../services/authService';

interface LoginModalProps {
  isOpen: boolean;
  currentTheme: Theme;
  onClose: () => void;
  onLogin: () => void;
}

export function LoginModal({ isOpen, currentTheme, onClose, onLogin }: LoginModalProps) {
  const theme = themes[currentTheme];
  const isDuneli = currentTheme === 'duneli';

  const [phoneStep, setPhoneStep] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      await signInWithGoogle();
      onLogin();
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return;
    try {
      setLoading(true);
      setErrorMsg('');
      await signInWithPhone(phoneNumber);
      setPhoneStep(true);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to send OTP code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode) return;
    try {
      setLoading(true);
      setErrorMsg('');
      await verifyPhoneCode(phoneNumber, otpCode);
      onLogin();
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Invalid OTP code');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    try {
      setLoading(true);
      await continueAsGuest();
      onLogin();
      onClose();
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
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
                  Login to Duneli
                </h2>
                <button
                  onClick={onClose}
                  className={`p-2 rounded-full transition-colors ${isDuneli ? 'hover:bg-blue-50' : 'hover:bg-white/10'}`}
                >
                  <X className={`w-5 h-5 ${isDuneli ? 'text-[#1A1A2E]/50' : theme.textColor}`} />
                </button>
              </div>

              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 border border-red-200 text-xs font-semibold">
                  {errorMsg}
                </div>
              )}

              {/* Message */}
              <p className={`mb-6 text-sm leading-relaxed ${isDuneli ? 'text-[#1A1A2E]/60' : `${theme.textColor} opacity-70`}`}>
                To participate in live audio discussions, show interest, or save topics, please authenticate below.
              </p>

              {/* Login Options */}
              <div className="space-y-3">
                <button
                  disabled={loading}
                  onClick={handleGoogleLogin}
                  className={`w-full px-6 py-3.5 rounded-2xl font-extrabold text-sm transition-all hover:scale-105 flex items-center justify-center gap-3 text-white shadow-lg shadow-blue-200 ${isDuneli ? '' : theme.buttonClass}`}
                  style={isDuneli ? { background: 'linear-gradient(135deg, #3B5BF6, #7C3AED)' } : {}}
                >
                  <LogIn className="w-5 h-5" />
                  <span>{loading ? 'Authenticating...' : 'Sign in with Google'}</span>
                </button>

                {!phoneStep ? (
                  <form onSubmit={handleSendOtp} className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="tel"
                        placeholder="+1 234 567 8900"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="flex-1 px-4 py-3 rounded-2xl bg-blue-50/60 border border-blue-100 text-xs font-bold text-[#1A1A2E] outline-none focus:border-blue-500"
                      />
                      <button
                        type="submit"
                        disabled={loading || !phoneNumber}
                        className="px-4 py-3 rounded-2xl bg-[#1A1A2E] text-white font-extrabold text-xs hover:bg-[#2d2d4e] transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>OTP</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        className="flex-1 px-4 py-3 rounded-2xl bg-blue-50/60 border border-blue-100 text-xs font-bold text-[#1A1A2E] outline-none focus:border-blue-500"
                      />
                      <button
                        type="submit"
                        disabled={loading || !otpCode}
                        className="px-4 py-3 rounded-2xl bg-green-600 text-white font-extrabold text-xs hover:bg-green-700 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Verify</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>

              <button
                onClick={handleGuestLogin}
                className={`w-full mt-4 px-6 py-3 text-xs font-bold ${theme.textColor} opacity-70 hover:opacity-100 transition-opacity flex items-center justify-center gap-2`}
              >
                <span>Continue browsing as guest</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
