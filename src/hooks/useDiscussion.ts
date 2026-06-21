// Discussion Hook
import { useState, useEffect } from 'react';
import {
  subscribeLiveTopics,
  subscribeParticipantCount,
  Topic,
  Discussion,
  getDiscussion,
} from '../services/discussionService';

export const useLiveTopics = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeLiveTopics((liveTopics) => {
      setTopics(liveTopics);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { topics, loading };
};

export const useParticipantCount = (discussionId: string | null) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!discussionId) return;

    const unsubscribe = subscribeParticipantCount(discussionId, (participantCount) => {
      setCount(participantCount);
    });

    return () => unsubscribe();
  }, [discussionId]);

  return count;
};

export const useDiscussion = (discussionId: string | null) => {
  const [discussion, setDiscussion] = useState<Discussion | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!discussionId) {
      setLoading(false);
      return;
    }

    const fetchDiscussion = async () => {
      const disc = await getDiscussion(discussionId);
      setDiscussion(disc);
      setLoading(false);
    };

    fetchDiscussion();
  }, [discussionId]);

  return { discussion, loading };
};
