import { Radio, Users, Clock } from 'lucide-react';
import { Discussion, Theme } from '../types';
import { themes } from '../config/themes';
import { motion } from 'motion/react';

interface HappeningNowProps {
  discussions: Discussion[];
  currentTheme: Theme;
  isLoggedIn: boolean;
  onJoinDiscussion: (discussionId: string) => void;
  onLoginPrompt: () => void;
}

export function HappeningNow({ 
  discussions, 
  currentTheme, 
  isLoggedIn,
  onJoinDiscussion,
  onLoginPrompt 
}: HappeningNowProps) {
  const theme = themes[currentTheme];

  const formatElapsedTime = (startedTime: Date) => {
    const now = new Date();
    const diff = now.getTime() - startedTime.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m ago`;
  };

  const liveDiscussions = discussions.filter(d => d.status === 'live');

  if (liveDiscussions.length === 0) {
    return null;
  }

  const handleJoinClick = (discussionId: string) => {
    if (!isLoggedIn) {
      onLoginPrompt();
      return;
    }
    onJoinDiscussion(discussionId);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-8 sm:py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="relative flex items-center">
            <Radio className={`w-5 h-5 sm:w-6 sm:h-6 ${theme.textColor}`} />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          </div>
          <h2 
            className={`text-xl sm:text-3xl font-bold ${theme.textColor}`}
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Happening Now
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {liveDiscussions.map((discussion, index) => (
            <motion.div
              key={discussion.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`${theme.cardStyle} rounded-3xl p-4 sm:p-6 relative overflow-hidden`}
            >
              {/* Live Indicator - Emphasized */}
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-1.5 sm:gap-2 bg-red-500 text-white px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-full font-medium shadow-lg">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
                <span className="text-[10px] sm:text-sm uppercase tracking-wider">LIVE</span>
              </div>

              {/* Content */}
              <div className="pr-16 sm:pr-24 mb-3 sm:mb-4">
                <div className={`text-xs sm:text-sm ${theme.textColor} opacity-70 mb-2 flex items-center gap-2 flex-wrap`}>
                  <span className={`px-3 py-1 rounded-full ${theme.cardStyle} text-xs`}>
                    {discussion.category}
                  </span>
                  <span>•</span>
                  <span>{discussion.language}</span>
                </div>
                
                <h3 
                  className={`text-base sm:text-xl font-semibold ${theme.textColor} mb-2 sm:mb-3 line-clamp-2`}
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  {discussion.title}
                </h3>

                <div className={`text-xs sm:text-sm ${theme.textColor} opacity-60 mb-3 sm:mb-4`}>
                  <p>Hosted by {discussion.hostName}</p>
                  <p className="flex items-center gap-2 mt-1">
                    <Clock className="w-3 h-3" />
                    Started {formatElapsedTime(discussion.startedTime!)}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className={`flex items-center gap-4 sm:gap-6 mb-3 sm:mb-4 ${theme.textColor} opacity-70`}>
                {discussion.listenerCount !== undefined && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">{discussion.listenerCount} listening</span>
                  </div>
                )}
                {discussion.speakerCount !== undefined && discussion.speakerCount > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{discussion.speakerCount} speaking</span>
                  </div>
                )}
              </div>

              {/* Current Speaker */}
              {discussion.currentSpeaker && (
                <div className={`${theme.cardStyle} rounded-2xl px-4 py-3 mb-4`}>
                  <p className={`text-xs ${theme.textColor} opacity-60 mb-1`}>
                    Currently speaking
                  </p>
                  <p className={`text-sm font-medium ${theme.textColor}`}>
                    {discussion.currentSpeaker}
                  </p>
                </div>
              )}

              {/* Join Button */}
              <button
                onClick={() => handleJoinClick(discussion.id)}
                className={`w-full ${theme.buttonClass} px-6 py-3 rounded-2xl font-medium transition-all hover:scale-105 shadow-lg`}
              >
                Join Discussion
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
