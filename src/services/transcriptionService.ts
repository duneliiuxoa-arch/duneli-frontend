// src/services/transcriptionService.ts
// Real-time audio transcription using Deepgram WebSocket API
// Speaker/Debater ka mic audio → text → backend mein save

const DEEPGRAM_API_KEY = import.meta.env.VITE_DEEPGRAM_API_KEY || '';
const BACKEND_URL = 'http://localhost:3000';

interface TranscriptSegment {
  speaker: string;
  text: string;
  timestamp: number;
  isFinal: boolean;
}

class TranscriptionService {
  private socket: WebSocket | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private meetingId: string = '';
  private userId: string = '';
  private onTranscript: ((segment: TranscriptSegment) => void) | null = null;
  private isRunning = false;
  private fullTranscript: TranscriptSegment[] = [];

  // ── Start transcription ─────────────────────────────────────
  async start(
    meetingId: string,
    userId: string,
    anonymousId: string,
    onTranscript: (segment: TranscriptSegment) => void
  ): Promise<void> {
    if (this.isRunning) return;

    this.meetingId   = meetingId;
    this.userId      = userId;
    this.onTranscript = onTranscript;
    this.fullTranscript = [];

    try {
      // 1. Mic access lo
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      // 2. Deepgram WebSocket connect karo
      const dgUrl = `wss://api.deepgram.com/v1/listen?` +
        `model=nova-2&` +
        `language=hi-en&` +        // Hindi + English (Hinglish support)
        `punctuate=true&` +
        `interim_results=true&` +
        `endpointing=500&` +
        `encoding=linear16&` +
        `sample_rate=16000`;

      this.socket = new WebSocket(dgUrl, ['token', DEEPGRAM_API_KEY]);

      this.socket.onopen = () => {
        console.log('[transcription] Deepgram connected ✅');
        this.startRecording(anonymousId);
      };

      this.socket.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        const transcript = data.channel?.alternatives?.[0]?.transcript;
        const isFinal = data.is_final;

        if (transcript && transcript.trim()) {
          const segment: TranscriptSegment = {
            speaker:   anonymousId,
            text:      transcript.trim(),
            timestamp: Date.now(),
            isFinal,
          };

          // Callback to UI
          if (this.onTranscript) this.onTranscript(segment);

          // Final segments backend mein save karo
          if (isFinal) {
            this.fullTranscript.push(segment);
            await this.saveToBackend(segment);
          }
        }
      };

      this.socket.onerror = (err) => {
        console.error('[transcription] Deepgram error:', err);
      };

      this.socket.onclose = () => {
        console.log('[transcription] Deepgram disconnected');
        this.isRunning = false;
      };

      this.isRunning = true;
    } catch (err) {
      console.error('[transcription] Failed to start:', err);
      throw err;
    }
  }

  // ── Start MediaRecorder → send audio chunks to Deepgram ────
  private startRecording(anonymousId: string): void {
    if (!this.stream || !this.socket) return;

    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : 'audio/webm';

    this.mediaRecorder = new MediaRecorder(this.stream, { mimeType });

    this.mediaRecorder.ondataavailable = (event) => {
      if (
        event.data.size > 0 &&
        this.socket?.readyState === WebSocket.OPEN
      ) {
        this.socket.send(event.data);
      }
    };

    // 250ms chunks = low latency
    this.mediaRecorder.start(250);
    console.log(`[transcription] Recording started for ${anonymousId}`);
  }

  // ── Save transcript segment to backend ─────────────────────
  private async saveToBackend(segment: TranscriptSegment): Promise<void> {
    try {
      await fetch(`${BACKEND_URL}/api/discussions/transcript`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meetingId: this.meetingId,
          userId:    this.userId,
          speaker:   segment.speaker,
          text:      segment.text,
          timestamp: segment.timestamp,
        }),
      });
    } catch (err) {
      console.error('[transcription] Save failed:', err);
    }
  }

  // ── Stop transcription ──────────────────────────────────────
  async stop(): Promise<string> {
    this.isRunning = false;

    if (this.mediaRecorder?.state !== 'inactive') {
      this.mediaRecorder?.stop();
    }

    if (this.socket?.readyState === WebSocket.OPEN) {
      // Tell Deepgram we're done
      this.socket.send(JSON.stringify({ type: 'CloseStream' }));
      this.socket.close();
    }

    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
    }

    // Return full transcript as text
    const fullText = this.fullTranscript
      .map(s => `[${s.speaker}]: ${s.text}`)
      .join('\n');

    console.log(`[transcription] Stopped. Total segments: ${this.fullTranscript.length}`);
    return fullText;
  }

  getIsRunning(): boolean { return this.isRunning; }
  getTranscript(): TranscriptSegment[] { return this.fullTranscript; }
}

// Singleton
export const transcriptionService = new TranscriptionService();
export type { TranscriptSegment };
