/**
 * Example: Integrating Firebase with MeetingPage Component
 * 
 * This shows how to connect your existing MeetingPage UI with:
 * - Agora audio
 * - Real-time speaking queue
 * - Participant count
 * - Reactions
 * - Speaker timer
 */

import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { useSpeakingQueue, useCurrentSpeaker } from '../hooks/useQueue';
import { useParticipantCount } from '../hooks/useDiscussion';
import { useReactionCounts } from '../hooks/useReactions';
import { useSpeakerTimer } from '../hooks/useTimer';
import {
  joinDiscussion,
  leaveDiscussion,
  getDiscussion,
} from '../services/discussionService';
import {
  raiseHand,
  lowerHand,
  markAsSpeaking,
  markAsDone,
} from '../services/queueService';
import { addReaction } from '../services/reactionService';
import {
  joinAgoraChannel,
  leaveAgoraChannel,
  toggleMicrophone,
  isMicrophoneEnabled,
} from '../services/agoraService';

interface MeetingPageProps {
  discussionId: string;
  onLeave: () => void;
}

export const IntegratedMeetingPage: React.FC<MeetingPageProps> = ({
  discussionId,
  onLeave,
}) => {
  const { user, anonymousId, isAuthenticated } = useAuthContext();
  const [role, setRole] = useState<'listener' | 'speaker' | 'debater'>('listener');
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [queueId, setQueueId] = useState<string | null>(null);
  const [micEnabled, setMicEnabled] = useState(false);
  const [channelName, setChannelName] = useState<string | null>(null);

  // Real-time data hooks
  const { queue } = useSpeakingQueue(discussionId);
  const currentSpeaker = useCurrentSpeaker(discussionId);
  const participantCount = useParticipantCount(discussionId);
  const reactionCounts = useReactionCounts(discussionId);

  // Speaker timer (only active when user is speaking)
  const isSpeaking = currentSpeaker?.userId === user?.uid;
  const speakerTimer = useSpeakerTimer(isSpeaking && role === 'speaker', 180, async () => {
    // Auto-mute when timer expires
    if (queueId) {
      await markAsDone(queueId);
      await toggleMicrophone(false);
      setMicEnabled(false);
      setQueueId(null);
    }
  });

  // Join discussion on mount
  useEffect(() => {
    if (!user || !isAuthenticated) return;

    const joinMeeting = async () => {
      try {
        // Get discussion details
        const discussion = await getDiscussion(discussionId);
        if (!discussion) {
          console.error('Discussion not found');
          return;
        }

        setChannelName(discussion.agoraChannelName);

        // Join as participant in Firestore
        const partId = await joinDiscussion(discussionId, user.uid, role);
        setParticipantId(partId);

        // Join Agora channel
        await joinAgoraChannel(discussion.agoraChannelName, user.uid, role);
      } catch (error) {
        console.error('Error joining meeting:', error);
      }
    };

    joinMeeting();

    // Cleanup on unmount
    return () => {
      if (participantId && user) {
        leaveDiscussion(participantId, discussionId, user.uid);
        leaveAgoraChannel();
      }
    };
  }, [discussionId, user, isAuthenticated, role]);

  // Handle raising hand
  const handleRaiseHand = async () => {
    if (!user || role === 'listener') return;

    try {
      if (queueId) {
        // Already in queue, lower hand
        await lowerHand(queueId);
        setQueueId(null);
      } else {
        // Raise hand
        const id = await raiseHand(discussionId, user.uid);
        setQueueId(id);
      }
    } catch (error) {
      console.error('Error with queue:', error);
    }
  };

  // Handle when user becomes current speaker
  useEffect(() => {
    if (currentSpeaker?.userId === user?.uid && role === 'speaker') {
      // User is now speaking, enable mic
      toggleMicrophone(true);
      setMicEnabled(true);
    }
  }, [currentSpeaker, user, role]);

  // Handle microphone toggle (debater only)
  const handleMicToggle = async () => {
    if (role !== 'debater') return;

    const newState = !micEnabled;
    await toggleMicrophone(newState);
    setMicEnabled(newState);
  };

  // Handle reactions
  const handleReaction = async (type: 'agree' | 'disagree') => {
    if (!user || !isAuthenticated) return;

    try {
      await addReaction(discussionId, user.uid, type);
    } catch (error: any) {
      // Handle rate limiting
      if (error.message.includes('wait')) {
        alert('Please wait before reacting again');
      }
    }
  };

  // Handle leaving meeting
  const handleLeave = async () => {
    if (participantId && user) {
      await leaveDiscussion(participantId, discussionId, user.uid);
    }
    await leaveAgoraChannel();
    onLeave();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Header */}
      <div className="bg-white rounded-lg p-4 mb-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Discussion Room</h1>
          <p className="text-gray-600">
            {participantCount} participant{participantCount !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={handleLeave}
          className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
        >
          Leave
        </button>
      </div>

      {/* User Info */}
      <div className="bg-white rounded-lg p-4 mb-4">
        <p className="text-sm text-gray-600">You are: <span className="font-bold">{anonymousId}</span></p>
        <p className="text-sm text-gray-600">Role: <span className="font-bold capitalize">{role}</span></p>
      </div>

      {/* Current Speaker */}
      {currentSpeaker && (
        <div className="bg-blue-100 border-2 border-blue-500 rounded-lg p-4 mb-4">
          <p className="text-sm text-blue-800 mb-2">🎙️ Currently Speaking</p>
          <p className="font-bold">User ID: {currentSpeaker.userId}</p>
          {isSpeaking && role === 'speaker' && (
            <p className="text-red-600 font-bold mt-2">
              Time remaining: {speakerTimer.formattedTime}
            </p>
          )}
        </div>
      )}

      {/* Speaking Queue */}
      <div className="bg-white rounded-lg p-4 mb-4">
        <h2 className="font-bold mb-3">Speaking Queue ({queue.length})</h2>
        {queue.length === 0 ? (
          <p className="text-gray-500">No one in queue</p>
        ) : (
          <div className="space-y-2">
            {queue.map((entry, index) => (
              <div
                key={entry.id}
                className={`p-3 rounded ${
                  entry.status === 'speaking'
                    ? 'bg-blue-100 border-blue-500'
                    : 'bg-gray-100'
                }`}
              >
                <p className="font-medium">
                  {index + 1}. User {entry.userId}
                  {entry.userId === user?.uid && ' (You)'}
                </p>
                <p className="text-sm text-gray-600">
                  Status: {entry.status}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg p-4 mb-4">
        <h2 className="font-bold mb-3">Controls</h2>
        <div className="grid grid-cols-2 gap-3">
          {/* Raise Hand (Speaker/Debater only) */}
          {role !== 'listener' && (
            <button
              onClick={handleRaiseHand}
              className={`py-3 rounded-lg font-bold ${
                queueId
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {queueId ? '✋ Lower Hand' : '✋ Raise Hand'}
            </button>
          )}

          {/* Mic Toggle (Debater only) */}
          {role === 'debater' && (
            <button
              onClick={handleMicToggle}
              className={`py-3 rounded-lg font-bold ${
                micEnabled
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
              }`}
            >
              {micEnabled ? '🎤 Mic On' : '🔇 Mic Off'}
            </button>
          )}

          {/* Reactions */}
          <button
            onClick={() => handleReaction('agree')}
            disabled={!isAuthenticated}
            className="bg-green-100 text-green-700 py-3 rounded-lg font-bold hover:bg-green-200 disabled:opacity-50"
          >
            👍 Agree ({reactionCounts.agree})
          </button>

          <button
            onClick={() => handleReaction('disagree')}
            disabled={!isAuthenticated}
            className="bg-red-100 text-red-700 py-3 rounded-lg font-bold hover:bg-red-200 disabled:opacity-50"
          >
            👎 Disagree ({reactionCounts.disagree})
          </button>
        </div>

        {role === 'listener' && (
          <p className="text-sm text-gray-500 mt-3">
            Listeners can only react. To speak, rejoin as Speaker or Debater.
          </p>
        )}
      </div>

      {/* Mic Status */}
      <div className="bg-white rounded-lg p-4">
        <p className="text-sm">
          Microphone: <span className={micEnabled ? 'text-green-600' : 'text-red-600'}>
            {micEnabled ? 'Enabled' : 'Disabled'}
          </span>
        </p>
        {role === 'speaker' && !isSpeaking && (
          <p className="text-sm text-gray-500 mt-1">
            Your mic will auto-enable when it's your turn to speak
          </p>
        )}
      </div>
    </div>
  );
};
