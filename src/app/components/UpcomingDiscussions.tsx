import { Calendar, ThumbsUp, Clock, Radio, Users, Volume2, ArrowRight } from 'lucide-react';
import { Discussion, Theme } from '../types';
import { themes } from '../config/themes';
import { motion } from 'motion/react';

interface UpcomingDiscussionsProps {
  discussions: Discussion[];
  currentTheme: Theme;
  isLoggedIn: boolean;
  onShowInterest: (discussionId: string) => void;
  onJoinDiscussion?: (discussionId: string) => void;
  onLoginPrompt: () => void;
}

export function UpcomingDiscussions({ 
  discussions, 
  currentTheme,
  isLoggedIn,
  onShowInterest,
  onJoinDiscussion,
  onLoginPrompt
}: UpcomingDiscussionsProps) {
  const theme = themes[currentTheme];
  const isDuneli = currentTheme === 'duneli';

  const formatScheduledTime = (scheduledTime: Date) => {
    const now = new Date();
    const diff = scheduledTime.getTime() - now.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(hours / 24);
    
    if (hours < 1) return 'Starting soon';
    if (hours < 24) return `In ${hours}h`;
    if (days === 1) return 'Tomorrow';
    return `In ${days} days`;
  };

  const formatFullTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatElapsedTime = (startedTime: Date) => {
    const now = new Date();
    const diff = now.getTime() - startedTime.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m ago`;
  };

  const liveDiscussions = discussions.filter(d => d.status === 'live');
  const upcomingDiscussions = discussions.filter(d => d.status === 'upcoming');

  const handleInterestClick = (discussionId: string) => {
    if (!isLoggedIn) {
      onLoginPrompt();
      return;
    }
    onShowInterest(discussionId);
  };

  const handleJoinClick = (discussionId: string) => {
    if (!isLoggedIn) {
      onLoginPrompt();
      return;
    }
    if (onJoinDiscussion) {
      onJoinDiscussion(discussionId);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10 space-y-12">
      
      {/* SECTION 1: LIVE SESSIONS (COPIED FROM HAPPENING NOW) */}
      {liveDiscussions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Section Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="relative flex items-center">
              <Radio className={`w-5 h-5 ${isDuneli ? 'text-red-500' : theme.textColor}`} />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
              </span>
            </div>
            <h2
              className={`text-2xl font-black ${isDuneli ? 'text-[#1A1A2E]' : theme.textColor}`}
              style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            >
              Happening Now (Live Audio Rooms)
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {liveDiscussions.map((discussion, index) => (
              <motion.div
                key={discussion.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`rounded-3xl p-7 relative overflow-hidden transition-all duration-300 hover:scale-[1.02] ${
                  isDuneli
                    ? 'bg-white border-2 border-red-100 shadow-xl shadow-red-50/50 hover:shadow-2xl hover:shadow-red-100/50'
                    : `${theme.cardStyle}`
                }`}
              >
                {/* Live pulsing gradient top border */}
                {isDuneli && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-purple-500 to-blue-500" />
                )}

                <div className="flex items-start justify-between gap-4 mb-4">
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-red-50 text-red-600 border border-red-200 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    <span>LIVE NOW</span>
                  </span>

                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-blue-50 text-[#3B5BF6] border border-blue-100">
                    {discussion.category}
                  </span>
                </div>

                <h3 className="text-xl font-extrabold text-[#1A1A2E] mb-3 leading-snug">
                  {discussion.title}
                </h3>

                <div className="flex items-center gap-4 text-xs font-bold text-slate-500 mb-6 flex-wrap">
                  <span>Hosted by {discussion.hostName}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1 text-[#7C3AED]">
                    <Users className="w-3.5 h-3.5" />
                    <span>{discussion.listenerCount} listening</span>
                  </span>
                  <span>·</span>
                  <span>{formatElapsedTime(discussion.startedTime!)}</span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <span className="text-xs font-extrabold text-[#1A1A2E]/70 flex items-center gap-1.5">
                    <Volume2 className="w-4 h-4 text-[#3B5BF6]" />
                    <span>Instant Anonymous Audio</span>
                  </span>

                  <button
                    onClick={() => handleJoinClick(discussion.id)}
                    className="px-6 py-2.5 rounded-2xl bg-[#1A1A2E] hover:bg-[#2d2d4e] text-white text-xs font-extrabold shadow-lg flex items-center gap-2 hover:scale-105 transition-all cursor-pointer"
                  >
                    <span>Join Room</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* SECTION 2: UPCOMING DISCUSSIONS */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Section Header */}
        <div className="flex items-center gap-3 mb-6">
          <Calendar className={`w-5 h-5 ${isDuneli ? 'text-[#7C3AED]' : theme.textColor}`} />
          <h2
            className={`text-2xl font-extrabold ${isDuneli ? 'text-[#1A1A2E]' : theme.textColor}`}
            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            Upcoming Scheduled Discussions
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {upcomingDiscussions.map((discussion, index) => (
            <motion.div
              key={discussion.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`rounded-3xl overflow-hidden ${
                isDuneli
                  ? 'bg-white border border-blue-100/70 shadow-lg shadow-blue-50/50 hover:shadow-xl hover:shadow-blue-100/50 transition-shadow'
                  : `${theme.cardStyle}`
              }`}
            >
              {isDuneli && (
                <div className="h-0.5 w-full" style={{ background: 'linear-gradient(90deg, #3B5BF6, #7C3AED)' }} />
              )}
              
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    isDuneli
                      ? 'bg-purple-50 text-[#7C3AED] border border-purple-100'
                      : `${theme.cardStyle} ${theme.textColor} opacity-70`
                  }`}>
                    {discussion.category}
                  </span>
                  <div className={`flex items-center gap-1.5 text-xs font-semibold ${isDuneli ? 'text-[#3B5BF6]' : 'text-blue-500'}`}>
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatScheduledTime(discussion.scheduledTime!)}</span>
                  </div>
                </div>

                <h3
                  className={`text-base font-bold mb-3 line-clamp-3 ${isDuneli ? 'text-[#1A1A2E]' : theme.textColor}`}
                  style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                >
                  {discussion.title}
                </h3>

                <div className={`text-xs mb-4 space-y-1 ${isDuneli ? 'text-[#1A1A2E]/50' : `${theme.textColor} opacity-60`}`}>
                  <p>Hosted by {discussion.hostName}</p>
                  <p>{formatFullTime(discussion.scheduledTime!)}</p>
                  <p>{discussion.duration} min · {discussion.language}</p>
                </div>

                <div className={`flex items-center gap-1.5 mb-4 text-xs ${isDuneli ? 'text-[#1A1A2E]/50' : `${theme.textColor} opacity-70`}`}>
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{discussion.interestCount} interested</span>
                </div>

                <button
                  onClick={() => handleInterestClick(discussion.id)}
                  className={`w-full px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all hover:scale-105 ${
                    discussion.hasUserInterest
                      ? isDuneli
                        ? 'text-white shadow-md shadow-blue-200'
                        : theme.buttonClass
                      : isDuneli
                        ? 'bg-blue-50 border border-blue-100 text-[#3B5BF6] hover:bg-blue-100'
                        : `${theme.cardStyle} hover:scale-105`
                  }`}
                  style={discussion.hasUserInterest && isDuneli ? { background: 'linear-gradient(135deg, #3B5BF6, #7C3AED)' } : {}}
                >
                  <div className="flex items-center justify-center gap-2">
                    <ThumbsUp className={`w-3.5 h-3.5 ${discussion.hasUserInterest ? 'fill-current' : ''}`} />
                    <span>{discussion.hasUserInterest ? 'Interested ✓' : 'Show Interest'}</span>
                  </div>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

    </div>
  );
}
