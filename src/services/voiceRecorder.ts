/**
 * Voice recording utility supporting MediaRecorder with fallback mimeTypes
 * and graceful microphone permission handling.
 */

export interface RecordingResult {
  blob: Blob;
  duration: number; // in seconds
  mimeType: string;
}

export class VoiceRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private startTime: number = 0;
  private timerInterval: number | null = null;
  private analyser: AnalyserNode | null = null;
  private audioCtx: AudioContext | null = null;
  private animationFrameId: number | null = null;

  public static getSupportedMimeType(): string {
    if (typeof MediaRecorder === 'undefined') return '';
    const candidates = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/aac',
      'audio/ogg;codecs=opus',
    ];
    for (const type of candidates) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return '';
  }

  public async startRecording(
    onTick: (elapsedSeconds: number) => void,
    onMaxReached: () => void,
    onWaveformUpdate?: (amplitude: number) => void
  ): Promise<void> {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Aapke browser mein audio recording support uplabdh nahi hai.');
    }

    this.audioChunks = [];
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err: unknown) {
      const error = err as { name?: string; message?: string };
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        throw new Error('Mic ki permission nahi mili. Aap text kahani bhi likh sakte hain!');
      }
      throw new Error('Mic connect nahi ho paya: ' + (error.message || 'Error'));
    }

    const mimeType = VoiceRecorder.getSupportedMimeType();
    const options: MediaRecorderOptions = mimeType ? { mimeType } : {};

    try {
      this.mediaRecorder = new MediaRecorder(this.stream, options);
    } catch {
      this.mediaRecorder = new MediaRecorder(this.stream);
    }

    // Set up AnalyserNode for live visual waveform
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.audioCtx = new AudioCtx();
        const source = this.audioCtx.createMediaStreamSource(this.stream);
        this.analyser = this.audioCtx.createAnalyser();
        this.analyser.fftSize = 64;
        source.connect(this.analyser);

        if (onWaveformUpdate) {
          const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
          const checkVolume = () => {
            if (!this.analyser || !this.mediaRecorder || this.mediaRecorder.state !== 'recording') return;
            this.analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const avg = sum / dataArray.length;
            const normalized = Math.min(1, avg / 128);
            onWaveformUpdate(normalized);
            this.animationFrameId = requestAnimationFrame(checkVolume);
          };
          checkVolume();
        }
      }
    } catch {
      // Analyser fallback
    }

    this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
      if (event.data && event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };

    this.startTime = Date.now();
    this.mediaRecorder.start(250); // Slice every 250ms for reliable chunks

    this.timerInterval = window.setInterval(() => {
      const elapsed = Math.min(30, Math.floor((Date.now() - this.startTime) / 1000));
      onTick(elapsed);
      if (elapsed >= 30) {
        this.stopTimer();
        onMaxReached();
      }
    }, 200);
  }

  private stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  public async stopRecording(): Promise<RecordingResult> {
    this.stopTimer();

    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        return reject(new Error('Recorder chalu nahi hai'));
      }

      this.mediaRecorder.onstop = () => {
        const mimeType = this.mediaRecorder?.mimeType || VoiceRecorder.getSupportedMimeType() || 'audio/webm';
        const blob = new Blob(this.audioChunks, { type: mimeType });
        const duration = Math.min(30, Math.max(1, Math.round((Date.now() - this.startTime) / 1000)));

        this.cleanup();
        resolve({ blob, duration, mimeType });
      };

      try {
        if (this.mediaRecorder.state === 'recording') {
          this.mediaRecorder.stop();
        }
      } catch (e) {
        this.cleanup();
        reject(e);
      }
    });
  }

  public cancelRecording() {
    this.stopTimer();
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      try {
        this.mediaRecorder.stop();
      } catch {
        // Ignore
      }
    }
    this.cleanup();
  }

  private cleanup() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    if (this.audioCtx) {
      this.audioCtx.close().catch(() => {});
      this.audioCtx = null;
    }
    this.analyser = null;
    this.mediaRecorder = null;
    this.audioChunks = [];
  }
}
