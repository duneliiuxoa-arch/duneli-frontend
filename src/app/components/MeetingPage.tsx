import { Radio, Users, Clock, Hand, ThumbsUp, ThumbsDown, Mic, MicOff, LogOut, Volume2, Headphones, Send } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Theme, Role, Discussion, Participant, HandRaiseRequest, Idea } from '../types';
import { themes } from '../config/themes';
import { motion, AnimatePresence } from 'motion/react';
import {
  subscribeIdeas,
  shareIdea,
  reactToIdea,
  type RealIdea,
} from '../../services/api';
import { supabase } from '../../lib/supabase';

interface MeetingPageProps {
  discussion: Discussion;
  currentTheme: Theme;
  userRole: Role;
  userName: string;
  onLeave: () => void;
}

export function MeetingPage({ 
  discussion, 
  currentTheme, 
  userRole,
  userName,
  onLeave 
}: MeetingPageProps) {
  const theme = themes[currentTheme];
  
  // Meeting state
  const [elapsedTime, setElapsedTime] = useState(0);
  const [handRaised, setHandRaised] = useState(false);
  const [micMuted, setMicMuted] = useState(userRole !== 'debater');
  const [speakerTimeLeft, setSpeakerTimeLeft] = useState<number | null>(null);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [newIdeaText, setNewIdeaText] = useState('');
  
  // Mock data
  const [participants] = useState<Participant[]>([
    { id: '1', name: 'Emma Thompson', role: 'debater', isSpeaking: true },
    { id: '2', name: 'David Kim', role: 'listener', isSpeaking: false },
    { id: '3', name: 'Sarah Chen', role: 'speaker', isSpeaking: false },
    { id: '4', name: userName, role: userRole, isSpeaking: false },
  ]);
  
  const [handRaiseQueue] = useState<HandRaiseRequest[]>([
    { userId: '5', userName: 'Alex Morgan', timestamp: new Date(Date.now() - 5 * 60000) },
    { userId: '6', userName: 'Maya Patel', timestamp: new Date(Date.now() - 2 * 60000) },
  ]);
  
  // ── Ideas — real API ──────────────────────────────────────
  const [currentIdeas, setCurrentIdeas] = useState<Idea[]>([]);
  const [ideaCooldown, setIdeaCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>('');

  // Get current user id from supabase
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user?.id) setCurrentUserId(data.session.user.id);
    });
  }, []);

  // Subscribe to real ideas — all participants see same data
  useEffect(() => {
    if (!discussion.id) return;
    const unsub = subscribeIdeas(discussion.id, (realIdeas: RealIdea[]) => {
      setCurrentIdeas(realIdeas.map(i => ({
        id:              i.id,
        speakerId:       i.userId,
        speakerName:     i.anonymousId || i.userName,
        content:         i.content,
        timestamp:       i.createdAt,
        agreeCount:      i.agreeCount,
        disagreeCount:   i.disagreeCount,
        hasUserAgreed:   i.myReaction === 'agree',
        hasUserDisagreed: i.myReaction === 'disagree',
      })));
    });
    return unsub;
  }, [discussion.id]);

  // Cooldown ticker
  const startCooldown = (seconds: number) => {
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    setIdeaCooldown(seconds);
    cooldownRef.current = setInterval(() => {
      setIdeaCooldown(prev => {
        if (prev <= 1) { clearInterval(cooldownRef.current!); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => () => { if (cooldownRef.current) clearInterval(cooldownRef.current); }, []);

  const canShareIdea = userRole === 'speaker' || userRole === 'debater';

  const [ideas, setIdeas] = useState<Idea[]>([]);

  // Sync real ideas into local state
  useEffect(() => { setIdeas(currentIdeas); }, [currentIdeas]);

  // Timer for elapsed time
  useEffect(() => {
    const timer = setInterval(() => setElapsedTime(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // Speaker time limit
  useEffect(() => {
    if (isUserSpeaking && userRole === 'speaker') {
      setSpeakerTimeLeft(180);
      const timer = setInterval(() => {
        setSpeakerTimeLeft(prev => {
          if (prev === null || prev <= 1) { setMicMuted(true); setIsUserSpeaking(false); return null; }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isUserSpeaking, userRole]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // ── Share idea — real API with cooldown ───────────────────
  const handleShareIdea = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newIdeaText.trim() || ideaCooldown > 0) return;

    const text = newIdeaText.trim();
    setNewIdeaText('');

    const result = await shareIdea(discussion.id, text);
    if (result.cooldown) {
      startCooldown(result.cooldown);
    } else if (result.idea) {
      // Optimistic — subscription will update shortly anyway
      setIdeas(prev => [...prev, {
        id:           result.idea!.id,
        speakerId:    result.idea!.userId,
        speakerName:  result.idea!.userName,
        content:      result.idea!.content,
        timestamp:    result.idea!.createdAt,
        agreeCount:   0,
        disagreeCount: 0,
        hasUserAgreed: false,
        hasUserDisagreed: false,
      }]);
      startCooldown(300); // 5 min cooldown
    }
  };

  // ── React to idea — real API ──────────────────────────────
  const handleIdeaReaction = async (ideaId: string, type: 'agree' | 'disagree') => {
    const result = await reactToIdea(ideaId, type);
    if (!result) return;
    setIdeas(prev => prev.map(idea =>
      idea.id === ideaId
        ? {
            ...idea,
            agreeCount:      result.agreeCount,
            disagreeCount:   result.disagreeCount,
            hasUserAgreed:   result.myReaction === 'agree',
            hasUserDisagreed: result.myReaction === 'disagree',
          }
        : idea
    ));
  };

  const handleMicToggle = () => {
    if (userRole === 'debater') setMicMuted(!micMuted);
  };

  const handleHandRaise = () => {
    if (userRole === 'listener' || userRole === 'speaker') setHandRaised(!handRaised);
  };
  const currentSpeaker = participants.find(p => p.isSpeaking);

  return (
    <div 
      className={`h-screen w-full overflow-hidden ${theme.textColor} flex flex-col select-none`}
      style={{ background: theme.background, fontFamily: 'var(--font-body)' }}
    >
      {/* Top Bar */}
      <div className={`${theme.cardStyle} px-6 py-3 shrink-0 border-b ${theme.textColor === 'text-white' ? 'border-white/10' : 'border-gray-200'}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Topic & Live Status */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex items-center gap-2 bg-red-500 text-white px-3 py-1.5 rounded-full font-medium flex-shrink-0">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              <Radio className="w-3.5 h-3.5" />
              <span className="text-xs font-black">LIVE</span>
            </div>
            <h1 className={`font-extrabold text-base sm:text-lg truncate ${theme.textColor}`}>
              {discussion.title}
            </h1>
          </div>

          {/* Stats */}
          <div className={`flex items-center gap-5 text-xs sm:text-sm font-semibold ${theme.textColor} opacity-80 shrink-0`}>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>{formatTime(elapsedTime)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[#3B5BF6]" />
              <span>{discussion.listenerCount} listening</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content (Fits 100% inside remaining screen height) */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Panel - Queue & Participants */}
        <div className={`w-72 lg:w-80 ${theme.cardStyle} p-5 overflow-y-auto shrink-0 border-r ${theme.textColor === 'text-white' ? 'border-white/10' : 'border-gray-200'} space-y-5`}>
          {/* Your Role */}
          <div>
            <h3 className={`text-xs uppercase font-extrabold tracking-wider opacity-60 mb-2 ${theme.textColor}`}>
              Your Role
            </h3>
            <div className={`${theme.buttonClass} rounded-xl px-3.5 py-2.5 flex items-center gap-2.5`}>
              {userRole === 'listener' && <Headphones className="w-4 h-4" />}
              {userRole === 'speaker' && <Mic className="w-4 h-4" />}
              {userRole === 'debater' && <Volume2 className="w-4 h-4" />}
              <span className="font-extrabold text-xs capitalize">{userRole}</span>
            </div>
          </div>

          {/* Hand Raise Queue */}
          {handRaiseQueue.length > 0 && (
            <div>
              <h3 className={`text-xs uppercase font-extrabold tracking-wider opacity-60 mb-2 ${theme.textColor}`}>
                Speaking Queue
              </h3>
              <div className="space-y-2">
                {handRaiseQueue.map((request, index) => (
                  <div
                    key={request.userId}
                    className={`${theme.cardStyle} rounded-xl px-3.5 py-2 flex items-center gap-2.5`}
                  >
                    <div className={`w-5 h-5 rounded-full ${theme.buttonClass} flex items-center justify-center text-[10px] font-bold shrink-0`}>
                      {index + 1}
                    </div>
                    <span className="flex-1 text-xs font-semibold truncate">{request.userName}</span>
                    <Hand className="w-3.5 h-3.5 opacity-60 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Participants */}
          <div>
            <h3 className={`text-xs uppercase font-extrabold tracking-wider opacity-60 mb-2 ${theme.textColor}`}>
              Participants ({participants.length})
            </h3>
            <div className="space-y-2">
              {participants.map((participant) => (
                <div
                  key={participant.id}
                  className={`rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 ${
                    participant.isSpeaking ? theme.buttonClass : `${theme.cardStyle} opacity-70`
                  }`}
                >
                  <div className={`w-7 h-7 rounded-full ${participant.isSpeaking ? 'bg-white/20' : 'bg-white/10'} flex items-center justify-center text-xs font-bold shrink-0`}>
                    {participant.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-xs truncate">{participant.name}</p>
                    <p className="text-[10px] opacity-75 capitalize">{participant.role}</p>
                  </div>
                  {participant.isSpeaking && (
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Stage - Current Speaker & Ideas */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          {/* Current Speaker Banner */}
          <div className="p-5 lg:p-6 shrink-0 border-b border-white/10">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className={`${theme.cardStyle} rounded-2xl p-5 text-center flex flex-col items-center justify-center`}
            >
              <div className={`w-16 h-16 rounded-full ${theme.buttonClass} flex items-center justify-center text-2xl font-black mx-auto mb-2 shadow-lg`}>
                {currentSpeaker?.name.charAt(0)}
              </div>
              <h2 className={`text-xl font-black mb-0.5 ${theme.textColor}`} style={{ fontFamily: 'var(--font-heading)' }}>
                {currentSpeaker?.name}
              </h2>
              <p className={`text-xs font-semibold ${theme.textColor} opacity-75 capitalize`}>
                {currentSpeaker?.role} • Currently Speaking
              </p>
            </motion.div>
          </div>

          {/* Ideas Stream (Internal scroll) */}
          <div className="flex-1 overflow-y-auto p-5 lg:p-6 min-h-0">
            <div className="flex items-center justify-between gap-4 mb-3 max-w-3xl">
              <h3 className={`text-xs uppercase font-extrabold tracking-wider opacity-60 ${theme.textColor}`}>
                Ideas Shared ({ideas.length})
              </h3>
            </div>

            {/* Share Idea Input Box & Button */}
            <form onSubmit={handleShareIdea} className="mb-4 max-w-3xl">
              <div className="flex items-center gap-3 bg-white border-2 border-slate-200 p-1.5 pl-4 rounded-2xl shadow-lg focus-within:border-[#3B5BF6] transition-all">
                <input
                  type="text"
                  placeholder="Type your idea or notes to share..."
                  value={newIdeaText}
                  onChange={(e) => setNewIdeaText(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-sm font-semibold text-[#1A1A2E] placeholder:text-slate-400 placeholder:font-medium"
                  style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                />
                <button
                  type="submit"
                  disabled={!newIdeaText.trim()}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#3B5BF6] to-[#7C3AED] text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all cursor-pointer shrink-0"
                >
                  <span>Share Idea</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
            <div className="space-y-3 max-w-3xl">
              <AnimatePresence>
                {ideas.map((idea) => (
                  <motion.div
                    key={idea.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`${theme.cardStyle} rounded-2xl p-4 sm:p-5`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <p className={`font-bold text-sm ${theme.textColor}`}>
                          {idea.speakerName}
                        </p>
                        <p className={`text-[11px] ${theme.textColor} opacity-60`}>
                          {formatTime(Math.floor((Date.now() - idea.timestamp.getTime()) / 1000))} ago
                        </p>
                      </div>
                    </div>
                    
                    <p className={`${theme.textColor} text-xs sm:text-sm leading-relaxed mb-3`}>
                      {idea.content}
                    </p>

                    {/* Reactions */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleIdeaReaction(idea.id, 'agree')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          idea.hasUserAgreed 
                            ? 'bg-green-500 text-white' 
                            : `${theme.cardStyle} hover:bg-white/10`
                        }`}
                      >
                        <ThumbsUp className={`w-3.5 h-3.5 ${idea.hasUserAgreed ? 'fill-current' : ''}`} />
                        <span>{idea.agreeCount}</span>
                      </button>
                      
                      <button
                        onClick={() => handleIdeaReaction(idea.id, 'disagree')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          idea.hasUserDisagreed 
                            ? 'bg-red-500 text-white' 
                            : `${theme.cardStyle} hover:bg-white/10`
                        }`}
                      >
                        <ThumbsDown className={`w-3.5 h-3.5 ${idea.hasUserDisagreed ? 'fill-current' : ''}`} />
                        <span>{idea.disagreeCount}</span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar - Role-based Controls */}
      <div className={`${theme.cardStyle} px-6 py-3.5 shrink-0 border-t ${theme.textColor === 'text-white' ? 'border-white/10' : 'border-gray-200'}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left Controls */}
          <div className="flex items-center gap-3">
            {/* Listener & Speaker: Hand Raise */}
            {(userRole === 'listener' || userRole === 'speaker') && (
              <button
                onClick={handleHandRaise}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all hover:scale-105 cursor-pointer ${
                  handRaised ? theme.buttonClass : `${theme.cardStyle} hover:bg-white/10`
                }`}
              >
                <Hand className={`w-4 h-4 ${handRaised ? '' : 'opacity-70'}`} />
                <span>{handRaised ? 'Hand Raised' : 'Raise Hand'}</span>
              </button>
            )}

            {/* Debater: Mic Control */}
            {userRole === 'debater' && (
              <button
                onClick={handleMicToggle}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all hover:scale-105 cursor-pointer ${
                  !micMuted ? 'bg-green-500 text-white' : `${theme.cardStyle} hover:bg-white/10`
                }`}
              >
                {micMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                <span>{micMuted ? 'Unmute' : 'Muted'}</span>
              </button>
            )}

            {/* Speaker Timer */}
            {isUserSpeaking && userRole === 'speaker' && speakerTimeLeft !== null && (
              <div className={`px-4 py-2 rounded-xl text-xs ${speakerTimeLeft <= 30 ? 'bg-red-500 text-white' : theme.buttonClass}`}>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span className="font-mono font-bold">{formatTime(speakerTimeLeft)}</span>
                  <span className="text-xs opacity-80">remaining</span>
                </div>
              </div>
            )}
          </div>

          {/* Right Controls */}
          <button
            onClick={onLeave}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white text-xs font-extrabold transition-all hover:scale-105 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Leave Discussion</span>
          </button>
        </div>
      </div>
    </div>
  );
}