# DUNELI Backend Integration Guide

This document explains how the frontend connects to the backend services (Firebase & Agora).

---

## 🏗️ Architecture Overview

```
Frontend (React)
    ↓
Services Layer (Business Logic)
    ↓
    ├─→ Firebase Auth
    ├─→ Firestore Database
    ├─→ Cloud Functions
    └─→ Agora SDK
```

---

## 🔐 Authentication Flow

### Google Sign-In

```typescript
import { signInWithGoogle } from '@/services/authService';

// In your component
const handleGoogleSignIn = async () => {
  try {
    const user = await signInWithGoogle();
    console.log('User signed in:', user.uid);
    // User profile with anonymousId is created automatically
  } catch (error) {
    console.error('Sign-in failed:', error);
  }
};
```

### Phone Number OTP

```typescript
import { 
  initializeRecaptcha, 
  signInWithPhone, 
  verifyPhoneCode 
} from '@/services/authService';

// Step 1: Initialize reCAPTCHA (once on mount)
useEffect(() => {
  initializeRecaptcha('recaptcha-container');
}, []);

// Step 2: Send OTP
const handleSendOTP = async (phoneNumber: string) => {
  try {
    const confirmationResult = await signInWithPhone(phoneNumber);
    setConfirmationResult(confirmationResult);
    // Show OTP input
  } catch (error) {
    console.error('Failed to send OTP:', error);
  }
};

// Step 3: Verify OTP
const handleVerifyOTP = async (code: string) => {
  try {
    const user = await verifyPhoneCode(confirmationResult, code);
    console.log('User signed in:', user.uid);
  } catch (error) {
    console.error('Invalid code:', error);
  }
};
```

### Guest Mode

```typescript
import { continueAsGuest } from '@/services/authService';

const handleGuestMode = () => {
  continueAsGuest();
  // User can browse but not interact
};
```

### Auth State Listener

```typescript
import { useEffect } from 'react';
import { onAuthChange } from '@/services/authService';

const MyComponent = () => {
  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      if (user) {
        console.log('User is signed in:', user.uid);
        // Load user data
      } else {
        console.log('User is signed out');
        // Redirect to login
      }
    });

    return () => unsubscribe();
  }, []);
};
```

---

## 💬 Discussion Management

### Create a Topic

```typescript
import { createTopic } from '@/services/discussionService';

const handleCreateTopic = async () => {
  try {
    const topicId = await createTopic(
      'Is AI consciousness possible?',
      'Technology',
      userId,
      null // scheduledAt (null for immediate)
    );
    console.log('Topic created:', topicId);
  } catch (error) {
    console.error('Failed to create topic:', error);
  }
};
```

### Get Live Topics (Real-time)

```typescript
import { subscribeLiveTopics } from '@/services/discussionService';

useEffect(() => {
  const unsubscribe = subscribeLiveTopics((topics) => {
    setLiveTopics(topics);
  });

  return () => unsubscribe();
}, []);
```

### Start a Discussion

```typescript
import { createDiscussion } from '@/services/discussionService';

const handleStartDiscussion = async (topicId: string) => {
  try {
    const discussionId = await createDiscussion(topicId);
    console.log('Discussion started:', discussionId);
    // Navigate to meeting page
  } catch (error) {
    console.error('Failed to start discussion:', error);
  }
};
```

### Join a Discussion

```typescript
import { joinDiscussion } from '@/services/discussionService';

const handleJoinDiscussion = async (
  discussionId: string,
  role: 'listener' | 'speaker' | 'debater'
) => {
  try {
    const participantId = await joinDiscussion(
      discussionId,
      userId,
      role
    );
    console.log('Joined as:', role);
    setParticipantId(participantId);
  } catch (error) {
    console.error('Failed to join:', error);
  }
};
```

### Leave a Discussion

```typescript
import { leaveDiscussion } from '@/services/discussionService';

const handleLeaveDiscussion = async () => {
  try {
    await leaveDiscussion(participantId, discussionId, userId);
    console.log('Left discussion');
    // Navigate to leaving page
  } catch (error) {
    console.error('Failed to leave:', error);
  }
};
```

### Subscribe to Participant Count

```typescript
import { subscribeParticipantCount } from '@/services/discussionService';

useEffect(() => {
  const unsubscribe = subscribeParticipantCount(discussionId, (count) => {
    setParticipantCount(count);
  });

  return () => unsubscribe();
}, [discussionId]);
```

---

## 🎙️ Agora Audio Integration

### Join Audio Channel

```typescript
import { joinAgoraChannel, leaveAgoraChannel } from '@/services/agoraService';

const handleJoinAudio = async () => {
  try {
    const client = await joinAgoraChannel(
      agoraChannelName,
      userId,
      role // 'listener' | 'speaker' | 'debater'
    );
    console.log('Joined Agora channel');
    setAgoraClient(client);
  } catch (error) {
    console.error('Failed to join audio:', error);
  }
};

const handleLeaveAudio = async () => {
  try {
    await leaveAgoraChannel();
    console.log('Left Agora channel');
  } catch (error) {
    console.error('Failed to leave audio:', error);
  }
};
```

### Toggle Microphone (Speaker/Debater only)

```typescript
import { toggleMicrophone, isMicrophoneEnabled } from '@/services/agoraService';

const handleToggleMic = async () => {
  try {
    const currentState = isMicrophoneEnabled();
    await toggleMicrophone(!currentState);
    setMicEnabled(!currentState);
  } catch (error) {
    console.error('Failed to toggle mic:', error);
  }
};
```

---

## 📋 Speaking Queue Management

### Raise Hand

```typescript
import { raiseHand, lowerHand } from '@/services/queueService';

const handleRaiseHand = async () => {
  try {
    const queueId = await raiseHand(discussionId, userId);
    console.log('Added to queue:', queueId);
    setQueueId(queueId);
  } catch (error) {
    console.error('Failed to raise hand:', error);
  }
};

const handleLowerHand = async () => {
  try {
    await lowerHand(queueId);
    console.log('Removed from queue');
    setQueueId(null);
  } catch (error) {
    console.error('Failed to lower hand:', error);
  }
};
```

### Subscribe to Queue (Real-time)

```typescript
import { subscribeToQueue } from '@/services/queueService';

useEffect(() => {
  const unsubscribe = subscribeToQueue(discussionId, (queue) => {
    setSpeakingQueue(queue);
  });

  return () => unsubscribe();
}, [discussionId]);
```

### Current Speaker (Real-time)

```typescript
import { subscribeCurrentSpeaker } from '@/services/queueService';

useEffect(() => {
  const unsubscribe = subscribeCurrentSpeaker(discussionId, (speaker) => {
    setCurrentSpeaker(speaker);
    
    // If I'm the current speaker, unmute
    if (speaker && speaker.userId === userId) {
      toggleMicrophone(true);
    }
  });

  return () => unsubscribe();
}, [discussionId, userId]);
```

### Mark as Speaking (Auto-called by app)

```typescript
import { markAsSpeaking } from '@/services/queueService';

// This is called automatically when it's the user's turn
const handleStartSpeaking = async (queueId: string) => {
  try {
    await markAsSpeaking(queueId, discussionId);
    // This triggers the 3-minute timer in Cloud Function
  } catch (error) {
    console.error('Failed to mark as speaking:', error);
  }
};
```

---

## 👍👎 Reactions

### Add Reaction

```typescript
import { addReaction } from '@/services/reactionService';

const handleReact = async (type: 'agree' | 'disagree') => {
  try {
    await addReaction(discussionId, userId, type);
    console.log('Reacted:', type);
  } catch (error) {
    if (error.message.includes('wait')) {
      alert('Please wait before reacting again');
    }
  }
};
```

### Subscribe to Reaction Counts (Real-time)

```typescript
import { subscribeToReactionCounts } from '@/services/reactionService';

useEffect(() => {
  const unsubscribe = subscribeToReactionCounts(discussionId, (counts) => {
    setAgreeCount(counts.agree);
    setDisagreeCount(counts.disagree);
  });

  return () => unsubscribe();
}, [discussionId]);
```

---

## ⏱️ Speaker Timer Hook

```typescript
import { useTimer } from '@/hooks/useTimer';

const MeetingPage = () => {
  const { timeLeft, isActive } = useTimer(
    currentSpeaker?.userId === userId, // Start timer if I'm speaking
    180 // 3 minutes in seconds
  );

  return (
    <div>
      {isActive && (
        <div>Time remaining: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</div>
      )}
    </div>
  );
};
```

---

## 🔄 Complete Meeting Flow

Here's a complete example of joining and participating in a meeting:

```typescript
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useDiscussion } from '@/hooks/useDiscussion';
import { useQueue } from '@/hooks/useQueue';
import { useReactions } from '@/hooks/useReactions';
import { joinAgoraChannel, toggleMicrophone } from '@/services/agoraService';

const MeetingPage = ({ discussionId }) => {
  const { user } = useAuth();
  const { discussion, participantCount } = useDiscussion(discussionId);
  const { queue, currentSpeaker, raiseHand, lowerHand } = useQueue(discussionId);
  const { reactionCounts, addReaction } = useReactions(discussionId);
  
  const [role, setRole] = useState<'listener' | 'speaker' | 'debater'>('listener');
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [micEnabled, setMicEnabled] = useState(false);

  // Join discussion when component mounts
  useEffect(() => {
    const join = async () => {
      if (!user || !discussion) return;

      // 1. Join as participant in Firestore
      const pid = await joinDiscussion(discussionId, user.uid, role);
      setParticipantId(pid);

      // 2. Join Agora audio channel
      await joinAgoraChannel(discussion.agoraChannelName, user.uid, role);
    };

    join();

    // Cleanup: leave discussion on unmount
    return () => {
      if (participantId) {
        leaveDiscussion(participantId, discussionId, user.uid);
        leaveAgoraChannel();
      }
    };
  }, [discussionId, user, role, discussion]);

  // Auto-unmute if I'm the current speaker
  useEffect(() => {
    if (currentSpeaker?.userId === user?.uid) {
      toggleMicrophone(true);
      setMicEnabled(true);
    }
  }, [currentSpeaker, user]);

  const handleToggleMic = async () => {
    await toggleMicrophone(!micEnabled);
    setMicEnabled(!micEnabled);
  };

  const handleReact = async (type: 'agree' | 'disagree') => {
    if (!user) {
      alert('Please sign in to react');
      return;
    }
    await addReaction(type);
  };

  return (
    <div>
      <h1>Discussion: {discussion?.topicId}</h1>
      <p>Participants: {participantCount}</p>
      
      {/* Current speaker */}
      {currentSpeaker && (
        <div>
          Current speaker: {currentSpeaker.userId}
          {currentSpeaker.userId === user?.uid && (
            <button onClick={handleToggleMic}>
              {micEnabled ? 'Mute' : 'Unmute'}
            </button>
          )}
        </div>
      )}

      {/* Speaking queue */}
      <div>
        <h2>Queue ({queue.length})</h2>
        {queue.map((entry, index) => (
          <div key={entry.id}>
            {index + 1}. {entry.userId}
          </div>
        ))}
        {role === 'speaker' && (
          <button onClick={raiseHand}>Raise Hand</button>
        )}
      </div>

      {/* Reactions */}
      <div>
        <button onClick={() => handleReact('agree')}>
          👍 {reactionCounts.agree}
        </button>
        <button onClick={() => handleReact('disagree')}>
          👎 {reactionCounts.disagree}
        </button>
      </div>
    </div>
  );
};
```

---

## 🎯 Key Implementation Rules

### 1. Authentication
- Always check if user is authenticated before allowing interactions
- Guest users can only read data
- Store anonymous ID, not real names

### 2. Roles
- **Listener**: Listen only, can react, mic OFF
- **Speaker**: Raise hand, join queue, 3-minute limit, auto-mute
- **Debater**: Mic always available, no time limit

### 3. Speaking Queue
- FIFO order (first-in, first-out)
- No skipping
- Auto-mute after 3 minutes
- Cleanup "done" entries automatically

### 4. Reactions
- Anti-spam: 2-second cooldown per user
- Auto-cleanup old reactions (1 hour)
- Real-time sync

### 5. Audio
- Agora tokens generated server-side only
- Listeners cannot publish audio
- Speakers/Debaters can publish audio
- Auto-leave on page exit

### 6. Cleanup
- Auto-end discussions after 2 hours
- Remove inactive participants after 10 minutes
- Clean up old reactions hourly
- Remove done queue entries every minute

---

## 🔍 Debugging Tips

### Check Firebase Authentication
```typescript
import { auth } from '@/lib/firebase';

console.log('Current user:', auth.currentUser);
console.log('Is signed in:', !!auth.currentUser);
```

### Check Firestore Connection
```typescript
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

const testConnection = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'users'));
    console.log('Firestore connected, users:', snapshot.size);
  } catch (error) {
    console.error('Firestore error:', error);
  }
};
```

### Check Agora Connection
```typescript
import { getAgoraClient } from '@/services/agoraService';

const client = getAgoraClient();
console.log('Agora client:', client);
console.log('Connection state:', client?.connectionState);
```

### View Function Logs
```bash
firebase functions:log --only generateAgoraToken
firebase functions:log --only processSpeakerTimers
```

---

## ✅ Pre-Deployment Checklist

- [ ] `.env` file configured with Firebase credentials
- [ ] Firebase project created and services enabled
- [ ] Authentication methods enabled (Google, Phone)
- [ ] Firestore database created
- [ ] Security rules deployed
- [ ] Indexes deployed and built
- [ ] Cloud Functions deployed
- [ ] Agora credentials set
- [ ] Test all authentication flows
- [ ] Test audio in meeting
- [ ] Test speaker timer
- [ ] Test reactions
- [ ] Test queue management

---

## 📚 Next Steps

1. Read the [Setup Guide](./SETUP_GUIDE.md) for detailed deployment instructions
2. Review the [README](./README.md) for project overview
3. Test locally with Firebase Emulators
4. Deploy to production
5. Monitor logs and analytics

---

**Happy integrating! 🎉**
