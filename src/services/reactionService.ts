// Real Supabase Reaction Service
import { supabase } from '../lib/supabase';

export interface Reaction {
  id: string;
  discussionId: string;
  userId: string;
  type: 'agree' | 'disagree';
  createdAt: any;
}

// Add reaction
export const addReaction = async (
  discussionId: string,
  userId: string,
  type: 'agree' | 'disagree'
): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from('reactions')
      .insert([
        {
          discussion_id: discussionId,
          user_id: userId,
          type,
        },
      ])
      .select('id')
      .single();

    if (error || !data) {
      return `react_${Date.now()}`;
    }

    return data.id;
  } catch (error) {
    console.error('Error adding reaction:', error);
    return `react_${Date.now()}`;
  }
};

// Subscribe to reactions
export const subscribeToReactions = (
  discussionId: string,
  callback: (reactions: Reaction[]) => void
): (() => void) => {
  const fetchReactions = async () => {
    try {
      const { data } = await supabase
        .from('reactions')
        .select('*')
        .eq('discussion_id', discussionId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (data) {
        callback(
          data.map((d: any) => ({
            id: d.id,
            discussionId: d.discussion_id,
            userId: d.user_id,
            type: d.type,
            createdAt: d.created_at,
          }))
        );
      }
    } catch (e) {
      console.warn('Reactions fetch error:', e);
    }
  };

  const channel = supabase
    .channel(`reactions:${discussionId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'reactions', filter: `discussion_id=eq.${discussionId}` },
      () => {
        fetchReactions();
      }
    )
    .subscribe();

  fetchReactions();

  return () => {
    supabase.removeChannel(channel);
  };
};

// Get reaction counts
export const subscribeToReactionCounts = (
  discussionId: string,
  callback: (counts: { agree: number; disagree: number }) => void
): (() => void) => {
  const fetchCounts = async () => {
    try {
      const { data } = await supabase
        .from('reactions')
        .select('type')
        .eq('discussion_id', discussionId);

      const counts = { agree: 0, disagree: 0 };
      if (data) {
        data.forEach((r: any) => {
          if (r.type === 'agree') counts.agree++;
          if (r.type === 'disagree') counts.disagree++;
        });
      }
      callback(counts);
    } catch (e) {
      callback({ agree: 0, disagree: 0 });
    }
  };

  const channel = supabase
    .channel(`reaction_counts:${discussionId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'reactions', filter: `discussion_id=eq.${discussionId}` },
      () => {
        fetchCounts();
      }
    )
    .subscribe();

  fetchCounts();

  return () => {
    supabase.removeChannel(channel);
  };
};

// Clean up old reactions
export const cleanupOldReactions = async (discussionId: string): Promise<void> => {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    await supabase
      .from('reactions')
      .delete()
      .eq('discussion_id', discussionId)
      .lt('created_at', fiveMinutesAgo);
  } catch (error) {
    console.error('Error cleaning up reactions:', error);
  }
};
