/**
 * Pure Web Audio API Sound Synthesizer for Handball Arenas
 * Zero-dependency, 100% offline-ready high-volume acoustic alerts and horns.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private masterGain: GainNode | null = null;

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

  private getMaster(ctx: AudioContext): GainNode {
    if (!this.compressor || !this.masterGain) {
      // Dynamic compressor to maximize acoustic loudness and punch without clipping
      this.compressor = ctx.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(-4, ctx.currentTime);
      this.compressor.knee.setValueAtTime(2, ctx.currentTime);
      this.compressor.ratio.setValueAtTime(10, ctx.currentTime);
      this.compressor.attack.setValueAtTime(0.002, ctx.currentTime);
      this.compressor.release.setValueAtTime(0.2, ctx.currentTime);

      this.masterGain = ctx.createGain();
      this.masterGain.gain.setValueAtTime(1.0, ctx.currentTime); // 100% maximum digital level

      this.masterGain.connect(this.compressor);
      this.compressor.connect(ctx.destination);
    }
    return this.masterGain;
  }

  /**
   * Powerful Official Gym Horn / Buzzer (Sirena Palazzetto dello Sport)
   * Multi-oscillator electric acoustic horn: sub-octave, fundamental and detuned harmonics.
   */
  playBuzzer() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const master = this.getMaster(ctx);

      const now = ctx.currentTime;
      const duration = 1.6;

      // Sub fundamental (punch)
      const subOsc = ctx.createOscillator();
      subOsc.type = 'sawtooth';
      subOsc.frequency.setValueAtTime(220, now);

      // Primary horn tone (A4)
      const osc1 = ctx.createOscillator();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(440, now);

      // Detuned horn tone (acoustic chorus & presence)
      const osc2 = ctx.createOscillator();
      osc2.type = 'square';
      osc2.frequency.setValueAtTime(444, now);

      // High harmonic cut-through
      const osc3 = ctx.createOscillator();
      osc3.type = 'sawtooth';
      osc3.frequency.setValueAtTime(880, now);

      const buzzerGain = ctx.createGain();
      buzzerGain.gain.setValueAtTime(0.01, now);
      // Punchy attack
      buzzerGain.gain.linearRampToValueAtTime(0.95, now + 0.04);
      // High volume sustain
      buzzerGain.gain.setValueAtTime(0.95, now + duration - 0.15);
      // Clean tail off
      buzzerGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      subOsc.connect(buzzerGain);
      osc1.connect(buzzerGain);
      osc2.connect(buzzerGain);
      osc3.connect(buzzerGain);
      buzzerGain.connect(master);

      subOsc.start(now);
      osc1.start(now);
      osc2.start(now);
      osc3.start(now);

      subOsc.stop(now + duration);
      osc1.stop(now + duration);
      osc2.stop(now + duration);
      osc3.stop(now + duration);
    } catch {
      // Audio might be blocked by browser gesture policy until user interacts
    }
  }

  /**
   * Authentic Referee Whistle with Trill (Fischio Arbitrale FIGH)
   */
  playWhistle() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const master = this.getMaster(ctx);

      const now = ctx.currentTime;
      const duration = 0.35;

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const whistleGain = ctx.createGain();

      // Dual whistle resonance frequencies
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(2750, now);
      osc1.frequency.linearRampToValueAtTime(2950, now + 0.08);
      osc1.frequency.linearRampToValueAtTime(2650, now + duration);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(3150, now);
      osc2.frequency.linearRampToValueAtTime(3350, now + 0.08);
      osc2.frequency.linearRampToValueAtTime(3050, now + duration);

      // Tremolo / trill LFO to simulate pea inside referee whistle
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(32, now); // 32 Hz trill flutter
      lfoGain.gain.setValueAtTime(120, now);
      lfo.connect(osc1.frequency);
      lfo.connect(osc2.frequency);

      whistleGain.gain.setValueAtTime(0.05, now);
      whistleGain.gain.linearRampToValueAtTime(0.85, now + 0.03);
      whistleGain.gain.setValueAtTime(0.85, now + duration - 0.06);
      whistleGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc1.connect(whistleGain);
      osc2.connect(whistleGain);
      whistleGain.connect(master);

      lfo.start(now);
      osc1.start(now);
      osc2.start(now);

      lfo.stop(now + duration);
      osc1.stop(now + duration);
      osc2.stop(now + duration);
    } catch {}
  }

  /**
   * Goal Celebration Acoustic Ping (Gol Chime ad alto volume)
   */
  playGoalSound() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const master = this.getMaster(ctx);

      const now = ctx.currentTime;

      // Bright energetic 4-tone ascending fanfare (C5, E5, G5, C6)
      const freqs = [523.25, 659.25, 783.99, 1046.5];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();
        const noteStart = now + idx * 0.07;
        const noteDuration = 0.28;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteStart);

        noteGain.gain.setValueAtTime(0.01, noteStart);
        noteGain.gain.linearRampToValueAtTime(0.85, noteStart + 0.02);
        noteGain.gain.exponentialRampToValueAtTime(0.001, noteStart + noteDuration);

        osc.connect(noteGain);
        noteGain.connect(master);

        osc.start(noteStart);
        osc.stop(noteStart + noteDuration);
      });
    } catch {}
  }

  /**
   * Warning Ping / Penalty alert (Avviso esclusioni 2 minuti e correzioni)
   */
  playWarningBeep() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const master = this.getMaster(ctx);

      const now = ctx.currentTime;

      // Double high-impact alert tone
      [0, 0.1].forEach((delay) => {
        const osc = ctx.createOscillator();
        const beepGain = ctx.createGain();
        const start = now + delay;

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1100, start);
        osc.frequency.exponentialRampToValueAtTime(800, start + 0.08);

        beepGain.gain.setValueAtTime(0.01, start);
        beepGain.gain.linearRampToValueAtTime(0.8, start + 0.015);
        beepGain.gain.exponentialRampToValueAtTime(0.001, start + 0.08);

        osc.connect(beepGain);
        beepGain.connect(master);

        osc.start(start);
        osc.stop(start + 0.08);
      });
    } catch {}
  }
}

export const sound = new SoundEngine();
