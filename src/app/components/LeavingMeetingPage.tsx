import { Lightbulb, Wind, HelpCircle, Minus, Home, X } from 'lucide-react';
import { useState } from 'react';
import { Theme, FeedbackOption } from '../types';
import { themes } from '../config/themes';
import { motion } from 'motion/react';

interface LeavingMeetingPageProps {
  discussionTitle: string;
  currentTheme: Theme;
  onReturnHome: () => void;
}

export function LeavingMeetingPage({ 
  discussionTitle, 
  currentTheme, 
  onReturnHome 
}: LeavingMeetingPageProps) {
  const theme = themes[currentTheme];
  const isDuneli = currentTheme === 'duneli';
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackOption | null>(null);
  const [additionalComment, setAdditionalComment] = useState('');

  const feedbackOptions = [
    {
      id: 'thoughtProvoking' as FeedbackOption,
      icon: Lightbulb,
      label: 'Thought-provoking',
      color: 'bg-gradient-to-br from-[#7C3AED] to-[#a855f7]',
      shadowColor: 'shadow-purple-200',
    },
    {
      id: 'calm' as FeedbackOption,
      icon: Wind,
      label: 'Calm',
      color: 'bg-gradient-to-br from-[#3B5BF6] to-[#6366f1]',
      shadowColor: 'shadow-blue-200',
    },
    {
      id: 'confusing' as FeedbackOption,
      icon: HelpCircle,
      label: 'Confusing',
      color: 'bg-gradient-to-br from-[#F97316] to-[#ef4444]',
      shadowColor: 'shadow-orange-200',
    },
    {
      id: 'neutral' as FeedbackOption,
      icon: Minus,
      label: 'Neutral',
      color: 'bg-gradient-to-br from-gray-400 to-gray-600',
      shadowColor: 'shadow-gray-200',
    },
  ];

  const handleSubmit = () => {
    onReturnHome();
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center px-4 relative overflow-hidden ${
        isDuneli ? 'text-[#1A1A2E]' : theme.textColor
      }`}
      style={{
        background: isDuneli
          ? 'linear-gradient(160deg, #f8f7ff 0%, #eef2ff 40%, #f0f7ff 70%, #faf5ff 100%)'
          : theme.background,
        fontFamily: 'Plus Jakarta Sans, sans-serif',
      }}
    >
      {isDuneli && (
        <>
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-15 blur-3xl pointer-events-none"
            style={{ background: 'radial-gradient(circle, #7C3AED, transparent)', transform: 'translate(30%, -30%)' }} />
          <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full opacity-15 blur-3xl pointer-events-none"
            style={{ background: 'radial-gradient(circle, #3B5BF6, transparent)', transform: 'translate(-30%, 30%)' }} />
        </>
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full relative z-10"
      >
        {/* Thank You */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-5 text-3xl shadow-xl"
            style={{ background: 'linear-gradient(135deg, #3B5BF6, #7C3AED)' }}
          >
            ✓
          </motion.div>
          <h1
            className={`text-4xl sm:text-5xl font-black mb-3 ${isDuneli ? 'text-[#1A1A2E]' : theme.textColor}`}
            style={{ letterSpacing: '-0.02em' }}
          >
            Thanks for listening.
          </h1>
          <p className={`text-base ${isDuneli ? 'text-[#1A1A2E]/50' : `${theme.textColor} opacity-70`}`}>
            {discussionTitle}
          </p>
        </div>

        {/* Feedback Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`rounded-3xl p-7 mb-5 ${
            isDuneli
              ? 'bg-white border border-blue-100 shadow-xl shadow-blue-50'
              : `${theme.cardStyle}`
          }`}
        >
          {isDuneli && (
            <div className="h-1 w-full -mt-7 mb-5 rounded-t-3xl"
              style={{ background: 'linear-gradient(90deg, #3B5BF6, #7C3AED, #F97316)' }} />
          )}

          <h2 className={`text-lg font-bold mb-6 text-center ${isDuneli ? 'text-[#1A1A2E]' : theme.textColor}`}>
            How did this discussion feel?
          </h2>

          {/* Feedback Options */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {feedbackOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelectedFeedback(option.id)}
                className={`p-5 rounded-2xl transition-all hover:scale-105 ${
                  selectedFeedback === option.id
                    ? `${option.color} text-white shadow-lg ${option.shadowColor}`
                    : isDuneli
                      ? 'bg-blue-50 border border-blue-100 hover:bg-blue-100 text-[#1A1A2E]'
                      : `${theme.cardStyle} hover:bg-white/10`
                }`}
              >
                <option.icon className="w-7 h-7 mx-auto mb-2" />
                <p className="text-xs font-semibold text-center">{option.label}</p>
              </button>
            ))}
          </div>

          {/* Optional Comment */}
          <div className="mb-4">
            <label className={`block text-xs font-medium mb-2 ${isDuneli ? 'text-[#1A1A2E]/60' : `${theme.textColor} opacity-70`}`}>
              One short line (optional)
            </label>
            <input
              type="text"
              value={additionalComment}
              onChange={(e) => setAdditionalComment(e.target.value)}
              placeholder="Any additional thoughts..."
              maxLength={100}
              className={`w-full px-4 py-3 rounded-xl text-sm outline-none ${
                isDuneli
                  ? 'bg-blue-50 border border-blue-100 text-[#1A1A2E] placeholder:text-[#1A1A2E]/30 focus:border-[#3B5BF6] focus:ring-1 focus:ring-[#3B5BF6]/20'
                  : `${theme.cardStyle} ${theme.textColor} placeholder:opacity-50 focus:ring-2 focus:ring-white/20`
              }`}
            />
          </div>

          <p className={`text-xs text-center ${isDuneli ? 'text-[#1A1A2E]/30' : `${theme.textColor} opacity-50`}`}>
            Your feedback is private and helps improve future discussions.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onReturnHome}
            className={`flex-1 px-6 py-4 rounded-2xl text-sm font-semibold transition-all hover:scale-105 flex items-center justify-center gap-2 ${
              isDuneli
                ? 'bg-white border border-blue-100 text-[#1A1A2E]/70 hover:bg-blue-50 shadow-sm'
                : `${theme.cardStyle} hover:bg-white/10 ${theme.textColor}`
            }`}
          >
            <X className="w-4 h-4" />
            <span>Skip</span>
          </button>

          <button
            onClick={handleSubmit}
            className={`flex-1 px-6 py-4 rounded-2xl text-sm font-bold text-white transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-lg shadow-blue-200 ${
              isDuneli ? '' : theme.buttonClass
            }`}
            style={isDuneli ? { background: 'linear-gradient(135deg, #3B5BF6, #7C3AED)' } : {}}
          >
            <Home className="w-4 h-4" />
            <span>Return Home</span>
          </button>
        </div>

        {/* Privacy Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className={`text-center text-xs mt-5 ${isDuneli ? 'text-[#1A1A2E]/30' : `${theme.textColor} opacity-50`}`}
        >
          No scores. No public display. No pressure.
        </motion.p>
      </motion.div>
    </div>
  );
}
