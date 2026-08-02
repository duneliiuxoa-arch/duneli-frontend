// Discussion Service
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  updateDoc,
  deleteDoc,
  increment,
} from 'firebase/firestore';
import { logEvent } from 'firebase/analytics';
import { db, analytics } from '../lib/firebase';

export interface Topic {
  id: string;
  title: string;
  category: string;
  createdBy: string;
  createdAt: Timestamp;
  scheduledAt: Timestamp | null;
  status: 'live' | 'upcoming' | 'ended';
  interestCount: number;
}

export interface Discussion {
  id: string;
  topicId: string;
  startedAt: Timestamp;
  endedAt: Timestamp | null;
  agoraChannelName: string;
  status: 'live' | 'ended';
}

export interface Participant {
  id: string;
  discussionId: string;
  userId: string;
  role: 'listener' | 'speaker' | 'debater';
  joinedAt: Timestamp;
}

// Create a new topic
export const createTopic = async (
  title: string,
  category: string,
  userId: string,
  scheduledAt: Date | null = null
): Promise<string> => {
  try {
    const topicRef = await addDoc(collection(db, 'topics'), {
      title,
      category,
      createdBy: userId,
      createdAt: serverTimestamp(),
      scheduledAt: scheduledAt ? Timestamp.fromDate(scheduledAt) : null,
      status: scheduledAt ? 'upcoming' : 'live',
      interestCount: 0,
    });

    return topicRef.id;
  } catch (error) {
    console.error('Error creating topic:', error);
    throw error;
  }
};

// Get live topics
export const getLiveTopics = async (): Promise<Topic[]> => {
  try {
    const q = query(
      collection(db, 'topics'),
      where('status', '==', 'live'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Topic[];
  } catch (error) {
    console.error('Error getting live topics:', error);
    throw error;
  }
};

// Get upcoming topics
export const getUpcomingTopics = async (): Promise<Topic[]> => {
  try {
    const q = query(
      collection(db, 'topics'),
      where('status', '==', 'upcoming'),
      orderBy('scheduledAt', 'asc'),
      limit(20)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Topic[];
  } catch (error) {
    console.error('Error getting upcoming topics:', error);
    throw error;
  }
};

// Subscribe to live topics (real-time)
export const subscribeLiveTopics = (
  callback: (topics: Topic[]) => void
): (() => void) => {
  const q = query(
    collection(db, 'topics'),
    where('status', '==', 'live'),
    orderBy('createdAt', 'desc'),
    limit(20)
  );

  return onSnapshot(q, (snapshot) => {
    const topics = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Topic[];
    callback(topics);
  });
};

// Create a discussion from a topic
export const createDiscussion = async (topicId: string): Promise<string> => {
  try {
    const channelName = `discussion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const discussionRef = await addDoc(collection(db, 'discussions'), {
      topicId,
      startedAt: serverTimestamp(),
      endedAt: null,
      agoraChannelName: channelName,
      status: 'live',
    });

    // Update topic status to live
    await updateDoc(doc(db, 'topics', topicId), {
      status: 'live',
    });

    if (analytics) {
      logEvent(analytics, 'meeting_started', {
        discussion_id: discussionRef.id,
        topic_id: topicId,
      });
    }

    return discussionRef.id;
  } catch (error) {
    console.error('Error creating discussion:', error);
    throw error;
  }
};

// Get discussion by ID
export const getDiscussion = async (discussionId: string): Promise<Discussion | null> => {
  try {
    const discussionRef = doc(db, 'discussions', discussionId);
    const discussionDoc = await getDoc(discussionRef);

    if (discussionDoc.exists()) {
      return {
        id: discussionDoc.id,
        ...discussionDoc.data(),
      } as Discussion;
    }

    return null;
  } catch (error) {
    console.error('Error getting discussion:', error);
    throw error;
  }
};

// Join discussion as participant
export const joinDiscussion = async (
  discussionId: string,
  userId: string,
  role: 'listener' | 'speaker' | 'debater'
): Promise<string> => {
  try {
    const participantRef = await addDoc(collection(db, 'participants'), {
      discussionId,
      userId,
      role,
      joinedAt: serverTimestamp(),
    });

    // Log activity
    await addDoc(collection(db, 'activityLogs'), {
      userId,
      type: 'joined',
      discussionId,
      timestamp: serverTimestamp(),
    });

    if (analytics) {
      logEvent(analytics, 'join_discussion', {
        discussion_id: discussionId,
        role,
      });
    }

    return participantRef.id;
  } catch (error) {
    console.error('Error joining discussion:', error);
    throw error;
  }
};

// Leave discussion
export const leaveDiscussion = async (
  participantId: string,
  discussionId: string,
  userId: string
): Promise<void> => {
  try {
    // Delete participant record
    await deleteDoc(doc(db, 'participants', participantId));

    // Log activity
    await addDoc(collection(db, 'activityLogs'), {
      userId,
      type: 'left',
      discussionId,
      timestamp: serverTimestamp(),
    });

    if (analytics) {
      logEvent(analytics, 'leave_discussion', {
        discussion_id: discussionId,
      });
    }
  } catch (error) {
    console.error('Error leaving discussion:', error);
    throw error;
  }
};

// Get participants count (real-time)
export const subscribeParticipantCount = (
  discussionId: string,
  callback: (count: number) => void
): (() => void) => {
  const q = query(
    collection(db, 'participants'),
    where('discussionId', '==', discussionId)
  );

  return onSnapshot(q, (snapshot) => {
    callback(snapshot.size);
  });
};

// Express interest in topic
export const expressInterest = async (topicId: string, userId: string): Promise<void> => {
  try {
    // Increment interest count
    await updateDoc(doc(db, 'topics', topicId), {
      interestCount: increment(1),
    });

    // Log activity
    await addDoc(collection(db, 'activityLogs'), {
      userId,
      type: 'expressed_interest',
      topicId,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error expressing interest:', error);
    throw error;
  }
};

// End discussion
export const endDiscussion = async (discussionId: string): Promise<void> => {
  try {
    await updateDoc(doc(db, 'discussions', discussionId), {
      endedAt: serverTimestamp(),
      status: 'ended',
    });

    // Get topic ID and update status
    const discussion = await getDiscussion(discussionId);
    if (discussion) {
      await updateDoc(doc(db, 'topics', discussion.topicId), {
        status: 'ended',
      });
    }

    if (analytics) {
      logEvent(analytics, 'meeting_ended', {
        discussion_id: discussionId,
      });
    }
  } catch (error) {
    console.error('Error ending discussion:', error);
    throw error;
  }
};
