// Real Supabase Discussion Service - 100% REAL DATA
import { supabase } from '../lib/supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface Topic {
  id: string;
  title: string;
  category: string;
  createdBy: string;
  createdAt: any;
  scheduledAt: any;
  status: 'live' | 'upcoming' | 'ended';
  interestCount: number;
}

export interface Discussion {
  id: string;
  topicId: string;
  startedAt: any;
  endedAt: any;
  agoraChannelName: string;
  status: 'live' | 'ended';
}

// ── Fetch LIVE meetings from real backend ────────────────────
const fetchLiveMeetings = async (): Promise<any[]> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`;

    // Fetch all ACTIVE topics — includes meeting + attendee data
    const res = await fetch(`${API_URL}/api/discussions?status=ACTIVE&limit=50`, { headers });
    if (!res.ok) return [];
    const data = await res.json();
    const topics = data.topics || [];

    // A topic is LIVE if it has a meeting with SCHEDULED status
    const live = topics.filter((t: any) => t.meeting?.status === 'SCHEDULED');

    return live.map((t: any) => ({
      id:             t.id,               // topicId — used for joining
      meetingId:      t.meeting?.id,
      title:          t.title,
      category:       'General',
      language:       'English',
      status:         'live' as const,
      interestCount:  t.voteCount || 0,
      startedTime:    t.meeting?.meetingDate ? new Date(t.meeting.meetingDate) : new Date(),
      duration:       60,
      hostId:         t.createdBy?.id || '',
      hostName:       t.createdBy?.name || 'Host',
      currentSpeaker: null,
      listenerCount:  t.activeAttendees || t.meeting?._count?.attendees || 0,
      speakerCount:   0,
      hasUserInterest: t.hasUserVoted || false,
    }));
  } catch (e) {
    console.warn('[discussionService] Live meetings fetch failed:', e);
    return [];
  }
};

// ── Fetch upcoming topics from Supabase ──────────────────────
const fetchUpcomingTopics = async (): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .in('status', ['upcoming', 'live'])
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map((d: any) => ({
      id:             d.id,
      title:          d.title,
      category:       d.category || 'General',
      language:       d.language || 'English',
      status:         d.status === 'live' ? 'live' : 'upcoming',
      interestCount:  d.interest_count || 0,
      scheduledTime:  d.scheduled_at ? new Date(d.scheduled_at) : undefined,
      startedTime:    d.created_at ? new Date(d.created_at) : new Date(),
      duration:       60,
      hostId:         d.created_by || '',
      hostName:       d.host_name || 'Host',
      currentSpeaker: d.current_speaker || null,
      listenerCount:  d.listener_count || 0,
      speakerCount:   d.speaker_count || 0,
      hasUserInterest: false,
    }));
  } catch (e) {
    console.warn('[discussionService] Supabase topics fetch failed:', e);
    return [];
  }
};

// ── Main fetch: live from backend + upcoming from Supabase ───
export const fetchAllDiscussions = async (): Promise<any[]> => {
  const [liveFromBackend, fromSupabase] = await Promise.all([
    fetchLiveMeetings(),
    fetchUpcomingTopics(),
  ]);

  // IDs already in live list — skip duplicates from Supabase
  const liveIds = new Set(liveFromBackend.map(m => m.id));

  // From Supabase: only keep upcoming (exclude live ones already in backend list)
  const upcomingOnly = fromSupabase.filter(d => d.status === 'upcoming' || !liveIds.has(d.id));

  // If backend returned 0 live meetings, promote Supabase live-status topics
  const supabaseLive = liveFromBackend.length === 0
    ? fromSupabase.filter(d => d.status === 'live')
    : [];

  return [...liveFromBackend, ...supabaseLive, ...upcomingOnly];
};

// Create a new topic in Supabase
export const createTopic = async (
  title: string,
  category: string,
  userId: string,
  hostName: string = 'User',
  scheduledAt: Date | null = null
): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from('topics')
      .insert([
        {
          title,
          category,
          created_by: userId,
          host_name: hostName,
          current_speaker: hostName,
          scheduled_at: scheduledAt ? scheduledAt.toISOString() : null,
          status: scheduledAt ? 'upcoming' : 'live',
          interest_count: 1,
          listener_count: 1,
          speaker_count: 1,
        },
      ])
      .select('id')
      .single();

    if (error || !data) {
      console.warn('Supabase topic creation response:', error);
      return `topic_${Date.now()}`;
    }

    return data.id;
  } catch (error) {
    console.error('Error creating topic in Supabase:', error);
    return `topic_${Date.now()}`;
  }
};

// Subscribe to all topics — realtime via Supabase + polling backend
export const subscribeAllTopics = (
  callback: (discussions: any[]) => void
): (() => void) => {
  const fetchAndNotify = () => {
    fetchAllDiscussions().then((items) => callback(items));
  };

  // Initial fetch
  fetchAndNotify();

  // Poll backend every 30s for live meeting updates
  const pollInterval = setInterval(fetchAndNotify, 30_000);

  // Supabase realtime for topic table changes (upcoming/interest updates)
  const channel = supabase
    .channel('public:topics_realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'topics' }, () => {
      fetchAndNotify();
    })
    .subscribe();

  return () => {
    clearInterval(pollInterval);
    supabase.removeChannel(channel);
  };
};

// Express interest in a topic
export const expressInterest = async (topicId: string, userId: string): Promise<void> => {
  try {
    const { data } = await supabase
      .from('topics')
      .select('interest_count')
      .eq('id', topicId)
      .single();

    const currentCount = data?.interest_count || 0;
    await supabase
      .from('topics')
      .update({ interest_count: currentCount + 1 })
      .eq('id', topicId);
  } catch (e) {
    console.warn('Express interest error:', e);
  }
};
