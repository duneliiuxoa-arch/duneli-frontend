/**
 * Example: Integrating Firebase Auth with LoginModal Component
 * 
 * This shows how to connect your existing LoginModal UI with Firebase authentication
 */

import React, { useState } from 'react';
import { ConfirmationResult } from 'firebase/auth';
import {
  signInWithGoogle,
  signInWithPhone,
  verifyPhoneCode,
  initializeRecaptcha,
  continueAsGuest,
} from '../services/authService';

// Your existing LoginModal component interface
interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IntegratedLoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'method' | 'phone' | 'verify'>('method');

  // Initialize reCAPTCHA when component mounts
  React.useEffect(() => {
    if (isOpen) {
      initializeRecaptcha('recaptcha-container');
    }
  }, [isOpen]);

  // Handle Google Sign-In
  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError('');
      await signInWithGoogle();
      onClose(); // Close modal on success
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  // Handle Phone Number Submit
  const handlePhoneSubmit = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Format phone number (ensure it includes country code)
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
      
      const confirmation = await signInWithPhone(formattedPhone);
      setConfirmationResult(confirmation);
      setStep('verify');
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  // Handle Verification Code Submit
  const handleVerifyCode = async () => {
    if (!confirmationResult) return;

    try {
      setLoading(true);
      setError('');
      await verifyPhoneCode(confirmationResult, verificationCode);
      onClose(); // Close modal on success
    } catch (err: any) {
      setError(err.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  // Handle Guest Mode
  const handleGuestMode = () => {
    continueAsGuest();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        {/* Method Selection */}
        {step === 'method' && (
          <>
            <h2 className="text-2xl font-bold mb-6">Sign In to DUNELI</h2>
            
            {error && (
              <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
                {error}
              </div>
            )}

            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full bg-white border border-gray-300 text-gray-700 py-3 rounded-lg mb-3 hover:bg-gray-50 flex items-center justify-center gap-2"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
              Continue with Google
            </button>

            <button
              onClick={() => setStep('phone')}
              disabled={loading}
              className="w-full bg-white border border-gray-300 text-gray-700 py-3 rounded-lg mb-3 hover:bg-gray-50"
            >
              Continue with Phone
            </button>

            <button
              onClick={handleGuestMode}
              className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300"
            >
              Browse as Guest
            </button>

            <p className="text-sm text-gray-500 mt-4 text-center">
              Guests can browse but cannot interact
            </p>

            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </>
        )}

        {/* Phone Number Entry */}
        {step === 'phone' && (
          <>
            <h2 className="text-2xl font-bold mb-6">Enter Phone Number</h2>
            
            {error && (
              <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
                {error}
              </div>
            )}

            <input
              type="tel"
              placeholder="+1234567890"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 mb-4"
            />

            <button
              onClick={handlePhoneSubmit}
              disabled={loading || !phoneNumber}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
            >
              {loading ? 'Sending...' : 'Send Verification Code'}
            </button>

            <button
              onClick={() => setStep('method')}
              className="w-full text-gray-600 py-3 mt-2"
            >
              ← Back
            </button>

            {/* Hidden reCAPTCHA container */}
            <div id="recaptcha-container"></div>
          </>
        )}

        {/* Verification Code Entry */}
        {step === 'verify' && (
          <>
            <h2 className="text-2xl font-bold mb-6">Enter Verification Code</h2>
            
            {error && (
              <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
                {error}
              </div>
            )}

            <p className="text-gray-600 mb-4">
              We sent a code to {phoneNumber}
            </p>

            <input
              type="text"
              placeholder="123456"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 mb-4"
              maxLength={6}
            />

            <button
              onClick={handleVerifyCode}
              disabled={loading || verificationCode.length !== 6}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>

            <button
              onClick={() => setStep('phone')}
              className="w-full text-gray-600 py-3 mt-2"
            >
              ← Back
            </button>
          </>
        )}
      </div>
    </div>
  );
};
