/**
 * We Care Jamaica - Audio & Sound Effects Synthesizer Engine
 * Pure Web Audio API implementation (zero external assets needed, ultra-fast, offline-capable).
 * Provides rich, diverse, musically tuned chimes and audio-visual feedback across all interactions.
 */

import { ActivityNotificationType } from '../types';

export type CelebrationChimeVariant = 'celestial_harp' | 'caribbean_marimba' | 'zen_crystal' | 'royal_fanfare';

class SoundFXEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private celebrationIndex: number = 0;
  private delightIndex: number = 0;
  private muteDoorbellAtNight: boolean = false;

  constructor() {
    // Check initial mute state from localStorage
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('wecare_sound_muted');
        this.isMuted = stored === 'true';
        const storedNightMute = localStorage.getItem('wecare_mute_doorbell_night');
        this.muteDoorbellAtNight = storedNightMute === 'true';
      } catch {
        this.isMuted = false;
        this.muteDoorbellAtNight = false;
      }
    }
  }

  public getMuteDoorbellAtNight(): boolean {
    return this.muteDoorbellAtNight;
  }

  public setMuteDoorbellAtNight(enabled: boolean): void {
    this.muteDoorbellAtNight = enabled;
    try {
      localStorage.setItem('wecare_mute_doorbell_night', String(enabled));
    } catch {}
  }

  public toggleMuteDoorbellAtNight(): boolean {
    this.setMuteDoorbellAtNight(!this.muteDoorbellAtNight);
    return this.muteDoorbellAtNight;
  }

  private isNightTime(): boolean {
    const hour = new Date().getHours();
    return hour >= 21 || hour < 6; // 9pm to 6am
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    try {
      localStorage.setItem('wecare_sound_muted', String(muted));
    } catch {}
  }

  public toggleMuted(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  /**
   * Helper to play a smooth synthesized tone with ADSR envelope
   */
  private playTone(
    freq: number, 
    type: OscillatorType, 
    startTime: number, 
    duration: number, 
    gainVal: number = 0.15,
    attack: number = 0.02
  ): void {
    const ctx = this.getAudioContext();
    if (!ctx || this.isMuted) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);

      // Smooth ADSR envelope
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, gainVal), startTime + attack);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.05);
    } catch {}
  }

  /**
   * 1. Booking Confirmation Chime
   * Triumphant, warm multi-tone ascending arpeggio (C5 -> E5 -> G5 -> B5 -> C6)
   */
  public playBookingConfirmed(): void {
    const ctx = this.getAudioContext();
    if (!ctx || this.isMuted) return;

    try {
      const now = ctx.currentTime;
      // Arpeggiated C Major 9 chord with warm sine/triangle blend
      const notes = [
        { f: 523.25, t: 0, d: 0.35, g: 0.2 },    // C5
        { f: 659.25, t: 0.08, d: 0.35, g: 0.2 }, // E5
        { f: 783.99, t: 0.16, d: 0.4, g: 0.22 }, // G5
        { f: 987.77, t: 0.24, d: 0.45, g: 0.2 }, // B5
        { f: 1046.50, t: 0.32, d: 0.75, g: 0.28 }, // C6
      ];

      notes.forEach(n => {
        this.playTone(n.f, 'triangle', now + n.t, n.d, n.g);
        this.playTone(n.f * 1.002, 'sine', now + n.t, n.d, n.g * 0.7); // subtle chorus shimmer
      });

      // Shimmer sparkle
      this.playTone(1567.98, 'sine', now + 0.45, 0.4, 0.12);
      this.playTone(2093.00, 'sine', now + 0.55, 0.5, 0.14);
    } catch {}
  }

  /**
   * 1b. Multi-Variant Visit Completed Celebration Chime
   * Rotates between 4 majestic musical celebration styles so visits always feel fresh and thrilling!
   */
  public playVisitCompleted(variant?: CelebrationChimeVariant): void {
    const ctx = this.getAudioContext();
    if (!ctx || this.isMuted) return;

    const variants: CelebrationChimeVariant[] = ['celestial_harp', 'caribbean_marimba', 'royal_fanfare', 'zen_crystal'];
    const chosenVariant = variant || variants[this.celebrationIndex % variants.length];
    this.celebrationIndex++;

    try {
      const now = ctx.currentTime;

      if (chosenVariant === 'celestial_harp') {
        // 1. Celestial Harp Chime (C5 -> E5 -> G5 -> B5 -> C6 -> E6 -> G6 + Triple Sparkle)
        const notes = [
          { f: 523.25, t: 0, d: 0.35, g: 0.22, type: 'triangle' as OscillatorType },    // C5
          { f: 659.25, t: 0.07, d: 0.35, g: 0.22, type: 'triangle' as OscillatorType }, // E5
          { f: 783.99, t: 0.14, d: 0.40, g: 0.24, type: 'sine' as OscillatorType },     // G5
          { f: 987.77, t: 0.21, d: 0.45, g: 0.24, type: 'triangle' as OscillatorType }, // B5
          { f: 1046.50, t: 0.28, d: 0.65, g: 0.28, type: 'sine' as OscillatorType },    // C6
          { f: 1318.51, t: 0.38, d: 0.85, g: 0.30, type: 'triangle' as OscillatorType }, // E6
          { f: 1567.98, t: 0.48, d: 1.10, g: 0.32, type: 'sine' as OscillatorType },    // G6
        ];

        notes.forEach(n => {
          this.playTone(n.f, n.type, now + n.t, n.d, n.g);
          this.playTone(n.f * 1.002, 'sine', now + n.t, n.d * 0.8, n.g * 0.6);
        });

        // Shimmering bell sparkle trail
        const sparkles = [1760.00, 2093.00, 2637.02, 3135.96];
        sparkles.forEach((freq, idx) => {
          this.playTone(freq, 'sine', now + 0.55 + (idx * 0.08), 0.45, 0.15);
        });
      } else if (chosenVariant === 'caribbean_marimba') {
        // 2. Caribbean Marimba & Steel Pan Glow (G4 -> C5 -> E5 -> G5 -> A5 -> C6 -> D6 -> G6)
        const notes = [
          { f: 392.00, t: 0, d: 0.25, g: 0.25, type: 'triangle' as OscillatorType },    // G4
          { f: 523.25, t: 0.06, d: 0.28, g: 0.26, type: 'triangle' as OscillatorType }, // C5
          { f: 659.25, t: 0.12, d: 0.30, g: 0.27, type: 'sine' as OscillatorType },     // E5
          { f: 783.99, t: 0.18, d: 0.35, g: 0.28, type: 'triangle' as OscillatorType }, // G5
          { f: 880.00, t: 0.24, d: 0.40, g: 0.28, type: 'sine' as OscillatorType },     // A5
          { f: 1046.50, t: 0.30, d: 0.60, g: 0.30, type: 'triangle' as OscillatorType },// C6
          { f: 1174.66, t: 0.40, d: 0.75, g: 0.32, type: 'sine' as OscillatorType },    // D6
          { f: 1567.98, t: 0.50, d: 1.20, g: 0.35, type: 'sine' as OscillatorType },    // G6
        ];

        notes.forEach(n => {
          this.playTone(n.f, n.type, now + n.t, n.d, n.g, 0.01);
          this.playTone(n.f * 2, 'sine', now + n.t, n.d * 0.5, n.g * 0.25, 0.01);
        });
      } else if (chosenVariant === 'royal_fanfare') {
        // 3. Royal Brass & Cathedral Chime (F5 -> A5 -> C6 -> F6 majestic brass chord)
        const chord1 = [
          { f: 698.46, t: 0, d: 0.35, g: 0.22 },    // F5
          { f: 880.00, t: 0.04, d: 0.35, g: 0.22 }, // A5
          { f: 1046.50, t: 0.08, d: 0.45, g: 0.24 },// C6
        ];
        const chord2 = [
          { f: 880.00, t: 0.22, d: 0.4, g: 0.24 },
          { f: 1174.66, t: 0.24, d: 0.4, g: 0.26 },
          { f: 1396.91, t: 0.26, d: 0.8, g: 0.30 }, // F6
        ];
        const chordFinal = [
          { f: 1046.50, t: 0.45, d: 1.2, g: 0.30 }, // C6
          { f: 1396.91, t: 0.46, d: 1.3, g: 0.32 }, // F6
          { f: 1760.00, t: 0.48, d: 1.4, g: 0.35 }, // A6
          { f: 2093.00, t: 0.50, d: 1.5, g: 0.28 }, // C7
        ];

        [...chord1, ...chord2, ...chordFinal].forEach(c => {
          this.playTone(c.f, 'triangle', now + c.t, c.d, c.g);
          this.playTone(c.f * 1.003, 'sine', now + c.t, c.d, c.g * 0.7);
        });
      } else {
        // 4. Zen Crystal Bowl Resonance (D5 -> A5 -> F#6 -> A6 with deep harmonic drone)
        const drones = [
          { f: 293.66, t: 0, d: 1.6, g: 0.22, type: 'sine' as OscillatorType },    // D4
          { f: 587.33, t: 0, d: 1.4, g: 0.25, type: 'triangle' as OscillatorType },// D5
          { f: 880.00, t: 0.12, d: 1.2, g: 0.26, type: 'sine' as OscillatorType },// A5
          { f: 1479.98, t: 0.26, d: 1.1, g: 0.28, type: 'sine' as OscillatorType },// F#6
          { f: 1760.00, t: 0.40, d: 1.5, g: 0.30, type: 'triangle' as OscillatorType },// A6
          { f: 2349.32, t: 0.52, d: 1.6, g: 0.22, type: 'sine' as OscillatorType },// D7
        ];

        drones.forEach(d => {
          this.playTone(d.f, d.type, now + d.t, d.d, d.g, 0.04);
        });
      }
    } catch {}
  }

  /**
   * 1c. Star Rating Musical Pentatonic Chime
   * Plays escalating harmonious crystal pitches as stars 1..5 are clicked!
   */
  public playStarRatingHover(starIndex: number): void {
    const ctx = this.getAudioContext();
    if (!ctx || this.isMuted) return;

    try {
      const now = ctx.currentTime;
      // Pentatonic scale mapped from 1 to 5 stars
      const starPitches = [
        523.25,  // 1 Star: C5
        587.33,  // 2 Stars: D5
        659.25,  // 3 Stars: E5
        783.99,  // 4 Stars: G5
        1046.50, // 5 Stars: C6 (Grand Golden Star)
      ];

      const freq = starPitches[Math.min(Math.max(starIndex - 1, 0), 4)];
      this.playTone(freq, 'triangle', now, 0.25, 0.22, 0.01);
      this.playTone(freq * 1.5, 'sine', now + 0.02, 0.2, 0.15, 0.01);

      // 5-Star gets an instant sparkle flourish
      if (starIndex >= 5) {
        this.playTone(1318.51, 'sine', now + 0.08, 0.35, 0.2); // E6
        this.playTone(1567.98, 'sine', now + 0.14, 0.45, 0.25); // G6
        this.playTone(2093.00, 'sine', now + 0.20, 0.6, 0.28);  // C7
      }
    } catch {}
  }

  /**
   * 1d. Tab Switch / Navigation Water-Drop Chime
   * Fluid, highly satisfying micro-waterdrop chime (G5 -> C6)
   */
  public playTabSwitch(): void {
    const ctx = this.getAudioContext();
    if (!ctx || this.isMuted) return;

    try {
      const now = ctx.currentTime;
      this.playTone(783.99, 'sine', now, 0.08, 0.14, 0.005);
      this.playTone(1046.50, 'triangle', now + 0.04, 0.14, 0.18, 0.005);
    } catch {}
  }

  /**
   * 1e. Caregiver Select / Profile Open Harp Glissando
   * Warm, welcoming acoustic harp strum (E5 -> G#5 -> B5 -> E6)
   */
  public playCaregiverSelect(): void {
    const ctx = this.getAudioContext();
    if (!ctx || this.isMuted) return;

    try {
      const now = ctx.currentTime;
      const notes = [659.25, 830.61, 987.77, 1318.51];
      notes.forEach((f, idx) => {
        this.playTone(f, 'triangle', now + (idx * 0.04), 0.25, 0.16, 0.01);
        this.playTone(f * 1.002, 'sine', now + (idx * 0.04), 0.2, 0.12, 0.01);
      });
    } catch {}
  }

  /**
   * 1f. Filter / Category Chip Select Chime
   * Tactile bamboo/wood block click with bright overtone (A5 -> D6)
   */
  public playFilterSelect(): void {
    const ctx = this.getAudioContext();
    if (!ctx || this.isMuted) return;

    try {
      const now = ctx.currentTime;
      this.playTone(880.00, 'triangle', now, 0.06, 0.16, 0.005);
      this.playTone(1174.66, 'sine', now + 0.03, 0.12, 0.18, 0.005);
    } catch {}
  }

  /**
   * 1g. Favorite / Heart Pluck
   * Sweet romantic kalimba double-pluck
   */
  public playFavoriteToggle(isFavorited: boolean = true): void {
    const ctx = this.getAudioContext();
    if (!ctx || this.isMuted) return;

    try {
      const now = ctx.currentTime;
      if (isFavorited) {
        this.playTone(587.33, 'triangle', now, 0.12, 0.2, 0.005); // D5
        this.playTone(739.99, 'sine', now + 0.06, 0.22, 0.24, 0.005); // F#5
        this.playTone(1174.66, 'sine', now + 0.12, 0.35, 0.22, 0.005); // D6
      } else {
        this.playTone(739.99, 'sine', now, 0.1, 0.14, 0.005);
        this.playTone(587.33, 'sine', now + 0.05, 0.15, 0.12, 0.005);
      }
    } catch {}
  }

  /**
   * 1h. Step Advance / Completed Sub-Task Ding
   * Crisp double xylophone ding (F#5 -> B5)
   */
  public playStepComplete(): void {
    const ctx = this.getAudioContext();
    if (!ctx || this.isMuted) return;

    try {
      const now = ctx.currentTime;
      this.playTone(739.99, 'triangle', now, 0.12, 0.18, 0.005);
      this.playTone(987.77, 'sine', now + 0.07, 0.28, 0.22, 0.005);
    } catch {}
  }

  /**
   * 1i. Promo Code Discount / Care Credit Applied Chime
   * Joyful cash register + golden chime (D5 -> F#5 -> A5 -> D6 chime)
   */
  public playPromoCodeApplied(): void {
    const ctx = this.getAudioContext();
    if (!ctx || this.isMuted) return;

    try {
      const now = ctx.currentTime;
      const notes = [587.33, 739.99, 880.00, 1174.66, 1479.98];
      notes.forEach((f, idx) => {
        this.playTone(f, 'sine', now + (idx * 0.05), 0.3, 0.22, 0.005);
        this.playTone(f * 1.5, 'triangle', now + (idx * 0.05), 0.2, 0.12, 0.005);
      });
    } catch {}
  }

  /**
   * 1j. Verified Nursing Council Badge Unlock / Stamp Bell
   * Pure golden bell chime with crystal shimmer
   */
  public playBadgeUnlock(): void {
    const ctx = this.getAudioContext();
    if (!ctx || this.isMuted) return;

    try {
      const now = ctx.currentTime;
      this.playTone(1046.50, 'sine', now, 0.4, 0.25, 0.01);
      this.playTone(1567.98, 'sine', now + 0.08, 0.5, 0.28, 0.01);
      this.playTone(2093.00, 'triangle', now + 0.16, 0.7, 0.30, 0.01);
    } catch {}
  }

  /**
   * 1k. Random Delight / Surprise Chime (Cycles through bright uplifting chord progressions)
   */
  public playRandomDelightChime(): void {
    const ctx = this.getAudioContext();
    if (!ctx || this.isMuted) return;

    try {
      const now = ctx.currentTime;
      const motifs = [
        [523.25, 659.25, 783.99, 1046.50], // C Major
        [587.33, 739.99, 880.00, 1174.66], // D Major
        [659.25, 830.61, 987.77, 1318.51], // E Major
        [783.99, 987.77, 1174.66, 1567.98] // G Major
      ];
      const motif = motifs[this.delightIndex % motifs.length];
      this.delightIndex++;

      motif.forEach((freq, idx) => {
        this.playTone(freq, 'triangle', now + (idx * 0.06), 0.3, 0.22, 0.005);
        this.playTone(freq * 1.002, 'sine', now + (idx * 0.06), 0.25, 0.15, 0.005);
      });
    } catch {}
  }

  /**
   * 1l. Health Record / Clinical Notes Saved Stethoscope Beep & Reassurance Chime
   */
  public playHealthRecordUpdate(): void {
    const ctx = this.getAudioContext();
    if (!ctx || this.isMuted) return;

    try {
      const now = ctx.currentTime;
      // Gentle double heartbeat pulse + harmonic reassurance chime
      this.playTone(180, 'sine', now, 0.08, 0.3, 0.01);
      this.playTone(220, 'sine', now + 0.12, 0.1, 0.28, 0.01);
      this.playTone(659.25, 'triangle', now + 0.25, 0.3, 0.22, 0.01);
      this.playTone(987.77, 'sine', now + 0.35, 0.45, 0.25, 0.01);
    } catch {}
  }

  /**
   * 1m. Financial / Invoice Generated Register Chime
   */
  public playInvoiceGenerated(): void {
    const ctx = this.getAudioContext();
    if (!ctx || this.isMuted) return;

    try {
      const now = ctx.currentTime;
      this.playTone(987.77, 'triangle', now, 0.1, 0.2, 0.005);
      this.playTone(1318.51, 'sine', now + 0.06, 0.35, 0.25, 0.005);
    } catch {}
  }

  /**
   * Verified ID Card Issuance Chime
   * Majestic brass & chime chord announcing official credentials
   */
  public playIDCardGenerated(): void {
    const ctx = this.getAudioContext();
    if (!ctx || this.isMuted) return;

    try {
      const now = ctx.currentTime;
      // Elegant arpeggio: C5 -> E5 -> G5 -> C6 with warm sustained crystal resonance
      this.playTone(523.25, 'triangle', now, 0.35, 0.22, 0.01);
      this.playTone(659.25, 'sine', now + 0.08, 0.4, 0.24, 0.01);
      this.playTone(783.99, 'sine', now + 0.16, 0.45, 0.26, 0.01);
      this.playTone(1046.50, 'triangle', now + 0.24, 0.8, 0.32, 0.005);
      this.playTone(2093.00, 'sine', now + 0.3, 0.6, 0.14, 0.02);
    } catch {}
  }

  /**
   * Auto-Reroute Caregiver Switch Chime
   * Smooth, melodic multi-tone chime informing the user that the request has transferred to the next available practitioner
   */
  public playRerouteNotification(): void {
    const ctx = this.getAudioContext();
    if (!ctx || this.isMuted) return;

    try {
      const now = ctx.currentTime;
      this.playTone(523.25, 'sine', now, 0.12, 0.18, 0.005); // C5
      this.playTone(659.25, 'triangle', now + 0.08, 0.15, 0.20, 0.005); // E5
      this.playTone(783.99, 'sine', now + 0.16, 0.24, 0.22, 0.005); // G5
      this.playTone(1046.50, 'sine', now + 0.24, 0.35, 0.25, 0.005); // C6
    } catch {}
  }

  /**
   * Dialing & Connection Tones
   */
  public playDialTone(): void {
    const ctx = this.getAudioContext();
    if (!ctx || this.isMuted) return;

    try {
      const now = ctx.currentTime;
      this.playTone(350, 'sine', now, 0.2, 0.15);
      this.playTone(440, 'sine', now, 0.2, 0.15);
    } catch {}
  }

  public playCallConnected(): void {
    const ctx = this.getAudioContext();
    if (!ctx || this.isMuted) return;

    try {
      const now = ctx.currentTime;
      this.playTone(440, 'sine', now, 0.12, 0.18);
      this.playTone(880, 'triangle', now + 0.08, 0.25, 0.22);
    } catch {}
  }

  /**
   * 2. New Booking Request Chime
   * Crisp double doorbell ascending tone (G5 -> C6)
   */
  public playBookingRequest(): void {
    const ctx = this.getAudioContext();
    if (!ctx || this.isMuted) return;

    try {
      const now = ctx.currentTime;
      this.playTone(783.99, 'sine', now, 0.2, 0.22);
      this.playTone(1046.50, 'triangle', now + 0.12, 0.45, 0.25);
    } catch {}
  }

  /**
   * 2b. Loud High-Priority Nurse Request Alert
   * Multi-frequency pulsating alert chime designed for caregivers on active duty
   */
  public playLoudNurseRequestAlert(): void {
    const ctx = this.getAudioContext();
    if (!ctx || this.isMuted) return;

    try {
      const now = ctx.currentTime;
      // Loud repeating pulse: 880Hz -> 1320Hz -> 1760Hz
      [0, 0.25, 0.5].forEach((offset) => {
        this.playTone(880, 'triangle', now + offset, 0.14, 0.45, 0.005);
        this.playTone(1320, 'sine', now + offset + 0.05, 0.18, 0.5, 0.005);
        this.playTone(1760, 'sine', now + offset + 0.11, 0.22, 0.45, 0.005);
      });
    } catch {}
  }

  /**
   * 3. Cancellation Sound
   * Gentle, soft descending minor tone (F5 -> D5 -> Bb4)
   */
  public playCancellation(): void {
    const ctx = this.getAudioContext();
    if (!ctx || this.isMuted) return;

    try {
      const now = ctx.currentTime;
      const notes = [
        { f: 698.46, t: 0, d: 0.25, g: 0.16 },   // F5
        { f: 587.33, t: 0.12, d: 0.3, g: 0.15 },  // D5
        { f: 466.16, t: 0.24, d: 0.5, g: 0.18 },  // Bb4
      ];

      notes.forEach(n => {
        this.playTone(n.f, 'sine', now + n.t, n.d, n.g);
      });
    } catch {}
  }

  /**
   * 4. Nurse En-Route / GPS Transit Update Chime
   * Dynamic travel ping (D5 -> A5 -> F#5)
   */
  public playNurseEnRoute(): void {
    const ctx = this.getAudioContext();
    if (!ctx || this.isMuted) return;

    try {
      const now = ctx.currentTime;
      this.playTone(587.33, 'sine', now, 0.15, 0.18);
      this.playTone(880.00, 'triangle', now + 0.1, 0.2, 0.22);
      this.playTone(739.99, 'sine', now + 0.22, 0.4, 0.2);
    } catch {}
  }

  /**
   * 4b. Doorstep Arrival Doorbell Chime (doorbell.mp3 equivalent)
   * Classic warm Jamaican home doorbell "Ding-Dong" (E5 -> C5) with resonant harmonics.
   * Respects night-time mute (9pm-6am) if enabled.
   */
  public playDoorbellAlert(forceSound: boolean = false): void {
    if (!forceSound && this.muteDoorbellAtNight && this.isNightTime()) {
      return; // Suppressed for quiet night hours
    }

    const ctx = this.getAudioContext();
    if (!ctx || this.isMuted) return;

    try {
      const now = ctx.currentTime;
      // Strike 1: "Ding" (E5 ~659.25 Hz) with warm harmonic sparkle
      this.playTone(659.25, 'sine', now, 0.9, 0.28, 0.005);
      this.playTone(659.25 * 2, 'sine', now, 0.5, 0.12, 0.005);
      this.playTone(659.25 * 1.5, 'triangle', now, 0.35, 0.08, 0.005);

      // Strike 2: "Dong" (C5 ~523.25 Hz) with deep resonant decay
      this.playTone(523.25, 'sine', now + 0.38, 1.4, 0.34, 0.005);
      this.playTone(523.25 * 2, 'sine', now + 0.38, 0.7, 0.16, 0.005);
      this.playTone(523.25 * 1.5, 'triangle', now + 0.38, 0.5, 0.1, 0.005);

      // Subtle atmospheric echo
      this.playTone(1046.50, 'sine', now + 0.45, 0.8, 0.06, 0.01);
    } catch {}
  }

  /**
   * Alias for doorbell arrival tone
   */
  public playDoorbellArrived(forceSound: boolean = false): void {
    this.playDoorbellAlert(forceSound);
  }

  /**
   * Section 12 Sound 2: request.mp3 (3x upbeat LOUD chimes + device vibration)
   * Triggered on incoming New Job Offers for nurses
   */
  public playNewJobRequestLoud(): void {
    const ctx = this.getAudioContext();
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([250, 100, 250, 100, 350]);
      } catch {}
    }

    if (!ctx || this.isMuted) return;

    try {
      const now = ctx.currentTime;
      // Chime Burst 1 (G5 -> C6)
      this.playTone(783.99, 'triangle', now, 0.18, 0.32, 0.01);
      this.playTone(1046.50, 'sine', now + 0.08, 0.25, 0.35, 0.01);

      // Chime Burst 2 (A5 -> D6)
      this.playTone(880.00, 'triangle', now + 0.30, 0.18, 0.32, 0.01);
      this.playTone(1174.66, 'sine', now + 0.38, 0.25, 0.35, 0.01);

      // Chime Burst 3 (B5 -> E6) - Triumpant and loud
      this.playTone(987.77, 'triangle', now + 0.60, 0.2, 0.34, 0.01);
      this.playTone(1318.51, 'sine', now + 0.68, 0.45, 0.38, 0.01);
    } catch {}
  }

  /**
   * Section 12 Sound 3: success.mp3 (Single soft ding)
   * Triggered on QR scan verification & job acceptance
   */
  public playSuccessSoftDing(): void {
    const ctx = this.getAudioContext();
    if (!ctx || this.isMuted) return;

    try {
      const now = ctx.currentTime;
      // Pure clear crystal bell ping (C6 ~1046.5Hz)
      this.playTone(1046.50, 'sine', now, 0.7, 0.22, 0.005);
      this.playTone(2093.00, 'sine', now, 0.35, 0.08, 0.005);
    } catch {}
  }

  /**
   * Section 12 Sound 4: alert.mp3 (Siren pulse for SOS only)
   * Acoustic emergency beacon pulse for SOS safety triggers
   */
  public playAlertSirenPulse(): void {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([400, 150, 400, 150, 600]);
      } catch {}
    }

    const ctx = this.getAudioContext();
    if (!ctx || this.isMuted) return;

    try {
      const now = ctx.currentTime;
      // Rapid alternating siren warble (880Hz -> 659Hz -> 880Hz -> 659Hz)
      this.playTone(880.00, 'sawtooth', now, 0.18, 0.30, 0.01);
      this.playTone(659.25, 'sawtooth', now + 0.16, 0.18, 0.30, 0.01);
      this.playTone(880.00, 'sawtooth', now + 0.32, 0.18, 0.30, 0.01);
      this.playTone(659.25, 'sawtooth', now + 0.48, 0.24, 0.32, 0.01);
      this.playTone(1046.50, 'sine', now + 0.68, 0.4, 0.25, 0.01);
    } catch {}
  }

  /**
   * Biometric Authentication Success Sound Effect & Haptic Feedback Pattern
   * Futuristic, crisp ascending triple chime (G5 -> C6 -> E6 + harmonic shimmer)
   * with synchronized device tactile double-pulse confirmation ([45, 55, 95] ms)
   */
  public playBiometricSuccess(): void {
    // 1. Device Haptic Feedback Pattern
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([45, 55, 95]);
      } catch {}
    }

    const ctx = this.getAudioContext();
    if (!ctx || this.isMuted) return;

    try {
      const now = ctx.currentTime;
      // Futuristic ascending chime triad: G5 (783.99Hz) -> C6 (1046.50Hz) -> E6 (1318.51Hz)
      this.playTone(783.99, 'sine', now, 0.18, 0.22, 0.005);
      this.playTone(1046.50, 'sine', now + 0.06, 0.24, 0.26, 0.005);
      this.playTone(1318.51, 'triangle', now + 0.14, 0.40, 0.30, 0.005);
      // High-frequency crystal resonance shimmer
      this.playTone(2093.00, 'sine', now + 0.15, 0.45, 0.15, 0.005);
      this.playTone(2637.02, 'sine', now + 0.22, 0.35, 0.10, 0.005);
    } catch {}
  }

  /**
   * Biometric Authentication Retry / Error Sound & Haptic
   * Subtle low alert chime + dual warning haptic tap
   */
  public playBiometricRetry(): void {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([70, 60, 80]);
      } catch {}
    }

    const ctx = this.getAudioContext();
    if (!ctx || this.isMuted) return;

    try {
      const now = ctx.currentTime;
      this.playTone(440, 'triangle', now, 0.14, 0.18, 0.01);
      this.playTone(329.63, 'triangle', now + 0.07, 0.18, 0.20, 0.01);
    } catch {}
  }

  /**
   * 5. Payment Confirmed & Escrow Release Chime
   * Rich shimmering coin/currency chime
   */
  public playPaymentConfirmed(): void {
    const ctx = this.getAudioContext();
    if (!ctx || this.isMuted) return;

    try {
      const now = ctx.currentTime;
      const coinTones = [
        { f: 987.77, t: 0, d: 0.2, g: 0.2 },
        { f: 1318.51, t: 0.08, d: 0.3, g: 0.24 },
        { f: 1567.98, t: 0.16, d: 0.4, g: 0.25 },
        { f: 1975.53, t: 0.24, d: 0.6, g: 0.3 },
      ];
      coinTones.forEach(c => {
        this.playTone(c.f, 'sine', now + c.t, c.d, c.g);
        this.playTone(c.f * 1.5, 'triangle', now + c.t, c.d * 0.6, c.g * 0.4);
      });
    } catch {}
  }

  /**
   * 6. New Rating Received (5-Star Sparkle)
   */
  public playRatingReceived(): void {
    this.playStarRatingHover(5);
  }

  /**
   * 7. Chat Message Bubble Pop (Sent / Received)
   */
  public playChatMessage(): void {
    const ctx = this.getAudioContext();
    if (!ctx || this.isMuted) return;

    try {
      const now = ctx.currentTime;
      this.playTone(800, 'sine', now, 0.06, 0.15, 0.005);
      this.playTone(1200, 'sine', now + 0.05, 0.1, 0.18, 0.005);
    } catch {}
  }

  public playChatMessageSent(): void {
    const ctx = this.getAudioContext();
    if (!ctx || this.isMuted) return;

    try {
      const now = ctx.currentTime;
      this.playTone(600, 'sine', now, 0.04, 0.12, 0.005);
      this.playTone(900, 'triangle', now + 0.03, 0.08, 0.16, 0.005);
    } catch {}
  }

  /**
   * 8. Incoming Call Ring Pulse
   */
  public playIncomingCall(): void {
    const ctx = this.getAudioContext();
    if (!ctx || this.isMuted) return;

    try {
      const now = ctx.currentTime;
      this.playTone(440, 'sine', now, 0.15, 0.2);
      this.playTone(480, 'sine', now, 0.15, 0.2);
      this.playTone(440, 'sine', now + 0.2, 0.15, 0.2);
      this.playTone(480, 'sine', now + 0.2, 0.15, 0.2);
    } catch {}
  }

  /**
   * 9. Health News Alert
   */
  public playHealthNews(): void {
    const ctx = this.getAudioContext();
    if (!ctx || this.isMuted) return;

    try {
      const now = ctx.currentTime;
      this.playTone(523.25, 'triangle', now, 0.12, 0.16);
      this.playTone(659.25, 'triangle', now + 0.1, 0.12, 0.18);
      this.playTone(783.99, 'triangle', now + 0.2, 0.35, 0.2);
    } catch {}
  }

  /**
   * 10. Camera Shutter Click Sound
   */
  public playCameraShutter(): void {
    const ctx = this.getAudioContext();
    if (!ctx || this.isMuted) return;

    try {
      const now = ctx.currentTime;
      this.playTone(1800, 'triangle', now, 0.03, 0.25);
      this.playTone(320, 'square', now + 0.03, 0.05, 0.2);
      this.playTone(1400, 'triangle', now + 0.12, 0.04, 0.18);
    } catch {}
  }

  /**
   * 11. Nurse Late / Delayed Alert Chime
   */
  public playNurseLateAlert(): void {
    const ctx = this.getAudioContext();
    if (!ctx || this.isMuted) return;

    try {
      const now = ctx.currentTime;
      const notes = [
        { f: 659.25, t: 0, d: 0.18, g: 0.22 },    // E5
        { f: 830.61, t: 0.12, d: 0.22, g: 0.24 }, // G#5
        { f: 659.25, t: 0.28, d: 0.4, g: 0.22 },  // E5
        { f: 830.61, t: 0.42, d: 0.55, g: 0.26 }, // G#5 accent
      ];

      notes.forEach(n => {
        this.playTone(n.f, 'triangle', now + n.t, n.d, n.g);
      });
    } catch {}
  }

  public playLateTimerWarning(): void {
    this.playNurseLateAlert();
  }

  /**
   * 12. Time Up / Nurse Departure Alert Chime
   */
  public playNurseTimeUp(): void {
    const ctx = this.getAudioContext();
    if (!ctx || this.isMuted) return;

    try {
      const now = ctx.currentTime;
      const bells = [
        { f: 880.00, t: 0, d: 0.3, g: 0.22 },     // A5
        { f: 1108.73, t: 0.14, d: 0.35, g: 0.24 }, // C#6
        { f: 1318.51, t: 0.28, d: 0.4, g: 0.26 }, // E6
        { f: 1760.00, t: 0.42, d: 0.8, g: 0.3 },  // A6
      ];

      bells.forEach(b => {
        this.playTone(b.f, 'sine', now + b.t, b.d, b.g);
        this.playTone(b.f * 2, 'sine', now + b.t, b.d * 0.5, b.g * 0.2);
      });
    } catch {}
  }

  /**
   * 13. 5-Minute Warning Chime
   */
  public play5MinWarning(): void {
    const ctx = this.getAudioContext();
    if (!ctx || this.isMuted) return;

    try {
      const now = ctx.currentTime;
      const notes = [
        { f: 783.99, t: 0, d: 0.25, g: 0.16 }, // G5
        { f: 880.00, t: 0.16, d: 0.45, g: 0.18 }, // A5
      ];
      notes.forEach(n => this.playTone(n.f, 'triangle', now + n.t, n.d, n.g));
    } catch {}
  }

  /**
   * 14. Countdown Tick
   */
  public playCountdownTick(pitchHigh: boolean = false): void {
    const ctx = this.getAudioContext();
    if (!ctx || this.isMuted) return;

    try {
      const now = ctx.currentTime;
      const freq = pitchHigh ? 1200 : 800;
      this.playTone(freq, 'triangle', now, 0.04, 0.08);
    } catch {}
  }

  /**
   * 15. General Success / Action Tone
   */
  public playSuccessPing(): void {
    const ctx = this.getAudioContext();
    if (!ctx || this.isMuted) return;

    try {
      const now = ctx.currentTime;
      this.playTone(880, 'sine', now, 0.1, 0.15);
      this.playTone(1320, 'sine', now + 0.08, 0.25, 0.2);
    } catch {}
  }

  /**
   * 15b. Gentle Notification 'Ding'
   * Soft, crystal-clear, resonant chime bell 'ding' with warm exponential decay.
   * Perfect for pleasant home nurse visit booking confirmations.
   */
  public playGentleDing(): void {
    const ctx = this.getAudioContext();
    if (!ctx || this.isMuted) return;

    try {
      const now = ctx.currentTime;
      // Gentle pure sine bell fundamental with harmonic fifth and overtone shimmer
      this.playTone(880.00, 'sine', now, 0.45, 0.18, 0.003); // A5 fundamental chime
      this.playTone(1318.51, 'sine', now + 0.01, 0.5, 0.12, 0.003); // E6 harmonic resonance
      this.playTone(1760.00, 'triangle', now + 0.018, 0.35, 0.07, 0.002); // A6 crystal overtone
      this.playTone(2637.02, 'sine', now + 0.025, 0.55, 0.04, 0.002); // E7 soft shimmer
    } catch {}
  }

  /**
   * 15c. Quick-SOS Emergency Pulse Tone
   * Urgent dual-frequency alert siren pulses (rapid oscillating tones)
   * High-contrast audio cue alerting safety dispatch and designated contacts immediately.
   */
  public playQuickSOSTone(): void {
    const ctx = this.getAudioContext();
    if (!ctx || this.isMuted) return;

    try {
      const now = ctx.currentTime;
      const pulses = [
        { f: 987.77, t: 0, d: 0.14, g: 0.32 },     // B5
        { f: 1318.51, t: 0.12, d: 0.16, g: 0.35 }, // E6
        { f: 987.77, t: 0.28, d: 0.14, g: 0.32 },  // B5
        { f: 1318.51, t: 0.40, d: 0.22, g: 0.38 }, // E6
        { f: 1760.00, t: 0.55, d: 0.35, g: 0.40 }  // A6 beacon sting
      ];
      pulses.forEach(p => {
        this.playTone(p.f, 'sawtooth', now + p.t, p.d, p.g, 0.005);
        this.playTone(p.f / 2, 'sine', now + p.t, p.d, p.g * 0.5, 0.005);
      });
    } catch {}
  }

  /**
   * Shorthand alias for gentle 'ding' notification sound
   */
  public playDing(): void {
    this.playGentleDing();
  }

  /**
   * 16. UI Toggle / Selection Pop Tone
   */
  public playPop(): void {
    const ctx = this.getAudioContext();
    if (!ctx || this.isMuted) return;

    try {
      const now = ctx.currentTime;
      this.playTone(700, 'sine', now, 0.04, 0.1);
      this.playTone(1050, 'sine', now + 0.02, 0.06, 0.12);
    } catch {}
  }

  /**
   * 17. 30-Minute Pre-Visit Reminder Chime
   */
  public play30MinReminder(): void {
    const ctx = this.getAudioContext();
    if (!ctx || this.isMuted) return;

    try {
      const now = ctx.currentTime;
      const chimes = [
        { f: 587.33, t: 0, d: 0.35, g: 0.22 },    // D5
        { f: 880.00, t: 0.14, d: 0.45, g: 0.25 }, // A5
        { f: 1174.66, t: 0.28, d: 0.75, g: 0.28 }, // D6
      ];

      chimes.forEach(c => {
        this.playTone(c.f, 'sine', now + c.t, c.d, c.g);
        this.playTone(c.f * 1.002, 'triangle', now + c.t, c.d * 0.7, c.g * 0.3);
      });
    } catch {}
  }

  /**
   * 18. Patient 15-Minute Pre-Medication Push Audio Alert
   * Double-pulse bell chime designed for high attention and comfort
   */
  public playMedicationPushAlert(): void {
    const ctx = this.getAudioContext();
    if (!ctx || this.isMuted) return;

    try {
      const now = ctx.currentTime;
      // Pulse 1
      this.playTone(1046.50, 'sine', now, 0.25, 0.25, 0.01);        // C6
      this.playTone(1318.51, 'triangle', now + 0.08, 0.35, 0.28, 0.01); // E6
      this.playTone(1567.98, 'sine', now + 0.16, 0.5, 0.30, 0.01);   // G6
      this.playTone(2093.00, 'sine', now + 0.24, 0.6, 0.22, 0.01);   // C7

      // Pulse 2 (gentle echo after 0.5s)
      this.playTone(1046.50, 'sine', now + 0.52, 0.22, 0.20, 0.01);
      this.playTone(1318.51, 'triangle', now + 0.60, 0.30, 0.22, 0.01);
      this.playTone(1567.98, 'sine', now + 0.68, 0.5, 0.25, 0.01);
      this.playTone(2093.00, 'sine', now + 0.76, 0.7, 0.18, 0.01);
    } catch {}
  }

  /**
   * 19. Proactive Kingston & St. Andrew Zone Nurse Availability Alert Chime
   * Bright, optimistic ascending arpeggio signifying a local caregiver is active nearby, reducing wait times
   */
  public playZoneNurseAvailable(): void {
    const ctx = this.getAudioContext();
    if (!ctx || this.isMuted) return;

    try {
      const now = ctx.currentTime;
      // Vibrant 4-note ascending chord (Eb5 -> G5 -> Bb5 -> Eb6) with crystalline sparkle
      const notes = [
        { f: 622.25, t: 0, d: 0.3, g: 0.22 },     // Eb5
        { f: 783.99, t: 0.10, d: 0.35, g: 0.25 }, // G5
        { f: 932.33, t: 0.20, d: 0.45, g: 0.28 }, // Bb5
        { f: 1244.51, t: 0.32, d: 0.85, g: 0.32 } // Eb6
      ];

      notes.forEach(n => {
        this.playTone(n.f, 'sine', now + n.t, n.d, n.g, 0.015);
        this.playTone(n.f * 1.003, 'triangle', now + n.t, n.d * 0.75, n.g * 0.35, 0.02);
      });
    } catch {}
  }

  /**
   * Background System Notification with Sound
   */
  public triggerNotification(
    title: string, 
    body: string, 
    soundType: ActivityNotificationType | 'success' = 'success'
  ): void {
    // Play appropriate sound
    switch (soundType) {
      case 'zone_nurse_available':
        this.playZoneNurseAvailable();
        break;
      case 'medication_push_alert':
        this.playMedicationPushAlert();
        break;
      case 'nurse_signup':
      case 'system_alert':
        this.playBookingConfirmed();
        break;
      case 'visit_completed':
        this.playVisitCompleted();
        break;
      case 'visit_reminder_30min':
        this.play30MinReminder();
        break;
      case 'booking_confirmed':
        this.playGentleDing();
        this.playBookingConfirmed();
        break;
      case 'booking_request':
        this.playBookingRequest();
        break;
      case 'nurse_enroute':
        this.playNurseEnRoute();
        break;
      case 'nurse_arrived':
        this.playDoorbellAlert();
        break;
      case 'sos_emergency':
        this.playQuickSOSTone();
        break;
      case 'payment_confirmed':
        this.playPaymentConfirmed();
        break;
      case 'rating_received':
        this.playRatingReceived();
        break;
      case 'nurse_late':
        this.playNurseLateAlert();
        break;
      case 'time_up':
        this.playNurseTimeUp();
        break;
      case 'chat_message':
        this.playChatMessage();
        break;
      case 'incoming_call':
        this.playIncomingCall();
        break;
      case 'cancellation':
        this.playCancellation();
        break;
      case 'health_news':
        this.playHealthNews();
        break;
      default:
        this.playSuccessPing();
        break;
    }

    // Trigger browser Web Notification if user permitted
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        try {
          new Notification(title, {
            body,
            icon: '/icon.png',
            tag: 'wecare-alert',
          });
        } catch {
          // Fallback if Notification constructor fails
        }
      }
    }
  }

  public playSuccessChime(): void {
    this.playSuccessPing();
  }

  public playToggleClick(): void {
    this.playTabSwitch();
  }

  public playToggleSwitch(): void {
    this.playTabSwitch();
  }

  public playAvailabilityOnCall(): void {
    const ctx = this.getAudioContext();
    if (!ctx || this.isMuted) return;
    try {
      const now = ctx.currentTime;
      // Uplifting ascending chime indicating on-call readiness
      this.playTone(523.25, 'triangle', now, 0.18, 0.22); // C5
      this.playTone(659.25, 'sine', now + 0.12, 0.22, 0.25); // E5
      this.playTone(783.99, 'sine', now + 0.24, 0.35, 0.28); // G5
    } catch {}
  }

  public playAvailabilityOffline(): void {
    const ctx = this.getAudioContext();
    if (!ctx || this.isMuted) return;
    try {
      const now = ctx.currentTime;
      // Soft gentle descending chime indicating off-duty state
      this.playTone(587.33, 'sine', now, 0.2, 0.2); // D5
      this.playTone(440.00, 'sine', now + 0.14, 0.25, 0.2); // A4
      this.playTone(349.23, 'sine', now + 0.28, 0.3, 0.15); // F4
    } catch {}
  }

  public playCallConnecting(): void {
    const ctx = this.getAudioContext();
    if (!ctx || this.isMuted) return;
    try {
      const now = ctx.currentTime;
      this.playTone(440, 'sine', now, 0.4, 0.15);
      this.playTone(480, 'sine', now, 0.4, 0.15);
    } catch {}
  }

  public playCallHangup(): void {
    const ctx = this.getAudioContext();
    if (!ctx || this.isMuted) return;
    try {
      const now = ctx.currentTime;
      this.playTone(480, 'sine', now, 0.15, 0.2);
      this.playTone(400, 'sine', now + 0.18, 0.25, 0.2);
    } catch {}
  }

  public playMessageSent(): void {
    this.playChatMessageSent();
  }

  public playWarningSound(): void {
    this.playCancellation();
  }

  public playAlert(): void {
    this.playCancellation();
  }

  public playClick(): void {
    this.playTone(600, 'sine', (this.ctx?.currentTime || 0), 0.04, 0.08, 0.005);
  }

  public playDelightChime(): void {
    this.playSuccessPing();
  }

  public playStartSession(): void {
    const ctx = this.getAudioContext();
    if (!ctx || this.isMuted) return;
    try {
      const now = ctx.currentTime;
      this.playTone(523.25, 'triangle', now, 0.2, 0.15);
      this.playTone(659.25, 'triangle', now + 0.1, 0.25, 0.15);
    } catch {}
  }

  public playNotificationChime(): void {
    const ctx = this.getAudioContext();
    if (!ctx || this.isMuted) return;
    try {
      const now = ctx.currentTime;
      this.playTone(880, 'sine', now, 0.15, 0.15);
      this.playTone(1320, 'sine', now + 0.1, 0.25, 0.18);
    } catch {}
  }

  public playMicStart(): void {
    const ctx = this.getAudioContext();
    if (!ctx || this.isMuted) return;
    try {
      const now = ctx.currentTime;
      // Upbeat double-pip indicating microphone is live and listening
      this.playTone(523.25, 'sine', now, 0.08, 0.18); // C5
      this.playTone(783.99, 'sine', now + 0.09, 0.14, 0.2); // G5
    } catch {}
  }

  public playMicStop(): void {
    const ctx = this.getAudioContext();
    if (!ctx || this.isMuted) return;
    try {
      const now = ctx.currentTime;
      // Gentle descending completion chime
      this.playTone(659.25, 'sine', now, 0.08, 0.16); // E5
      this.playTone(440.00, 'sine', now + 0.09, 0.16, 0.18); // A4
    } catch {}
  }

  public playRadarPing(): void {
    const ctx = this.getAudioContext();
    if (!ctx || this.isMuted) return;
    try {
      const now = ctx.currentTime;
      // High sonar radar pulse with resonant decay
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1760, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.35);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    } catch {}
  }

  public playProximityAlert(): void {
    const ctx = this.getAudioContext();
    if (!ctx || this.isMuted) return;
    try {
      const now = ctx.currentTime;
      // Urgent double warning beep for proximity / vicinity (< 2 minutes threshold)
      this.playTone(987.77, 'triangle', now, 0.12, 0.22); // B5
      this.playTone(1318.51, 'triangle', now + 0.14, 0.22, 0.25); // E6
    } catch {}
  }

  public async requestNotificationPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) return false;
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch {
      return false;
    }
  }
}

export const soundFX = new SoundFXEngine();
