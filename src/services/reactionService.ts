// Reaction Service
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  getDocs,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { logEvent } from 'firebase/analytics';
import { db, analytics } from '../lib/firebase';

export interface Reaction {
  id: string;
  discussionId: string;
  userId: string;
  type: 'agree' | 'disagree';
  createdAt: Timestamp;
}

// Add reaction
export const addReaction = async (
  discussionId: string,
  userId: string,
  type: 'agree' | 'disagree'
): Promise<string> => {
  try {
    // Check if user already reacted in the last 2 seconds (prevent spamming)
    const twoSecondsAgo = new Date(Date.now() - 2000);
    const q = query(
      collection(db, 'reactions'),
      where('discussionId', '==', discussionId),
      where('userId', '==', userId)
    );

    const snapshot = await getDocs(q);
    const recentReaction = snapshot.docs.find((doc) => {
      const data = doc.data();
      const createdAt = data.createdAt?.toDate();
      return createdAt && createdAt > twoSecondsAgo;
    });

    if (recentReaction) {
      throw new Error('Please wait before reacting again');
    }

    const reactionRef = await addDoc(collection(db, 'reactions'), {
      discussionId,
      userId,
      type,
      createdAt: serverTimestamp(),
    });

    // Log activity
    await addDoc(collection(db, 'activityLogs'), {
      userId,
      type: 'reacted',
      discussionId,
      timestamp: serverTimestamp(),
    });

    if (analytics) {
      logEvent(analytics, 'reaction_added', {
        discussion_id: discussionId,
        reaction_type: type,
      });
    }

    return reactionRef.id;
  } catch (error) {
    console.error('Error adding reaction:', error);
    throw error;
  }
};

// Subscribe to reactions (real-time)
export const subscribeToReactions = (
  discussionId: string,
  callback: (reactions: Reaction[]) => void
): (() => void) => {
  const q = query(
    collection(db, 'reactions'),
    where('discussionId', '==', discussionId)
  );

  return onSnapshot(q, (snapshot) => {
    const reactions = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Reaction[];
    callback(reactions);
  });
};

// Get reaction counts
export const subscribeToReactionCounts = (
  discussionId: string,
  callback: (counts: { agree: number; disagree: number }) => void
): (() => void) => {
  const q = query(
    collection(db, 'reactions'),
    where('discussionId', '==', discussionId)
  );

  return onSnapshot(q, (snapshot) => {
    const counts = { agree: 0, disagree: 0 };

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      if (data.type === 'agree') {
        counts.agree++;
      } else if (data.type === 'disagree') {
        counts.disagree++;
      }
    });

    callback(counts);
  });
};

// Clean up old reactions (optional, can be called periodically)
export const cleanupOldReactions = async (discussionId: string): Promise<void> => {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const q = query(
      collection(db, 'reactions'),
      where('discussionId', '==', discussionId)
    );

    const snapshot = await getDocs(q);
    const deletePromises = snapshot.docs
      .filter((doc) => {
        const data = doc.data();
        const createdAt = data.createdAt?.toDate();
        return createdAt && createdAt < fiveMinutesAgo;
      })
      .map((doc) => deleteDoc(doc.ref));

    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Error cleaning up reactions:', error);
  }
};
