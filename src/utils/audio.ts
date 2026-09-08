/**
 * Synthesizer audio utilities using Web Audio API for timer bells and ambient focus sounds
 */

class SoundEffects {
  private ctx: AudioContext | null = null;
  private ambientNoiseNode: AudioNode | null = null;
  private ambientGainNode: GainNode | null = null;
  private isAmbientPlaying = false;

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

  /**
   * Plays a classy, gentle Tibetan singing bowl / chime for session completion
   */
  public playCompletionBell() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      // Bell fundamental frequencies
      const frequencies = [528, 1056, 1584];
      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        // Soft harmonic envelope
        const initialGain = 0.25 / (idx + 1);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(initialGain, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.0 + idx * 0.5);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 4.0);
      });
    } catch {
      // Audio context might be restricted before user gesture
    }
  }

  /**
   * Plays a crisp, subtle notification tick
   */
  public playTick() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // Ignored
    }
  }

  /**
   * Plays an uplifting success chime (for goal achievements, logging water, completions)
   */
  public playSuccess() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      // Uplifting water / completion notes (C5 -> E5 -> G5)
      const notes = [
        { freq: 523.25, time: 0 },
        { freq: 659.25, time: 0.08 },
        { freq: 783.99, time: 0.16 },
      ];

      notes.forEach(({ freq, time }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + time);

        gain.gain.setValueAtTime(0, now + time);
        gain.gain.linearRampToValueAtTime(0.12, now + time + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + time + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + time);
        osc.stop(now + time + 0.65);
      });
    } catch {
      // Ignored
    }
  }

  /**
   * Toggle pleasant ambient focus noise (soft brown noise / gentle rain simulation)
   */
  public toggleAmbientFocus(play: boolean, volume = 0.08): boolean {
    const ctx = this.getContext();
    if (!ctx) return false;

    if (!play) {
      if (this.ambientGainNode && this.ambientNoiseNode) {
        this.ambientGainNode.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        setTimeout(() => {
          try {
            (this.ambientNoiseNode as unknown as { stop?: () => void })?.stop?.();
            this.ambientNoiseNode?.disconnect();
          } catch {
            // ignore
          }
          this.ambientNoiseNode = null;
          this.ambientGainNode = null;
        }, 500);
      }
      this.isAmbientPlaying = false;
      return false;
    }

    try {
      if (this.ambientNoiseNode) {
        this.toggleAmbientFocus(false);
      }

      // Generate 5 seconds of brown noise in a loop
      const bufferSize = ctx.sampleRate * 5;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5; // Boost perceived volume
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      // Filter to simulate warm library rain / gentle study murmur
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 1.0);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
      this.ambientNoiseNode = noise;
      this.ambientGainNode = gain;
      this.isAmbientPlaying = true;
      return true;
    } catch {
      return false;
    }
  }

  public isAmbientActive(): boolean {
    return this.isAmbientPlaying;
  }
}

export const soundFx = new SoundEffects();
