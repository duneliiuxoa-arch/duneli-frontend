import { Calendar, ThumbsUp, Clock } from 'lucide-react';
import { Discussion, Theme } from '../types';
import { themes } from '../config/themes';
import { motion } from 'motion/react';

interface UpcomingDiscussionsProps {
  discussions: Discussion[];
  currentTheme: Theme;
  isLoggedIn: boolean;
  onShowInterest: (discussionId: string) => void;
  onLoginPrompt: () => void;
}

export function UpcomingDiscussions({ 
  discussions, 
  currentTheme,
  isLoggedIn,
  onShowInterest,
  onLoginPrompt
}: UpcomingDiscussionsProps) {
  const theme = themes[currentTheme];

  const formatScheduledTime = (scheduledTime?: Date) => {
    if (!scheduledTime) return 'TBD';
    const now = new Date();
    const diff = scheduledTime.getTime() - now.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(hours / 24);
    if (hours < 1) return 'Starting soon';
    if (hours < 24) return `In ${hours}h`;
    if (days === 1) return 'Tomorrow';
    return `In ${days} days`;
  };

  const formatFullTime = (date?: Date) => {
    if (!date) return 'Time TBD';
    return date.toLocaleString('en-US', {
      month: 'short', day: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true
    });
  };

  const upcomingDiscussions = discussions.filter(d => d.status === 'upcoming');

  if (upcomingDiscussions.length === 0) {
    return null;
  }

  const handleInterestClick = (discussionId: string) => {
    if (!isLoggedIn) {
      onLoginPrompt();
      return;
    }
    onShowInterest(discussionId);
  };

  return (
    <div className="max-w-7xl mx-auto px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <Calendar className={`w-6 h-6 ${theme.textColor}`} />
          <h2 
            className={`text-3xl font-bold ${theme.textColor}`}
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Upcoming Discussions
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {upcomingDiscussions.map((discussion, index) => (
            <motion.div
              key={discussion.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`${theme.cardStyle} rounded-3xl p-6`}
            >
              {/* Time Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className={`px-3 py-1 rounded-full ${theme.cardStyle} text-xs ${theme.textColor} opacity-70`}>
                  {discussion.category}
                </span>
                <div className="flex items-center gap-2 text-sm font-medium text-blue-500">
                  <Clock className="w-4 h-4" />
                  <span>{formatScheduledTime(discussion.scheduledTime!)}</span>
                </div>
              </div>

              {/* Title */}
              <h3 
                className={`text-lg font-semibold ${theme.textColor} mb-3 line-clamp-3`}
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {discussion.title}
              </h3>

              {/* Details */}
              <div className={`text-sm ${theme.textColor} opacity-60 mb-4 space-y-1`}>
                <p>Hosted by {discussion.hostName}</p>
                <p>{formatFullTime(discussion.scheduledTime!)}</p>
                <p>{discussion.duration} minutes · {discussion.language}</p>
              </div>

              {/* Interest Count */}
              <div className={`flex items-center gap-2 mb-4 ${theme.textColor} opacity-70`}>
                <ThumbsUp className="w-4 h-4" />
                <span className="text-sm">{discussion.interestCount} interested</span>
              </div>

              {/* Interest Button */}
              <button
                onClick={() => handleInterestClick(discussion.id)}
                className={`w-full ${
                  discussion.hasUserInterest 
                    ? theme.buttonClass 
                    : `${theme.cardStyle} hover:scale-105`
                } px-6 py-3 rounded-2xl font-medium transition-all`}
              >
                <div className="flex items-center justify-center gap-2">
                  <ThumbsUp className={`w-4 h-4 ${discussion.hasUserInterest ? 'fill-current' : ''}`} />
                  <span>{discussion.hasUserInterest ? 'Interested' : 'Show Interest'}</span>
                </div>
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
