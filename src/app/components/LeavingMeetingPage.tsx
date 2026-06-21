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
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackOption | null>(null);
  const [additionalComment, setAdditionalComment] = useState('');

  const feedbackOptions = [
    {
      id: 'thoughtProvoking' as FeedbackOption,
      icon: Lightbulb,
      label: 'Thought-provoking',
      color: 'bg-purple-500',
    },
    {
      id: 'calm' as FeedbackOption,
      icon: Wind,
      label: 'Calm',
      color: 'bg-blue-500',
    },
    {
      id: 'confusing' as FeedbackOption,
      icon: HelpCircle,
      label: 'Confusing',
      color: 'bg-orange-500',
    },
    {
      id: 'neutral' as FeedbackOption,
      icon: Minus,
      label: 'Neutral',
      color: 'bg-gray-500',
    },
  ];

  const handleSubmit = () => {
    // Submit feedback (in real app)
    onReturnHome();
  };

  return (
    <div 
      className={`min-h-screen flex items-center justify-center px-4 ${theme.textColor}`}
      style={{ background: theme.background, fontFamily: 'var(--font-body)' }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full"
      >
        {/* Thank You Message */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="text-6xl mb-6"
          >
            ✓
          </motion.div>
          <h1 
            className={`text-4xl sm:text-5xl font-bold mb-4 ${theme.textColor}`}
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Thanks for listening.
          </h1>
          <p className={`text-lg ${theme.textColor} opacity-70 mb-2`}>
            {discussionTitle}
          </p>
        </div>

        {/* Feedback Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`${theme.cardStyle} rounded-3xl p-8 mb-6`}
        >
          <h2 className={`text-xl font-semibold mb-6 text-center ${theme.textColor}`}>
            How did this discussion feel?
          </h2>

          {/* Feedback Options */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {feedbackOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelectedFeedback(option.id)}
                className={`p-6 rounded-2xl transition-all hover:scale-105 ${
                  selectedFeedback === option.id
                    ? `${option.color} text-white`
                    : `${theme.cardStyle} hover:bg-white/10`
                }`}
              >
                <option.icon className="w-8 h-8 mx-auto mb-3" />
                <p className="text-sm font-medium text-center">{option.label}</p>
              </button>
            ))}
          </div>

          {/* Optional Comment */}
          <div className="mb-4">
            <label className={`block text-sm mb-2 ${theme.textColor} opacity-70`}>
              One short line (optional)
            </label>
            <input
              type="text"
              value={additionalComment}
              onChange={(e) => setAdditionalComment(e.target.value)}
              placeholder="Any additional thoughts..."
              maxLength={100}
              className={`w-full px-4 py-3 rounded-xl ${theme.cardStyle} ${theme.textColor} placeholder:opacity-50 outline-none focus:ring-2 focus:ring-white/20`}
              style={{ background: 'transparent' }}
            />
          </div>

          <p className={`text-xs ${theme.textColor} opacity-50 text-center`}>
            Your feedback is private and helps improve future discussions.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={onReturnHome}
            className={`flex-1 ${theme.cardStyle} hover:bg-white/10 px-6 py-4 rounded-2xl font-medium transition-all hover:scale-105 flex items-center justify-center gap-2 ${theme.textColor}`}
          >
            <X className="w-5 h-5" />
            <span>Skip</span>
          </button>
          
          <button
            onClick={handleSubmit}
            className={`flex-1 ${theme.buttonClass} px-6 py-4 rounded-2xl font-medium transition-all hover:scale-105 flex items-center justify-center gap-2`}
          >
            <Home className="w-5 h-5" />
            <span>Return to Homepage</span>
          </button>
        </div>

        {/* Privacy Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className={`text-center text-sm ${theme.textColor} opacity-50 mt-6`}
        >
          No scores. No public display. No pressure.
        </motion.p>
      </motion.div>
    </div>
  );
}
