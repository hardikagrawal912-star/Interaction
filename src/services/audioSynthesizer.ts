/**
 * Procedural Web Audio API sound generator.
 * Works 100% offline without external audio files.
 */

class AudioSynthesizer {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private cricketTimer: number | null = null;
  private isAmbienceRunning: boolean = false;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.isAmbienceRunning) {
      this.stopCricketAmbience();
    } else if (!muted && !this.isAmbienceRunning) {
      this.startCricketAmbience();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Gentle clock tick sound for blackout transition
   */
  public playSoftTick() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.05);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  /**
   * Celestial chime sound when a star is selected
   */
  public playStarChime() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C Major arpeggio harmonics
      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.04);

        const startTime = ctx.currentTime + idx * 0.04;
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.06, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 1.3);
      });
    } catch {
      // Ignore
    }
  }

  /**
   * Procedural cricket chirp generator for Andhera Mode
   */
  private triggerSingleChirp() {
    if (this.isMuted || !this.isAmbienceRunning) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const chirpCount = Math.floor(Math.random() * 3) + 2; // 2 to 4 micro pulses
      const baseFreq = 4600 + (Math.random() * 400 - 200);

      for (let i = 0; i < chirpCount; i++) {
        const startTime = ctx.currentTime + i * 0.035;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(baseFreq, startTime);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(baseFreq, startTime);
        filter.Q.setValueAtTime(8, startTime);

        // Very soft, quiet atmospheric level (ambient background)
        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.linearRampToValueAtTime(0.015, startTime + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.028);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.03);
      }
    } catch {
      // Audio context error
    }
  }

  public startCricketAmbience() {
    if (this.isAmbienceRunning || this.isMuted) return;
    this.isAmbienceRunning = true;
    const scheduleNext = () => {
      if (!this.isAmbienceRunning) return;
      this.triggerSingleChirp();
      // Random gap between cricket chirps (800ms to 2400ms)
      const nextDelay = 700 + Math.random() * 1500;
      this.cricketTimer = window.setTimeout(scheduleNext, nextDelay);
    };
    scheduleNext();
  }

  public stopCricketAmbience() {
    this.isAmbienceRunning = false;
    if (this.cricketTimer) {
      clearTimeout(this.cricketTimer);
      this.cricketTimer = null;
    }
  }
}

export const audioSynth = new AudioSynthesizer();
