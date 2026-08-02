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
  const isDuneli = currentTheme === 'duneli';

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
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
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
            className={`text-2xl font-bold ${isDuneli ? 'text-[#1A1A2E]' : theme.textColor}`}
            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            Happening Now
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {liveDiscussions.map((discussion, index) => (
            <motion.div
              key={discussion.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative overflow-hidden rounded-3xl ${
                isDuneli
                  ? 'bg-white border border-blue-100 shadow-xl shadow-blue-50/50'
                  : `${theme.cardStyle}`
              }`}
            >
              {/* Top accent bar */}
              {isDuneli && (
                <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #3B5BF6, #7C3AED, #F97316)' }} />
              )}

              <div className="p-6">
                {/* Live badge */}
                <div className="absolute top-5 right-5 flex items-center gap-1.5 bg-red-500 text-white px-3 py-1.5 rounded-full shadow-lg shadow-red-200">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider">LIVE</span>
                </div>

                {/* Content */}
                <div className="pr-20 mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      isDuneli
                        ? 'bg-blue-50 text-[#3B5BF6] border border-blue-100'
                        : `${theme.cardStyle} ${theme.textColor} opacity-70`
                    }`}>
                      {discussion.category}
                    </span>
                    <span className={`text-xs ${isDuneli ? 'text-[#1A1A2E]/40' : `${theme.textColor} opacity-50`}`}>
                      · {discussion.language}
                    </span>
                  </div>

                  <h3
                    className={`text-lg font-bold mb-2 line-clamp-2 ${isDuneli ? 'text-[#1A1A2E]' : `${theme.textColor}`}`}
                    style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                  >
                    {discussion.title}
                  </h3>

                  <div className={`text-sm ${isDuneli ? 'text-[#1A1A2E]/50' : `${theme.textColor} opacity-60`} space-y-0.5`}>
                    <p>Hosted by {discussion.hostName}</p>
                    <p className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      Started {formatElapsedTime(discussion.startedTime!)}
                    </p>
                  </div>
                </div>

                {/* Stats row */}
                <div className={`flex items-center gap-5 mb-4 text-sm ${isDuneli ? 'text-[#1A1A2E]/60' : `${theme.textColor} opacity-70`}`}>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    <span>{discussion.listenerCount} listening</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span>🎙️</span>
                    <span>{discussion.speakerCount} speaking</span>
                  </div>
                </div>

                {/* Current speaker */}
                {discussion.currentSpeaker && (
                  <div className={`rounded-xl px-4 py-2.5 mb-4 ${
                    isDuneli
                      ? 'bg-blue-50 border border-blue-100'
                      : `${theme.cardStyle}`
                  }`}>
                    <p className={`text-xs mb-0.5 ${isDuneli ? 'text-[#3B5BF6]/70' : `${theme.textColor} opacity-60`}`}>
                      Currently speaking
                    </p>
                    <p className={`text-sm font-semibold ${isDuneli ? 'text-[#1A1A2E]' : theme.textColor}`}>
                      {discussion.currentSpeaker}
                    </p>
                  </div>
                )}

                {/* Join button */}
                <button
                  onClick={() => handleJoinClick(discussion.id)}
                  className={`w-full px-6 py-3 rounded-2xl font-semibold transition-all hover:scale-105 shadow-lg text-sm ${
                    isDuneli
                      ? 'text-white shadow-blue-200'
                      : `${theme.buttonClass} shadow-lg`
                  }`}
                  style={isDuneli ? { background: 'linear-gradient(135deg, #3B5BF6, #7C3AED)' } : {}}
                >
                  Join Discussion
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
