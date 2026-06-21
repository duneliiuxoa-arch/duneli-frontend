// Speaking Queue Hook
import { useState, useEffect } from 'react';
import {
  subscribeToQueue,
  subscribeCurrentSpeaker,
  QueueEntry,
} from '../services/queueService';

export const useSpeakingQueue = (discussionId: string | null) => {
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!discussionId) {
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToQueue(discussionId, (queueEntries) => {
      setQueue(queueEntries);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [discussionId]);

  return { queue, loading };
};

export const useCurrentSpeaker = (discussionId: string | null) => {
  const [speaker, setSpeaker] = useState<QueueEntry | null>(null);

  useEffect(() => {
    if (!discussionId) return;

    const unsubscribe = subscribeCurrentSpeaker(discussionId, (currentSpeaker) => {
      setSpeaker(currentSpeaker);
    });

    return () => unsubscribe();
  }, [discussionId]);

  return speaker;
};
