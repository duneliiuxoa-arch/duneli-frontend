// Speaking Queue Service — Supabase (replaces Firestore)
import { supabase } from '../lib/supabase';

export interface QueueEntry {
  id: string;
  meetingId: string;
  userId: string;
  requestedAt: string;
  status: 'waiting' | 'speaking' | 'done';
}

// Raise hand to join speaking queue
export const raiseHand = async (meetingId: string, userId: string): Promise<string> => {
  // Check if already in queue
  const { data: existing } = await supabase
    .from('speaking_queue')
    .select('id')
    .eq('meetingId', meetingId)
    .eq('userId', userId)
    .in('status', ['waiting', 'speaking'])
    .maybeSingle();

  if (existing) throw new Error('Already in queue');

  const { data, error } = await supabase
    .from('speaking_queue')
    .insert({ meetingId, userId, status: 'waiting', requestedAt: new Date().toISOString() })
    .select('id')
    .single();

  if (error) { console.error('Error raising hand:', error.message); throw error; }
  return data.id;
};

// Lower hand (remove from queue)
export const lowerHand = async (queueId: string): Promise<void> => {
  const { error } = await supabase.from('speaking_queue').delete().eq('id', queueId);
  if (error) { console.error('Error lowering hand:', error.message); throw error; }
};

// Subscribe to speaking queue (real-time)
export const subscribeToQueue = (
  meetingId: string,
  callback: (queue: QueueEntry[]) => void
): (() => void) => {
  const fetchQueue = async () => {
    const { data, error } = await supabase
      .from('speaking_queue')
      .select('*')
      .eq('meetingId', meetingId)
      .in('status', ['waiting', 'speaking'])
      .order('requestedAt', { ascending: true });

    if (!error) callback(data as QueueEntry[]);
  };

  fetchQueue();

  const channel = supabase
    .channel(`queue-${meetingId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'speaking_queue', filter: `meetingId=eq.${meetingId}` }, fetchQueue)
    .subscribe();

  return () => { supabase.removeChannel(channel); };
};

// Mark user as speaking
export const markAsSpeaking = async (queueId: string): Promise<void> => {
  const { error } = await supabase
    .from('speaking_queue')
    .update({ status: 'speaking' })
    .eq('id', queueId);

  if (error) { console.error('Error marking as speaking:', error.message); throw error; }
  // Timer logic handled by backend (Duneli database server)
};

// Mark user as done speaking
export const markAsDone = async (queueId: string): Promise<void> => {
  const { error } = await supabase
    .from('speaking_queue')
    .update({ status: 'done' })
    .eq('id', queueId);

  if (error) { console.error('Error marking as done:', error.message); throw error; }
};

// Subscribe to current speaker
export const subscribeCurrentSpeaker = (
  meetingId: string,
  callback: (speaker: QueueEntry | null) => void
): (() => void) => {
  const fetchSpeaker = async () => {
    const { data } = await supabase
      .from('speaking_queue')
      .select('*')
      .eq('meetingId', meetingId)
      .eq('status', 'speaking')
      .order('requestedAt', { ascending: true })
      .limit(1)
      .maybeSingle();

    callback(data as QueueEntry | null);
  };

  fetchSpeaker();

  const channel = supabase
    .channel(`speaker-${meetingId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'speaking_queue', filter: `meetingId=eq.${meetingId}` }, fetchSpeaker)
    .subscribe();

  return () => { supabase.removeChannel(channel); };
};
