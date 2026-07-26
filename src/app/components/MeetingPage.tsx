import { Radio, Users, Clock, Hand, ThumbsUp, ThumbsDown, Mic, MicOff, LogOut, Volume2, Headphones, Send, MessageSquare, X } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Theme, Role, Discussion, Participant, Idea } from '../types';
import { themes } from '../config/themes';
import { motion, AnimatePresence } from 'motion/react';
import { MicVisualizer } from './MicVisualizer';
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
  const [ideaInput, setIdeaInput]           = useState('');
  const [ideaCooldown, setIdeaCooldown]     = useState(0);
  const ideaCooldownRef                     = useRef<ReturnType<typeof setInterval> | null>(null);
  const [chatOpen, setChatOpen]             = useState(false);
  const [chatMsgs, setChatMsgs]             = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput]           = useState('');
  const [chatSending, setChatSending]       = useState(false);
  const [chatError, setChatError]           = useState<string | null>(null);
  const [sessionToken, setSessionToken]     = useState<string | null>(null);
  const [currentUserId, setCurrentUserId]   = useState<string | null>(null);

  // ── Queue state ───────────────────────────────────────────
  // Each entry: { userId, name, joinedAt (timestamp for ordering) }
  const [speakingQueue, setSpeakingQueue]   = useState<{ userId: string; name: string; joinedAt: number }[]>([]);
  const [isSpeaking, setIsSpeaking]         = useState(false); // this user is currently speaking
  const speakingTimerRef                    = useRef<ReturnType<typeof setInterval> | null>(null);
  const SPEAK_LIMIT_SEC                     = 180; // 3 minutes

  const realtimeRef    = useRef<any>(null);
  const ideasChannelRef = useRef<any>(null);
  const speakerTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollRef        = useRef<ReturnType<typeof setInterval> | null>(null);
  const chatBottomRef  = useRef<HTMLDivElement>(null);
  const ideasBottomRef  = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    ideasBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ideas]);

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
          // ── Queue sync broadcasts ──────────────────────────
          .on('broadcast', { event: 'queue_join' }, ({ payload }: any) => {
            setSpeakingQueue(prev => {
              if (prev.find(q => q.userId === payload.userId)) return prev;
              return [...prev, { userId: payload.userId, name: payload.name, joinedAt: payload.joinedAt }]
                .sort((a, b) => a.joinedAt - b.joinedAt);
            });
          })
          .on('broadcast', { event: 'queue_leave' }, ({ payload }: any) => {
            setSpeakingQueue(prev => prev.filter(q => q.userId !== payload.userId));
          })
          .on('broadcast', { event: 'queue_speaking_start' }, ({ payload }: any) => {
            // When someone starts speaking, remove them from queue display
            setSpeakingQueue(prev => prev.filter(q => q.userId !== payload.userId));
            setParticipants(prev => prev.map(p =>
              p.id === payload.userId || p.id === payload.agoraUid
                ? { ...p, isSpeaking: true } : p
            ));
          })
          .on('broadcast', { event: 'queue_speaking_end' }, ({ payload }: any) => {
            setParticipants(prev => prev.map(p =>
              p.id === payload.userId ? { ...p, isSpeaking: false, handRaised: false } : p
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

  // ── Hand raise → Queue join/leave ─────────────────────────
  const handleHandRaise = () => {
    if (isSpeaking) return; // disabled while speaking
    const next = !handRaised;
    setHandRaised(next);
    const userId = currentUserId || userIdRef.current;
    const agoraUid = String(toAgoraUid(userId));

    if (next) {
      const joinedAt = Date.now();
      setSpeakingQueue(prev => {
        if (prev.find(q => q.userId === userId)) return prev;
        return [...prev, { userId, name: userName, joinedAt }].sort((a, b) => a.joinedAt - b.joinedAt);
      });
      realtimeRef.current?.send({ type: 'broadcast', event: 'queue_join', payload: { userId, agoraUid, name: userName, joinedAt } });
    } else {
      setSpeakingQueue(prev => prev.filter(q => q.userId !== userId));
      realtimeRef.current?.send({ type: 'broadcast', event: 'queue_leave', payload: { userId } });
    }
    realtimeRef.current?.track({ name: userName, role: userRole, agoraUid, userId, handRaised: next });
    setParticipants(prev => prev.map(p => p.id === agoraUid || p.id === userId ? { ...p, handRaised: next } : p));
  };

  const [skipTimer, setSkipTimer] = useState<number | null>(null);
  const skipTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Start speaking ────────────────────────────────────────
  const startSpeaking = () => {
    const userId = currentUserId || userIdRef.current;
    const agoraUid = String(toAgoraUid(userId));
    // Clear skip timer if user clicked manually
    if (skipTimerRef.current) clearInterval(skipTimerRef.current);
    setSkipTimer(null);
    setIsSpeaking(true);
    setHandRaised(false);
    // Remove self from queue
    setSpeakingQueue(prev => prev.filter(q => q.userId !== userId));
    setSpeakerTimeLeft(SPEAK_LIMIT_SEC);
    toggleMicrophone(true).catch(() => {});
    setMicMuted(false);
    realtimeRef.current?.send({ type: 'broadcast', event: 'queue_speaking_start', payload: { userId, agoraUid, name: userName } });
    // Broadcast current speaker to homepage
    supabase.channel(`topic_presence:${discussion.id}`).send({ type: 'broadcast', event: 'current_speaker', payload: { name: userName, topicId: discussion.id } }).catch(() => {});
    speakingTimerRef.current = setInterval(() => {
      setSpeakerTimeLeft(prev => {
        if (prev === null || prev <= 1) { clearInterval(speakingTimerRef.current!); endSpeaking(); return null; }
        return prev - 1;
      });
    }, 1000);
  };

  // ── End speaking ──────────────────────────────────────────
  const endSpeaking = () => {
    const userId = currentUserId || userIdRef.current;
    if (speakingTimerRef.current) clearInterval(speakingTimerRef.current);
    if (skipTimerRef.current) clearInterval(skipTimerRef.current);
    setIsSpeaking(false);
    setHandRaised(false);
    setSpeakerTimeLeft(null);
    setSkipTimer(null);
    setMicMuted(true);
    // Remove self from queue on end
    setSpeakingQueue(prev => prev.filter(q => q.userId !== userId));
    toggleMicrophone(false).catch(() => {});
    if (isTranscribing) transcriptionService.stop().then(() => { setIsTranscribing(false); setLiveTranscript(''); });
    realtimeRef.current?.send({ type: 'broadcast', event: 'queue_speaking_end', payload: { userId } });
    realtimeRef.current?.track({ name: userName, role: userRole, agoraUid: String(toAgoraUid(userId)), userId, handRaised: false });
    // Clear current speaker on homepage
    supabase.channel(`topic_presence:${discussion.id}`).send({ type: 'broadcast', event: 'current_speaker', payload: { name: null, topicId: discussion.id } }).catch(() => {});
  };

  // ── 10 sec auto-skip when it's your turn ──────────────────
  useEffect(() => {
    const userId = currentUserId || userIdRef.current;
    const isMyTurn = speakingQueue.length > 0 && speakingQueue[0].userId === userId && !isSpeaking;
    if (isMyTurn) {
      setSkipTimer(10);
      skipTimerRef.current = setInterval(() => {
        setSkipTimer(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(skipTimerRef.current!);
            // Auto-skip: remove from queue, lower hand
            setHandRaised(false);
            setSpeakingQueue(q => q.filter(x => x.userId !== userId));
            realtimeRef.current?.send({ type: 'broadcast', event: 'queue_leave', payload: { userId } });
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (skipTimerRef.current) clearInterval(skipTimerRef.current);
      setSkipTimer(null);
    }
    return () => { if (skipTimerRef.current) clearInterval(skipTimerRef.current); };
  }, [speakingQueue[0]?.userId, isSpeaking, currentUserId]);

  // ── Ideas realtime sync ─────────────────────────────────
  // Fetch existing ideas from DB on mount
  const fetchIdeas = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/discussions/${discussion.id}/ideas`, {
        headers: sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {},
      });
      if (!res.ok) return;
      const data = await res.json();
      setIdeas((data.ideas || []).map((i: any) => ({
        id: i.id,
        speakerId: i.userId,
        speakerName: i.user?.name || i.user?.anonymousId || 'Speaker',
        content: i.content,
        timestamp: new Date(i.createdAt),
        agreeCount: i.agreeCount || 0,
        disagreeCount: i.disagreeCount || 0,
        hasUserAgreed: i.hasUserAgreed || false,
        hasUserDisagreed: i.hasUserDisagreed || false,
      })));
    } catch { /* silent */ }
  }, [discussion.id, sessionToken]);

  useEffect(() => {
    if (sessionToken) fetchIdeas();
  }, [fetchIdeas, sessionToken]);

  // Subscribe to idea broadcasts via Supabase channel
  useEffect(() => {
    const ch = supabase.channel(`ideas:${discussion.id}`, {
      config: { broadcast: { self: false } },
    });
    ideasChannelRef.current = ch;
    ch
      .on('broadcast', { event: 'new_idea' }, ({ payload }: any) => {
        setIdeas(prev => {
          if (prev.find(i => i.id === payload.id)) return prev;
          return [...prev, {
            id: payload.id,
            speakerId: payload.speakerId,
            speakerName: payload.speakerName,
            content: payload.content,
            timestamp: new Date(payload.timestamp),
            agreeCount: 0,
            disagreeCount: 0,
          }];
        });
      })
      .on('broadcast', { event: 'idea_reaction' }, ({ payload }: any) => {
        setIdeas(prev => prev.map(idea => {
          if (idea.id !== payload.ideaId) return idea;
          return {
            ...idea,
            agreeCount: payload.agreeCounts ?? idea.agreeCount,
            disagreeCount: payload.disagreeCounts ?? idea.disagreeCount,
          };
        }));
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [discussion.id]);

  // ── Idea reactions (API + broadcast) ────────────────────
  const handleIdeaReaction = async (ideaId: string, type: 'agree' | 'disagree') => {
    let newAgree = 0, newDisagree = 0;
    setIdeas(prev => prev.map(idea => {
      if (idea.id !== ideaId) return idea;
      const updated = type === 'agree'
        ? { ...idea, hasUserAgreed: !idea.hasUserAgreed, hasUserDisagreed: false,
            agreeCount: idea.hasUserAgreed ? idea.agreeCount - 1 : idea.agreeCount + 1,
            disagreeCount: idea.hasUserDisagreed ? idea.disagreeCount - 1 : idea.disagreeCount }
        : { ...idea, hasUserDisagreed: !idea.hasUserDisagreed, hasUserAgreed: false,
            disagreeCount: idea.hasUserDisagreed ? idea.disagreeCount - 1 : idea.disagreeCount + 1,
            agreeCount: idea.hasUserAgreed ? idea.agreeCount - 1 : idea.agreeCount };
      newAgree = updated.agreeCount;
      newDisagree = updated.disagreeCount;
      return updated;
    }));
    // Persist
    if (sessionToken) {
      fetch(`${API_URL}/api/discussions/${discussion.id}/ideas/${ideaId}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sessionToken}` },
        body: JSON.stringify({ type }),
      }).catch(() => {});
    }
    // Broadcast to room
    ideasChannelRef.current?.send({
      type: 'broadcast', event: 'idea_reaction',
      payload: { ideaId, agreeCounts: newAgree, disagreeCounts: newDisagree },
    });
  };

  const currentSpeaker  = participants.find(p => p.isSpeaking);
  // Deduplicate participants by id
  const uniqueParticipants = participants.filter((p, i, arr) => arr.findIndex(x => x.id === p.id) === i);
  const raisedHands     = uniqueParticipants.filter(p => (p as any).handRaised);
  const canShareIdea    = userRole === 'speaker' || userRole === 'debater';

  // ── Share Idea ────────────────────────────────────────────
  const submitIdea = async () => {
    const text = ideaInput.trim();
    if (!text || ideaCooldown > 0 || !canShareIdea || !sessionToken) return;
    setIdeaInput('');
    setIdeaCooldown(300);
    ideaCooldownRef.current = setInterval(() => {
      setIdeaCooldown(prev => {
        if (prev <= 1) { clearInterval(ideaCooldownRef.current!); return 0; }
        return prev - 1;
      });
    }, 1000);
    try {
      const res = await fetch(`${API_URL}/api/discussions/${discussion.id}/ideas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sessionToken}` },
        body: JSON.stringify({ content: text }),
      });
      const data = res.ok ? await res.json() : {};
      const newIdea: Idea = {
        id: data.idea?.id || `idea-${Date.now()}`,
        speakerId: currentUserId || 'me',
        speakerName: userName,
        content: text,
        timestamp: new Date(),
        agreeCount: 0,
        disagreeCount: 0,
      };
      setIdeas(prev => [...prev, newIdea]);
      ideasChannelRef.current?.send({
        type: 'broadcast', event: 'new_idea',
        payload: { id: newIdea.id, speakerId: newIdea.speakerId,
          speakerName: newIdea.speakerName, content: newIdea.content,
          timestamp: newIdea.timestamp.toISOString() },
      });
    } catch { /* silent */ }
  };

  const handleIdeaKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitIdea(); }
  };
  const msgBubbleOwn    = isDark ? 'bg-indigo-600 text-white' : 'bg-indigo-500 text-white';
  const msgBubbleOther  = isDark ? 'bg-white/10 text-white'   : 'bg-gray-100 text-gray-800';
  const borderCls       = isDark ? 'border-white/10' : 'border-gray-200';

  return (
    <div className={`min-h-screen ${theme.textColor} flex flex-col`} style={{ background: theme.background, fontFamily: 'var(--font-body)' }}>

      {/* ── Top Bar ── */}
      <div className={`${theme.cardStyle} px-4 py-3 border-b ${borderCls}`}>
        <div className="flex items-center justify-between gap-3 w-full">
          {/* Live badge + topic */}
          <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
            <div className="flex items-center gap-1.5 bg-red-500 text-white px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-full font-medium flex-shrink-0 text-xs sm:text-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
              </span>
              <Radio className="w-3 h-3 sm:w-4 sm:h-4" />
              LIVE
            </div>
            <h1 className={`font-semibold truncate text-sm sm:text-base ${theme.textColor}`}>{discussion.title}</h1>
          </div>

          {/* Desktop: stats | Mobile: Leave button here so it's always visible */}
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
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
            {/* Leave — only in top bar on mobile */}
            <button onClick={onLeave}
              className="md:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/20 text-red-400 font-medium text-sm active:bg-red-500 active:text-white transition-all">
              <LogOut className="w-4 h-4" />
              <span className="text-xs font-semibold">Leave</span>
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
              <button onClick={endSpeaking} className="ml-auto text-xs underline opacity-70 hover:opacity-100">
                Done
              </button>
            </div>
          )}

          {/* Speaking Queue — ordered list */}
          {speakingQueue.length > 0 && (
            <div className="mb-6">
              <h3 className={`text-xs uppercase tracking-wider opacity-60 mb-3 ${theme.textColor}`}>
                ✋ Speaking Queue ({speakingQueue.length})
              </h3>
              <div className="space-y-2">
                {speakingQueue.map((q, i) => {
                  const isMe = q.userId === (currentUserId || userIdRef.current);
                  const isNext = i === 0;
                  return (
                    <div key={q.userId} className={`rounded-xl px-4 py-3 flex items-center gap-3 ${
                      isMe
                        ? 'bg-indigo-500/20 border border-indigo-500/40'
                        : isNext
                          ? isDark ? 'bg-green-500/15 border border-green-500/30' : 'bg-green-50 border border-green-200'
                          : theme.cardStyle
                    }`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        isNext ? 'bg-green-500 text-white' : theme.buttonClass
                      }`}>{i + 1}</div>
                      <span className={`flex-1 text-sm font-medium ${isMe ? 'text-indigo-400' : ''}`}>
                        {isMe ? 'You' : q.name}
                      </span>
                      {isNext && <span className="text-[10px] text-green-400 font-semibold">NEXT</span>}
                    </div>
                  );
                })}
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
                    <MicVisualizer
                      isMuted={p.id === (currentUserId || userIdRef.current) ? micMuted : false}
                      isDark={isDark}
                      size="sm"
                    />
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
                  <p className={`${theme.textColor} opacity-60 text-sm capitalize mb-3`}>
                    {currentSpeaker.role} • Currently Speaking
                  </p>
                  {/* Mic visualizer on stage — shows whose mic is live */}
                  <div className="flex justify-center mb-2">
                    <MicVisualizer
                      isMuted={currentSpeaker.id === (currentUserId || userIdRef.current) ? micMuted : false}
                      isDark={isDark}
                      size="lg"
                    />
                  </div>
                  {liveTranscript && (
                    <p className={`mt-2 text-sm italic opacity-70 ${theme.textColor}`}>🎙️ {liveTranscript}</p>
                  )}
                </motion.div>
              ) : (
                <div className={`${theme.cardStyle} rounded-3xl p-6 text-center opacity-50`}>
                  <Volume2 className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className={`text-sm ${theme.textColor}`}>No one is speaking yet</p>
                </div>
              )}
            </div>

            {/* Ideas Stream + Input */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Header */}
              <div className={`px-6 pt-4 pb-3 flex items-center justify-between border-b ${borderCls} flex-shrink-0`}>
                <div className="flex items-center gap-2">
                  <span className={`text-xs uppercase tracking-wider opacity-60 font-semibold ${theme.textColor}`}>Ideas Shared</span>
                  {ideas.length > 0 && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${isDark ? 'bg-white/10 text-white/50' : 'bg-gray-100 text-gray-500'}`}>
                      {ideas.length}
                    </span>
                  )}
                </div>
                {/* Cooldown badge in header */}
                {canShareIdea && ideaCooldown > 0 && (
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold ${
                    ideaCooldown <= 30
                      ? 'bg-green-500/15 text-green-400 border border-green-500/25'
                      : isDark ? 'bg-yellow-500/12 text-yellow-400 border border-yellow-500/20' : 'bg-yellow-50 text-yellow-600 border border-yellow-200'
                  }`}>
                    <Clock className="w-3 h-3 flex-shrink-0" />
                    {Math.floor(ideaCooldown / 60)}:{(ideaCooldown % 60).toString().padStart(2, '0')}
                  </div>
                )}
                {/* Listener badge */}
                {!canShareIdea && (
                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${isDark ? 'bg-white/6 text-white/40' : 'bg-gray-100 text-gray-400'}`}>
                    👁 Read-only
                  </span>
                )}
              </div>

              {/* Ideas list — chat style, visible to ALL roles */}
              <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-4 min-h-0">
                {ideas.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center gap-3 py-14 opacity-40 select-none">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isDark ? 'bg-white/8' : 'bg-gray-100'}`}>
                      <Volume2 className="w-5 h-5" />
                    </div>
                    <div className="text-center">
                      <p className={`text-sm font-medium ${theme.textColor}`}>No ideas shared yet</p>
                      <p className="text-xs mt-1">The debate will unfold here.</p>
                    </div>
                  </div>
                ) : (
                  <AnimatePresence initial={false}>
                    {ideas.map(idea => {
                      const isOwn = idea.speakerId === currentUserId;
                      const secondsAgo = Math.floor((Date.now() - idea.timestamp.getTime()) / 1000);
                      const timeLabel = secondsAgo < 60
                        ? `${secondsAgo}s ago`
                        : `${Math.floor(secondsAgo / 60)}m ago`;

                      return (
                        <motion.div key={idea.id}
                          initial={{ opacity: 0, y: 14, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                          className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}
                        >
                          {/* Name + time */}
                          <div className={`flex items-center gap-2 mb-1.5 ${isOwn ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${
                              isDark ? 'bg-indigo-500/30 text-indigo-300' : 'bg-indigo-100 text-indigo-600'
                            }`}>
                              {idea.speakerName.charAt(0).toUpperCase()}
                            </div>
                            <span className={`text-[11px] font-semibold ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                              {isOwn ? 'You' : idea.speakerName}
                            </span>
                            <span className={`text-[10px] ${isDark ? 'text-white/25' : 'text-gray-300'}`}>{timeLabel}</span>
                          </div>

                          {/* Bubble */}
                          <div className={`max-w-[82%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                            isOwn
                              ? 'bg-indigo-500 text-white rounded-tr-md'
                              : isDark
                                ? 'bg-white/10 text-white rounded-tl-md border border-white/8'
                                : 'bg-white text-gray-800 rounded-tl-md border border-gray-200'
                          }`}>
                            {idea.content}
                          </div>

                          {/* Agree / Disagree reactions */}
                          <div className={`flex items-center gap-1.5 mt-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
                            <button
                              onClick={() => handleIdeaReaction(idea.id, 'agree')}
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all active:scale-95 ${
                                idea.hasUserAgreed
                                  ? 'bg-green-500 text-white shadow-sm'
                                  : isDark ? 'bg-white/8 hover:bg-white/14 text-white/50' : 'bg-gray-100 hover:bg-gray-200 text-gray-500'
                              }`}>
                              <ThumbsUp className={`w-3 h-3 ${idea.hasUserAgreed ? 'fill-current' : ''}`} />
                              <span>{idea.agreeCount}</span>
                            </button>
                            <button
                              onClick={() => handleIdeaReaction(idea.id, 'disagree')}
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all active:scale-95 ${
                                idea.hasUserDisagreed
                                  ? 'bg-red-500 text-white shadow-sm'
                                  : isDark ? 'bg-white/8 hover:bg-white/14 text-white/50' : 'bg-gray-100 hover:bg-gray-200 text-gray-500'
                              }`}>
                              <ThumbsDown className={`w-3 h-3 ${idea.hasUserDisagreed ? 'fill-current' : ''}`} />
                              <span>{idea.disagreeCount}</span>
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                )}
                <div ref={ideasBottomRef} />
              </div>

              {/* ── Idea Input / Cooldown — speaker & debater only ── */}
              {canShareIdea && (
                <div className={`px-4 pb-4 pt-2 border-t ${borderCls} flex-shrink-0`}>
                  <AnimatePresence mode="wait">
                    {ideaCooldown > 0 ? (
                      /* Cooldown locked state */
                      <motion.div key="cooldown"
                        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl ${
                          isDark ? 'bg-white/5 border border-white/8' : 'bg-gray-50 border border-gray-200'
                        }`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isDark ? 'bg-white/8' : 'bg-gray-200'
                        }`}>
                          <Clock className={`w-4 h-4 ${isDark ? 'text-white/40' : 'text-gray-400'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-medium ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                            Next idea available in
                          </p>
                          {/* Progress bar */}
                          <div className={`mt-1.5 h-1 rounded-full overflow-hidden ${isDark ? 'bg-white/8' : 'bg-gray-200'}`}>
                            <motion.div
                              className={`h-full rounded-full ${ideaCooldown <= 30 ? 'bg-green-400' : 'bg-indigo-400'}`}
                              style={{ width: `${((300 - ideaCooldown) / 300) * 100}%` }}
                              transition={{ duration: 1, ease: 'linear' }}
                            />
                          </div>
                        </div>
                        <span className={`text-lg font-mono font-bold flex-shrink-0 tabular-nums ${
                          ideaCooldown <= 30
                            ? 'text-green-400'
                            : isDark ? 'text-white/70' : 'text-gray-700'
                        }`}>
                          {Math.floor(ideaCooldown / 60)}:{(ideaCooldown % 60).toString().padStart(2, '0')}
                        </span>
                      </motion.div>
                    ) : (
                      /* Active input */
                      <motion.div key="input"
                        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                        className={`flex items-end gap-2 px-3 py-2.5 rounded-2xl ${
                          isDark
                            ? 'bg-white/8 border border-white/12 focus-within:border-indigo-500/50'
                            : 'bg-white border border-gray-200 shadow-sm focus-within:border-indigo-300'
                        } transition-colors`}>
                        <textarea
                          value={ideaInput}
                          onChange={e => setIdeaInput(e.target.value)}
                          onKeyDown={handleIdeaKey}
                          placeholder="Share an idea with the room…"
                          rows={2}
                          style={{ resize: 'none' }}
                          className={`flex-1 text-sm outline-none bg-transparent leading-relaxed pt-0.5 ${
                            isDark ? 'text-white placeholder:text-white/30' : 'text-gray-800 placeholder:text-gray-400'
                          }`}
                        />
                        <button
                          onClick={submitIdea}
                          disabled={!ideaInput.trim()}
                          className="p-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 active:scale-95 text-white disabled:opacity-30 transition-all flex-shrink-0 mb-0.5">
                          <Send className="w-4 h-4" />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <p className={`text-[10px] mt-2 text-center font-medium ${isDark ? 'text-white/20' : 'text-gray-300'}`}>
                    Speakers &amp; Debaters · 1 idea per 5 minutes
                  </p>
                </div>
              )}

              {/* Listener: locked footer */}
              {!canShareIdea && (
                <div className={`px-4 py-3 border-t ${borderCls} flex-shrink-0`}>
                  <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl ${
                    isDark ? 'bg-white/4 border border-white/6' : 'bg-gray-50 border border-gray-200'
                  }`}>
                    <Headphones className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-white/25' : 'text-gray-300'}`} />
                    <p className={`text-xs ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                      Idea sharing is for speakers &amp; debaters only
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* ── Bottom Controls ── */}
            <div className={`${theme.cardStyle} px-6 py-5 border-t ${borderCls}`}>
              <div className="flex items-center justify-between gap-4 w-full">
                <div className="flex items-center gap-3">

                  {/* Listener/Speaker: Hand Raise — disabled while speaking */}
                  {(userRole === 'listener' || userRole === 'speaker') && !isSpeaking && (
                    <button onClick={handleHandRaise}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-medium transition-all hover:scale-105 text-sm ${
                        handRaised ? theme.buttonClass : `${theme.cardStyle} hover:bg-white/10`
                      }`}>
                      <Hand className={`w-5 h-5 ${handRaised ? '' : 'opacity-70'}`} />
                      {handRaised ? 'Lower Hand' : 'Raise Hand'}
                    </button>
                  )}

                  {/* "Your Turn!" button — pulsing + 10 sec skip countdown */}
                  {speakingQueue.length > 0 &&
                   speakingQueue[0].userId === (currentUserId || userIdRef.current) &&
                   !isSpeaking && (
                    <div className="flex items-center gap-2">
                      <motion.button
                        onClick={startSpeaking}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: [1, 1.05, 1], opacity: 1 }}
                        transition={{ repeat: Infinity, duration: 1.4 }}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-green-500 text-white font-bold text-sm shadow-lg shadow-green-500/30">
                        <Mic className="w-5 h-5" />
                        Speak Now!
                      </motion.button>
                      {skipTimer !== null && (
                        <div className={`px-3 py-2 rounded-xl text-xs font-bold ${
                          skipTimer <= 3 ? 'bg-red-500 text-white' : isDark ? 'bg-white/10 text-white/60' : 'bg-gray-100 text-gray-500'
                        }`}>
                          Skip in {skipTimer}s
                        </div>
                      )}
                    </div>
                  )}

                  {/* Speaking badge + End button */}
                  {isSpeaking && (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-red-500 text-white text-sm font-bold">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                        </span>
                        Speaking — {speakerTimeLeft !== null ? formatTime(speakerTimeLeft) : ''}
                      </div>
                      <button onClick={endSpeaking}
                        className={`px-4 py-2 rounded-2xl text-sm font-medium ${theme.cardStyle} hover:bg-red-500/20 transition-all`}>
                        Done
                      </button>
                    </div>
                  )}

                  {/* Debater/Speaker: Mic button with live visualizer */}
                  {(userRole === 'debater' || userRole === 'speaker') && (
                    <button onClick={handleMicToggle}
                      className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl font-medium transition-all hover:scale-105 text-sm ${
                        !micMuted
                          ? 'bg-green-500/15 border border-green-500/40 text-green-400'
                          : `${theme.cardStyle} hover:bg-white/10`
                      }`}>
                      <MicVisualizer isMuted={micMuted} isDark={isDark} size="sm" />
                      <span>{micMuted ? 'Unmute' : 'Mute'}</span>
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
