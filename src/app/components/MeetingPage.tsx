import { Radio, Users, Clock, Hand, ThumbsUp, ThumbsDown, Mic, MicOff, LogOut, Volume2, Headphones, Send, MessageSquare, X, PlayCircle, SkipForward } from 'lucide-react';
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
const SPEAK_LIMIT    = 180;
const TURN_COUNTDOWN = 10;

// ── Mic Visualizer Component ─────────────────────────────────
function MicVisualizer({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef   = useRef<number>(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef   = useRef<MediaStreamAudioSourceNode | null>(null);
  const ctxRef      = useRef<AudioContext | null>(null);
  const streamRef   = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!active) {
      // Stop visualizer
      cancelAnimationFrame(animRef.current);
      if (streamRef.current)  { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
      if (sourceRef.current)  { sourceRef.current.disconnect(); sourceRef.current = null; }
      if (ctxRef.current)     { ctxRef.current.close().catch(() => {}); ctxRef.current = null; }
      analyserRef.current = null;
      // Clear canvas
      const canvas = canvasRef.current;
      if (canvas) { const c = canvas.getContext('2d'); if (c) { c.clearRect(0, 0, canvas.width, canvas.height); } }
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current  = stream;
        const audioCtx     = new AudioContext();
        ctxRef.current     = audioCtx;
        const analyser     = audioCtx.createAnalyser();
        analyser.fftSize   = 64;
        analyserRef.current = analyser;
        const source       = audioCtx.createMediaStreamSource(stream);
        sourceRef.current  = source;
        source.connect(analyser);

        const draw = () => {
          if (cancelled) return;
          animRef.current = requestAnimationFrame(draw);
          const canvas = canvasRef.current;
          if (!canvas) return;
          const ctx    = canvas.getContext('2d');
          if (!ctx)    return;
          const W = canvas.width, H = canvas.height;
          ctx.clearRect(0, 0, W, H);

          const bufLen = analyser.frequencyBinCount;
          const data   = new Uint8Array(bufLen);
          analyser.getByteFrequencyData(data);

          const bars    = 20;
          const barW    = 3;
          const gap     = 2;
          const totalW  = bars * (barW + gap);
          const startX  = (W - totalW) / 2;

          for (let i = 0; i < bars; i++) {
            const idx      = Math.floor(i * bufLen / bars);
            const val      = data[idx] / 255;
            const barH     = Math.max(3, val * H * 0.85);
            const x        = startX + i * (barW + gap);
            const y        = (H - barH) / 2;
            const alpha    = 0.4 + val * 0.6;
            ctx.fillStyle  = `rgba(59,91,246,${alpha})`;
            ctx.beginPath();
            ctx.roundRect(x, y, barW, barH, 2);
            ctx.fill();
          }
        };
        draw();
      } catch { /* mic permission denied */ }
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(animRef.current);
      if (streamRef.current)  { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
      if (sourceRef.current)  { sourceRef.current.disconnect(); sourceRef.current = null; }
      if (ctxRef.current)     { ctxRef.current.close().catch(() => {}); ctxRef.current = null; }
    };
  }, [active]);

  if (!active) {
    // Static flat bars when muted
    return (
      <div className="flex items-center gap-0.5 h-6">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="w-[3px] rounded-full bg-gray-300" style={{ height: 3 }} />
        ))}
      </div>
    );
  }

  return <canvas ref={canvasRef} width={100} height={24} className="block" />;
}

const toAnonDisplay = (userId: string, myId: string, myName: string): string => {
  if (userId === myId) return myName;
  let hash = 0;
  for (let i = 0; i < userId.length; i++) { hash = ((hash << 5) - hash) + userId.charCodeAt(i); hash |= 0; }
  const code = Math.abs(hash).toString(36).toUpperCase().slice(0, 4).padEnd(4, 'X');
  return `DNL-${code}`;
};

interface QueueEntry { agoraUid: string; userId: string; anonId: string; joinedAt: number; }

interface MeetingPageProps {
  discussion: Discussion; currentTheme: Theme;
  userRole: Role; userName: string; onLeave: () => void;
}

export function MeetingPage({ discussion, currentTheme, userRole, userName, onLeave }: MeetingPageProps) {
  const theme   = themes[currentTheme];
  const isDark  = theme.textColor === 'text-white';
  const borderC = isDark ? 'border-white/10' : 'border-gray-200';

  // ── Speaker Queue state ──────────────────────────────────
  const [speakerQueue, setSpeakerQueue]       = useState<QueueEntry[]>([]);
  const [inQueue, setInQueue]                 = useState(false);
  const [myTurn, setMyTurn]                   = useState(false);       // it's my turn now
  const [turnCountdown, setTurnCountdown]     = useState(0);           // 10s to accept
  const [isSpeaking, setIsSpeaking]           = useState(false);       // actively speaking
  const turnTimerRef                          = useRef<ReturnType<typeof setInterval> | null>(null);
  const speakTimerRef2                        = useRef<ReturnType<typeof setInterval> | null>(null);

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
              id: String(u.uid), name: `DNL-${String(u.uid).slice(-4).toUpperCase()}`, role: 'listener' as Role, isSpeaking: false, handRaised: false,
            }]));
          client.on('user-joined', u => setParticipants(prev =>
            prev.find(p => p.id === String(u.uid)) ? prev : [...prev, {
              id: String(u.uid), name: `DNL-${String(u.uid).slice(-4).toUpperCase()}`, role: 'listener' as Role, isSpeaking: false, handRaised: false,
            }]));
          client.on('user-left',        u  => setParticipants(prev => prev.filter(p => p.id !== String(u.uid))));
          client.on('user-published',   (u, mt) => { if (mt === 'audio') setParticipants(prev => prev.map(p => p.id === String(u.uid) ? { ...p, isSpeaking: true  } : p)); });
          client.on('user-unpublished', (u, mt) => { if (mt === 'audio') setParticipants(prev => prev.map(p => p.id === String(u.uid) ? { ...p, isSpeaking: false } : p)); });
        }

        // Backend join — pass role so it gets locked in DB
        if (session?.access_token) fetch(`${API_URL}/api/discussions/${discussion.id}/join`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
          body: JSON.stringify({ role: userRole }),
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
          .on('broadcast', { event: 'queue_update' }, ({ payload }: any) => {
            // Sync queue from broadcaster
            setSpeakerQueue(payload.queue || []);
            // Check if it's MY turn (first in queue)
            if (payload.queue?.length > 0 && payload.queue[0].userId === userIdRef.current) {
              startMyTurn();
            }
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

      } catch (err: any) {
        if (!cancelled) {
          // Don't show mic errors as fatal — user can still participate as listener
          console.warn('Agora join warning:', err.message);
          if (err.message?.includes('permission') || err.message?.includes('token') || err.message?.includes('not active')) {
            setAgoraError(err.message);
          }
          // For mic/publish errors, silently continue
        }
      }
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

  // ── Queue broadcast helper ────────────────────────────────
  const broadcastQueue = (queue: QueueEntry[]) => {
    realtimeRef.current?.send({ type: 'broadcast', event: 'queue_update', payload: { queue } });
  };

  // ── Join / Leave queue ───────────────────────────────────────
  const handleJoinQueue = () => {
    if (userRole !== 'speaker') return;
    if (inQueue) {
      // Leave queue
      const next = speakerQueue.filter(e => e.userId !== currentUserId);
      setSpeakerQueue(next); setInQueue(false);
      broadcastQueue(next);
      // Update hand raise visual
      setParticipants(prev => prev.map(p => p.userId === currentUserId || p.id === String(toAgoraUid(currentUserId)) ? { ...p, handRaised: false } : p));
      realtimeRef.current?.track({ agoraUid: String(toAgoraUid(currentUserId)), userId: currentUserId, role: userRole, anonId: anonIdRef.current, handRaised: false });
    } else {
      // Join queue
      const entry: QueueEntry = { agoraUid: String(toAgoraUid(currentUserId)), userId: currentUserId, anonId: anonIdRef.current, joinedAt: Date.now() };
      const next = [...speakerQueue.filter(e => e.userId !== currentUserId), entry];
      setSpeakerQueue(next); setInQueue(true);
      broadcastQueue(next);
      // Update hand raise visual
      setParticipants(prev => prev.map(p => p.userId === currentUserId || p.id === String(toAgoraUid(currentUserId)) ? { ...p, handRaised: true } : p));
      realtimeRef.current?.track({ agoraUid: String(toAgoraUid(currentUserId)), userId: currentUserId, role: userRole, anonId: anonIdRef.current, handRaised: true });
      // If I'm first in queue, start my turn immediately
      if (next[0].userId === currentUserId) startMyTurn();
    }
  };

  // ── My turn starts (10s countdown) ───────────────────────────
  const startMyTurn = () => {
    if (turnTimerRef.current) clearInterval(turnTimerRef.current);
    setMyTurn(true); setTurnCountdown(TURN_COUNTDOWN);
    turnTimerRef.current = setInterval(() => {
      setTurnCountdown(prev => {
        if (prev <= 1) {
          clearInterval(turnTimerRef.current!);
          // Auto-skip if no action
          skipTurn();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // ── Accept turn → start speaking ─────────────────────────────
  const acceptTurn = async () => {
    if (turnTimerRef.current) clearInterval(turnTimerRef.current);
    setMyTurn(false); setTurnCountdown(0); setIsSpeaking(true);
    // Unmute mic
    try { await toggleMicrophone(true); setMicMuted(false); } catch { }
    // Start 3 min limit
    setSpeakerTimeLeft(SPEAK_LIMIT);
    if (speakerTimerRef.current) clearInterval(speakerTimerRef.current);
    speakerTimerRef.current = setInterval(() => {
      setSpeakerTimeLeft(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(speakerTimerRef.current!);
          endSpeaking(true);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    // Transcription
    if (!isTranscribing) {
      transcriptionService.start(meetingIdRef.current, userIdRef.current, anonIdRef.current,
        seg => seg.isFinal ? setLiveTranscript('') : setLiveTranscript(seg.text)
      ).then(() => setIsTranscribing(true)).catch(() => {});
    }
  };

  // ── Skip / Done speaking ──────────────────────────────────────
  const skipTurn = () => {
    if (turnTimerRef.current) clearInterval(turnTimerRef.current);
    setMyTurn(false); setTurnCountdown(0);
    // Remove from queue
    const next = speakerQueue.filter(e => e.userId !== currentUserId);
    setSpeakerQueue(next); setInQueue(false);
    broadcastQueue(next);
    setParticipants(prev => prev.map(p => p.userId === currentUserId || p.id === String(toAgoraUid(currentUserId)) ? { ...p, handRaised: false } : p));
  };

  const endSpeaking = async (auto = false) => {
    if (speakerTimerRef.current) clearInterval(speakerTimerRef.current);
    setSpeakerTimeLeft(null); setIsSpeaking(false); setMicMuted(true);
    try { await toggleMicrophone(false); } catch { }
    if (isTranscribing) { transcriptionService.stop().then(() => { setIsTranscribing(false); setLiveTranscript(''); }); }
    // Remove from front of queue, notify others
    const next = speakerQueue.filter(e => e.userId !== currentUserId);
    setSpeakerQueue(next); setInQueue(false);
    broadcastQueue(next);
    setParticipants(prev => prev.map(p => p.userId === currentUserId || p.id === String(toAgoraUid(currentUserId)) ? { ...p, handRaised: false } : p));
    realtimeRef.current?.track({ agoraUid: String(toAgoraUid(currentUserId)), userId: currentUserId, role: userRole, anonId: anonIdRef.current, handRaised: false });
  };

  const uniqueParticipants = participants.filter((p, i, arr) => arr.findIndex(x => x.id === p.id) === i);
  const raisedHands        = uniqueParticipants.filter(p => p.handRaised);
  const currentSpeaker     = uniqueParticipants.find(p => p.isSpeaking);

  // ── Bright light theme (fixed) ────────────────────────────
  const bg       = 'linear-gradient(160deg, #f8f7ff 0%, #eef2ff 50%, #faf5ff 100%)';
  const cardBg   = 'rgba(255,255,255,0.85)';
  const border   = '#e5e7f0';
  const txt      = '#1A1A2E';
  const txtMuted = 'rgba(26,26,46,0.5)';
  const accent   = '#3B5BF6';

  return (
    <div className="h-screen w-full overflow-hidden flex flex-col select-none"
      style={{ background: bg, fontFamily: 'Plus Jakarta Sans, sans-serif', color: txt }}>

      {/* ── Top Bar ── */}
      <div className="px-6 py-3 shrink-0 border-b" style={{ background: cardBg, borderColor: border, backdropFilter: 'blur(12px)' }}>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex items-center gap-2 bg-red-500 text-white px-3 py-1.5 rounded-full font-medium flex-shrink-0">
              <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-white" /></span>
              <Radio className="w-3.5 h-3.5" /><span className="text-xs font-black">LIVE</span>
            </div>
            <h1 className="font-extrabold text-base sm:text-lg truncate" style={{ color: txt }}>{discussion.title}</h1>
          </div>
          <div className="flex items-center gap-5 text-xs sm:text-sm font-semibold shrink-0" style={{ color: txtMuted }}>
            <div className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-amber-400" /><span>{formatTime(elapsedTime)}</span></div>
            <div className="flex items-center gap-1.5"><Users className="w-4 h-4" style={{ color: accent }} /><span>{uniqueParticipants.length} listening</span></div>
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
          {speakerQueue.length > 0 && (
            <div>
              <h3 className={`text-xs uppercase font-extrabold tracking-wider opacity-60 mb-2 ${theme.textColor}`}>Speaking Queue ({speakerQueue.length})</h3>
              <div className="space-y-2">
                {speakerQueue.map((entry, i) => {
                  const isMe = entry.userId === currentUserId;
                  return (
                    <div key={entry.userId} className={`rounded-xl px-3.5 py-2 flex items-center gap-2.5 ${
                      i === 0 ? 'bg-green-500/15 border border-green-500/30' : theme.cardStyle
                    }`}>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                        i === 0 ? 'bg-green-500 text-white' : theme.buttonClass
                      }`}>{i + 1}</div>
                      <span className="flex-1 text-xs font-semibold truncate">
                        {isMe ? `You${i === 0 ? ' — Your turn!' : ''}` : entry.anonId}
                      </span>
                      {i === 0 && <span className="relative flex h-2 w-2 shrink-0"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" /></span>}
                    </div>
                  );
                })}
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

            {/* ── Role Sections with real users ── */}
            <div className={`mt-5 pt-4 border-t ${borderC}`}>
              <h3 className={`text-[10px] uppercase font-extrabold tracking-wider opacity-50 mb-3 ${theme.textColor}`}>
                Role Guide
              </h3>
              <div className="space-y-2">
                {/* Listener */}
                {(() => {
                  const listeners = uniqueParticipants.filter(p => p.role === 'listener');
                  return (
                    <div className={`rounded-xl p-3 ${isDark ? 'bg-white/4' : 'bg-gray-50'} ${userRole === 'listener' ? `border ${isDark ? 'border-blue-400/30' : 'border-blue-300/50'}` : ''}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
                          <Headphones className="w-3 h-3 text-blue-400" />
                        </div>
                        <p className={`text-[11px] font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Listener</p>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full ml-auto font-bold ${isDark ? 'bg-white/10 text-white/60' : 'bg-gray-200 text-gray-600'}`}>{listeners.length}</span>
                      </div>
                      {listeners.length === 0 ? (
                        <p className={`text-[10px] ${isDark ? 'text-white/25' : 'text-gray-400'}`}>No listeners yet</p>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {listeners.map(p => {
                            const isMe = p.userId === currentUserId || p.id === String(toAgoraUid(currentUserId));
                            return (
                              <span key={p.id} className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
                                isMe
                                  ? 'bg-blue-500/25 text-blue-400 border border-blue-400/30'
                                  : isDark ? 'bg-white/8 text-white/40' : 'bg-gray-200 text-gray-500'
                              }`}>
                                {isMe ? 'You' : (p.userId ? toAnonDisplay(p.userId, currentUserId, userName) : p.name)}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Speaker */}
                {(() => {
                  const speakers = uniqueParticipants.filter(p => p.role === 'speaker');
                  return (
                    <div className={`rounded-xl p-3 ${isDark ? 'bg-white/4' : 'bg-gray-50'} ${userRole === 'speaker' ? `border ${isDark ? 'border-purple-400/30' : 'border-purple-300/50'}` : ''}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0">
                          <Mic className="w-3 h-3 text-purple-400" />
                        </div>
                        <p className={`text-[11px] font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Speaker</p>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full ml-auto font-bold ${isDark ? 'bg-white/10 text-white/60' : 'bg-gray-200 text-gray-600'}`}>{speakers.length}</span>
                      </div>
                      {speakers.length === 0 ? (
                        <p className={`text-[10px] ${isDark ? 'text-white/25' : 'text-gray-400'}`}>No speakers yet</p>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {speakers.map(p => {
                            const isMe = p.userId === currentUserId || p.id === String(toAgoraUid(currentUserId));
                            return (
                              <span key={p.id} className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                                isMe
                                  ? 'bg-purple-500/25 text-purple-400 border border-purple-400/30'
                                  : isDark ? 'bg-white/8 text-white/40' : 'bg-gray-200 text-gray-500'
                              }`}>
                                {p.isSpeaking && <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />}
                                {isMe ? 'You' : (p.userId ? toAnonDisplay(p.userId, currentUserId, userName) : p.name)}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Debater */}
                {(() => {
                  const debaters = uniqueParticipants.filter(p => p.role === 'debater');
                  return (
                    <div className={`rounded-xl p-3 ${isDark ? 'bg-white/4' : 'bg-gray-50'} ${userRole === 'debater' ? `border ${isDark ? 'border-orange-400/30' : 'border-orange-300/50'}` : ''}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-lg bg-orange-500/20 flex items-center justify-center shrink-0">
                          <Volume2 className="w-3 h-3 text-orange-400" />
                        </div>
                        <p className={`text-[11px] font-bold ${theme.textColor}`}>Debater</p>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full ml-auto ${isDark ? 'bg-white/10 text-white/40' : 'bg-gray-200 text-gray-500'}`}>{debaters.length}</span>
                      </div>
                      {debaters.length === 0 ? (
                        <p className={`text-[10px] ${isDark ? 'text-white/25' : 'text-gray-400'}`}>No debaters yet</p>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {debaters.map(p => {
                            const isMe = p.userId === currentUserId || p.id === String(toAgoraUid(currentUserId));
                            return (
                              <span key={p.id} className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                                isMe
                                  ? 'bg-orange-500/25 text-orange-400 border border-orange-400/30'
                                  : isDark ? 'bg-white/8 text-white/40' : 'bg-gray-200 text-gray-500'
                              }`}>
                                {p.isSpeaking && <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />}
                                {isMe ? 'You' : (p.userId ? toAnonDisplay(p.userId, currentUserId, userName) : p.name)}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
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
                  {/* Avatar */}
                  <div className={`w-16 h-16 rounded-full ${theme.buttonClass} flex items-center justify-center text-2xl font-black mx-auto mb-3 shadow-lg`}>
                    {currentSpeaker.name.charAt(0).toUpperCase()}
                  </div>
                  {/* Anonymous ID — visible to everyone */}
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold mb-2 ${isDark ? 'bg-white/10 text-white/60' : 'bg-gray-100 text-gray-500'}`}>
                    🎙️ {currentSpeaker.userId && currentSpeaker.userId !== currentUserId
                      ? toAnonDisplay(currentSpeaker.userId, currentUserId, userName)
                      : currentSpeaker.name === userName
                        ? 'You'
                        : toAnonDisplay(currentSpeaker.id, currentUserId, userName)
                    }
                  </div>
                  {/* Role badge */}
                  <p className={`text-xs font-semibold ${theme.textColor} opacity-60 capitalize`}>
                    {currentSpeaker.role} • Currently Speaking
                  </p>
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
        </div>
      </div>

      {/* ── My Turn Modal ── */}
      <AnimatePresence>
        {myTurn && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="rounded-3xl p-8 text-center max-w-sm w-full mx-4 shadow-2xl"
              style={{ background: isDark ? '#1a1a2e' : '#fff', border: '2px solid rgba(59,91,246,0.4)' }}
              initial={{ scale: 0.85, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.85, y: 20 }}>
              {/* Countdown ring */}
              <div className="relative w-24 h-24 mx-auto mb-5">
                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                  <circle cx="48" cy="48" r="40" fill="none" stroke="rgba(59,91,246,0.15)" strokeWidth="8" />
                  <circle cx="48" cy="48" r="40" fill="none" stroke="#3B5BF6" strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - turnCountdown / TURN_COUNTDOWN)}`}
                    strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s linear' }} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-black" style={{ color: '#3B5BF6' }}>{turnCountdown}</span>
                </div>
              </div>
              <h2 className="text-xl font-black mb-1 text-[#1A1A2E]">It's Your Turn!</h2>
              <p className="text-sm text-[#1A1A2E]/60 mb-6">Click Speak Now or it'll be skipped automatically</p>
              <div className="flex gap-3">
                <button onClick={skipTurn}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold transition-all bg-gray-100 hover:bg-gray-200 text-[#1A1A2E]">
                  <SkipForward className="w-4 h-4" /> Skip
                </button>
                <button onClick={acceptTurn}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-black bg-gradient-to-r from-[#3B5BF6] to-[#7C3AED] text-white shadow-lg hover:scale-105 transition-all">
                  <PlayCircle className="w-4 h-4" /> Speak Now
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Speaking active bar ── */}
      <AnimatePresence>
        {isSpeaking && speakerTimeLeft !== null && (
          <motion.div className="fixed top-16 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-5 py-2.5 rounded-2xl shadow-xl"
            style={{ background: 'linear-gradient(135deg,#3B5BF6,#7C3AED)', color: 'white' }}
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" /><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" /></span>
            <span className="text-xs font-black">SPEAKING</span>
            <span className={`font-mono font-black text-sm ${ speakerTimeLeft <= 30 ? 'text-red-300' : 'text-white'}`}>{formatTime(speakerTimeLeft)}</span>
            <button onClick={() => endSpeaking(false)}
              className="ml-2 px-3 py-1 rounded-xl bg-white/20 hover:bg-white/30 text-xs font-bold transition-all">
              Done
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Bottom Bar ── */}
      <div className={`${theme.cardStyle} px-6 py-3.5 shrink-0 border-t ${borderC}`}>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            {/* Speaker: Queue button */}
            {userRole === 'speaker' && !isSpeaking && (
              <button onClick={handleJoinQueue}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all hover:scale-105 cursor-pointer ${
                  inQueue
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500/30'
                    : `${theme.cardStyle} hover:bg-white/10`
                }`}>
                <Hand className="w-4 h-4" />
                <span>{inQueue ? `In Queue #${speakerQueue.findIndex(e => e.userId === currentUserId) + 1}` : 'Raise Hand'}</span>
              </button>
            )}
            {/* Speaker: Done speaking */}
            {userRole === 'speaker' && isSpeaking && (
              <button onClick={() => endSpeaking(false)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30 transition-all hover:scale-105 cursor-pointer">
                <MicOff className="w-4 h-4" /> Done Speaking
              </button>
            )}
            {/* Mic Visualizer — speaker speaking or debater unmuted */}
            {((userRole === 'speaker' && isSpeaking) || (userRole === 'debater' && !micMuted)) && (
              <div className="flex flex-col items-start gap-0.5 ml-1">
                <MicVisualizer active={true} />
                <span className="text-[9px] font-bold text-indigo-400 tracking-wide">MIC ACTIVE</span>
              </div>
            )}
            {((userRole === 'speaker' && !isSpeaking) || (userRole === 'debater' && micMuted)) && (
              <div className="flex flex-col items-start gap-0.5 ml-1">
                <MicVisualizer active={false} />
                <span className="text-[9px] font-bold text-gray-400 tracking-wide">MIC OFF</span>
              </div>
            )}
            {/* Listener: Raise hand */}
            {userRole === 'listener' && (
              <button onClick={handleHandRaise}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all hover:scale-105 cursor-pointer ${handRaised ? theme.buttonClass : `${theme.cardStyle} hover:bg-white/10`}`}>
                <Hand className={`w-4 h-4 ${handRaised ? '' : 'opacity-70'}`} /><span>{handRaised ? 'Hand Raised' : 'Raise Hand'}</span>
              </button>
            )}
            {/* Debater: mic */}
            {userRole === 'debater' && (
              <button onClick={handleMicToggle}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all hover:scale-105 cursor-pointer ${!micMuted ? 'bg-green-500 text-white' : `${theme.cardStyle} hover:bg-white/10`}`}>
                {micMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                <span>{micMuted ? 'Unmute' : 'Mute'}</span>
              </button>
            )}
            {(userRole === 'debater' || userRole === 'speaker') && (
              <div className="hidden" />
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
