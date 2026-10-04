/**
 * Pure Web Audio API Sound Synthesizer for Handball Arenas & FIGH Matches
 * Zero-dependency, 100% offline-ready high-volume acoustic alerts, horns and sirens.
 * Tuned with multi-oscillator harmonic saturation & dynamics compressor for maximum arena loudness.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private boosterGain: GainNode | null = null;
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
    if (!this.compressor || !this.masterGain || !this.boosterGain) {
      // High-ratio sports arena limiter & dynamic compressor
      this.compressor = ctx.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(-12, ctx.currentTime);
      this.compressor.knee.setValueAtTime(3, ctx.currentTime);
      this.compressor.ratio.setValueAtTime(16, ctx.currentTime);
      this.compressor.attack.setValueAtTime(0.001, ctx.currentTime);
      this.compressor.release.setValueAtTime(0.08, ctx.currentTime);

      // Acoustic volume booster stage (maximizes digital loudness)
      this.boosterGain = ctx.createGain();
      this.boosterGain.gain.setValueAtTime(1.85, ctx.currentTime);

      this.masterGain = ctx.createGain();
      this.masterGain.gain.setValueAtTime(1.0, ctx.currentTime);

      // Audio route: masterGain -> boosterGain -> compressor -> destination
      this.masterGain.connect(this.boosterGain);
      this.boosterGain.connect(this.compressor);
      this.compressor.connect(ctx.destination);
    }
    return this.masterGain;
  }

  /**
   * Powerful Official Gym Horn / Buzzer (Sirena Palazzetto dello Sport FIGH)
   * 5-oscillator industrial acoustic klaxon: sub-bass rumble (110Hz), dual body (220Hz & 440Hz),
   * chorus detune (445Hz), and piercing harmonic (880Hz) with instant punch attack.
   */
  playBuzzer() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const master = this.getMaster(ctx);

      const now = ctx.currentTime;
      const duration = 1.8;

      // Sub-octave 110Hz (deep physical punch for arena speakers)
      const subOsc = ctx.createOscillator();
      subOsc.type = 'square';
      subOsc.frequency.setValueAtTime(110, now);

      // Low body 220Hz
      const oscLow = ctx.createOscillator();
      oscLow.type = 'sawtooth';
      oscLow.frequency.setValueAtTime(220, now);

      // Fundamental tone 440Hz (A4)
      const osc1 = ctx.createOscillator();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(440, now);

      // Detuned chorus tone 445Hz (acoustic presence and vibration)
      const osc2 = ctx.createOscillator();
      osc2.type = 'square';
      osc2.frequency.setValueAtTime(445, now);

      // High penetrating harmonic 880Hz (cuts through crowd and whistle noise)
      const osc3 = ctx.createOscillator();
      osc3.type = 'sawtooth';
      osc3.frequency.setValueAtTime(880, now);

      const buzzerGain = ctx.createGain();
      buzzerGain.gain.setValueAtTime(0.01, now);
      // Instant loud attack (15ms)
      buzzerGain.gain.linearRampToValueAtTime(1.0, now + 0.015);
      // High sustained loudness
      buzzerGain.gain.setValueAtTime(1.0, now + duration - 0.12);
      // Punchy cutoff
      buzzerGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      subOsc.connect(buzzerGain);
      oscLow.connect(buzzerGain);
      osc1.connect(buzzerGain);
      osc2.connect(buzzerGain);
      osc3.connect(buzzerGain);
      buzzerGain.connect(master);

      subOsc.start(now);
      oscLow.start(now);
      osc1.start(now);
      osc2.start(now);
      osc3.start(now);

      subOsc.stop(now + duration);
      oscLow.stop(now + duration);
      osc1.stop(now + duration);
      osc2.stop(now + duration);
      osc3.stop(now + duration);
    } catch {
      // Audio might be waiting for user gesture
    }
  }

  /**
   * Authentic Referee Whistle with Trill (Fischio Arbitrale FIGH ad alto impatto)
   * High-pitch dual resonant frequencies (2850Hz + 3350Hz) modulated by a 34Hz pea trill LFO.
   */
  playWhistle() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const master = this.getMaster(ctx);

      const now = ctx.currentTime;
      const duration = 0.38;

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const whistleGain = ctx.createGain();

      // Sharp dual whistle resonant frequencies
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(2850, now);
      osc1.frequency.linearRampToValueAtTime(3050, now + 0.06);
      osc1.frequency.linearRampToValueAtTime(2750, now + duration);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(3250, now);
      osc2.frequency.linearRampToValueAtTime(3450, now + 0.06);
      osc2.frequency.linearRampToValueAtTime(3150, now + duration);

      // Tremolo / trill LFO to simulate pea inside referee whistle
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(34, now); // 34 Hz flutter
      lfoGain.gain.setValueAtTime(140, now);
      lfo.connect(osc1.frequency);
      lfo.connect(osc2.frequency);

      whistleGain.gain.setValueAtTime(0.05, now);
      whistleGain.gain.linearRampToValueAtTime(1.0, now + 0.02);
      whistleGain.gain.setValueAtTime(1.0, now + duration - 0.05);
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
   * Goal Celebration Acoustic Ping (Gol Fanfare ad alto volume)
   * Bright, ringing 4-tone ascending fanfare (C5, E5, G5, C6) with rich harmonics.
   */
  playGoalSound() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const master = this.getMaster(ctx);

      const now = ctx.currentTime;

      const freqs = [523.25, 659.25, 783.99, 1046.5];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const oscHarmonic = ctx.createOscillator();
        const noteGain = ctx.createGain();
        const noteStart = now + idx * 0.065;
        const noteDuration = 0.32;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteStart);

        oscHarmonic.type = 'sine';
        oscHarmonic.frequency.setValueAtTime(freq * 2, noteStart);

        noteGain.gain.setValueAtTime(0.01, noteStart);
        noteGain.gain.linearRampToValueAtTime(0.95, noteStart + 0.015);
        noteGain.gain.exponentialRampToValueAtTime(0.001, noteStart + noteDuration);

        osc.connect(noteGain);
        oscHarmonic.connect(noteGain);
        noteGain.connect(master);

        osc.start(noteStart);
        oscHarmonic.start(noteStart);
        osc.stop(noteStart + noteDuration);
        oscHarmonic.stop(noteStart + noteDuration);
      });
    } catch {}
  }

  /**
   * Warning Ping / Penalty alert (Avviso esclusioni 2 minuti e correzioni)
   * High-impact dual alert tone.
   */
  playWarningBeep() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const master = this.getMaster(ctx);

      const now = ctx.currentTime;

      [0, 0.09].forEach((delay) => {
        const osc = ctx.createOscillator();
        const beepGain = ctx.createGain();
        const start = now + delay;

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1250, start);
        osc.frequency.exponentialRampToValueAtTime(850, start + 0.075);

        beepGain.gain.setValueAtTime(0.01, start);
        beepGain.gain.linearRampToValueAtTime(0.95, start + 0.01);
        beepGain.gain.exponentialRampToValueAtTime(0.001, start + 0.075);

        osc.connect(beepGain);
        beepGain.connect(master);

        osc.start(start);
        osc.stop(start + 0.075);
      });
    } catch {}
  }

  /**
   * Timeout End Alert (3 rapid buzzer bursts to warn teams timeout is expiring)
   */
  playTimeoutAlert() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const master = this.getMaster(ctx);
      const now = ctx.currentTime;

      [0, 0.18, 0.36].forEach((delay) => {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = now + delay;
        const dur = 0.12;

        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(480, start);
        osc2.type = 'square';
        osc2.frequency.setValueAtTime(720, start);

        gain.gain.setValueAtTime(0.01, start);
        gain.gain.linearRampToValueAtTime(0.95, start + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, start + dur);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(master);

        osc1.start(start);
        osc2.start(start);
        osc1.stop(start + dur);
        osc2.stop(start + dur);
      });
    } catch {}
  }

  /**
   * Short clean UI notification tone for button interactions
   */
  playBeep(frequency = 600, duration = 0.1) {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const master = this.getMaster(ctx);
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, now);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.5, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(master);

      osc.start(now);
      osc.stop(now + duration);
    } catch {}
  }
}

export const sound = new SoundEngine();
