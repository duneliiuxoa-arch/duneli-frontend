// Speaking Queue Service
import {
  collection,
  doc,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  getDocs,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../lib/firebase';

export interface QueueEntry {
  id: string;
  discussionId: string;
  userId: string;
  requestedAt: Timestamp;
  status: 'waiting' | 'speaking' | 'done';
}

// Raise hand to join speaking queue
export const raiseHand = async (
  discussionId: string,
  userId: string
): Promise<string> => {
  try {
    // Check if user is already in queue
    const q = query(
      collection(db, 'speakingQueue'),
      where('discussionId', '==', discussionId),
      where('userId', '==', userId),
      where('status', 'in', ['waiting', 'speaking'])
    );

    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      throw new Error('Already in queue');
    }

    const queueRef = await addDoc(collection(db, 'speakingQueue'), {
      discussionId,
      userId,
      requestedAt: serverTimestamp(),
      status: 'waiting',
    });

    return queueRef.id;
  } catch (error) {
    console.error('Error raising hand:', error);
    throw error;
  }
};

// Lower hand (remove from queue)
export const lowerHand = async (queueId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'speakingQueue', queueId));
  } catch (error) {
    console.error('Error lowering hand:', error);
    throw error;
  }
};

// Subscribe to speaking queue (real-time)
export const subscribeToQueue = (
  discussionId: string,
  callback: (queue: QueueEntry[]) => void
): (() => void) => {
  const q = query(
    collection(db, 'speakingQueue'),
    where('discussionId', '==', discussionId),
    where('status', 'in', ['waiting', 'speaking']),
    orderBy('requestedAt', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const queue = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as QueueEntry[];
    callback(queue);
  });
};

// Mark user as speaking
export const markAsSpeaking = async (
  queueId: string,
  discussionId: string
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'speakingQueue', queueId), {
      status: 'speaking',
    });

    // Start the 3-minute timer via Cloud Function
    const startTimer = httpsCallable(functions, 'startSpeakerTimer');
    await startTimer({
      queueId,
      discussionId,
    });
  } catch (error) {
    console.error('Error marking as speaking:', error);
    throw error;
  }
};

// Mark user as done speaking
export const markAsDone = async (queueId: string): Promise<void> => {
  try {
    await updateDoc(doc(db, 'speakingQueue', queueId), {
      status: 'done',
    });

    // Note: The cleanup function will delete this entry
  } catch (error) {
    console.error('Error marking as done:', error);
    throw error;
  }
};

// Get current speaker
export const subscribeCurrentSpeaker = (
  discussionId: string,
  callback: (speaker: QueueEntry | null) => void
): (() => void) => {
  const q = query(
    collection(db, 'speakingQueue'),
    where('discussionId', '==', discussionId),
    where('status', '==', 'speaking'),
    orderBy('requestedAt', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    if (snapshot.empty) {
      callback(null);
    } else {
      const speaker = {
        id: snapshot.docs[0].id,
        ...snapshot.docs[0].data(),
      } as QueueEntry;
      callback(speaker);
    }
  });
};
