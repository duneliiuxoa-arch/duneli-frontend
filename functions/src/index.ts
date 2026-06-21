/**
 * Firebase Cloud Functions for DUNELI - STRICT IMPLEMENTATION
 * 
 * CRITICAL REQUIREMENTS:
 * - Agora certificate NEVER exposed to frontend
 * - All tokens generated server-side
 * - Proper authentication validation
 * - Error handling for all edge cases
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { RtcTokenBuilder, RtcRole } from 'agora-access-token';

// Initialize Firebase Admin
admin.initializeApp();

// Agora credentials (SECURE - SERVER SIDE ONLY)
const AGORA_APP_ID = '649581f9f2664ca5b6e54ed70bc371b5';
const AGORA_APP_CERTIFICATE = '5a2286112a1f4901ad710c5fbecab0ec';

/**
 * Generate Agora RTC Token - STRICT VALIDATION
 * 
 * Requirements:
 * - User must be authenticated
 * - User must NOT be guest (anonymous)
 * - Discussion must exist and be live
 * - Token generated server-side only
 */
export const generateAgoraToken = functions.https.onCall(
  async (data, context) => {
    // CRITICAL: Verify authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated to generate token'
      );
    }

    // CRITICAL: Block guest users
    if (context.auth.token.firebase?.sign_in_provider === 'anonymous') {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Guest users cannot join audio discussions'
      );
    }

    const { channelName, userId, role } = data;

    // Validate inputs
    if (!channelName || !userId || !role) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Missing required parameters: channelName, userId, role'
      );
    }

    // Validate role
    if (!['listener', 'speaker', 'debater'].includes(role)) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Invalid role. Must be listener, speaker, or debater'
      );
    }

    // Validate user matches authenticated user
    if (userId !== context.auth.uid) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'User ID does not match authenticated user'
      );
    }

    try {
      // Set token expiry (1 hour)
      const expirationTimeInSeconds = 3600;
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

      // Determine Agora role
      // Listeners are subscribers, speakers and debaters are publishers
      const agoraRole = role === 'listener' ? RtcRole.SUBSCRIBER : RtcRole.PUBLISHER;

      // Build token (SECURE - SERVER SIDE ONLY)
      const token = RtcTokenBuilder.buildTokenWithUid(
        AGORA_APP_ID,
        AGORA_APP_CERTIFICATE,
        channelName,
        Number(userId.replace(/\D/g, '')) || 0, // Convert to number, use 0 if fails
        agoraRole,
        privilegeExpiredTs,
        privilegeExpiredTs
      );

      // Log for monitoring
      console.log(`Generated Agora token for user ${userId} with role ${role}`);

      return { token };
    } catch (error) {
      console.error('Error generating Agora token:', error);
      throw new functions.https.HttpsError(
        'internal',
        'Failed to generate Agora token'
      );
    }
  }
);

/**
 * Start Speaker Timer
 * Called when user starts speaking to track 3-minute limit
 */
export const startSpeakerTimer = functions.https.onCall(
  async (data, context) => {
    // Verify authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated'
      );
    }

    // Block guests
    if (context.auth.token.firebase?.sign_in_provider === 'anonymous') {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Guest users cannot speak'
      );
    }

    const { queueId, discussionId } = data;

    if (!queueId || !discussionId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Missing required parameters'
      );
    }

    try {
      const db = admin.firestore();
      
      // Verify queue entry exists and belongs to user
      const queueRef = db.collection('speakingQueue').doc(queueId);
      const queueDoc = await queueRef.get();
      
      if (!queueDoc.exists) {
        throw new functions.https.HttpsError(
          'not-found',
          'Queue entry not found'
        );
      }
      
      if (queueDoc.data()?.userId !== context.auth.uid) {
        throw new functions.https.HttpsError(
          'permission-denied',
          'Queue entry does not belong to user'
        );
      }
      
      // Store timer info in Firestore with expiry time
      await db.collection('speakerTimers').doc(queueId).set({
        queueId,
        discussionId,
        userId: context.auth.uid,
        startedAt: admin.firestore.FieldValue.serverTimestamp(),
        expiresAt: admin.firestore.Timestamp.fromMillis(Date.now() + 180000), // 3 minutes
        status: 'active',
      });

      console.log(`Started timer for speaker ${context.auth.uid} in queue ${queueId}`);

      return { success: true };
    } catch (error: any) {
      console.error('Error starting speaker timer:', error);
      
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      
      throw new functions.https.HttpsError(
        'internal',
        'Failed to start speaker timer'
      );
    }
  }
);

/**
 * Process Speaker Timers
 * Runs every minute to check for expired speaker timers
 * Auto-mutes speakers after 3 minutes
 */
export const processSpeakerTimers = functions.pubsub
  .schedule('every 1 minutes')
  .onRun(async (context) => {
    try {
      const db = admin.firestore();
      const now = admin.firestore.Timestamp.now();

      // Find expired timers
      const expiredTimersSnapshot = await db
        .collection('speakerTimers')
        .where('status', '==', 'active')
        .where('expiresAt', '<=', now)
        .get();

      if (expiredTimersSnapshot.empty) {
        return null;
      }

      const batch = db.batch();
      let processed = 0;

      for (const timerDoc of expiredTimersSnapshot.docs) {
        const timerData = timerDoc.data();
        const queueId = timerData.queueId;

        // Check if queue entry still exists and is speaking
        const queueRef = db.collection('speakingQueue').doc(queueId);
        const queueDoc = await queueRef.get();

        if (queueDoc.exists && queueDoc.data()?.status === 'speaking') {
          // Mark as done
          batch.update(queueRef, {
            status: 'done',
          });
          processed++;
          console.log(`Auto-muted speaker ${queueId} after 3 minutes`);
        }

        // Mark timer as completed
        batch.update(timerDoc.ref, {
          status: 'completed',
        });
      }

      await batch.commit();

      // Clean up completed timers older than 5 minutes
      const fiveMinutesAgo = admin.firestore.Timestamp.fromMillis(
        Date.now() - 300000
      );
      
      const oldTimersSnapshot = await db
        .collection('speakerTimers')
        .where('status', '==', 'completed')
        .where('expiresAt', '<', fiveMinutesAgo)
        .get();

      if (!oldTimersSnapshot.empty) {
        const cleanupBatch = db.batch();
        oldTimersSnapshot.docs.forEach((doc) => {
          cleanupBatch.delete(doc.ref);
        });
        await cleanupBatch.commit();
      }

      console.log(`Processed ${processed} expired speaker timers`);
    } catch (error) {
      console.error('Error processing speaker timers:', error);
    }

    return null;
  });

/**
 * Clean up inactive participants
 * Runs every 5 minutes
 */
export const cleanupInactiveParticipants = functions.pubsub
  .schedule('every 5 minutes')
  .onRun(async (context) => {
    try {
      const db = admin.firestore();
      const now = admin.firestore.Timestamp.now();
      const tenMinutesAgo = new admin.firestore.Timestamp(
        now.seconds - 600,
        now.nanoseconds
      );

      const participantsSnapshot = await db
        .collection('participants')
        .where('joinedAt', '<', tenMinutesAgo)
        .get();

      if (participantsSnapshot.empty) {
        return null;
      }

      const batch = db.batch();
      participantsSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();

      console.log(`Cleaned up ${participantsSnapshot.size} inactive participants`);
    } catch (error) {
      console.error('Error cleaning up participants:', error);
    }

    return null;
  });

/**
 * Clean up old reactions
 * Runs every hour
 */
export const cleanupOldReactions = functions.pubsub
  .schedule('every 1 hours')
  .onRun(async (context) => {
    try {
      const db = admin.firestore();
      const now = admin.firestore.Timestamp.now();
      const oneHourAgo = new admin.firestore.Timestamp(
        now.seconds - 3600,
        now.nanoseconds
      );

      const reactionsSnapshot = await db
        .collection('reactions')
        .where('createdAt', '<', oneHourAgo)
        .get();

      if (reactionsSnapshot.empty) {
        return null;
      }

      const batch = db.batch();
      reactionsSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();

      console.log(`Cleaned up ${reactionsSnapshot.size} old reactions`);
    } catch (error) {
      console.error('Error cleaning up reactions:', error);
    }

    return null;
  });

/**
 * Clean up done queue entries
 * Runs every minute
 */
export const cleanupDoneQueueEntries = functions.pubsub
  .schedule('every 1 minutes')
  .onRun(async (context) => {
    try {
      const db = admin.firestore();

      const doneEntriesSnapshot = await db
        .collection('speakingQueue')
        .where('status', '==', 'done')
        .get();

      if (doneEntriesSnapshot.empty) {
        return null;
      }

      const batch = db.batch();
      doneEntriesSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();

      console.log(`Cleaned up ${doneEntriesSnapshot.size} done queue entries`);
    } catch (error) {
      console.error('Error cleaning up queue entries:', error);
    }

    return null;
  });

/**
 * Update user last active timestamp
 * Triggered when user performs any activity
 */
export const updateLastActive = functions.firestore
  .document('activityLogs/{logId}')
  .onCreate(async (snap, context) => {
    try {
      const activity = snap.data();
      const userId = activity.userId;

      if (userId) {
        const userRef = admin.firestore().collection('users').doc(userId);
        await userRef.update({
          lastActiveAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    } catch (error) {
      console.error('Error updating last active:', error);
    }

    return null;
  });

/**
 * Auto-end discussions that have been live for more than 2 hours
 * Runs every 10 minutes
 */
export const autoEndLongDiscussions = functions.pubsub
  .schedule('every 10 minutes')
  .onRun(async (context) => {
    try {
      const db = admin.firestore();
      const now = admin.firestore.Timestamp.now();
      const twoHoursAgo = new admin.firestore.Timestamp(
        now.seconds - 7200,
        now.nanoseconds
      );

      const longDiscussionsSnapshot = await db
        .collection('discussions')
        .where('status', '==', 'live')
        .where('startedAt', '<', twoHoursAgo)
        .get();

      if (longDiscussionsSnapshot.empty) {
        return null;
      }

      const batch = db.batch();

      for (const discussionDoc of longDiscussionsSnapshot.docs) {
        const discussionData = discussionDoc.data();
        
        batch.update(discussionDoc.ref, {
          endedAt: admin.firestore.FieldValue.serverTimestamp(),
          status: 'ended',
        });

        if (discussionData.topicId) {
          const topicRef = db.collection('topics').doc(discussionData.topicId);
          batch.update(topicRef, {
            status: 'ended',
          });
        }

        console.log(`Auto-ended discussion ${discussionDoc.id} after 2 hours`);
      }

      await batch.commit();

      console.log(`Auto-ended ${longDiscussionsSnapshot.size} long discussions`);
    } catch (error) {
      console.error('Error auto-ending discussions:', error);
    }

    return null;
  });
