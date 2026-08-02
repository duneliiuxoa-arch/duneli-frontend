// Agora Service - STRICT IMPLEMENTATION (NO CERTIFICATE IN FRONTEND)
import { httpsCallable, HttpsCallableResult } from 'firebase/functions';
import { functions } from '../lib/firebase';
import {
  createAgoraClient,
  createMicrophoneTrack,
  AgoraClient,
  MicrophoneTrack,
  AGORA_APP_ID,
} from '../lib/agora';

let agoraClient: AgoraClient | null = null;
let localAudioTrack: MicrophoneTrack | null = null;

interface AgoraTokenResponse {
  token: string;
  channelName: string;
}

// Get Agora token from Cloud Function (SECURE - SERVER SIDE ONLY)
export const getAgoraToken = async (
  channelName: string,
  userId: string,
  role: 'listener' | 'speaker' | 'debater'
): Promise<string> => {
  try {
    const generateToken = httpsCallable<
      { channelName: string; userId: string; role: string },
      { token: string }
    >(functions, 'generateAgoraToken');

    const result: HttpsCallableResult<{ token: string }> = await generateToken({
      channelName,
      userId,
      role,
    });

    if (!result.data || !result.data.token) {
      throw new Error('Invalid token response from server');
    }

    return result.data.token;
  } catch (error: any) {
    console.error('Error getting Agora token:', error);
    
    // Handle specific Firebase Function errors
    if (error.code === 'unauthenticated') {
      throw new Error('You must be signed in to join audio');
    } else if (error.code === 'permission-denied') {
      throw new Error('You do not have permission to join this discussion');
    } else if (error.code === 'failed-precondition') {
      throw new Error('Discussion not found or not active');
    } else {
      throw new Error('Failed to generate audio token. Please try again.');
    }
  }
};

// Join Agora channel with STRICT token validation
export const joinAgoraChannel = async (
  channelName: string,
  userId: string,
  role: 'listener' | 'speaker' | 'debater'
): Promise<AgoraClient> => {
  try {
    // CRITICAL: Get token from backend ONLY (never use certificate in frontend)
    const token = await getAgoraToken(channelName, userId, role);

    // Create Agora client if not exists
    if (!agoraClient) {
      agoraClient = createAgoraClient();

      // Set up event listeners
      agoraClient.on('user-published', async (user, mediaType) => {
        await agoraClient?.subscribe(user, mediaType);
        if (mediaType === 'audio') {
          user.audioTrack?.play();
        }
      });

      agoraClient.on('user-unpublished', (user, mediaType) => {
        if (mediaType === 'audio') {
          user.audioTrack?.stop();
        }
      });

      agoraClient.on('user-left', (user) => {
        console.log('User left:', user.uid);
      });

      agoraClient.on('connection-state-change', (curState, prevState, reason) => {
        console.log(`Agora connection state: ${prevState} -> ${curState}, reason: ${reason}`);
      });

      agoraClient.on('exception', (event) => {
        console.error('Agora exception:', event);
      });
    }

    // Join channel with server-generated token
    await agoraClient.join(AGORA_APP_ID, channelName, token, userId);

    // Create and publish audio track for speakers and debaters ONLY
    if (role === 'speaker' || role === 'debater') {
      localAudioTrack = await createMicrophoneTrack();
      await agoraClient.publish([localAudioTrack]);

      // Mute by default - user must explicitly unmute
      localAudioTrack.setEnabled(false);
    }

    return agoraClient;
  } catch (error) {
    console.error('Error joining Agora channel:', error);
    
    // Clean up on error
    if (agoraClient) {
      try {
        await agoraClient.leave();
      } catch (e) {
        // Ignore leave errors
      }
      agoraClient = null;
    }
    
    if (localAudioTrack) {
      localAudioTrack.close();
      localAudioTrack = null;
    }
    
    throw error;
  }
};

// Leave Agora channel - CLEAN RESOURCE MANAGEMENT
export const leaveAgoraChannel = async (): Promise<void> => {
  try {
    // Stop and close local audio track
    if (localAudioTrack) {
      localAudioTrack.stop();
      localAudioTrack.close();
      localAudioTrack = null;
    }

    // Leave channel
    if (agoraClient) {
      await agoraClient.leave();
      agoraClient.removeAllListeners();
      agoraClient = null;
    }
  } catch (error) {
    console.error('Error leaving Agora channel:', error);
    
    // Force cleanup even on error
    localAudioTrack = null;
    agoraClient = null;
    
    throw error;
  }
};

// Mute/Unmute microphone - ROLE-BASED ENFORCEMENT
export const toggleMicrophone = async (enabled: boolean): Promise<void> => {
  try {
    if (!localAudioTrack) {
      throw new Error('Microphone not available. Are you a Speaker or Debater?');
    }

    await localAudioTrack.setEnabled(enabled);
  } catch (error) {
    console.error('Error toggling microphone:', error);
    throw error;
  }
};

// Get microphone state
export const isMicrophoneEnabled = (): boolean => {
  return localAudioTrack?.enabled || false;
};

// Get Agora client instance
export const getAgoraClient = (): AgoraClient | null => {
  return agoraClient;
};

// Get local audio track
export const getLocalAudioTrack = (): MicrophoneTrack | null => {
  return localAudioTrack;
};

// Force cleanup (use on app unmount or user logout)
export const forceCleanupAgora = async (): Promise<void> => {
  try {
    if (localAudioTrack) {
      try {
        localAudioTrack.stop();
        localAudioTrack.close();
      } catch (e) {
        // Ignore
      }
      localAudioTrack = null;
    }

    if (agoraClient) {
      try {
        await agoraClient.leave();
        agoraClient.removeAllListeners();
      } catch (e) {
        // Ignore
      }
      agoraClient = null;
    }
  } catch (error) {
    console.error('Error in force cleanup:', error);
  }
};
