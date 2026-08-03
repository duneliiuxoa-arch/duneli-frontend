// Real API Integration Service — duneli 1 naya UI
// Sab kuch yahan se export hota hai — App.tsx sirf ye use kare
// Backend: Railway (duneli database)
// Realtime: Supabase channels
// Auth: Supabase Google OAuth

import { supabase } from '../lib/supabase';

const API = import.meta.env.VITE_API_URL || 'https://duneli-backend.up.railway.app';

// Fallback to Railway if localhost fails
const API_FALLBACK = 'https://duneli-backend.up.railway.app';

async function fetchWithFallback(path: string, options?: RequestInit): Promise<Response> {
  try {
    const res = await fetch(`${API}${path}`, options);
    if (res.ok) return res;
    throw new Error(`${res.status}`);
  } catch {
    // If localhost fails, try Railway
    if (API !== API_FALLBACK) {
      return fetch(`${API_FALLBACK}${path}`, options);
    }
    throw new Error('Both endpoints failed');
  }
}

// ── Auth headers helper ───────────────────────────────────────
export async function authHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (session?.access_token) h['Authorization'] = `Bearer ${session.access_token}`;
  return h;
}

// ═══════════════════════════════════════════════════════════════
// DISCUSSIONS — fetch, create, vote
// ═══════════════════════════════════════════════════════════════

export interface RealDiscussion {
  id: string;
  title: string;
  category: string;
  language: string;
  status: 'live' | 'upcoming' | 'ended';
  interestCount: number;
  activeAttendees: number;
  scheduledTime?: Date;
  startedTime?: Date;
  hostId: string;
  hostName: string;
  hostAvatar?: string;
  hasUserVoted: boolean;
  meetingId?: string;
}

export async function fetchDiscussions(): Promise<RealDiscussion[]> {
  try {
    const headers = await authHeaders();
    const res = await fetchWithFallback('/api/discussions?status=ALL&limit=50', { headers });
    if (!res.ok) throw new Error(`${res.status}`);
    const { topics } = await res.json();

    return (topics || []).map((t: any): RealDiscussion => {
      const meetingStatus = t.meeting?.status;
      const topicStatus   = t.status; // ACTIVE | SELECTED | CLOSED
      const status: RealDiscussion['status'] =
        meetingStatus === 'SCHEDULED' ? 'live' :
        meetingStatus === 'COMPLETED' ? 'ended' :
        topicStatus   === 'SELECTED'  ? 'live' :   // SELECTED = admin picked it → treat as live
        'upcoming';

      return {
        id:              t.id,
        title:           t.title,
        category:        t.category || 'General',
        language:        t.language  || 'English',
        status,
        interestCount:   t.voteCount || t.topicScore?.voteCount || 0,
        activeAttendees: t.activeAttendees ?? 0,
        scheduledTime:   t.meeting?.meetingDate ? new Date(t.meeting.meetingDate) : undefined,
        startedTime:     status === 'live' && t.meeting?.meetingDate ? new Date(t.meeting.meetingDate) : undefined,
        hostId:          t.createdBy?.id   || '',
        hostName:        t.createdBy?.name || 'Host',
        hostAvatar:      t.createdBy?.avatarUrl || undefined,
        hasUserVoted:    t.hasUserVoted || false,
        meetingId:       t.meeting?.id,
      };
    });
  } catch (e) {
    console.warn('[api] fetchDiscussions failed:', e);
    return [];
  }
}

export async function createDiscussion(title: string): Promise<string | null> {
  try {
    const headers = await authHeaders();
    const res = await fetchWithFallback('/api/discussions', {
      method: 'POST',
      headers,
      body: JSON.stringify({ title }),
    });
    if (!res.ok) throw new Error(`${res.status}`);
    const { topic } = await res.json();
    return topic?.id || null;
  } catch (e) {
    console.warn('[api] createDiscussion failed:', e);
    return null;
  }
}

export async function voteDiscussion(topicId: string): Promise<boolean> {
  try {
    const headers = await authHeaders();
    const res = await fetchWithFallback(`/api/discussions/${topicId}/vote`, {
      method: 'POST',
      headers,
    });
    return res.ok;
  } catch { return false; }
}

// ═══════════════════════════════════════════════════════════════
// MEETINGS — join, leave
// ═══════════════════════════════════════════════════════════════

export async function joinMeeting(topicId: string): Promise<void> {
  try {
    const headers = await authHeaders();
    await fetchWithFallback(`/api/discussions/${topicId}/join`, { method: 'POST', headers });
  } catch (e) {
    console.warn('[api] joinMeeting failed:', e);
  }
}

export async function leaveMeeting(topicId: string): Promise<void> {
  try {
    const headers = await authHeaders();
    await fetchWithFallback(`/api/discussions/${topicId}/leave`, { method: 'POST', headers });
  } catch (e) {
    console.warn('[api] leaveMeeting failed:', e);
  }
}

// ═══════════════════════════════════════════════════════════════
// AGORA TOKEN — real token from backend
// ═══════════════════════════════════════════════════════════════

export async function getAgoraToken(channelName: string, uid: number): Promise<string | null> {
  try {
    const headers = await authHeaders();
    const res = await fetch(`${API}/api/agora/token?channelName=${channelName}&uid=${uid}`, { headers });
    if (!res.ok) throw new Error(`${res.status}`);
    const { token } = await res.json();
    return token || null;
  } catch (e) {
    console.warn('[api] getAgoraToken failed:', e);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
// IDEAS — share, fetch, react (speaker/debater only, 5min cooldown)
// ═══════════════════════════════════════════════════════════════

export interface RealIdea {
  id: string;
  topicId: string;
  userId: string;
  userName: string;
  anonymousId?: string;
  content: string;
  createdAt: Date;
  agreeCount: number;
  disagreeCount: number;
  myReaction: 'agree' | 'disagree' | null;
}

export async function fetchIdeas(topicId: string): Promise<RealIdea[]> {
  try {
    const headers = await authHeaders();
    const res = await fetch(`${API}/api/ideas/${topicId}`, { headers });
    if (!res.ok) throw new Error(`${res.status}`);
    const { ideas } = await res.json();
    return (ideas || []).map((i: any): RealIdea => ({
      id:           i.id,
      topicId:      i.topicId,
      userId:       i.userId,
      userName:     i.userName || 'Anonymous',
      anonymousId:  i.anonymousId,
      content:      i.content,
      createdAt:    new Date(i.createdAt),
      agreeCount:   i.agreeCount    ?? 0,
      disagreeCount: i.disagreeCount ?? 0,
      myReaction:   (i.myReaction as 'agree' | 'disagree' | null) || null,
    }));
  } catch (e) {
    console.warn('[api] fetchIdeas failed:', e);
    return [];
  }
}

export async function shareIdea(topicId: string, content: string): Promise<{ idea?: RealIdea; cooldown?: number; error?: string }> {
  try {
    const headers = await authHeaders();
    const res = await fetch(`${API}/api/ideas/${topicId}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ content }),
    });
    const data = await res.json();
    if (res.status === 429) return { cooldown: data.remainingSeconds, error: data.message };
    if (!res.ok) return { error: data.error || 'Failed' };
    const i = data.idea;
    return {
      idea: {
        id:           i.id,
        topicId:      i.topicId,
        userId:       i.userId,
        userName:     i.userName || 'You',
        content:      i.content,
        createdAt:    new Date(i.createdAt),
        agreeCount:   0,
        disagreeCount: 0,
        myReaction:   null,
      }
    };
  } catch (e) {
    console.warn('[api] shareIdea failed:', e);
    return { error: 'Network error' };
  }
}

export async function reactToIdea(ideaId: string, type: 'agree' | 'disagree'): Promise<{ agreeCount: number; disagreeCount: number; myReaction: string | null } | null> {
  try {
    const headers = await authHeaders();
    const res = await fetch(`${API}/api/ideas/${ideaId}/react`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ type }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

// ═══════════════════════════════════════════════════════════════
// REALTIME SUBSCRIPTIONS — discussions + ideas
// ═══════════════════════════════════════════════════════════════

// Subscribe to all discussion updates (for homepage ShutterDrawer)
export function subscribeDiscussions(
  onUpdate: (discussions: RealDiscussion[]) => void
): () => void {
  let alive = true;

  const poll = async () => {
    if (!alive) return;
    const data = await fetchDiscussions();
    if (alive) onUpdate(data);
  };

  // Initial fetch
  poll();

  // Poll every 20s for live attendee count changes
  const interval = setInterval(poll, 20_000);

  // Supabase realtime on topics table
  const channel = supabase
    .channel('realtime:topics')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'topics' }, poll)
    .subscribe();

  return () => {
    alive = false;
    clearInterval(interval);
    supabase.removeChannel(channel);
  };
}

// Subscribe to ideas for a specific topic (used in MeetingPage)
export function subscribeIdeas(
  topicId: string,
  onUpdate: (ideas: RealIdea[]) => void
): () => void {
  let alive = true;

  const poll = async () => {
    if (!alive) return;
    const data = await fetchIdeas(topicId);
    if (alive) onUpdate(data);
  };

  poll();

  // Poll every 8s so all participants see new ideas quickly
  const interval = setInterval(poll, 8_000);

  // Supabase realtime on idea_shares table
  const channel = supabase
    .channel(`realtime:ideas:${topicId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table:  'idea_shares',
      filter: `topicId=eq.${topicId}`,
    }, poll)
    .subscribe();

  return () => {
    alive = false;
    clearInterval(interval);
    supabase.removeChannel(channel);
  };
}

// Subscribe to idea reactions for a topic
export function subscribeIdeaReactions(
  topicId: string,
  onUpdate: () => void
): () => void {
  const channel = supabase
    .channel(`realtime:idea_reactions:${topicId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'idea_reactions' }, onUpdate)
    .subscribe();
  return () => supabase.removeChannel(channel);
}
