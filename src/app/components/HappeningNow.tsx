import { Radio, Clock, Headphones, Mic, Scale } from 'lucide-react';
import { Discussion, Theme } from '../types';
import { themes } from '../config/themes';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface RoleCount { listeners: number; speakers: number; debaters: number; total: number; }

function useRoleCounts(topicId: string): RoleCount {
  const [counts, setCounts] = useState<RoleCount>({ listeners: 0, speakers: 0, debaters: 0, total: 0 });
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(`${API_URL}/api/discussions/${topicId}/participants`);
        if (!res.ok) return;
        const d = await res.json();
        if (!cancelled) setCounts({ listeners: d.listeners ?? 0, speakers: d.speakers ?? 0, debaters: d.debaters ?? 0, total: d.total ?? 0 });
      } catch { /* silent */ }
    };
    load();
    const t = setInterval(load, 10000);
    return () => { cancelled = true; clearInterval(t); };
  }, [topicId]);
  return counts;
}

// ── LiveCard sub-component ────────────────────────────────────
function LiveCard({ discussion, index, isDuneli, theme, onJoin, formatElapsedTime }: {
  discussion: Discussion; index: number; isDuneli: boolean; theme: any;
  onJoin: (id: string) => void; formatElapsedTime: (d: Date) => string;
}) {
  const counts = useRoleCounts(discussion.id);
  const textMuted = isDuneli ? 'text-[#1A1A2E]/60' : `${theme.textColor} opacity-70`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`relative overflow-hidden rounded-3xl ${isDuneli ? 'bg-white border border-blue-100 shadow-xl shadow-blue-50/50' : theme.cardStyle}`}
    >
      {isDuneli && <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #3B5BF6, #7C3AED, #F97316)' }} />}
      <div className="p-6">
        {/* Live badge */}
        <div className="absolute top-5 right-5 flex items-center gap-1.5 bg-red-500 text-white px-3 py-1.5 rounded-full shadow-lg shadow-red-200">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider">LIVE</span>
        </div>

        {/* Title + category */}
        <div className="pr-20 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${isDuneli ? 'bg-blue-50 text-[#3B5BF6] border border-blue-100' : `${theme.cardStyle} ${theme.textColor} opacity-70`}`}>
              {discussion.category}
            </span>
            <span className={`text-xs ${isDuneli ? 'text-[#1A1A2E]/40' : `${theme.textColor} opacity-50`}`}>· {discussion.language}</span>
          </div>
          <h3 className={`text-lg font-bold mb-2 line-clamp-2 ${isDuneli ? 'text-[#1A1A2E]' : theme.textColor}`}
            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            {discussion.title}
          </h3>
          <p className={`text-sm flex items-center gap-1.5 ${isDuneli ? 'text-[#1A1A2E]/50' : `${theme.textColor} opacity-60`}`}>
            <Clock className="w-3 h-3" /> Started {formatElapsedTime(discussion.startedTime!)}
          </p>
        </div>

        {/* Real role counts */}
        <div className={`flex items-center gap-4 mb-4 text-sm ${textMuted}`}>
          <div className="flex items-center gap-1.5">
            <Headphones className="w-3.5 h-3.5" />
            <span>{counts.listeners} listening</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Mic className="w-3.5 h-3.5" />
            <span>{counts.speakers} speaking</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5" />
            <span>{counts.debaters} debating</span>
          </div>
        </div>

        {/* Join button */}
        <button onClick={() => onJoin(discussion.id)}
          className={`w-full px-6 py-3 rounded-2xl font-semibold transition-all hover:scale-105 shadow-lg text-sm ${isDuneli ? 'text-white shadow-blue-200' : `${theme.buttonClass} shadow-lg`}`}
          style={isDuneli ? { background: 'linear-gradient(135deg, #3B5BF6, #7C3AED)' } : {}}>
          Join Discussion
        </button>
      </div>
    </motion.div>
  );
}

// ── Main component ─────────────────────────────────────────────
interface HappeningNowProps {
  discussions: Discussion[];
  currentTheme: Theme;
  isLoggedIn: boolean;
  onJoinDiscussion: (discussionId: string) => void;
  onLoginPrompt: () => void;
}

export function HappeningNow({ discussions, currentTheme, isLoggedIn, onJoinDiscussion, onLoginPrompt }: HappeningNowProps) {
  const theme = themes[currentTheme];
  const isDuneli = currentTheme === 'duneli';
  const liveDiscussions = discussions.filter(d => d.status === 'live');

  const formatElapsedTime = (startedTime: Date) => {
    const diff = Date.now() - startedTime.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m ago`;
  };

  const handleJoin = (id: string) => {
    if (!isLoggedIn) { onLoginPrompt(); return; }
    onJoinDiscussion(id);
  };

  if (liveDiscussions.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex items-center">
            <Radio className={`w-5 h-5 ${isDuneli ? 'text-red-500' : theme.textColor}`} />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
            </span>
          </div>
          <h2 className={`text-2xl font-bold ${isDuneli ? 'text-[#1A1A2E]' : theme.textColor}`}
            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Happening Now
          </h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {liveDiscussions.map((d, i) => (
            <LiveCard key={d.id} discussion={d} index={i} isDuneli={isDuneli}
              theme={theme} onJoin={handleJoin} formatElapsedTime={formatElapsedTime} />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
