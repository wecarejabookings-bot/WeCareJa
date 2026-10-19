/**
 * We Care Jamaica - AI Emergency Voice Police Dispatch Service
 * Handles speech synthesis, emergency script construction, phonetic GPS coordinates readout,
 * radio chirps, and countdown failsafe when a distressed user cannot speak to police.
 */

import { soundFX } from '../utils/soundEffects';

export interface EmergencyVoiceScriptParams {
  userRole: 'client' | 'nurse' | 'admin';
  userName?: string;
  lat: number;
  lng: number;
  address?: string;
  nearestStationName?: string;
  nearestStationDistanceKm?: number;
}

export interface EmergencyVoiceScriptResult {
  fullText: string;
  shortText: string;
  phoneticCoordinates: string;
  smsBody: string;
  roleDescription: string;
  resolvedName: string;
  resolvedAddress: string;
}

/**
 * Format human-readable & phonetic coordinates for radio clarity
 */
export function formatPhoneticCoordinates(lat: number, lng: number): string {
  const latStr = lat.toFixed(4);
  const lngStr = lng.toFixed(4);

  const digitToWord: Record<string, string> = {
    '0': 'zero',
    '1': 'one',
    '2': 'two',
    '3': 'three',
    '4': 'four',
    '5': 'five',
    '6': 'six',
    '7': 'seven',
    '8': 'eight',
    '9': 'nine',
    '.': 'point',
    '-': 'negative'
  };

  const latWords = latStr.split('').map(c => digitToWord[c] || c).join(' ');
  const lngWords = lngStr.split('').map(c => digitToWord[c] || c).join(' ');

  return `Latitude ${latWords} North, Longitude ${lngWords} West`;
}

/**
 * Build the full emergency police dispatch script conforming strictly to requirements:
 * 1. Specifies WeCareJa.care (w-e-c-a-r-e-j-a dot c-a-r-e)
 * 2. Specifies the user's name registered on the app
 * 3. Specifies the user's address registered on the app
 * 4. Specifies the exact user role (Patient / Registered Nurse / Administrator)
 * 5. States that they are in distress and need the urgent assistance of the police
 * 6. States their location according to their exact GPS coordinates
 */
export function buildPoliceVoiceEmergencyScript(params: EmergencyVoiceScriptParams): EmergencyVoiceScriptResult {
  const { userRole, userName, lat, lng, address, nearestStationName, nearestStationDistanceKm } = params;

  let roleDescription = 'Registered Patient and Healthcare Client';
  let shortRole = 'Client';
  if (userRole === 'nurse') {
    roleDescription = 'Registered Nurse and Clinical Healthcare Provider';
    shortRole = 'Nurse';
  } else if (userRole === 'admin') {
    roleDescription = 'Lead Healthcare Operations Administrator';
    shortRole = 'Admin';
  }

  const roundedLat = lat.toFixed(4);
  const roundedLng = lng.toFixed(4);
  const phoneticCoords = formatPhoneticCoordinates(lat, lng);

  const resolvedName = userName?.trim() || (userRole === 'nurse' ? 'Nurse Healthcare Provider' : userRole === 'admin' ? 'Lead Administrator' : 'Patient Client');
  const resolvedAddress = address?.trim() || 'Kingston & St. Andrew, Jamaica';

  const stationRef = nearestStationName 
    ? `Reference police station: ${nearestStationName}${nearestStationDistanceKm !== undefined ? ` located approximately ${nearestStationDistanceKm} kilometers away` : ''}. `
    : '';

  const fullText = 
    `Attention Jamaica Constabulary Force 119 and Emergency Police Dispatch. ` +
    `This is an automated emergency distress broadcast from WeCareJa.care, spelled W-E-C-A-R-E-J-A dot C-A-R-E. ` +
    `The user is in distress, unable to speak, and needs the urgent assistance of the police immediately. ` +
    `The reporting user's name on the app is: ${resolvedName}. ` +
    `User account role: ${roleDescription}. ` +
    `The user's registered address on the app is: ${resolvedAddress}. ` +
    `Their exact location according to real-time GPS coordinates is: Latitude ${roundedLat} degrees North, Longitude ${roundedLng} degrees West. ` +
    `${phoneticCoords}. ` +
    `${stationRef}` +
    `Repeating emergency identification for police units: ` +
    `User name on the app: ${resolvedName}. ` +
    `Address on the app: ${resolvedAddress}. ` +
    `The ${shortRole} is in acute distress and requires urgent police tactical intervention at coordinates ${roundedLat}, ${roundedLng}. ` +
    `Please dispatch an emergency police response unit to ${resolvedName} at ${resolvedAddress} immediately.`;

  const shortText = 
    `Automated Emergency Distress Broadcast from WeCareJa.care: User Name: "${resolvedName}" (${roleDescription}) at registered app address "${resolvedAddress}" is in severe distress and unable to speak. Urgent police assistance required at Coordinates: ${roundedLat}, ${roundedLng}.`;

  const smsBody = 
    `🚨 WECAREJA.CARE EMERGENCY POLICE ALERT: ${resolvedName} (${roleDescription}) is in severe distress and needs urgent police response! Address on app: ${resolvedAddress}. GPS: ${roundedLat}, ${roundedLng}. Map: https://maps.google.com/?q=${roundedLat},${roundedLng}`;

  return {
    fullText,
    shortText,
    phoneticCoordinates: phoneticCoords,
    smsBody,
    roleDescription,
    resolvedName,
    resolvedAddress
  };
}

class AIEmergencyVoiceService {
  private keepAliveInterval: any = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isCurrentlySpeaking: boolean = false;

  /**
   * Play high-urgency radio pre-chirp via Web Audio API before AI voice speaks
   */
  public playPoliceRadioPreChirp(): void {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // Two-tone tactical police radio burst (1200Hz + 850Hz)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(1200, now);
      osc1.frequency.exponentialRampToValueAtTime(1800, now + 0.12);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(850, now);
      osc2.frequency.exponentialRampToValueAtTime(1400, now + 0.12);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.25);
      osc2.stop(now + 0.25);
    } catch {
      // Fallback to quick sound FX tone
      soundFX.playQuickSOSTone();
    }
  }

  /**
   * Speak emergency script using window.speechSynthesis
   */
  public speakEmergencyScript(
    text: string,
    options: {
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (err: any) => void;
      onBoundary?: (charIndex: number) => void;
      preferredVoice?: 'female' | 'male';
      rate?: number;
      pitch?: number;
      volume?: number;
    } = {}
  ): boolean {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('SpeechSynthesis is not supported in this browser environment');
      return false;
    }

    try {
      this.stop();

      // Play tactical audio chirp first
      this.playPoliceRadioPreChirp();

      const utterance = new SpeechSynthesisUtterance(text);
      this.currentUtterance = utterance;

      utterance.rate = options.rate ?? 0.92; // Deliberate, clear cadence for emergency communications
      utterance.pitch = options.pitch ?? 1.05;
      utterance.volume = options.volume ?? 1.0;

      // Select high-quality English voice if available
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        let selectedVoice = voices.find(v => 
          (options.preferredVoice === 'male' 
            ? /male|david|george|alex|daniel/i.test(v.name)
            : /female|samantha|karen|victoria|zira|natural/i.test(v.name)) && 
          v.lang.startsWith('en')
        );

        if (!selectedVoice) {
          selectedVoice = voices.find(v => v.lang.startsWith('en-US') || v.lang.startsWith('en-GB') || v.lang.startsWith('en'));
        }

        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      }

      utterance.onstart = () => {
        this.isCurrentlySpeaking = true;
        options.onStart?.();

        // Chrome SpeechSynthesis keep-alive workaround for long utterances
        this.clearKeepAlive();
        this.keepAliveInterval = setInterval(() => {
          if (window.speechSynthesis.speaking) {
            window.speechSynthesis.pause();
            window.speechSynthesis.resume();
          }
        }, 8000);
      };

      utterance.onend = () => {
        this.isCurrentlySpeaking = false;
        this.clearKeepAlive();
        options.onEnd?.();
      };

      utterance.onerror = (e) => {
        this.isCurrentlySpeaking = false;
        this.clearKeepAlive();
        options.onError?.(e);
      };

      if (options.onBoundary) {
        utterance.onboundary = (e) => {
          options.onBoundary?.(e.charIndex);
        };
      }

      window.speechSynthesis.speak(utterance);
      return true;
    } catch (err) {
      console.error('Speech synthesis initiation error:', err);
      this.clearKeepAlive();
      options.onError?.(err);
      return false;
    }
  }

  public stop(): void {
    this.clearKeepAlive();
    this.isCurrentlySpeaking = false;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
  }

  public pause(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.pause();
      } catch {}
    }
  }

  public resume(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.resume();
      } catch {}
    }
  }

  public isSpeaking(): boolean {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false;
    return window.speechSynthesis.speaking || this.isCurrentlySpeaking;
  }

  private clearKeepAlive(): void {
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }
  }
}

export const aiEmergencyVoice = new AIEmergencyVoiceService();
