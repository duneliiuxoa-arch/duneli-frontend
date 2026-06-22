import { Radio, Users, Clock, Hand, ThumbsUp, ThumbsDown, Mic, MicOff, LogOut, Volume2, Headphones, Send, MessageSquare, X } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Theme, Role, Discussion, Participant, Idea } from '../types';
import { themes } from '../config/themes';
import { motion, AnimatePresence } from 'motion/react';
import {
  joinAgoraChannel,
  leaveAgoraChannel,
  toggleMicrophone,
  getAgoraClient,
  toAgoraUid,
} from '../../services/agoraService';
import { transcriptionService } from '../../services/transcriptionService';
import { supabase } from '../../lib/supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface ChatMsg {
  id: string;
  message: string;
  createdAt: string;
  user: { id: string; name: string; anonymousId: string | null };
  pending?: boolean;
}

interface MeetingPageProps {
  discussion: Discussion;
  currentTheme: Theme;
  userRole: Role;
  userName: string;
  onLeave: () => void;
}

export function MeetingPage({ discussion, currentTheme, userRole, userName, onLeave }: MeetingPageProps) {
  const theme = themes[currentTheme];
  const isDark = theme.textColor === 'text-white';

  // ── State ─────────────────────────────────────────────────
  const [elapsedTime, setElapsedTime]       = useState(0);
  const [micMuted, setMicMuted]             = useState(true);
  const [handRaised, setHandRaised]         = useState(false);
  const [speakerTimeLeft, setSpeakerTimeLeft] = useState<number | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [participants, setParticipants]     = useState<Participant[]>([]);
  const [agoraError, setAgoraError]         = useState<string | null>(null);
  const [ideas, setIdeas]                   = useState<Idea[]>([]);
  const [chatOpen, setChatOpen]             = useState(false);
  const [chatMsgs, setChatMsgs]             = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput]           = useState('');
  const [chatSending, setChatSending]       = useState(false);
  const [chatError, setChatError]           = useState<string | null>(null);
  const [sessionToken, setSessionToken]     = useState<string | null>(null);
  const [currentUserId, setCurrentUserId]   = useState<string | null>(null);

  const realtimeRef    = useRef<any>(null);
  const speakerTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollRef        = useRef<ReturnType<typeof setInterval> | null>(null);
  const chatBottomRef  = useRef<HTMLDivElement>(null);
  const meetingIdRef   = useRef('');
  const userIdRef      = useRef('');
  const anonIdRef      = useRef('');

  // ── Session ────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSessionToken(session?.access_token || null);
      setCurrentUserId(session?.user?.id || null);
    });
  }, []);

  // ── Chat fetch ────────────────────────────────────────────
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

  useEffect(() => {
    if (!sessionToken) return;
    fetchMessages();
    pollRef.current = setInterval(fetchMessages, 4000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [fetchMessages, sessionToken]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMsgs]);

  // ── Send chat ─────────────────────────────────────────────
  const sendMessage = async () => {
    const text = chatInput.trim();
    if (!text || chatSending || !sessionToken) return;
    const tempId = `tmp-${Date.now()}`;
    setChatMsgs(prev => [...prev, { id: tempId, message: text, createdAt: new Date().toISOString(), user: { id: currentUserId || 'me', name: userName, anonymousId: null }, pending: true }]);
    setChatInput('');
    setChatSending(true);
    setChatError(null);
    try {
      const res = await fetch(`${API_URL}/api/discussions/${discussion.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sessionToken}` },
        body: JSON.stringify({ message: text }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Failed to send');
      const data = await res.json();
      setChatMsgs(prev => prev.map(m => m.id === tempId ? { ...data.message, pending: false } : m));
    } catch (err: any) {
      setChatError(err.message || 'Failed to send');
      setChatMsgs(prev => prev.filter(m => m.id !== tempId));
    } finally { setChatSending(false); }
  };

  const handleChatKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  // ── Agora + Supabase Presence ─────────────────────────────
  useEffect(() => {
    let cancelled = false;
    const join = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id || 'guest-' + Date.now();
        meetingIdRef.current = discussion.meetingId || discussion.id;
        userIdRef.current    = userId;
        anonIdRef.current    = session?.user?.user_metadata?.anonymousId || userId.slice(0, 8);

        await joinAgoraChannel(discussion.id, userId, userRole);
        if (cancelled) return;
        setParticipants([{ id: userId, name: userName, role: userRole, isSpeaking: false }]);

        const client = getAgoraClient();
        if (client) {
          client.remoteUsers.forEach(user => {
            setParticipants(prev => {
              if (prev.find(p => p.id === String(user.uid))) return prev;
              return [...prev, { id: String(user.uid), name: `User-${String(user.uid)}`, role: 'listener' as Role, isSpeaking: false }];
            });
          });
          client.on('user-joined', (user) => {
            setParticipants(prev => {
              if (prev.find(p => p.id === String(user.uid))) return prev;
              return [...prev, { id: String(user.uid), name: `User-${String(user.uid)}`, role: 'listener' as Role, isSpeaking: false }];
            });
          });
          client.on('user-left', (user) => setParticipants(prev => prev.filter(p => p.id !== String(user.uid))));
          client.on('user-published', (user, mediaType) => {
            if (mediaType === 'audio') setParticipants(prev => prev.map(p => p.id === String(user.uid) ? { ...p, isSpeaking: true } : p));
          });
          client.on('user-unpublished', (user, mediaType) => {
            if (mediaType === 'audio') setParticipants(prev => prev.map(p => p.id === String(user.uid) ? { ...p, isSpeaking: false } : p));
          });
        }

        if (session?.access_token) {
          fetch(`${API_URL}/api/discussions/${discussion.id}/join`, {
            method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
          }).catch(() => {});
        }

        // Supabase Presence
        const channel = supabase.channel(`meeting:${discussion.id}`, {
          config: { broadcast: { self: false }, presence: { key: userId } },
        });

        const updateFromPresence = (p: any) => {
          if (!p) return;
          setParticipants(prev => {
            const exists = prev.find(pt => pt.id === p.agoraUid || pt.id === p.userId);
            if (exists) return prev.map(pt => pt.id === p.agoraUid || pt.id === p.userId ? { ...pt, name: p.name, role: p.role as Role, handRaised: p.handRaised ?? false } : pt);
            return [...prev, { id: p.agoraUid, name: p.name, role: p.role as Role, isSpeaking: false, handRaised: p.handRaised ?? false }];
          });
        };

        channel
          .on('presence', { event: 'sync' }, () => {
            const state = channel.presenceState<any>();
            Object.values(state).forEach((presences: any) => updateFromPresence(presences[0]));
          })
          .on('presence', { event: 'join' }, ({ newPresences }: any) => updateFromPresence(newPresences[0]))
          .on('broadcast', { event: 'hand_raise' }, ({ payload }: any) => {
            setParticipants(prev => prev.map(p =>
              p.id === payload.agoraUid || p.id === payload.userId
                ? { ...p, handRaised: payload.raised, name: payload.name } : p
            ));
          })
          .subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
              await channel.track({ name: userName, role: userRole, agoraUid: String(toAgoraUid(userId)), userId, handRaised: false });
              const state = channel.presenceState<any>();
              Object.values(state).forEach((presences: any) => {
                const p = presences[0];
                if (!p || p.userId === userId) return;
                updateFromPresence(p);
              });
            }
          });

        realtimeRef.current = channel;
      } catch (err: any) {
        if (!cancelled) setAgoraError(err.message || 'Failed to join audio');
      }
    };
    join();
    return () => {
      cancelled = true;
      if (transcriptionService.getIsRunning()) transcriptionService.stop().catch(() => {});
      leaveAgoraChannel().catch(() => {});
      if (realtimeRef.current) { supabase.removeChannel(realtimeRef.current); realtimeRef.current = null; }
    };
  }, [discussion.id, userRole, userName]);

  // ── Timer ─────────────────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => setElapsedTime(prev => prev + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  // ── Mic toggle ────────────────────────────────────────────
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
              transcriptionService.stop().then(() => setIsTranscribing(false));
              return null;
            }
            return prev - 1;
          });
        }, 1000);
      } else if (next && speakerTimerRef.current) {
        clearInterval(speakerTimerRef.current);
        setSpeakerTimeLeft(null);
      }
      if (!next && (userRole === 'speaker' || userRole === 'debater')) {
        if (meetingIdRef.current && !isTranscribing) {
          transcriptionService.start(
            meetingIdRef.current, userIdRef.current, anonIdRef.current,
            (segment) => segment.isFinal ? setLiveTranscript('') : setLiveTranscript(segment.text)
          ).then(() => setIsTranscribing(true)).catch(() => {});
        }
      } else if (next && isTranscribing) {
        transcriptionService.stop().then(() => { setIsTranscribing(false); setLiveTranscript(''); });
      }
    } catch (err: any) { console.error('Mic error:', err); }
  };

  // ── Hand raise ────────────────────────────────────────────
  const handleHandRaise = () => {
    const next = !handRaised;
    setHandRaised(next);
    if (realtimeRef.current && currentUserId) {
      realtimeRef.current.send({
        type: 'broadcast', event: 'hand_raise',
        payload: { userId: currentUserId, agoraUid: String(toAgoraUid(currentUserId)), name: userName, raised: next },
      });
      realtimeRef.current.track({
        name: userName, role: userRole,
        agoraUid: String(toAgoraUid(currentUserId)), userId: currentUserId, handRaised: next,
      });
    }
    setParticipants(prev => prev.map(p =>
      p.id === String(toAgoraUid(currentUserId || '')) || p.id === currentUserId ? { ...p, handRaised: next } : p
    ));
  };

  // ── Idea reactions ────────────────────────────────────────
  const handleIdeaReaction = (ideaId: string, type: 'agree' | 'disagree') => {
    setIdeas(ideas.map(idea => {
      if (idea.id !== ideaId) return idea;
      if (type === 'agree') return { ...idea, hasUserAgreed: !idea.hasUserAgreed, hasUserDisagreed: false, agreeCount: idea.hasUserAgreed ? idea.agreeCount - 1 : idea.agreeCount + 1, disagreeCount: idea.hasUserDisagreed ? idea.disagreeCount - 1 : idea.disagreeCount };
      return { ...idea, hasUserDisagreed: !idea.hasUserDisagreed, hasUserAgreed: false, disagreeCount: idea.hasUserDisagreed ? idea.disagreeCount - 1 : idea.disagreeCount + 1, agreeCount: idea.hasUserAgreed ? idea.agreeCount - 1 : idea.agreeCount };
    }));
  };

  const currentSpeaker  = participants.find(p => p.isSpeaking);
  const raisedHands     = participants.filter(p => (p as any).handRaised);
  const msgBubbleOwn    = isDark ? 'bg-indigo-600 text-white' : 'bg-indigo-500 text-white';
  const msgBubbleOther  = isDark ? 'bg-white/10 text-white'   : 'bg-gray-100 text-gray-800';
  const borderCls       = isDark ? 'border-white/10' : 'border-gray-200';

  return (
    <div className={`min-h-screen ${theme.textColor} flex flex-col`} style={{ background: theme.background, fontFamily: 'var(--font-body)' }}>

      {/* ── Top Bar ── */}
      <div className={`${theme.cardStyle} px-6 py-4 border-b ${borderCls}`}>
        <div className="flex items-center justify-between gap-4 w-full">
          {/* Live badge + topic */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-full font-medium flex-shrink-0 text-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
              </span>
              <Radio className="w-4 h-4" />
              LIVE
            </div>
            <h1 className={`font-semibold truncate ${theme.textColor}`}>{discussion.title}</h1>
          </div>

          {/* Stats + Leave */}
          <div className="flex items-center gap-6">
            <div className={`hidden sm:flex items-center gap-6 ${theme.textColor} opacity-70`}>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4" />
                <span>{formatTime(elapsedTime)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4" />
                <span>{participants.length} in room</span>
              </div>
            </div>
            <button onClick={onLeave}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white font-medium transition-all text-sm">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Leave</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Error banner ── */}
      {agoraError && (
        <div className="mx-6 mt-3 px-4 py-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-sm">
          ⚠️ Audio: {agoraError}
        </div>
      )}

      {/* ── Main Layout ── */}
      <div className="flex-1 flex overflow-hidden w-full">

        {/* ── Left Panel — Queue & Participants ── */}
        <div className={`w-72 flex-shrink-0 ${theme.cardStyle} p-6 overflow-y-auto border-r ${borderCls} hidden md:block`}>

          {/* Your Role */}
          <div className="mb-6">
            <h3 className={`text-xs uppercase tracking-wider opacity-60 mb-3 ${theme.textColor}`}>Your Role</h3>
            <div className={`${theme.buttonClass} rounded-2xl px-4 py-3 flex items-center gap-3`}>
              {userRole === 'listener' && <Headphones className="w-5 h-5" />}
              {userRole === 'speaker'  && <Mic className="w-5 h-5" />}
              {userRole === 'debater'  && <Volume2 className="w-5 h-5" />}
              <span className="font-medium capitalize">{userRole}</span>
            </div>
          </div>

          {/* Speaker timer */}
          {speakerTimeLeft !== null && (
            <div className={`mb-4 px-4 py-3 rounded-2xl flex items-center gap-2 ${speakerTimeLeft <= 30 ? 'bg-red-500 text-white' : theme.buttonClass}`}>
              <Clock className="w-4 h-4" />
              <span className="font-mono font-bold">{formatTime(speakerTimeLeft)}</span>
              <span className="text-sm opacity-80">remaining</span>
            </div>
          )}

          {/* Hand Raise Queue */}
          {raisedHands.length > 0 && (
            <div className="mb-6">
              <h3 className={`text-xs uppercase tracking-wider opacity-60 mb-3 ${theme.textColor}`}>
                ✋ Speaking Queue ({raisedHands.length})
              </h3>
              <div className="space-y-2">
                {raisedHands.map((p, i) => (
                  <div key={p.id} className={`${theme.cardStyle} rounded-xl px-4 py-3 flex items-center gap-3`}>
                    <div className={`w-6 h-6 rounded-full ${theme.buttonClass} flex items-center justify-center text-xs font-bold`}>{i + 1}</div>
                    <span className="flex-1 text-sm">{p.name}</span>
                    <Hand className="w-4 h-4 opacity-60" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Participants */}
          <div>
            <h3 className={`text-xs uppercase tracking-wider opacity-60 mb-3 ${theme.textColor}`}>
              Participants ({participants.length})
            </h3>
            <div className="space-y-2">
              {participants.map(p => (
                <div key={p.id}
                  className={`rounded-xl px-4 py-3 flex items-center gap-3 relative ${
                    p.isSpeaking ? theme.buttonClass : `${theme.cardStyle} opacity-80`
                  }`}>
                  {(p as any).handRaised && (
                    <span className="absolute -top-1 -right-1 text-sm">✋</span>
                  )}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${p.isSpeaking ? 'bg-white/20' : 'bg-white/10'}`}>
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{p.name}</p>
                    <p className="text-xs opacity-60 capitalize">{p.role}</p>
                  </div>
                  {p.isSpeaking && (
                    <span className="relative flex h-2 w-2 flex-shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Center — Stage + Ideas + Chat ── */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col overflow-hidden">

            {/* Current Speaker Stage */}
            <div className={`p-6 border-b ${borderCls}`}>
              {currentSpeaker ? (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className={`${theme.cardStyle} rounded-3xl p-6 text-center`}>
                  <div className={`w-20 h-20 rounded-full ${theme.buttonClass} flex items-center justify-center text-3xl font-bold mx-auto mb-3`}>
                    {currentSpeaker.name.charAt(0).toUpperCase()}
                  </div>
                  <h2 className={`text-xl font-bold mb-1 ${theme.textColor}`} style={{ fontFamily: 'var(--font-heading)' }}>
                    {currentSpeaker.name}
                  </h2>
                  <p className={`${theme.textColor} opacity-60 text-sm capitalize`}>
                    {currentSpeaker.role} • Currently Speaking
                  </p>
                  {liveTranscript && (
                    <p className={`mt-3 text-sm italic opacity-70 ${theme.textColor}`}>🎙️ {liveTranscript}</p>
                  )}
                </motion.div>
              ) : (
                <div className={`${theme.cardStyle} rounded-3xl p-6 text-center opacity-50`}>
                  <Volume2 className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className={`text-sm ${theme.textColor}`}>No one is speaking yet</p>
                </div>
              )}
            </div>

            {/* Ideas Stream */}
            <div className="flex-1 overflow-y-auto p-6">
              <h3 className={`text-xs uppercase tracking-wider opacity-60 mb-4 ${theme.textColor}`}>Ideas Shared</h3>
              {ideas.length === 0 ? (
                <p className={`text-sm opacity-40 ${theme.textColor}`}>No ideas shared yet. The debate will unfold here.</p>
              ) : (
                <div className="space-y-4 max-w-3xl">
                  <AnimatePresence>
                    {ideas.map(idea => (
                      <motion.div key={idea.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                        className={`${theme.cardStyle} rounded-2xl p-5`}>
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div>
                            <p className={`font-medium text-sm ${theme.textColor}`}>{idea.speakerName}</p>
                            <p className={`text-xs ${theme.textColor} opacity-50`}>
                              {formatTime(Math.floor((Date.now() - idea.timestamp.getTime()) / 1000))} ago
                            </p>
                          </div>
                        </div>
                        <p className={`${theme.textColor} text-sm mb-4`}>{idea.content}</p>
                        <div className="flex items-center gap-3">
                          <button onClick={() => handleIdeaReaction(idea.id, 'agree')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all ${idea.hasUserAgreed ? 'bg-green-500 text-white' : `${theme.cardStyle} hover:bg-white/10`}`}>
                            <ThumbsUp className={`w-4 h-4 ${idea.hasUserAgreed ? 'fill-current' : ''}`} />
                            {idea.agreeCount}
                          </button>
                          <button onClick={() => handleIdeaReaction(idea.id, 'disagree')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all ${idea.hasUserDisagreed ? 'bg-red-500 text-white' : `${theme.cardStyle} hover:bg-white/10`}`}>
                            <ThumbsDown className={`w-4 h-4 ${idea.hasUserDisagreed ? 'fill-current' : ''}`} />
                            {idea.disagreeCount}
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* ── Bottom Controls ── */}
            <div className={`${theme.cardStyle} px-6 py-5 border-t ${borderCls}`}>
              <div className="flex items-center justify-between gap-4 w-full">
                <div className="flex items-center gap-3">

                  {/* Listener/Speaker: Hand Raise */}
                  {(userRole === 'listener' || userRole === 'speaker') && (
                    <button onClick={handleHandRaise}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-medium transition-all hover:scale-105 text-sm ${handRaised ? theme.buttonClass : `${theme.cardStyle} hover:bg-white/10`}`}>
                      <Hand className={`w-5 h-5 ${handRaised ? '' : 'opacity-70'}`} />
                      {handRaised ? 'Hand Raised' : 'Raise Hand'}
                    </button>
                  )}

                  {/* Debater/Speaker: Mic */}
                  {(userRole === 'debater' || userRole === 'speaker') && (
                    <button onClick={handleMicToggle}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-medium transition-all hover:scale-105 text-sm ${!micMuted ? 'bg-green-500 text-white' : `${theme.cardStyle} hover:bg-white/10`}`}>
                      {micMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                      {micMuted ? 'Unmute' : 'Mute'}
                    </button>
                  )}

                  {/* Chat toggle */}
                  <button onClick={() => setChatOpen(o => !o)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-medium transition-all hover:scale-105 text-sm ${chatOpen ? theme.buttonClass : `${theme.cardStyle} hover:bg-white/10`}`}>
                    <MessageSquare className="w-5 h-5" />
                    <span className="hidden sm:inline">Chat</span>
                  </button>

                  {/* Mobile: participants count */}
                  <div className={`md:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm ${theme.cardStyle} opacity-70`}>
                    <Users className="w-4 h-4" />
                    {participants.length}
                  </div>
                </div>

                {/* Leave */}
                <button onClick={onLeave}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white font-medium transition-all hover:scale-105 text-sm">
                  <LogOut className="w-5 h-5" />
                  <span className="hidden sm:inline">Leave Discussion</span>
                </button>
              </div>
            </div>
          </div>

          {/* ── Chat Panel ── */}
          <AnimatePresence>
            {chatOpen && (
              <motion.div
                key="chat"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 300, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className={`flex flex-col overflow-hidden border-l ${borderCls} ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}
                style={{ minWidth: 0 }}
              >
                {/* Header */}
                <div className={`flex items-center justify-between px-4 py-3 border-b ${borderCls} flex-shrink-0`}>
                  <span className={`text-sm font-semibold flex items-center gap-1.5 ${theme.textColor}`}>
                    <MessageSquare className="w-4 h-4 text-indigo-400" /> Chat
                  </span>
                  <button onClick={() => setChatOpen(false)} className="opacity-40 hover:opacity-70 p-1">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
                  {chatMsgs.length === 0 && (
                    <p className="text-xs opacity-40 text-center mt-6">No messages yet. Say something!</p>
                  )}
                  {chatMsgs.map(msg => {
                    const isOwn = msg.user.id === currentUserId;
                    return (
                      <div key={msg.id} className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                        {!isOwn && <span className="text-[10px] opacity-50 mb-0.5 ml-1">{msg.user.name}</span>}
                        <div className={`max-w-[85%] px-3 py-1.5 rounded-2xl text-sm ${isOwn ? msgBubbleOwn : msgBubbleOther} ${msg.pending ? 'opacity-60' : ''}`}>
                          {msg.message}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={chatBottomRef} />
                </div>

                {chatError && <p className="text-xs text-red-400 px-3 pb-1">{chatError}</p>}

                {/* Input */}
                <div className={`flex items-center gap-2 px-3 py-2.5 border-t ${borderCls} flex-shrink-0`}>
                  <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={handleChatKey}
                    placeholder="Type a message…"
                    className={`flex-1 text-sm px-3 py-1.5 rounded-full outline-none ${isDark ? 'bg-white/10 placeholder:text-white/30 text-white' : 'bg-white border border-gray-200 text-gray-800 placeholder:text-gray-400'}`}
                  />
                  <button onClick={sendMessage} disabled={!chatInput.trim() || chatSending}
                    className="p-1.5 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white disabled:opacity-40 transition-colors">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
