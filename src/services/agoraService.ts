// Agora Service - STRICT IMPLEMENTATION (NO CERTIFICATE IN FRONTEND)
// Token fetched from Duneli backend API (replaces Firebase Cloud Functions)
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

// Get Agora token from Duneli backend API (SECURE - SERVER SIDE ONLY)
const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const getAgoraToken = async (
  channelName: string,
  userId: string,
  role: 'listener' | 'speaker' | 'debater'
): Promise<string | null> => {
  try {
    const res = await fetch(`${BACKEND_URL}/api/agora/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channelName, userId, role }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const msg = (err as any).message || res.statusText;
      if (res.status === 401) throw new Error('You must be signed in to join audio');
      if (res.status === 403) throw new Error('You do not have permission to join this discussion');
      if (res.status === 404) throw new Error('Discussion not found or not active');
      throw new Error(msg || 'Failed to generate audio token. Please try again.');
    }

    const data = await res.json();
    // null token = App ID only mode (no certificate) — allowed for testing
    return data.token ?? null;
  } catch (error: any) {
    console.error('Error getting Agora token:', error);
    throw error;
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

    // Join channel — null token = App ID only mode (testing)
    await agoraClient.join(AGORA_APP_ID, channelName, token || null, userId);

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
