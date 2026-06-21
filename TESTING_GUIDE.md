# 🧪 DUNELI Testing Guide

This guide covers how to test DUNELI's backend integration thoroughly.

---

## 🎯 Testing Overview

We'll test:
1. Authentication (Google, Phone, Guest)
2. Discussion Management
3. Speaking Queue & Timer
4. Agora Audio
5. Reactions
6. Real-time Sync
7. Cloud Functions
8. Security Rules

---

## 🔐 1. Authentication Testing

### Test Google Sign-In

**Steps:**
1. Open app in browser
2. Click "Login" button
3. Select "Continue with Google"
4. Choose Google account
5. Verify redirect back to app

**Expected Results:**
- ✅ User is signed in
- ✅ User UID appears in console
- ✅ Firebase Console → Authentication shows new user
- ✅ Firestore → users collection has new document
- ✅ User has anonymous ID (e.g., "Δ-8472")

**Test Code:**
```typescript
import { signInWithGoogle } from '@/services/authService';

const testGoogleSignIn = async () => {
  try {
    const user = await signInWithGoogle();
    console.log('✅ Google sign-in successful');
    console.log('User ID:', user.uid);
    
    // Check anonymous ID was created
    const anonymousId = await getUserAnonymousId(user.uid);
    console.log('Anonymous ID:', anonymousId);
    
    if (!anonymousId) {
      console.error('❌ Anonymous ID not created');
    } else {
      console.log('✅ Anonymous ID created successfully');
    }
  } catch (error) {
    console.error('❌ Google sign-in failed:', error);
  }
};
```

### Test Phone OTP Sign-In

**Steps:**
1. Click "Login" button
2. Select "Continue with Phone"
3. Enter phone number (e.g., +1234567890)
4. Click "Send Code"
5. Check phone for OTP
6. Enter OTP code
7. Click "Verify"

**Expected Results:**
- ✅ OTP sent successfully
- ✅ OTP received on phone
- ✅ User signed in after verification
- ✅ User appears in Firebase Console → Authentication
- ✅ User has anonymous ID in Firestore

### Test Guest Mode

**Steps:**
1. Click "Continue as Guest"
2. Try to create a topic
3. Try to join a discussion
4. Try to react

**Expected Results:**
- ✅ User can browse topics
- ✅ User can view discussions
- ❌ User CANNOT create topics
- ❌ User CANNOT join discussions
- ❌ User CANNOT react
- ✅ Login prompt appears when trying to interact

---

## 💬 2. Discussion Management Testing

### Test Create Topic

**Test Code:**
```typescript
import { createTopic } from '@/services/discussionService';

const testCreateTopic = async (userId: string) => {
  try {
    const topicId = await createTopic(
      'Is AI consciousness possible?',
      'Technology',
      userId,
      null // No scheduling
    );
    
    console.log('✅ Topic created:', topicId);
    
    // Verify in Firestore
    const topic = await getDoc(doc(db, 'topics', topicId));
    console.log('Topic data:', topic.data());
    
    if (topic.data()?.status !== 'live') {
      console.error('❌ Topic status should be "live"');
    }
  } catch (error) {
    console.error('❌ Failed to create topic:', error);
  }
};
```

**Expected Results:**
- ✅ Topic created in Firestore
- ✅ Status is "live"
- ✅ Creator is current user
- ✅ interestCount is 0

### Test Create Discussion

**Test Code:**
```typescript
import { createDiscussion } from '@/services/discussionService';

const testCreateDiscussion = async (topicId: string) => {
  try {
    const discussionId = await createDiscussion(topicId);
    console.log('✅ Discussion created:', discussionId);
    
    // Verify in Firestore
    const discussion = await getDoc(doc(db, 'discussions', discussionId));
    const data = discussion.data();
    
    console.log('Discussion data:', data);
    
    if (!data?.agoraChannelName) {
      console.error('❌ Agora channel name not set');
    }
    
    if (data?.status !== 'live') {
      console.error('❌ Discussion status should be "live"');
    }
    
    console.log('✅ All checks passed');
  } catch (error) {
    console.error('❌ Failed to create discussion:', error);
  }
};
```

**Expected Results:**
- ✅ Discussion created
- ✅ Has agoraChannelName
- ✅ Status is "live"
- ✅ startedAt timestamp set

### Test Join Discussion

**Test Code:**
```typescript
const testJoinDiscussion = async (
  discussionId: string,
  userId: string,
  role: 'listener' | 'speaker' | 'debater'
) => {
  try {
    const participantId = await joinDiscussion(discussionId, userId, role);
    console.log('✅ Joined as', role, '- ID:', participantId);
    
    // Verify in Firestore
    const participant = await getDoc(doc(db, 'participants', participantId));
    const data = participant.data();
    
    if (data?.role !== role) {
      console.error('❌ Role mismatch');
    }
    
    if (data?.userId !== userId) {
      console.error('❌ User ID mismatch');
    }
    
    console.log('✅ All checks passed');
  } catch (error) {
    console.error('❌ Failed to join discussion:', error);
  }
};
```

---

## 📋 3. Speaking Queue Testing

### Test Raise Hand

**Test Code:**
```typescript
const testRaiseHand = async (discussionId: string, userId: string) => {
  try {
    const queueId = await raiseHand(discussionId, userId);
    console.log('✅ Raised hand - Queue ID:', queueId);
    
    // Verify in Firestore
    const queueEntry = await getDoc(doc(db, 'speakingQueue', queueId));
    const data = queueEntry.data();
    
    if (data?.status !== 'waiting') {
      console.error('❌ Status should be "waiting"');
    }
    
    console.log('✅ Queue entry created successfully');
  } catch (error) {
    console.error('❌ Failed to raise hand:', error);
  }
};
```

### Test Speaker Timer (Critical!)

**Setup:**
1. User A joins as Speaker
2. User A raises hand
3. User A starts speaking

**Test Code:**
```typescript
const testSpeakerTimer = async (queueId: string, discussionId: string) => {
  console.log('🕐 Starting speaker timer test...');
  
  try {
    // Mark as speaking (this triggers the timer)
    await markAsSpeaking(queueId, discussionId);
    console.log('✅ Marked as speaking');
    console.log('⏰ Timer started - waiting 3 minutes...');
    
    // Check status immediately
    const entry1 = await getDoc(doc(db, 'speakingQueue', queueId));
    if (entry1.data()?.status !== 'speaking') {
      console.error('❌ Status should be "speaking"');
    }
    
    // Check timer in Firestore
    const timer = await getDoc(doc(db, 'speakerTimers', queueId));
    if (!timer.exists()) {
      console.error('❌ Timer not created');
    } else {
      console.log('✅ Timer created in Firestore');
    }
    
    // Wait 3 minutes + 10 seconds for processing
    console.log('⏳ Please wait 3 minutes 10 seconds...');
    await new Promise(resolve => setTimeout(resolve, 190000));
    
    // Check if status changed to "done"
    const entry2 = await getDoc(doc(db, 'speakingQueue', queueId));
    
    if (!entry2.exists()) {
      console.log('✅ Queue entry deleted (as expected)');
    } else if (entry2.data()?.status === 'done') {
      console.log('✅ Status changed to "done"');
      console.log('⏳ Waiting for deletion...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const entry3 = await getDoc(doc(db, 'speakingQueue', queueId));
      if (!entry3.exists()) {
        console.log('✅ Entry deleted after "done" status');
      }
    } else {
      console.error('❌ Timer did not trigger correctly');
      console.error('Current status:', entry2.data()?.status);
    }
  } catch (error) {
    console.error('❌ Timer test failed:', error);
  }
};
```

**Expected Results:**
- ✅ Status changes from "waiting" → "speaking"
- ✅ Timer created in speakerTimers collection
- ✅ After 3 minutes, status changes to "done"
- ✅ After "done", entry is deleted

### Test Queue Order (FIFO)

**Setup:**
1. User A joins and raises hand
2. User B joins and raises hand
3. User C joins and raises hand

**Test Code:**
```typescript
const testQueueOrder = async (discussionId: string) => {
  const users = ['userA', 'userB', 'userC'];
  const queueIds: string[] = [];
  
  // Add all users to queue
  for (const userId of users) {
    const queueId = await raiseHand(discussionId, userId);
    queueIds.push(queueId);
    console.log(`✅ ${userId} raised hand`);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Small delay
  }
  
  // Get queue
  const q = query(
    collection(db, 'speakingQueue'),
    where('discussionId', '==', discussionId),
    orderBy('requestedAt', 'asc')
  );
  
  const snapshot = await getDocs(q);
  const queue = snapshot.docs.map(doc => doc.data());
  
  // Verify order
  console.log('Queue order:', queue.map(e => e.userId));
  
  if (queue[0].userId !== 'userA') {
    console.error('❌ First in queue should be userA');
  }
  if (queue[1].userId !== 'userB') {
    console.error('❌ Second in queue should be userB');
  }
  if (queue[2].userId !== 'userC') {
    console.error('❌ Third in queue should be userC');
  }
  
  console.log('✅ Queue order is FIFO');
};
```

---

## 🎙️ 4. Agora Audio Testing

### Test Join Audio Channel

**Test Code:**
```typescript
const testJoinAudio = async (
  channelName: string,
  userId: string,
  role: 'listener' | 'speaker' | 'debater'
) => {
  try {
    console.log('🎙️ Joining audio channel...');
    
    const client = await joinAgoraChannel(channelName, userId, role);
    console.log('✅ Joined Agora channel');
    console.log('Connection state:', client.connectionState);
    
    // For speaker/debater, check if local track exists
    if (role !== 'listener') {
      const micEnabled = isMicrophoneEnabled();
      console.log('Mic enabled:', micEnabled);
      
      // Try toggling mic
      await toggleMicrophone(true);
      console.log('✅ Microphone unmuted');
      
      await toggleMicrophone(false);
      console.log('✅ Microphone muted');
    }
    
    // Leave channel
    await leaveAgoraChannel();
    console.log('✅ Left Agora channel');
  } catch (error) {
    console.error('❌ Agora test failed:', error);
  }
};
```

**Manual Test:**
1. Open app in 2 browsers (or 2 devices)
2. User A: Join as Debater, unmute mic
3. User B: Join as Listener
4. User A: Speak
5. User B: Should hear User A

**Expected Results:**
- ✅ User A can unmute mic
- ✅ User B hears User A
- ✅ User B (listener) cannot unmute
- ✅ Audio is clear, no lag

---

## 👍👎 5. Reactions Testing

### Test Add Reaction

**Test Code:**
```typescript
const testReactions = async (discussionId: string, userId: string) => {
  try {
    // Add agree reaction
    await addReaction(discussionId, userId, 'agree');
    console.log('✅ Added agree reaction');
    
    // Try to add another immediately (should fail due to cooldown)
    try {
      await addReaction(discussionId, userId, 'disagree');
      console.error('❌ Should have been rate limited');
    } catch (error) {
      console.log('✅ Rate limiting working');
    }
    
    // Wait 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Try again (should work)
    await addReaction(discussionId, userId, 'disagree');
    console.log('✅ Added disagree reaction after cooldown');
    
  } catch (error) {
    console.error('❌ Reaction test failed:', error);
  }
};
```

**Expected Results:**
- ✅ First reaction added
- ❌ Second immediate reaction fails (cooldown)
- ✅ Reaction after 2 seconds succeeds

### Test Real-time Reaction Counts

**Setup:**
1. User A and User B join same discussion
2. User A subscribes to reaction counts

**Test Code:**
```typescript
const testReactionRealtime = (discussionId: string) => {
  // Subscribe to counts
  const unsubscribe = subscribeToReactionCounts(discussionId, (counts) => {
    console.log('Reaction counts updated:', counts);
  });
  
  // User B adds reactions (in another browser/device)
  // Observer should see counts update in real-time
  
  return unsubscribe;
};
```

---

## 🔄 6. Real-time Sync Testing

### Test Real-time Topics

**Test:**
1. User A opens app
2. User B creates a new topic
3. User A should see the topic appear automatically

**Test Code:**
```typescript
const testRealtimeTopics = () => {
  console.log('📡 Subscribing to live topics...');
  
  const unsubscribe = subscribeLiveTopics((topics) => {
    console.log('Topics updated:', topics.length);
    topics.forEach(topic => {
      console.log('-', topic.title);
    });
  });
  
  // Create a topic in another browser
  // Observer should see it appear
  
  return unsubscribe;
};
```

---

## ☁️ 7. Cloud Functions Testing

### Test Agora Token Generation

**Test Code:**
```typescript
import { getAgoraToken } from '@/services/agoraService';

const testAgoraTokenFunction = async () => {
  try {
    const token = await getAgoraToken(
      'test-channel',
      'user123',
      'speaker'
    );
    
    console.log('✅ Token generated:', token.substring(0, 20) + '...');
    
    if (token.length < 100) {
      console.error('❌ Token seems too short');
    }
  } catch (error) {
    console.error('❌ Token generation failed:', error);
  }
};
```

### Check Function Logs

**Command:**
```bash
# View logs for all functions
firebase functions:log

# View logs for specific function
firebase functions:log --only generateAgoraToken

# Stream logs in real-time
firebase functions:log --follow
```

**What to Check:**
- ✅ No error messages
- ✅ Functions executing successfully
- ✅ Timer functions running every minute
- ✅ Cleanup functions running on schedule

---

## 🔒 8. Security Rules Testing

### Test Unauthorized Access

**Test Code:**
```typescript
const testSecurityRules = async () => {
  // Try to create topic without auth (should fail)
  try {
    await addDoc(collection(db, 'topics'), {
      title: 'Unauthorized topic',
      createdBy: 'fake-user',
    });
    console.error('❌ Should not allow unauthorized topic creation');
  } catch (error) {
    console.log('✅ Security rule blocked unauthorized access');
  }
  
  // Try to update another user's record (should fail)
  try {
    await updateDoc(doc(db, 'users', 'other-user-id'), {
      anonymousId: 'hacked',
    });
    console.error('❌ Should not allow updating other users');
  } catch (error) {
    console.log('✅ Security rule blocked unauthorized update');
  }
};
```

---

## 📊 9. End-to-End Flow Testing

### Complete Meeting Flow

**Steps:**
1. User A signs in with Google
2. User A creates topic "Climate Change Solutions"
3. User A starts discussion
4. User B signs in with Phone
5. User B joins as Listener
6. User C signs in with Google
7. User C joins as Speaker
8. User C raises hand
9. User C starts speaking (auto-promoted)
10. User A reacts with 👍
11. User B reacts with 👎
12. Wait 3 minutes
13. User C auto-muted
14. User C leaves
15. User A ends discussion

**Expected Results:**
- ✅ All users authenticated
- ✅ Topic created and visible
- ✅ Discussion started
- ✅ All users joined successfully
- ✅ Queue worked correctly
- ✅ Reactions appeared in real-time
- ✅ Timer worked (3 minutes)
- ✅ Auto-mute worked
- ✅ Discussion ended cleanly
- ✅ All data in Firestore

---

## ✅ Testing Checklist

Use this checklist for comprehensive testing:

### Authentication
- [ ] Google sign-in works
- [ ] Phone OTP works
- [ ] Guest mode restricts interactions
- [ ] Anonymous IDs generated
- [ ] Users appear in Firebase Console

### Discussion Management
- [ ] Can create topics
- [ ] Can start discussions
- [ ] Can join as Listener
- [ ] Can join as Speaker
- [ ] Can join as Debater
- [ ] Real-time topic updates work

### Speaking Queue
- [ ] Can raise hand
- [ ] Can lower hand
- [ ] Queue order is FIFO
- [ ] Status changes correctly
- [ ] Real-time queue updates work

### Speaker Timer
- [ ] Timer starts when speaking
- [ ] Auto-mutes after 3 minutes
- [ ] Entry deleted after done
- [ ] Cloud Function logs show execution

### Agora Audio
- [ ] Can join audio channel
- [ ] Listener cannot unmute
- [ ] Speaker can unmute when speaking
- [ ] Debater can unmute anytime
- [ ] Audio quality is good
- [ ] Can leave channel cleanly

### Reactions
- [ ] Can add reactions
- [ ] Rate limiting works (2 second cooldown)
- [ ] Real-time counts update
- [ ] Old reactions cleaned up

### Real-time Sync
- [ ] Topics update in real-time
- [ ] Queue updates in real-time
- [ ] Reactions update in real-time
- [ ] Participant count updates

### Cloud Functions
- [ ] Agora token generation works
- [ ] Speaker timer triggers
- [ ] Cleanup functions run
- [ ] Logs show no errors

### Security
- [ ] Unauthorized access blocked
- [ ] Can only update own records
- [ ] Guest mode enforced
- [ ] Agora tokens secure

---

## 🐛 Common Test Failures

### "Permission denied"
- **Fix:** Deploy security rules again
- **Check:** Firebase Console → Firestore → Rules

### "Index not found"
- **Fix:** Deploy indexes and wait 2-5 minutes
- **Check:** Firebase Console → Firestore → Indexes

### Audio not working
- **Fix:** Check browser microphone permissions
- **Check:** Agora credentials in code
- **Check:** Role (listeners can't speak)

### Timer not working
- **Fix:** Check Cloud Function logs
- **Check:** Ensure `processSpeakerTimers` is deployed
- **Check:** Verify timer collection exists

---

## 📝 Test Report Template

After testing, fill out this report:

```
DUNELI Test Report
Date: ___________
Tester: ___________

✅ PASSED | ❌ FAILED | ⚠️ PARTIAL

Authentication:
  Google Sign-in: ___
  Phone OTP: ___
  Guest Mode: ___

Discussion:
  Create Topic: ___
  Start Discussion: ___
  Join Meeting: ___

Queue:
  Raise Hand: ___
  Queue Order: ___
  Speaker Timer: ___

Audio:
  Join Channel: ___
  Mic Control: ___
  Audio Quality: ___

Reactions:
  Add Reaction: ___
  Rate Limiting: ___
  Real-time Sync: ___

Functions:
  Token Generation: ___
  Timer Function: ___
  Cleanup Functions: ___

Security:
  Rules Enforced: ___
  Unauthorized Blocked: ___

Notes:
___________________________
___________________________
```

---

**Happy testing! 🧪**
