// Real Supabase Speaking Queue Service
import { supabase } from '../lib/supabase';

export interface QueueEntry {
  id: string;
  discussionId: string;
  userId: string;
  requestedAt: any;
  status: 'waiting' | 'speaking' | 'done';
}

// Raise hand to join speaking queue
export const raiseHand = async (
  discussionId: string,
  userId: string
): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from('speaking_queue')
      .insert([
        {
          discussion_id: discussionId,
          user_id: userId,
          status: 'waiting',
        },
      ])
      .select('id')
      .single();

    if (error || !data) {
      return `queue_${Date.now()}`;
    }

    return data.id;
  } catch (error) {
    console.error('Error raising hand:', error);
    return `queue_${Date.now()}`;
  }
};

// Lower hand
export const lowerHand = async (queueId: string): Promise<void> => {
  try {
    await supabase.from('speaking_queue').delete().eq('id', queueId);
  } catch (error) {
    console.error('Error lowering hand:', error);
  }
};

// Subscribe to speaking queue (real-time)
export const subscribeToQueue = (
  discussionId: string,
  callback: (queue: QueueEntry[]) => void
): (() => void) => {
  const fetchQueue = async () => {
    try {
      const { data } = await supabase
        .from('speaking_queue')
        .select('*')
        .eq('discussion_id', discussionId)
        .in('status', ['waiting', 'speaking'])
        .order('created_at', { ascending: true });

      if (data) {
        callback(
          data.map((d: any) => ({
            id: d.id,
            discussionId: d.discussion_id,
            userId: d.user_id,
            requestedAt: d.created_at,
            status: d.status,
          }))
        );
      }
    } catch (e) {
      console.warn('Queue fetch error:', e);
    }
  };

  const channel = supabase
    .channel(`speaking_queue:${discussionId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'speaking_queue', filter: `discussion_id=eq.${discussionId}` },
      () => {
        fetchQueue();
      }
    )
    .subscribe();

  fetchQueue();

  return () => {
    supabase.removeChannel(channel);
  };
};

// Mark user as speaking
export const markAsSpeaking = async (
  queueId: string,
  discussionId: string
): Promise<void> => {
  try {
    await supabase.from('speaking_queue').update({ status: 'speaking' }).eq('id', queueId);
  } catch (error) {
    console.error('Error marking as speaking:', error);
  }
};

// Mark user as done speaking
export const markAsDone = async (queueId: string): Promise<void> => {
  try {
    await supabase.from('speaking_queue').update({ status: 'done' }).eq('id', queueId);
  } catch (error) {
    console.error('Error marking as done:', error);
  }
};

// Get current speaker
export const subscribeCurrentSpeaker = (
  discussionId: string,
  callback: (speaker: QueueEntry | null) => void
): (() => void) => {
  const fetchSpeaker = async () => {
    try {
      const { data } = await supabase
        .from('speaking_queue')
        .select('*')
        .eq('discussion_id', discussionId)
        .eq('status', 'speaking')
        .limit(1)
        .maybeSingle();

      if (data) {
        callback({
          id: data.id,
          discussionId: data.discussion_id,
          userId: data.user_id,
          requestedAt: data.created_at,
          status: data.status,
        });
      } else {
        callback(null);
      }
    } catch (e) {
      callback(null);
    }
  };

  const channel = supabase
    .channel(`current_speaker:${discussionId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'speaking_queue', filter: `discussion_id=eq.${discussionId}` },
      () => {
        fetchSpeaker();
      }
    )
    .subscribe();

  fetchSpeaker();

  return () => {
    supabase.removeChannel(channel);
  };
};
