// agoraService.ts — Token from Duneli backend (no Firebase)
import {
  createAgoraClient,
  createMicrophoneTrack,
  AgoraClient,
  MicrophoneTrack,
  AGORA_APP_ID,
} from '../lib/agora';

let agoraClient: AgoraClient | null = null;
let localAudioTrack: MicrophoneTrack | null = null;

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// ── Helper: Supabase UUID → consistent numeric Agora UID ─────
export const toAgoraUid = (userId: string): number => {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash) + userId.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % 100000;
};

// ── Get token from Duneli backend ────────────────────────────
export const getAgoraToken = async (
  channelName: string,
  userId: string,
  role: 'listener' | 'speaker' | 'debater'
): Promise<string | null> => {
  try {
    const res = await fetch(`${BACKEND_URL}/api/agora/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channelName, userId: toAgoraUid(userId), role }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const msg = (err as any).error || (err as any).message || res.statusText;
      if (res.status === 401) throw new Error('You must be signed in to join audio');
      if (res.status === 403) throw new Error('You do not have permission to join this discussion');
      if (res.status === 404) throw new Error('Discussion not found or not active');
      if (res.status === 500) throw new Error('Audio server error — AGORA_APP_CERTIFICATE not set on server.');
      throw new Error(msg || 'Failed to generate audio token. Please try again.');
    }

    const data = await res.json();
    return data.token || null;
  } catch (error: any) {
    console.error('Error getting Agora token:', error);
    throw error;
  }
};

// ── Join Agora channel ────────────────────────────────────────
export const joinAgoraChannel = async (
  channelName: string,
  userId: string,
  role: 'listener' | 'speaker' | 'debater'
): Promise<AgoraClient> => {
  try {
    const token     = await getAgoraToken(channelName, userId, role);
    const numericUid = toAgoraUid(userId);

    if (!agoraClient) {
      agoraClient = createAgoraClient();

      agoraClient.on('user-published', async (user, mediaType) => {
        await agoraClient?.subscribe(user, mediaType);
        if (mediaType === 'audio') user.audioTrack?.play();
      });
      agoraClient.on('user-unpublished', (user, mediaType) => {
        if (mediaType === 'audio') user.audioTrack?.stop();
      });
      agoraClient.on('connection-state-change', (cur, prev, reason) => {
        console.log(`Agora: ${prev} → ${cur} (${reason})`);
      });
      agoraClient.on('exception', (event) => {
        console.error('Agora exception:', event);
      });
    }

    await agoraClient.join(AGORA_APP_ID, channelName, token || null, numericUid);

    // Speakers & debaters get mic (muted by default)
    if (role === 'speaker' || role === 'debater') {
      localAudioTrack = await createMicrophoneTrack();
      await agoraClient.publish([localAudioTrack]);
      localAudioTrack.setEnabled(false);
    }

    return agoraClient;
  } catch (error) {
    console.error('Error joining Agora channel:', error);
    if (agoraClient) { try { await agoraClient.leave(); } catch { } agoraClient = null; }
    if (localAudioTrack) { localAudioTrack.close(); localAudioTrack = null; }
    throw error;
  }
};

// ── Leave Agora channel ───────────────────────────────────────
export const leaveAgoraChannel = async (): Promise<void> => {
  try {
    if (localAudioTrack) { localAudioTrack.stop(); localAudioTrack.close(); localAudioTrack = null; }
    if (agoraClient)     { await agoraClient.leave(); agoraClient.removeAllListeners(); agoraClient = null; }
  } catch (error) {
    localAudioTrack = null; agoraClient = null;
    console.error('Error leaving Agora channel:', error);
  }
};

// ── Mic toggle ────────────────────────────────────────────────
export const toggleMicrophone = async (enabled: boolean): Promise<void> => {
  if (!localAudioTrack) throw new Error('Microphone not available. Are you a Speaker or Debater?');
  await localAudioTrack.setEnabled(enabled);
};

// ── Getters ───────────────────────────────────────────────────
export const isMicrophoneEnabled = (): boolean => localAudioTrack?.enabled || false;
export const getAgoraClient      = (): AgoraClient | null => agoraClient;
export const getLocalAudioTrack  = (): MicrophoneTrack | null => localAudioTrack;

// ── Force cleanup ─────────────────────────────────────────────
export const forceCleanupAgora = async (): Promise<void> => {
  try {
    if (localAudioTrack) { try { localAudioTrack.stop(); localAudioTrack.close(); } catch { } localAudioTrack = null; }
    if (agoraClient)     { try { await agoraClient.leave(); agoraClient.removeAllListeners(); } catch { } agoraClient = null; }
  } catch (error) {
    console.error('Error in force cleanup:', error);
  }
};
