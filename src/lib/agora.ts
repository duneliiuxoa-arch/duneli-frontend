// Agora SDK Configuration
import AgoraRTC, {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  IMicrophoneAudioTrack,
} from 'agora-rtc-sdk-ng';

// Agora App Credentials (from spec)
export const AGORA_APP_ID = import.meta.env.VITE_AGORA_APP_ID || 'e582fb72e35e456b93f8d2431bd0ac24';

// Initialize Agora client
export const createAgoraClient = (): IAgoraRTCClient => {
  const client = AgoraRTC.createClient({
    mode: 'rtc',
    codec: 'vp8',
  });

  return client;
};

// Create microphone audio track
export const createMicrophoneTrack = async (): Promise<IMicrophoneAudioTrack> => {
  const microphoneTrack = await AgoraRTC.createMicrophoneAudioTrack({
    encoderConfig: 'music_standard',
  });
  return microphoneTrack;
};

// Types for Agora
export type AgoraClient = IAgoraRTCClient;
export type AgoraRemoteUser = IAgoraRTCRemoteUser;
export type MicrophoneTrack = IMicrophoneAudioTrack;

export default AgoraRTC;
