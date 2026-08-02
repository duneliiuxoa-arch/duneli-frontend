// Real Supabase Discussion Service
import { supabase } from '../lib/supabase';

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

export interface Participant {
  id: string;
  discussionId: string;
  userId: string;
  role: 'listener' | 'speaker' | 'debater';
  joinedAt: any;
}

// Create a new topic in Supabase
export const createTopic = async (
  title: string,
  category: string,
  userId: string,
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
          scheduled_at: scheduledAt ? scheduledAt.toISOString() : null,
          status: scheduledAt ? 'upcoming' : 'live',
          interest_count: 1,
        },
      ])
      .select('id')
      .single();

    if (error) {
      console.warn('Supabase topic creation fallback:', error);
      return `topic_${Date.now()}`;
    }

    return data.id;
  } catch (error) {
    console.error('Error creating topic:', error);
    return `topic_${Date.now()}`;
  }
};

// Get live topics from Supabase
export const getLiveTopics = async (): Promise<Topic[]> => {
  try {
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .eq('status', 'live')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error || !data) return [];
    return data.map((d: any) => ({
      id: d.id,
      title: d.title,
      category: d.category,
      createdBy: d.created_by,
      createdAt: d.created_at,
      scheduledAt: d.scheduled_at,
      status: d.status,
      interestCount: d.interest_count || 0,
    }));
  } catch (error) {
    console.error('Error getting live topics from Supabase:', error);
    return [];
  }
};

// Get upcoming topics from Supabase
export const getUpcomingTopics = async (): Promise<Topic[]> => {
  try {
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .eq('status', 'upcoming')
      .order('scheduled_at', { ascending: true })
      .limit(20);

    if (error || !data) return [];
    return data.map((d: any) => ({
      id: d.id,
      title: d.title,
      category: d.category,
      createdBy: d.created_by,
      createdAt: d.created_at,
      scheduledAt: d.scheduled_at,
      status: d.status,
      interestCount: d.interest_count || 0,
    }));
  } catch (error) {
    console.error('Error getting upcoming topics from Supabase:', error);
    return [];
  }
};

// Subscribe to live topics (Supabase Realtime)
export const subscribeLiveTopics = (
  callback: (topics: Topic[]) => void
): (() => void) => {
  const channel = supabase
    .channel('public:topics')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'topics' },
      () => {
        getLiveTopics().then(callback);
      }
    )
    .subscribe();

  // Fetch initial
  getLiveTopics().then(callback);

  return () => {
    supabase.removeChannel(channel);
  };
};

// Create a discussion channel
export const createDiscussion = async (topicId: string): Promise<string> => {
  const channelName = `discussion_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  try {
    const { data, error } = await supabase
      .from('discussions')
      .insert([
        {
          topic_id: topicId,
          agora_channel_name: channelName,
          status: 'live',
        },
      ])
      .select('id')
      .single();

    if (!error && data) {
      await supabase.from('topics').update({ status: 'live' }).eq('id', topicId);
      return data.id;
    }
  } catch (e) {
    console.warn('Supabase discussion create fallback:', e);
  }
  return `disc_${Date.now()}`;
};

// Join discussion
export const joinDiscussion = async (
  discussionId: string,
  userId: string,
  role: 'listener' | 'speaker' | 'debater'
): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from('participants')
      .insert([
        {
          discussion_id: discussionId,
          user_id: userId,
          role,
        },
      ])
      .select('id')
      .single();

    if (!error && data) return data.id;
  } catch (e) {
    console.warn('Join discussion fallback:', e);
  }
  return `part_${Date.now()}`;
};

// Leave discussion
export const leaveDiscussion = async (
  participantId: string,
  discussionId: string,
  userId: string
): Promise<void> => {
  try {
    await supabase.from('participants').delete().eq('id', participantId);
  } catch (e) {
    console.warn('Leave discussion fallback:', e);
  }
};

// Subscribe to participants count in Supabase
export const subscribeParticipantCount = (
  discussionId: string,
  callback: (count: number) => void
): (() => void) => {
  const channel = supabase
    .channel(`participants:${discussionId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'participants', filter: `discussion_id=eq.${discussionId}` },
      () => {
        supabase
          .from('participants')
          .select('id', { count: 'exact' })
          .eq('discussion_id', discussionId)
          .then(({ count }) => {
            callback(count || 1);
          });
      }
    )
    .subscribe();

  callback(1);

  return () => {
    supabase.removeChannel(channel);
  };
};

// Express interest in a topic
export const expressInterest = async (topicId: string, userId: string): Promise<void> => {
  try {
    await supabase.rpc('increment_topic_interest', { topic_id: topicId });
  } catch (e) {
    console.warn('Express interest fallback:', e);
  }
};
