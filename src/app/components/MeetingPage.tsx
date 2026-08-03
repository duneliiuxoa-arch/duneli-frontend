import { Radio, Users, Clock, Hand, ThumbsUp, ThumbsDown, Mic, MicOff, LogOut, Volume2, Headphones, Send, MessageSquare, X } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Theme, Role, Discussion, Participant, Idea } from '../types';
import { themes } from '../config/themes';
import { motion, AnimatePresence } from 'motion/react';
import { subscribeIdeas, shareIdea, reactToIdea, type RealIdea } from '../../services/api';
import { supabase } from '../../lib/supabase';
import {
  joinAgoraChannel, leaveAgoraChannel, toggleMicrophone,
  getAgoraClient, toAgoraUid,
} from '../../services/agoraService';
import { transcriptionService } from '../../services/transcriptionService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// ── Anonymous ID generator ────────────────────────────────────
// Given a userId, always returns same DNL-XXXX string
const toAnonDisplay = (userId: string, myId: string, myName: string): string => {
  if (userId === myId) return myName; // sirf apna real naam khud ko dikhao
  // Hash userId to short 4-char code
  let hash = 0;
  for (let i = 0; i < userId.length; i++) { hash = ((hash << 5) - hash) + userId.charCodeAt(i); hash |= 0; }
  const code = Math.abs(hash).toString(36).toUpperCase().slice(0, 4).padEnd(4, 'X');
  return `DNL-${code}`;
};

interface ChatMsg {
  id: string; message: string; createdAt: string;
  user: { id: string; name: string; anonymousId: string | null }; pending?: boolean;
}

interface MeetingPageProps {
  discussion: Discussion; currentTheme: Theme;
  userRole: Role; userName: string; onLeave: () => void;
}

export function MeetingPage({ discussion, currentTheme, userRole, userName, onLeave }: MeetingPageProps) {
  const theme   = themes[currentTheme];
  const isDark  = theme.textColor === 'text-white';
  const borderC = isDark ? 'border-white/10' : 'border-gray-200';

  // ── Core state ────────────────────────────────────────────
  const [elapsedTime, setElapsedTime]         = useState(0);
  const [micMuted, setMicMuted]               = useState(true);
  const [handRaised, setHandRaised]           = useState(false);
  const [speakerTimeLeft, setSpeakerTimeLeft] = useState<number | null>(null);
  const [isTranscribing, setIsTranscribing]   = useState(false);
  const [liveTranscript, setLiveTranscript]   = useState('');
  const [participants, setParticipants]       = useState<(Participant & { handRaised?: boolean; userId?: string })[]>([]);
  const [agoraError, setAgoraError]           = useState<string | null>(null);
  const [sessionToken, setSessionToken]       = useState<string | null>(null);
  const [currentUserId, setCurrentUserId]     = useState<string>('');

  // ── Ideas state (real API) ─────────────────────────────────
  const [ideas, setIdeas]           = useState<Idea[]>([]);
  const [newIdeaText, setNewIdeaText] = useState('');
  const [ideaCooldown, setIdeaCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Chat state ─────────────────────────────────────────────
  const [chatOpen, setChatOpen]     = useState(false);
  const [chatMsgs, setChatMsgs]     = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput]   = useState('');
  const [chatSending, setChatSending] = useState(false);
  const chatBottomRef               = useRef<HTMLDivElement>(null);

  // ── Refs ───────────────────────────────────────────────────
  const realtimeRef     = useRef<any>(null);
  const speakerTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollRef         = useRef<ReturnType<typeof setInterval> | null>(null);
  const meetingIdRef    = useRef('');
  const userIdRef       = useRef('');
  const anonIdRef       = useRef('');

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  const canShareIdea = true; // ALL roles can share ideas — listener bhi

  // ── Session ────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSessionToken(session?.access_token || null);
      const uid = session?.user?.id || '';
      setCurrentUserId(uid);
      userIdRef.current = uid;
    });
  }, []);

  // ── Timer ──────────────────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => setElapsedTime(p => p + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // ── Real Ideas (via subscribeIdeas API) ────────────────────
  useEffect(() => {
    if (!discussion.id) return;
    const unsub = subscribeIdeas(discussion.id, (realIdeas: RealIdea[]) => {
      setIdeas(realIdeas.map(i => ({
        id:               i.id,
        speakerId:        i.userId,
        // Anonymous: show real name only to self
        speakerName:      i.userId === currentUserId ? (i.userName || userName) : (i.anonymousId || toAnonDisplay(i.userId, currentUserId, userName)),
        content:          i.content,
        timestamp:        i.createdAt,
        agreeCount:       i.agreeCount,
        disagreeCount:    i.disagreeCount,
        hasUserAgreed:    i.myReaction === 'agree',
        hasUserDisagreed: i.myReaction === 'disagree',
      })));
    });
    return unsub;
  }, [discussion.id, currentUserId]);

  // Cooldown ticker
  const startCooldown = (seconds: number) => {
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    setIdeaCooldown(seconds);
    cooldownRef.current = setInterval(() => {
      setIdeaCooldown(prev => { if (prev <= 1) { clearInterval(cooldownRef.current!); return 0; } return prev - 1; });
    }, 1000);
  };
  useEffect(() => () => { if (cooldownRef.current) clearInterval(cooldownRef.current); }, []);

  // ── Share idea ─────────────────────────────────────────────
  const handleShareIdea = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newIdeaText.trim() || ideaCooldown > 0) return;
    const text = newIdeaText.trim();
    setNewIdeaText('');
    const result = await shareIdea(discussion.id, text);
    if (result.cooldown) { startCooldown(result.cooldown); }
    else { startCooldown(300); }
  };

  // ── React to idea ──────────────────────────────────────────
  const handleIdeaReaction = async (ideaId: string, type: 'agree' | 'disagree') => {
    const result = await reactToIdea(ideaId, type);
    if (!result) return;
    setIdeas(prev => prev.map(idea => idea.id === ideaId ? {
      ...idea,
      agreeCount:       result.agreeCount,
      disagreeCount:    result.disagreeCount,
      hasUserAgreed:    result.myReaction === 'agree',
      hasUserDisagreed: result.myReaction === 'disagree',
    } : idea));
  };

  // ── Chat fetch ─────────────────────────────────────────────
  const fetchMessages = useCallback(async () => {
    if (!sessionToken) return;
    try {
      const res = await fetch(`${API_URL}/api/discussions/${discussion.id}/messages?limit=60`, {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      if (res.ok) { const d = await res.json(); setChatMsgs(d.messages || []); }
    } catch { /* silent */ }
  }, [discussion.id, sessionToken]);

  useEffect(() => {
    if (!sessionToken) return;
    fetchMessages();
    pollRef.current = setInterval(fetchMessages, 4000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [fetchMessages, sessionToken]);

  useEffect(() => { chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMsgs]);

  const sendMessage = async () => {
    const text = chatInput.trim();
    if (!text || chatSending || !sessionToken) return;
    const tempId = `tmp-${Date.now()}`;
    setChatMsgs(prev => [...prev, { id: tempId, message: text, createdAt: new Date().toISOString(), user: { id: currentUserId, name: userName, anonymousId: null }, pending: true }]);
    setChatInput(''); setChatSending(true);
    try {
      const res = await fetch(`${API_URL}/api/discussions/${discussion.id}/messages`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sessionToken}` },
        body: JSON.stringify({ message: text }),
      });
      if (!res.ok) throw new Error();
      const d = await res.json();
      setChatMsgs(prev => prev.map(m => m.id === tempId ? { ...d.message, pending: false } : m));
    } catch { setChatMsgs(prev => prev.filter(m => m.id !== tempId)); }
    finally { setChatSending(false); }
  };

  const handleChatKey = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  // ── Agora + Supabase Presence (REAL participants, ANONYMOUS) ─
  useEffect(() => {
    let cancelled = false;
    const join = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id || 'guest-' + Date.now();
        userIdRef.current    = userId;
        meetingIdRef.current = (discussion as any).meetingId || discussion.id;
        anonIdRef.current    = session?.user?.user_metadata?.anonymousId || `DNL-${userId.slice(0, 4).toUpperCase()}`;

        await joinAgoraChannel(discussion.id, userId, userRole);
        if (cancelled) return;

        // Add self — show real name to self
        setParticipants([{ id: String(toAgoraUid(userId)), name: userName, role: userRole, isSpeaking: false, userId, handRaised: false }]);

        const client = getAgoraClient();
        if (client) {
          // Existing remote users
          client.remoteUsers.forEach(u => setParticipants(prev =>
            prev.find(p => p.id === String(u.uid)) ? prev : [...prev, {
              id: String(u.uid), name: `DNL-...`, role: 'listener' as Role, isSpeaking: false, handRaised: false,
            }]));
          client.on('user-joined', u => setParticipants(prev =>
            prev.find(p => p.id === String(u.uid)) ? prev : [...prev, {
              id: String(u.uid), name: `DNL-...`, role: 'listener' as Role, isSpeaking: false, handRaised: false,
            }]));
          client.on('user-left',        u  => setParticipants(prev => prev.filter(p => p.id !== String(u.uid))));
          client.on('user-published',   (u, mt) => { if (mt === 'audio') setParticipants(prev => prev.map(p => p.id === String(u.uid) ? { ...p, isSpeaking: true  } : p)); });
          client.on('user-unpublished', (u, mt) => { if (mt === 'audio') setParticipants(prev => prev.map(p => p.id === String(u.uid) ? { ...p, isSpeaking: false } : p)); });
        }

        // Backend join
        if (session?.access_token) fetch(`${API_URL}/api/discussions/${discussion.id}/join`, {
          method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        }).catch(() => {});

        // Supabase Presence — send anonymousId, NOT real name
        const channel = supabase.channel(`meeting:${discussion.id}`, {
          config: { broadcast: { self: false }, presence: { key: userId } },
        });

        const applyPresence = (p: any, selfId: string) => {
          if (!p) return;
          const displayName = p.userId === selfId ? userName : (p.anonId || `DNL-${String(p.agoraUid).slice(0, 4)}`);
          setParticipants(prev => {
            const exists = prev.find(pt => pt.id === String(p.agoraUid) || pt.id === p.userId);
            const updated = { id: String(p.agoraUid), name: displayName, role: p.role as Role, isSpeaking: false, handRaised: p.handRaised ?? false, userId: p.userId };
            if (exists) return prev.map(pt => pt.id === String(p.agoraUid) || pt.id === p.userId ? { ...pt, name: displayName, role: p.role as Role, handRaised: p.handRaised ?? false, userId: p.userId } : pt);
            return [...prev, updated];
          });
        };

        channel
          .on('presence', { event: 'sync' }, () => {
            Object.values(channel.presenceState<any>()).forEach((ps: any) => applyPresence(ps[0], userId));
          })
          .on('presence', { event: 'join' }, ({ newPresences }: any) => applyPresence(newPresences[0], userId))
          .on('broadcast', { event: 'hand_raise' }, ({ payload }: any) => {
            setParticipants(prev => prev.map(p =>
              p.id === String(payload.agoraUid) || p.userId === payload.userId ? { ...p, handRaised: payload.raised } : p
            ));
          })
          .subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
              // Track with anonId — never broadcast real name
              await channel.track({
                agoraUid:   String(toAgoraUid(userId)),
                userId,
                role:       userRole,
                anonId:     anonIdRef.current,
                handRaised: false,
              });
              // Sync existing presence
              const state = channel.presenceState<any>();
              Object.values(state).forEach((ps: any) => { const p = ps[0]; if (!p || p.userId === userId) return; applyPresence(p, userId); });
            }
          });
        realtimeRef.current = channel;

        if (session?.access_token) fetch(`${API_URL}/api/discussions/${discussion.id}/join`, {
          method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        }).catch(() => {});

      } catch (err: any) { if (!cancelled) setAgoraError(err.message || 'Failed to join audio'); }
    };
    join();
    return () => {
      cancelled = true;
      if (transcriptionService.getIsRunning()) transcriptionService.stop().catch(() => {});
      leaveAgoraChannel().catch(() => {});
      if (realtimeRef.current) { supabase.removeChannel(realtimeRef.current); realtimeRef.current = null; }
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [discussion.id, userRole, userName]);

  // ── Mic toggle ─────────────────────────────────────────────
  const handleMicToggle = async () => {
    try {
      const next = !micMuted;
      await toggleMicrophone(!next);
      setMicMuted(next);
      if (userRole === 'speaker' && !next) {
        setSpeakerTimeLeft(180);
        speakerTimerRef.current = setInterval(() => setSpeakerTimeLeft(prev => {
          if (prev === null || prev <= 1) { clearInterval(speakerTimerRef.current!); toggleMicrophone(false).catch(() => {}); setMicMuted(true); transcriptionService.stop().then(() => setIsTranscribing(false)); return null; }
          return prev - 1;
        }), 1000);
      } else if (next && speakerTimerRef.current) { clearInterval(speakerTimerRef.current); setSpeakerTimeLeft(null); }
      if (!next && (userRole === 'speaker' || userRole === 'debater') && !isTranscribing) {
        transcriptionService.start(meetingIdRef.current, userIdRef.current, anonIdRef.current,
          (seg) => seg.isFinal ? setLiveTranscript('') : setLiveTranscript(seg.text)
        ).then(() => setIsTranscribing(true)).catch(() => {});
      } else if (next && isTranscribing) { transcriptionService.stop().then(() => { setIsTranscribing(false); setLiveTranscript(''); }); }
    } catch (err: any) { console.error('Mic error:', err); }
  };

  // ── Hand raise ─────────────────────────────────────────────
  const handleHandRaise = () => {
    if (userRole !== 'listener' && userRole !== 'speaker') return;
    const next = !handRaised; setHandRaised(next);
    if (realtimeRef.current && currentUserId) {
      realtimeRef.current.send({ type: 'broadcast', event: 'hand_raise', payload: { userId: currentUserId, agoraUid: String(toAgoraUid(currentUserId)), raised: next } });
      realtimeRef.current.track({ agoraUid: String(toAgoraUid(currentUserId)), userId: currentUserId, role: userRole, anonId: anonIdRef.current, handRaised: next });
    }
    setParticipants(prev => prev.map(p => p.id === String(toAgoraUid(currentUserId)) || p.userId === currentUserId ? { ...p, handRaised: next } : p));
  };

  const uniqueParticipants = participants.filter((p, i, arr) => arr.findIndex(x => x.id === p.id) === i);
  const raisedHands        = uniqueParticipants.filter(p => p.handRaised);
  const currentSpeaker     = uniqueParticipants.find(p => p.isSpeaking);

  return (
    <div className={`h-screen w-full overflow-hidden ${theme.textColor} flex flex-col select-none`}
      style={{ background: theme.background, fontFamily: 'var(--font-body)' }}>

      {/* ── Top Bar ── */}
      <div className={`${theme.cardStyle} px-6 py-3 shrink-0 border-b ${borderC}`}>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex items-center gap-2 bg-red-500 text-white px-3 py-1.5 rounded-full font-medium flex-shrink-0">
              <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-white" /></span>
              <Radio className="w-3.5 h-3.5" /><span className="text-xs font-black">LIVE</span>
            </div>
            <h1 className={`font-extrabold text-base sm:text-lg truncate ${theme.textColor}`}>{discussion.title}</h1>
          </div>
          <div className={`flex items-center gap-5 text-xs sm:text-sm font-semibold ${theme.textColor} opacity-80 shrink-0`}>
            <div className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-amber-400" /><span>{formatTime(elapsedTime)}</span></div>
            <div className="flex items-center gap-1.5"><Users className="w-4 h-4 text-[#3B5BF6]" /><span>{uniqueParticipants.length} listening</span></div>
          </div>
        </div>
      </div>

      {agoraError && (
        <div className="mx-4 mt-2 px-4 py-2 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs shrink-0">⚠️ Audio: {agoraError}</div>
      )}

      {/* ── Main Content ── */}
      <div className="flex-1 flex overflow-hidden min-h-0">

        {/* ── Left Panel ── */}
        <div className={`w-72 lg:w-80 ${theme.cardStyle} p-5 overflow-y-auto shrink-0 border-r ${borderC} space-y-5`}>

          {/* Your Role */}
          <div>
            <h3 className={`text-xs uppercase font-extrabold tracking-wider opacity-60 mb-2 ${theme.textColor}`}>Your Role</h3>
            <div className={`${theme.buttonClass} rounded-xl px-3.5 py-2.5 flex items-center gap-2.5`}>
              {userRole === 'listener' && <Headphones className="w-4 h-4" />}
              {userRole === 'speaker'  && <Mic className="w-4 h-4" />}
              {userRole === 'debater'  && <Volume2 className="w-4 h-4" />}
              <span className="font-extrabold text-xs capitalize">{userRole}</span>
            </div>
          </div>

          {/* Speaker timer */}
          {speakerTimeLeft !== null && (
            <div className={`px-4 py-2.5 rounded-xl flex items-center gap-2 ${speakerTimeLeft <= 30 ? 'bg-red-500 text-white' : theme.buttonClass}`}>
              <Clock className="w-4 h-4" /><span className="font-mono font-bold text-sm">{formatTime(speakerTimeLeft)}</span><span className="text-xs opacity-80">remaining</span>
            </div>
          )}

          {/* Speaking Queue */}
          {raisedHands.length > 0 && (
            <div>
              <h3 className={`text-xs uppercase font-extrabold tracking-wider opacity-60 mb-2 ${theme.textColor}`}>Speaking Queue ({raisedHands.length})</h3>
              <div className="space-y-2">
                {raisedHands.map((p, i) => (
                  <div key={p.id} className={`${theme.cardStyle} rounded-xl px-3.5 py-2 flex items-center gap-2.5`}>
                    <div className={`w-5 h-5 rounded-full ${theme.buttonClass} flex items-center justify-center text-[10px] font-bold shrink-0`}>{i + 1}</div>
                    <span className="flex-1 text-xs font-semibold truncate">{p.name}</span>
                    <Hand className="w-3.5 h-3.5 opacity-60 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Participants — anonymous */}
          <div>
            <h3 className={`text-xs uppercase font-extrabold tracking-wider opacity-60 mb-2 ${theme.textColor}`}>Participants ({uniqueParticipants.length})</h3>
            <div className="space-y-2">
              {uniqueParticipants.map(p => {
                const isMe = p.userId === currentUserId || p.id === String(toAgoraUid(currentUserId));
                return (
                  <div key={p.id} className={`rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 relative ${p.isSpeaking ? theme.buttonClass : `${theme.cardStyle} opacity-70`}`}>
                    {p.handRaised && <span className="absolute -top-1 -right-1 text-sm">✋</span>}
                    <div className={`w-7 h-7 rounded-full ${p.isSpeaking ? 'bg-white/20' : 'bg-white/10'} flex items-center justify-center text-xs font-bold shrink-0`}>
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-xs truncate flex items-center gap-1.5">
                        {p.name}
                        {isMe && <span className="text-[9px] px-1.5 py-0.5 rounded-full opacity-60" style={{ background: 'rgba(255,255,255,0.1)' }}>you</span>}
                      </p>
                      <p className="text-[10px] opacity-75 capitalize">{p.role}</p>
                    </div>
                    {p.isSpeaking && <span className="relative flex h-2 w-2 shrink-0"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" /></span>}
                  </div>
                );
              })}
            </div>
            {/* Privacy note */}
            <p className="text-[10px] opacity-30 mt-3 text-center">🔒 Names are anonymous to others</p>
          </div>
        </div>

        {/* ── Center + Chat ── */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          <div className="flex-1 flex flex-col overflow-hidden min-h-0">

            {/* Current Speaker */}
            <div className={`p-5 lg:p-6 shrink-0 border-b ${borderC}`}>
              {currentSpeaker ? (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  className={`${theme.cardStyle} rounded-2xl p-5 text-center`}>
                  <div className={`w-16 h-16 rounded-full ${theme.buttonClass} flex items-center justify-center text-2xl font-black mx-auto mb-2 shadow-lg`}>{currentSpeaker.name.charAt(0).toUpperCase()}</div>
                  <h2 className={`text-xl font-black mb-0.5 ${theme.textColor}`}>{currentSpeaker.name}</h2>
                  <p className={`text-xs font-semibold ${theme.textColor} opacity-75 capitalize`}>{currentSpeaker.role} • Currently Speaking</p>
                  {liveTranscript && <p className={`mt-2 text-xs italic opacity-60 ${theme.textColor}`}>🎙️ {liveTranscript}</p>}
                </motion.div>
              ) : (
                <div className={`${theme.cardStyle} rounded-2xl p-5 text-center opacity-50`}>
                  <Volume2 className="w-8 h-8 mx-auto mb-1 opacity-40" />
                  <p className={`text-xs ${theme.textColor}`}>No one is speaking yet</p>
                </div>
              )}
            </div>

            {/* Ideas Stream */}
            <div className="flex-1 overflow-y-auto p-5 lg:p-6 min-h-0">
              <div className="flex items-center justify-between mb-3 max-w-3xl">
                <h3 className={`text-xs uppercase font-extrabold tracking-wider opacity-60 ${theme.textColor}`}>Ideas Shared ({ideas.length})</h3>
                {ideaCooldown > 0 && canShareIdea && (
                  <span className={`text-xs font-mono px-2 py-1 rounded-full ${isDark ? 'bg-yellow-500/15 text-yellow-400' : 'bg-yellow-50 text-yellow-600 border border-yellow-200'}`}>
                    Next in {formatTime(ideaCooldown)}
                  </span>
                )}
              </div>

              {/* Idea Input — speaker/debater only */}
              {canShareIdea && (
                <form onSubmit={handleShareIdea} className="mb-4 max-w-3xl">
                  {ideaCooldown > 0 ? (
                    <div className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                      <Clock className="w-4 h-4 opacity-40 shrink-0" />
                      <p className="text-xs opacity-50 flex-1">Next idea in</p>
                      <span className={`text-sm font-mono font-bold ${ideaCooldown <= 30 ? 'text-green-400' : isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>{formatTime(ideaCooldown)}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 bg-white border-2 border-slate-200 p-1.5 pl-4 rounded-2xl shadow-lg focus-within:border-[#3B5BF6] transition-all">
                      <input type="text" placeholder="Type your idea or notes to share..." value={newIdeaText}
                        onChange={e => setNewIdeaText(e.target.value)}
                        className="flex-1 bg-transparent outline-none text-sm font-semibold text-[#1A1A2E] placeholder:text-slate-400 placeholder:font-medium"
                        style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }} />
                      <button type="submit" disabled={!newIdeaText.trim()}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#3B5BF6] to-[#7C3AED] text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md hover:scale-105 disabled:opacity-40 disabled:hover:scale-100 transition-all shrink-0">
                        <span>Share Idea</span><Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </form>
              )}

              {/* Ideas list */}
              <div className="space-y-3 max-w-3xl">
                {ideas.length === 0 && <p className={`text-xs opacity-40 ${theme.textColor}`}>{canShareIdea ? 'Share your first idea above.' : 'No ideas shared yet.'}</p>}
                <AnimatePresence>
                  {ideas.map(idea => {
                    const isOwn = idea.speakerId === currentUserId;
                    return (
                      <motion.div key={idea.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                        className={`${theme.cardStyle} rounded-2xl p-4 sm:p-5`}>
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <p className={`font-bold text-sm ${theme.textColor} flex items-center gap-1.5`}>
                              {idea.speakerName}
                              {isOwn && <span className="text-[9px] px-1.5 py-0.5 rounded-full opacity-50" style={{ background: 'rgba(255,255,255,0.1)' }}>you</span>}
                            </p>
                            <p className={`text-[11px] ${theme.textColor} opacity-60`}>{formatTime(Math.floor((Date.now() - idea.timestamp.getTime()) / 1000))} ago</p>
                          </div>
                        </div>
                        <p className={`${theme.textColor} text-xs sm:text-sm leading-relaxed mb-3`}>{idea.content}</p>
                        <div className="flex items-center gap-3">
                          <button onClick={() => handleIdeaReaction(idea.id, 'agree')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${idea.hasUserAgreed ? 'bg-green-500 text-white' : `${theme.cardStyle} hover:bg-white/10`}`}>
                            <ThumbsUp className={`w-3.5 h-3.5 ${idea.hasUserAgreed ? 'fill-current' : ''}`} /><span>{idea.agreeCount}</span>
                          </button>
                          <button onClick={() => handleIdeaReaction(idea.id, 'disagree')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${idea.hasUserDisagreed ? 'bg-red-500 text-white' : `${theme.cardStyle} hover:bg-white/10`}`}>
                            <ThumbsDown className={`w-3.5 h-3.5 ${idea.hasUserDisagreed ? 'fill-current' : ''}`} /><span>{idea.disagreeCount}</span>
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* ── Chat Panel ── */}
          <AnimatePresence>
            {chatOpen && (
              <motion.div key="chat" initial={{ width: 0, opacity: 0 }} animate={{ width: 280, opacity: 1 }} exit={{ width: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                className={`flex flex-col overflow-hidden border-l ${borderC} ${isDark ? 'bg-white/5' : 'bg-gray-50'}`} style={{ minWidth: 0 }}>
                <div className={`flex items-center justify-between px-4 py-3 border-b ${borderC} shrink-0`}>
                  <span className={`text-xs font-extrabold flex items-center gap-1.5 ${theme.textColor}`}><MessageSquare className="w-3.5 h-3.5 text-indigo-400" />Chat</span>
                  <button onClick={() => setChatOpen(false)} className="opacity-40 hover:opacity-70"><X className="w-4 h-4" /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
                  {chatMsgs.length === 0 && <p className="text-xs opacity-40 text-center mt-6">No messages yet.</p>}
                  {chatMsgs.map(msg => {
                    const isOwn = msg.user.id === currentUserId;
                    // Anonymous chat — show DNL id for others
                    const displayName = isOwn ? 'You' : (msg.user.anonymousId || toAnonDisplay(msg.user.id, currentUserId, userName));
                    return (
                      <div key={msg.id} className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                        {!isOwn && <span className="text-[10px] opacity-50 mb-0.5 ml-1">{displayName}</span>}
                        <div className={`max-w-[85%] px-3 py-1.5 rounded-2xl text-xs ${isOwn ? (isDark ? 'bg-indigo-600 text-white' : 'bg-indigo-500 text-white') : (isDark ? 'bg-white/10 text-white' : 'bg-white border border-gray-200 text-gray-800')} ${msg.pending ? 'opacity-60' : ''}`}>
                          {msg.message}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={chatBottomRef} />
                </div>
                <div className={`flex items-center gap-2 px-3 py-2.5 border-t ${borderC} shrink-0`}>
                  <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={handleChatKey} placeholder="Type a message…"
                    className={`flex-1 text-xs px-3 py-1.5 rounded-full outline-none ${isDark ? 'bg-white/10 placeholder:text-white/30 text-white' : 'bg-white border border-gray-200 text-gray-800 placeholder:text-gray-400'}`} />
                  <button onClick={sendMessage} disabled={!chatInput.trim() || chatSending}
                    className="p-1.5 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white disabled:opacity-40 transition-colors shrink-0">
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Bottom Bar ── */}
      <div className={`${theme.cardStyle} px-6 py-3.5 shrink-0 border-t ${borderC}`}>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            {(userRole === 'listener' || userRole === 'speaker') && (
              <button onClick={handleHandRaise}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all hover:scale-105 cursor-pointer ${handRaised ? theme.buttonClass : `${theme.cardStyle} hover:bg-white/10`}`}>
                <Hand className={`w-4 h-4 ${handRaised ? '' : 'opacity-70'}`} /><span>{handRaised ? 'Hand Raised' : 'Raise Hand'}</span>
              </button>
            )}
            {(userRole === 'debater' || userRole === 'speaker') && (
              <button onClick={handleMicToggle}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all hover:scale-105 cursor-pointer ${!micMuted ? 'bg-green-500 text-white' : `${theme.cardStyle} hover:bg-white/10`}`}>
                {micMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                <span>{micMuted ? 'Unmute' : 'Mute'}</span>
              </button>
            )}
            {(userRole === 'debater' || userRole === 'speaker') && (
              <button onClick={() => setChatOpen(o => !o)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all hover:scale-105 cursor-pointer ${chatOpen ? theme.buttonClass : `${theme.cardStyle} hover:bg-white/10`}`}>
                <MessageSquare className="w-4 h-4" /><span>Chat</span>
              </button>
            )}
          </div>
          <button onClick={onLeave}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white text-xs font-extrabold transition-all hover:scale-105 cursor-pointer">
            <LogOut className="w-4 h-4" /><span>Leave Discussion</span>
          </button>
        </div>
      </div>
    </div>
  );
}
