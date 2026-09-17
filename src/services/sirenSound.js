/**
 * sirenSound.js
 * High-Decibel Tactical Security Siren & Radio Chime Engine for Ogere Remo
 * 
 * Generates authentic police / tactical intercept sirens for security officer terminals
 * while ensuring 100% silence for citizens in distress.
 */

class SirenSoundService {
  constructor() {
    this.audioCtx = null;
    this.loopInterval = null;
    this.isPlaying = false;
    this.isMuted = false;
    this.subscribers = new Set();
    this.hasUnlocked = false;

    // Auto-unlock AudioContext on first user interaction anywhere in the window
    if (typeof window !== 'undefined') {
      const unlock = () => {
        this.unlockAudio();
        window.removeEventListener('click', unlock);
        window.removeEventListener('keydown', unlock);
        window.removeEventListener('touchstart', unlock);
      };
      window.addEventListener('click', unlock, { passive: true });
      window.addEventListener('keydown', unlock, { passive: true });
      window.addEventListener('touchstart', unlock, { passive: true });
    }
  }

  /**
   * Ensure AudioContext exists and is running
   */
  getContext() {
    if (typeof window === 'undefined') return null;
    try {
      if (!this.audioCtx) {
        const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
        if (AudioCtxClass) {
          this.audioCtx = new AudioCtxClass();
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      this.hasUnlocked = true;
      return this.audioCtx;
    } catch (e) {
      console.warn('[SirenSound] Failed to initialize AudioContext:', e);
      return null;
    }
  }

  unlockAudio() {
    const ctx = this.getContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    callback({ isPlaying: this.isPlaying, isMuted: this.isMuted });
    return () => this.subscribers.delete(callback);
  }

  notify() {
    this.subscribers.forEach((cb) => {
      try {
        cb({ isPlaying: this.isPlaying, isMuted: this.isMuted });
      } catch (_) {}
    });
  }

  setMuted(muted) {
    this.isMuted = muted;
    if (muted && this.isPlaying) {
      this.stop();
    }
    this.notify();
  }

  toggleMute() {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  /**
   * Synthesize a single police siren cycle:
   * Sweep: 600Hz -> 1350Hz -> 600Hz over 0.75 seconds with dual oscillators
   */
  playSirenCycle(ctx, startTime, volume = 0.5) {
    const t = startTime;
    const duration = 0.75;

    // Main Sawtooth Oscillator (Tactical piercing tone)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sawtooth';

    // Frequency sweep
    osc1.frequency.setValueAtTime(620, t);
    osc1.frequency.linearRampToValueAtTime(1380, t + (duration * 0.5));
    osc1.frequency.linearRampToValueAtTime(620, t + duration);

    // Gain envelope
    gain1.gain.setValueAtTime(0.001, t);
    gain1.gain.linearRampToValueAtTime(volume * 0.7, t + 0.05);
    gain1.gain.setValueAtTime(volume * 0.7, t + duration - 0.05);
    gain1.gain.linearRampToValueAtTime(0.001, t + duration);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    // Secondary Triangle Oscillator (Harmonic body)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';

    osc2.frequency.setValueAtTime(640, t);
    osc2.frequency.linearRampToValueAtTime(1420, t + (duration * 0.5));
    osc2.frequency.linearRampToValueAtTime(640, t + duration);

    gain2.gain.setValueAtTime(0.001, t);
    gain2.gain.linearRampToValueAtTime(volume * 0.35, t + 0.05);
    gain2.gain.setValueAtTime(volume * 0.35, t + duration - 0.05);
    gain2.gain.linearRampToValueAtTime(0.001, t + duration);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + duration);
    osc2.stop(t + duration);
  }

  /**
   * Tactical radio chirp (Kssht-chirp) before siren
   */
  playRadioChirp(ctx, startTime) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    const t = startTime;

    osc.frequency.setValueAtTime(1800, t);
    osc.frequency.setValueAtTime(2400, t + 0.04);
    osc.frequency.setValueAtTime(1200, t + 0.08);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.2, t + 0.02);
    gain.gain.linearRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.13);
  }

  /**
   * Start looping emergency alarm (for Code Red / Armed SOS)
   */
  startEmergencySiren(options = {}) {
    if (this.isMuted) return;

    const ctx = this.getContext();
    if (!ctx) return;

    this.stop(); // Clear any previous loop
    this.isPlaying = true;
    this.notify();

    const burst = () => {
      if (!this.isPlaying || this.isMuted || !this.audioCtx) return;
      try {
        if (this.audioCtx.state === 'suspended') {
          this.audioCtx.resume();
        }
        const now = this.audioCtx.currentTime;

        // Tactical radio chirp
        this.playRadioChirp(this.audioCtx, now);

        // 2 consecutive piercing siren cycles (0.75s + 0.75s = 1.5s wail)
        this.playSirenCycle(this.audioCtx, now + 0.14, 0.6);
        this.playSirenCycle(this.audioCtx, now + 0.14 + 0.78, 0.6);
      } catch (e) {
        console.warn('[SirenSound] Playback error:', e);
      }
    };

    // Play first burst immediately
    burst();

    // Repeat every 2.4 seconds
    this.loopInterval = setInterval(burst, 2400);

    // Auto-timeout after 45 seconds if nobody silences it
    if (!options.infinite) {
      setTimeout(() => {
        if (this.isPlaying) {
          this.stop();
        }
      }, 45000);
    }
  }

  /**
   * Play a brief 2-cycle alert (for testing or lower severity alerts)
   */
  playTestChime() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      if (ctx.state === 'suspended') ctx.resume();
      const now = ctx.currentTime;
      this.playRadioChirp(ctx, now);
      this.playSirenCycle(ctx, now + 0.14, 0.45);
    } catch (_) {}
  }

  /**
   * Sonar acoustic pulse for live incoming GPS telemetry or breadcrumbs
   */
  playSonarPing() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      if (ctx.state === 'suspended') ctx.resume();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1046.5, now); // C6 note
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.42);
    } catch (_) {}
  }

  /**
   * Harmonious major-triad chime for incident resolution / all-clear
   */
  playAllClearChime() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      if (ctx.state === 'suspended') ctx.resume();
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t = now + idx * 0.12;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.18, t + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.8);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.85);
      });
    } catch (_) {}
  }

  /**
   * Crisp acoustic click/tick for SOS 3-second abort countdown
   */
  playCountdownTick() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      if (ctx.state === 'suspended') ctx.resume();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, now);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.01);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.06);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.07);
    } catch (_) {}
  }

  /**
   * Stop the siren immediately
   */
  stop() {
    if (this.loopInterval) {
      clearInterval(this.loopInterval);
      this.loopInterval = null;
    }
    this.isPlaying = false;
    this.notify();
  }
}

export const sirenSound = new SirenSoundService();
export default sirenSound;
