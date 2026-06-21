import { Radio, Users, Clock, Hand, ThumbsUp, ThumbsDown, Mic, MicOff, LogOut, Volume2, Headphones, Send, MessageSquare, X } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Theme, Role, Discussion, Participant, HandRaiseRequest, Idea } from '../types';
import { themes } from '../config/themes';
import { motion, AnimatePresence } from 'motion/react';
import {
  joinAgoraChannel,
  leaveAgoraChannel,
  toggleMicrophone,
} from '../../services/agoraService';
import { getAgoraClient } from '../../services/agoraService';
import { supabase } from '../../lib/supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface ChatMsg {
  id: string
  message: string
  createdAt: string
  user: { id: string; name: string; anonymousId: string | null }
  pending?: boolean
}

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
  onLeave,
}: MeetingPageProps) {
  const theme = themes[currentTheme];

  // ── Timer ─────────────────────────────────────────────────
  const [elapsedTime, setElapsedTime] = useState(0);

  // ── Mic / hand state ──────────────────────────────────────
  const [micMuted, setMicMuted] = useState(true);
  const [handRaised, setHandRaised] = useState(false);
  const [speakerTimeLeft, setSpeakerTimeLeft] = useState<number | null>(null);

  // ── Agora ─────────────────────────────────────────────────
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [agoraJoined, setAgoraJoined] = useState(false);
  const [agoraError, setAgoraError] = useState<string | null>(null);
  const [ideas] = useState<Idea[]>([]);
  const speakerTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Realtime channel for hand raise ───────────────────────
  const realtimeRef = useRef<any>(null);

  // ── Chat ──────────────────────────────────────────────────
  const [chatOpen, setChatOpen]     = useState(true);
  const [chatMsgs, setChatMsgs]     = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput]   = useState('');
  const [chatSending, setChatSending] = useState(false);
  const [chatError, setChatError]   = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const pollRef       = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Get session token once ─────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSessionToken(session?.access_token || null);
      setCurrentUserId(session?.user?.id || null);
    });
  }, []);

  // ── Fetch chat messages ────────────────────────────────────
  const fetchMessages = useCallback(async () => {
    if (!sessionToken) return;
    try {
      const res = await fetch(`${API_URL}/api/discussions/${discussion.id}/messages?limit=60`, {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setChatMsgs(data.messages || []);
    } catch { /* silent */ }
  }, [discussion.id, sessionToken]);

  // Initial fetch + poll every 4s
  useEffect(() => {
    if (!sessionToken) return;
    fetchMessages();
    pollRef.current = setInterval(fetchMessages, 4000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [fetchMessages, sessionToken]);

  // Auto-scroll to bottom when messages arrive
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMsgs]);

  // ── Send message ──────────────────────────────────────────
  const sendMessage = async () => {
    const text = chatInput.trim();
    if (!text || chatSending || !sessionToken) return;

    // Optimistic
    const tempId = `tmp-${Date.now()}`;
    const optimistic: ChatMsg = {
      id: tempId,
      message: text,
      createdAt: new Date().toISOString(),
      user: { id: currentUserId || 'me', name: userName, anonymousId: null },
      pending: true,
    };
    setChatMsgs(prev => [...prev, optimistic]);
    setChatInput('');
    setChatSending(true);
    setChatError(null);

    try {
      const res = await fetch(`${API_URL}/api/discussions/${discussion.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to send');
      }

      const data = await res.json();
      // Replace optimistic with real
      setChatMsgs(prev => prev.map(m => m.id === tempId ? { ...data.message, pending: false } : m));
    } catch (err: any) {
      setChatError(err.message || 'Failed to send message');
      setChatMsgs(prev => prev.filter(m => m.id !== tempId));
    } finally {
      setChatSending(false);
    }
  };

  const handleChatKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  // ── Join Agora ─────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    const join = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id || 'guest-' + Date.now();
        await joinAgoraChannel(discussion.id, userId, userRole);
        if (cancelled) return;
        setAgoraJoined(true);
        setParticipants([{ id: userId, name: userName, role: userRole, isSpeaking: false }]);
        const client = getAgoraClient();
        if (client) {
          client.on('user-joined', (user) => {
            setParticipants(prev => {
              if (prev.find(p => p.id === String(user.uid))) return prev;
              return [...prev, { id: String(user.uid), name: `User-${String(user.uid).slice(0, 6)}`, role: 'listener', isSpeaking: false }];
            });
          });
          client.on('user-left',      (user) => setParticipants(prev => prev.filter(p => p.id !== String(user.uid))));
          client.on('user-published', (user, mediaType) => {
            if (mediaType === 'audio') setParticipants(prev => prev.map(p => p.id === String(user.uid) ? { ...p, isSpeaking: true } : p));
          });
          client.on('user-unpublished', (user, mediaType) => {
            if (mediaType === 'audio') setParticipants(prev => prev.map(p => p.id === String(user.uid) ? { ...p, isSpeaking: false } : p));
          });
        }
        if (session?.access_token) {
          fetch(`${API_URL}/api/discussions/${discussion.id}/join`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
          }).catch(() => {});
        }

        // ── Supabase Realtime: hand-raise broadcast ──────────
        const channel = supabase.channel(`meeting:${discussion.id}`, {
          config: { broadcast: { self: false } },
        });
        channel
          .on('broadcast', { event: 'hand_raise' }, ({ payload }: any) => {
            setParticipants(prev => prev.map(p =>
              p.id === payload.userId
                ? { ...p, handRaised: payload.raised, name: payload.name }
                : p
            ));
          })
          .subscribe();
        realtimeRef.current = channel;
      } catch (err: any) {
        if (!cancelled) setAgoraError(err.message || 'Failed to join audio');
      }
    };
    join();
    return () => {
      cancelled = true;
      leaveAgoraChannel().catch(() => {});
      if (realtimeRef.current) { supabase.removeChannel(realtimeRef.current); realtimeRef.current = null; }
    };
  }, [discussion.id, userRole, userName]);

  // ── Elapsed timer ──────────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => setElapsedTime(prev => prev + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const handleMicToggle = async () => {
    try {
      const next = !micMuted;
      await toggleMicrophone(!next);
      setMicMuted(next);
      if (userRole === 'speaker' && !next) {
        setSpeakerTimeLeft(180);
        speakerTimerRef.current = setInterval(() => {
          setSpeakerTimeLeft(prev => {
            if (prev === null || prev <= 1) {
              clearInterval(speakerTimerRef.current!);
              toggleMicrophone(false).catch(() => {});
              setMicMuted(true);
              return null;
            }
            return prev - 1;
          });
        }, 1000);
      } else if (next && speakerTimerRef.current) {
        clearInterval(speakerTimerRef.current);
        setSpeakerTimeLeft(null);
      }
    } catch (err: any) { console.error('Mic toggle error:', err); }
  };

  const currentSpeaker = participants.find(p => p.isSpeaking);
  const isDark = theme.textColor === 'text-white';
  const msgBubbleOwn  = isDark ? 'bg-indigo-600 text-white'   : 'bg-indigo-500 text-white';
  const msgBubbleOther = isDark ? 'bg-white/10 text-white'    : 'bg-gray-100 text-gray-800';

  return (
    <div className={`min-h-screen ${theme.background} ${theme.textColor} flex flex-col`}>
      {/* ── Header ── */}
      <div className={`flex items-center justify-between px-4 py-3 border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
        <div className="flex items-center gap-3">
          <Radio className="w-5 h-5 text-indigo-400 animate-pulse" />
          <div>
            <h1 className="font-semibold text-sm leading-tight line-clamp-1">{discussion.title}</h1>
            <div className="flex items-center gap-2 text-xs opacity-60">
              <Clock className="w-3 h-3" />
              <span>{formatTime(elapsedTime)}</span>
              <Users className="w-3 h-3 ml-1" />
              <span>{participants.length}</span>
            </div>
          </div>
        </div>
        <button
          onClick={onLeave}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 text-xs font-medium transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Leave
        </button>
      </div>

      {/* ── Main content ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Left: Participants + Controls ── */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Agora error banner */}
          {agoraError && (
            <div className="mx-4 mt-3 px-3 py-2 rounded-lg bg-red-500/20 text-red-400 text-xs">
              ⚠️ Audio: {agoraError}
            </div>
          )}

          {/* Current speaker */}
          {currentSpeaker && (
            <div className={`mx-4 mt-3 px-3 py-2 rounded-xl flex items-center gap-2 text-sm ${isDark ? 'bg-indigo-500/20' : 'bg-indigo-50 border border-indigo-200'}`}>
              <Volume2 className="w-4 h-4 text-indigo-400 animate-pulse" />
              <span className="font-medium">{currentSpeaker.name}</span>
              <span className="opacity-60 text-xs">is speaking…</span>
            </div>
          )}

          {/* Hands raised banner */}
          {participants.filter(p => (p as any).handRaised).length > 0 && (
            <div className={`mx-4 mt-2 px-3 py-2 rounded-xl flex items-center gap-2 text-sm flex-wrap ${isDark ? 'bg-yellow-500/15 border border-yellow-500/30' : 'bg-yellow-50 border border-yellow-200'}`}>
              <span className="text-base">✋</span>
              <span className="text-yellow-400 font-semibold text-xs">Hands raised:</span>
              {participants.filter(p => (p as any).handRaised).map(p => (
                <span key={p.id} className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300">{p.name}</span>
              ))}
            </div>
          )}

          {/* Participants grid */}
          <div className="flex-1 overflow-y-auto p-4 grid grid-cols-3 sm:grid-cols-4 gap-3 content-start">
            {participants.map(p => (
              <div
                key={p.id}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all relative ${
                  p.isSpeaking
                    ? 'ring-2 ring-indigo-400 ' + (isDark ? 'bg-indigo-500/10' : 'bg-indigo-50')
                    : (p as any).handRaised
                    ? 'ring-2 ring-yellow-400 ' + (isDark ? 'bg-yellow-500/10' : 'bg-yellow-50')
                    : isDark ? 'bg-white/5' : 'bg-gray-50'
                }`}
              >
                {/* Hand raised badge */}
                {(p as any).handRaised && (
                  <span className="absolute -top-1 -right-1 text-base animate-bounce">✋</span>
                )}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-base font-bold ${isDark ? 'bg-white/10' : 'bg-indigo-100 text-indigo-600'}`}>
                  {p.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs text-center line-clamp-1 opacity-80">{p.name}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  p.role === 'speaker' ? 'bg-indigo-500/30 text-indigo-300' :
                  p.role === 'moderator' ? 'bg-yellow-500/30 text-yellow-300' :
                  'bg-gray-500/20 text-gray-400'
                }`}>{p.role}</span>
              </div>
            ))}
          </div>

          {/* ── Bottom controls ── */}
          <div className={`px-4 py-3 border-t ${isDark ? 'border-white/10' : 'border-gray-200'} flex items-center justify-center gap-4`}>
            {/* Mic */}
            <button
              onClick={handleMicToggle}
              disabled={userRole === 'listener'}
              className={`p-3 rounded-full transition-all ${
                userRole === 'listener'
                  ? 'opacity-30 cursor-not-allowed bg-gray-500/20'
                  : micMuted
                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                  : 'bg-green-500/20 text-green-400 hover:bg-green-500/30 ring-2 ring-green-400'
              }`}
            >
              {micMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Speaker timer */}
            {speakerTimeLeft !== null && (
              <span className="text-xs text-yellow-400 font-mono">{formatTime(speakerTimeLeft)}</span>
            )}

            {/* Hand raise */}
            {userRole === 'listener' && (
              <button
                onClick={() => {
                  const next = !handRaised;
                  setHandRaised(next);
                  // Broadcast to all participants via Supabase Realtime
                  if (realtimeRef.current && currentUserId) {
                    realtimeRef.current.send({
                      type: 'broadcast',
                      event: 'hand_raise',
                      payload: { userId: currentUserId, name: userName, raised: next },
                    });
                  }
                  // Also update own participant card
                  setParticipants(prev => prev.map(p =>
                    p.id === currentUserId ? { ...p, handRaised: next } : p
                  ));
                }}
                className={`p-3 rounded-full transition-all ${
                  handRaised ? 'bg-yellow-500/20 text-yellow-400 ring-2 ring-yellow-400' : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                }`}
              >
                <Hand className="w-5 h-5" />
              </button>
            )}

            {/* Headphones indicator */}
            <div className="p-3 rounded-full bg-gray-500/10 text-gray-400">
              <Headphones className="w-5 h-5" />
            </div>

            {/* Chat toggle */}
            <button
              onClick={() => setChatOpen(o => !o)}
              className={`p-3 rounded-full transition-all ${chatOpen ? 'bg-indigo-500/20 text-indigo-400' : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'}`}
            >
              <MessageSquare className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── Right: Chat panel ── */}
        <AnimatePresence>
          {chatOpen && (
            <motion.div
              key="chat"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 300, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex flex-col border-l overflow-hidden ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'}`}
            >
              {/* Chat header */}
              <div className={`flex items-center justify-between px-3 py-2.5 border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                <span className="text-sm font-semibold flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-indigo-400" />
                  Chat
                </span>
                <button onClick={() => setChatOpen(false)} className="opacity-40 hover:opacity-70 transition-opacity">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
                {chatMsgs.length === 0 && (
                  <p className="text-xs opacity-40 text-center mt-4">No messages yet. Say something!</p>
                )}
                {chatMsgs.map(msg => {
                  const isOwn = msg.user.id === currentUserId;
                  return (
                    <div key={msg.id} className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                      {!isOwn && (
                        <span className="text-[10px] opacity-50 mb-0.5 ml-1">{msg.user.name}</span>
                      )}
                      <div className={`max-w-[85%] px-3 py-1.5 rounded-2xl text-sm ${isOwn ? msgBubbleOwn : msgBubbleOther} ${msg.pending ? 'opacity-60' : ''}`}>
                        {msg.message}
                      </div>
                    </div>
                  );
                })}
                <div ref={chatBottomRef} />
              </div>

              {/* Error */}
              {chatError && (
                <p className="text-xs text-red-400 px-3 pb-1">{chatError}</p>
              )}

              {/* Input */}
              <div className={`flex items-center gap-2 px-3 py-2 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={handleChatKey}
                  placeholder="Type a message…"
                  className={`flex-1 text-sm px-3 py-1.5 rounded-full outline-none ${
                    isDark ? 'bg-white/10 placeholder:text-white/30 text-white' : 'bg-white border border-gray-200 text-gray-800 placeholder:text-gray-400'
                  }`}
                />
                <button
                  onClick={sendMessage}
                  disabled={!chatInput.trim() || chatSending}
                  className="p-1.5 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white disabled:opacity-40 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
