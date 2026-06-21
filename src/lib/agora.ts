// Agora SDK Configuration
import AgoraRTC, {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  IMicrophoneAudioTrack,
} from 'agora-rtc-sdk-ng';

// Agora App Credentials (from spec)
export const AGORA_APP_ID = '649581f9f2664ca5b6e54ed70bc371b5';

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
