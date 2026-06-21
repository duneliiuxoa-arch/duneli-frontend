// Reaction Hook
import { useState, useEffect } from 'react';
import { subscribeToReactionCounts } from '../services/reactionService';

export const useReactionCounts = (discussionId: string | null) => {
  const [counts, setCounts] = useState({ agree: 0, disagree: 0 });

  useEffect(() => {
    if (!discussionId) return;

    const unsubscribe = subscribeToReactionCounts(discussionId, (reactionCounts) => {
      setCounts(reactionCounts);
    });

    return () => unsubscribe();
  }, [discussionId]);

  return counts;
};
