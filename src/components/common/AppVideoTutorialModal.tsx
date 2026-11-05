import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  CheckCircle2, 
  ShieldCheck, 
  Stethoscope, 
  ShoppingBag, 
  MapPin, 
  AlertTriangle, 
  Scan, 
  Sparkles, 
  Clock, 
  Maximize2, 
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  HelpCircle,
  FileText,
  User,
  Calendar,
  CreditCard,
  Bell,
  Check,
  QrCode,
  Smartphone,
  Navigation,
  Activity,
  Layers,
  Lock
} from 'lucide-react';
import { soundFX } from '../../utils/soundEffects';
import { WeCareTrackLogo } from './WeCareTrackLogo';

export interface AppVideoTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateView?: (view: string) => void;
  onOpenBooking?: () => void;
  onOpenStore?: () => void;
  onOpenFaceScanTutorial?: () => void;
  onOpenQRGuide?: () => void;
  initialMode?: 'client_booking' | 'nurse_confirm' | 'full_tour';
}

type VideoMode = 'client_booking' | 'nurse_confirm' | 'full_tour';

interface VideoStep {
  stepNumber: number;
  title: string;
  subtitle: string;
  durationSec: number;
  narrationText: string;
  screenType: 
    | 'client_select_procedure'
    | 'client_parish_address'
    | 'client_pick_nurse'
    | 'client_escrow_payment'
    | 'client_booking_secured'
    | 'nurse_dispatch_alert'
    | 'nurse_review_notes'
    | 'nurse_confirm_accept'
    | 'nurse_route_navigation'
    | 'nurse_doorstep_qr';
}

const CLIENT_BOOKING_STEPS: VideoStep[] = [
  {
    stepNumber: 1,
    title: 'Select Clinical Procedure',
    subtitle: 'Choose hospital-grade service needed (Wound Care, IV Therapy, Vitals)',
    durationSec: 6,
    narrationText: 'To secure a booking, start by selecting the procedure your patient or family member requires, such as sterile wound dressing or IV hydration.',
    screenType: 'client_select_procedure'
  },
  {
    stepNumber: 2,
    title: 'Enter Parish & Address',
    subtitle: 'Specify residence location across Kingston, St. Andrew or Portmore',
    durationSec: 6,
    narrationText: 'Next, enter your Jamaican parish and address. We Care Jamaica matches you with nurses within a 15 to 30 minute travel radius.',
    screenType: 'client_parish_address'
  },
  {
    stepNumber: 3,
    title: 'Choose Verified NCJ Nurse',
    subtitle: 'Compare licensed practitioner profiles, council badges & patient ratings',
    durationSec: 6,
    narrationText: 'Pick your preferred registered nurse. Every practitioner is 100% verified with the Nursing Council of Jamaica.',
    screenType: 'client_pick_nurse'
  },
  {
    stepNumber: 4,
    title: 'Escrow Payment Protection',
    subtitle: 'Select Card or Cash on Delivery (Held safely in escrow until arrival)',
    durationSec: 6,
    narrationText: 'Review your total in Jamaican dollars. Funds remain locked in platform escrow and are never released until your visit is complete.',
    screenType: 'client_escrow_payment'
  },
  {
    stepNumber: 5,
    title: 'Booking Secured & Live GPS',
    subtitle: 'Immediate confirmation with real-time nurse route dispatch & ETA',
    durationSec: 6,
    narrationText: 'Your booking is now secured! You will receive live GPS tracking, arrival doorbell alerts, and instant clinical continuity.',
    screenType: 'client_booking_secured'
  }
];

const NURSE_CONFIRM_STEPS: VideoStep[] = [
  {
    stepNumber: 1,
    title: 'Instant Dispatch Alert',
    subtitle: 'Nurse device sounds an audible chime with patient request & procedure',
    durationSec: 6,
    narrationText: 'On the nurse\'s side, when a patient books a visit, the practitioner phone chimes with a real-time dispatch alert.',
    screenType: 'nurse_dispatch_alert'
  },
  {
    stepNumber: 2,
    title: 'Review Medical Notes & Vitals',
    subtitle: 'Inspect procedure history, allergies, emergency contacts & parish map',
    durationSec: 6,
    narrationText: 'The nurse reviews the patient\'s clinical condition, required sterile supplies, and home address before accepting.',
    screenType: 'nurse_review_notes'
  },
  {
    stepNumber: 3,
    title: 'Accept & Confirm Booking',
    subtitle: 'One-tap confirmation locks 85% practitioner earnings payout in escrow',
    durationSec: 6,
    narrationText: 'With one tap, the nurse accepts and confirms the visit. The client is immediately notified that their nurse is confirmed.',
    screenType: 'nurse_confirm_accept'
  },
  {
    stepNumber: 4,
    title: 'GPS Route Navigation',
    subtitle: 'Turn-by-turn routing with live telemetry sent to patient household',
    durationSec: 6,
    narrationText: 'The nurse initiates turn-by-turn directions. The patient can watch the nurse\'s vehicle approach in real time.',
    screenType: 'nurse_route_navigation'
  },
  {
    stepNumber: 5,
    title: 'Doorstep Arrival QR Presentation',
    subtitle: 'Present secure Job QR Code for mutual check-in & clinical start',
    durationSec: 6,
    narrationText: 'Upon arrival, the nurse presents their encrypted QR badge. The client scans it to verify identity and unlock clinical charting.',
    screenType: 'nurse_doorstep_qr'
  }
];

export const AppVideoTutorialModal: React.FC<AppVideoTutorialModalProps> = ({
  isOpen,
  onClose,
  onNavigateView,
  onOpenBooking,
  onOpenStore,
  onOpenFaceScanTutorial,
  onOpenQRGuide,
  initialMode = 'client_booking'
}) => {
  const [activeMode, setActiveMode] = useState<VideoMode>(initialMode);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isAudioVoiceEnabled, setIsAudioVoiceEnabled] = useState<boolean>(false);
  const [progressSec, setProgressSec] = useState<number>(0);
  const timerRef = useRef<number | null>(null);

  const activeSteps = activeMode === 'nurse_confirm' ? NURSE_CONFIRM_STEPS : CLIENT_BOOKING_STEPS;
  const currentStep = activeSteps[currentStepIdx] || activeSteps[0];
  const totalDuration = activeSteps.reduce((acc, s) => acc + s.durationSec, 0);

  // Stop any active speech synthesis when closing or changing steps
  const stopVoiceNarration = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  // Speak narration text if audio is enabled
  const speakNarration = useCallback((text: string) => {
    if (!isAudioVoiceEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.05;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('SpeechSynthesis error:', e);
    }
  }, [isAudioVoiceEnabled]);

  // Sync mode changes
  useEffect(() => {
    setCurrentStepIdx(0);
    setProgressSec(0);
    setIsPlaying(true);
    stopVoiceNarration();
  }, [activeMode, stopVoiceNarration]);

  // Handle auto-advancing video timer
  useEffect(() => {
    if (!isOpen || !isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = window.setInterval(() => {
      setProgressSec(prev => {
        const next = prev + 1;
        const currentStepEndTime = activeSteps
          .slice(0, currentStepIdx + 1)
          .reduce((acc, s) => acc + s.durationSec, 0);

        if (next >= currentStepEndTime) {
          if (currentStepIdx < activeSteps.length - 1) {
            setCurrentStepIdx(c => c + 1);
            soundFX.playTabSwitch();
          } else {
            // Reached end of mode
            setIsPlaying(false);
          }
        }
        return next;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, isPlaying, currentStepIdx, activeSteps]);

  // Trigger narration on step change
  useEffect(() => {
    if (isOpen && currentStep && isPlaying) {
      speakNarration(currentStep.narrationText);
    }
  }, [currentStepIdx, isOpen, isPlaying, speakNarration, currentStep]);

  // Cleanup on close
  useEffect(() => {
    if (!isOpen) {
      stopVoiceNarration();
      setIsPlaying(false);
    }
  }, [isOpen, stopVoiceNarration]);

  const handleStepSelect = (idx: number) => {
    stopVoiceNarration();
    setCurrentStepIdx(idx);
    const startSec = activeSteps
      .slice(0, idx)
      .reduce((acc, s) => acc + s.durationSec, 0);
    setProgressSec(startSec);
    setIsPlaying(true);
    soundFX.playToggleClick();
  };

  const handleTogglePlay = () => {
    if (progressSec >= totalDuration) {
      setProgressSec(0);
      setCurrentStepIdx(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
      if (isPlaying) stopVoiceNarration();
    }
    soundFX.playToggleClick();
  };

  const handleToggleVoice = () => {
    const newState = !isAudioVoiceEnabled;
    setIsAudioVoiceEnabled(newState);
    if (!newState) {
      stopVoiceNarration();
    } else {
      speakNarration(currentStep.narrationText);
    }
    soundFX.playToggleClick();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl rounded-3xl bg-[#0c102c] border border-blue-500/40 text-white shadow-2xl overflow-hidden flex flex-col max-h-[95vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Top EKG line */}
        <div className="h-1 bg-gradient-to-r from-blue-600 via-amber-400 to-emerald-400" />

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-white/[0.03] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <WeCareTrackLogo variant="horizontal" size="sm" inverted={true} />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-white">
                  Step-by-Step App Video Walkthrough
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[10px] font-mono font-bold">
                  Interactive Simulation
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Real visual walkthrough: securing a patient booking &amp; nurse confirmation dispatch
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
            title="Close video guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Navigation Tabs (Zero-pill discipline) */}
        <div className="px-4 sm:px-6 pt-3 pb-2 border-b border-white/10 bg-white/[0.02] flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setActiveMode('client_booking')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeMode === 'client_booking'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-900/50'
                  : 'text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>1. Client: How to Secure a Booking</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMode('nurse_confirm')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeMode === 'nurse_confirm'
                  ? 'bg-blue-600 text-white font-black shadow-md shadow-blue-900/50'
                  : 'text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>2. Nurse: How to Confirm a Booking</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleToggleVoice}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold border transition ${
              isAudioVoiceEnabled 
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
            }`}
            title="Toggle spoken voice narration"
          >
            {isAudioVoiceEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>Voice Narration: {isAudioVoiceEnabled ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        {/* Video Player & Live Simulated UI Screen Container */}
        <div className="p-3 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Main Simulated Phone Screen Frame */}
          <div className="relative w-full rounded-2xl overflow-hidden bg-black border border-white/20 shadow-2xl flex flex-col justify-between min-h-[360px] sm:min-h-[420px]">
            {/* Top Video Status Overlay */}
            <div className="absolute top-3 inset-x-3 z-30 flex items-center justify-between text-xs pointer-events-none">
              <span className="px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-md text-amber-300 border border-white/10 font-mono font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span>STEP {currentStep.stepNumber} OF {activeSteps.length}: {currentStep.title.toUpperCase()}</span>
              </span>

              <span className="px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-md text-slate-300 border border-white/10 font-mono text-[11px]">
                {activeMode === 'client_booking' ? 'Client Mobile View' : 'Nurse Dispatch Terminal'}
              </span>
            </div>

            {/* Simulated Live UI Content corresponding to Step */}
            <div className="relative z-10 w-full flex-1 flex items-center justify-center p-4 sm:p-8 pt-12 sm:pt-14">
              {/* SCREEN 1: Client Select Procedure */}
              {currentStep.screenType === 'client_select_procedure' && (
                <div className="w-full max-w-md bg-[#13183d] border border-blue-500/30 rounded-2xl p-5 shadow-2xl space-y-3.5 animate-fadeIn">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="text-xs font-black text-white flex items-center gap-1.5">
                      <Stethoscope className="w-4 h-4 text-blue-400" />
                      <span>Select Required Service</span>
                    </span>
                    <span className="text-[10px] text-amber-400 font-mono">Step 1/5</span>
                  </div>

                  <div className="space-y-2">
                    <div className="p-3 rounded-xl bg-blue-600/30 border-2 border-blue-400 flex items-center justify-between shadow-md">
                      <div>
                        <h5 className="font-extrabold text-white text-xs">Post-Op Wound Care &amp; Dressing</h5>
                        <p className="text-[11px] text-slate-300">Sterile cleansing, diabetic ulcer care, gauze pack</p>
                      </div>
                      <span className="px-2 py-1 rounded-md bg-blue-500 text-white font-mono font-bold text-xs">
                        JMD $6,500
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between opacity-70">
                      <div>
                        <h5 className="font-bold text-white text-xs">IV Infusion &amp; Hydration</h5>
                        <p className="text-[10px] text-slate-400">Normal saline drip, antibiotic infusion</p>
                      </div>
                      <span className="text-xs font-mono text-slate-300">JMD $8,000</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between opacity-70">
                      <div>
                        <h5 className="font-bold text-white text-xs">Elderly Bedside Vitals Check</h5>
                        <p className="text-[10px] text-slate-400">Blood pressure, SPO2, glucose check</p>
                      </div>
                      <span className="text-xs font-mono text-slate-300">JMD $4,500</span>
                    </div>
                  </div>

                  <div className="pt-1 flex justify-end">
                    <span className="px-4 py-1.5 rounded-xl bg-[#F59E0B] text-slate-950 font-black text-xs flex items-center gap-1 shadow-md">
                      <span>Procedure Selected ✓</span>
                    </span>
                  </div>
                </div>
              )}

              {/* SCREEN 2: Client Parish & Address */}
              {currentStep.screenType === 'client_parish_address' && (
                <div className="w-full max-w-md bg-[#13183d] border border-blue-500/30 rounded-2xl p-5 shadow-2xl space-y-3.5 animate-fadeIn">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="text-xs font-black text-white flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-rose-400" />
                      <span>Patient Home Address</span>
                    </span>
                    <span className="text-[10px] text-amber-400 font-mono">Step 2/5</span>
                  </div>

                  <div className="space-y-2.5">
                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">Parish:</label>
                      <div className="p-2.5 rounded-xl bg-white/10 border border-amber-400/60 font-bold text-xs text-white flex items-center justify-between">
                        <span>Kingston &amp; St. Andrew</span>
                        <Check className="w-4 h-4 text-amber-400" />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">Street Address:</label>
                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/15 text-xs text-slate-200">
                        14 Hope Road, Half Way Tree, Kingston 10
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-[11px] text-emerald-300">
                      <ShieldCheck className="w-4 h-4 shrink-0" />
                      <span>GPS verified within verified 15–30 min nurse dispatch zone</span>
                    </div>
                  </div>
                </div>
              )}

              {/* SCREEN 3: Client Pick Verified Nurse */}
              {currentStep.screenType === 'client_pick_nurse' && (
                <div className="w-full max-w-md bg-[#13183d] border border-blue-500/30 rounded-2xl p-5 shadow-2xl space-y-3.5 animate-fadeIn">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="text-xs font-black text-white flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Choose Licensed NCJ Nurse</span>
                    </span>
                    <span className="text-[10px] text-amber-400 font-mono">Step 3/5</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-900/50 to-purple-900/40 border-2 border-emerald-400 space-y-2 shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400 flex items-center justify-center font-black text-amber-300 text-sm">
                        AS
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5">
                          <h5 className="font-extrabold text-white text-xs">Nurse Althea Sterling, RN</h5>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/20" />
                        </div>
                        <p className="text-[10px] text-blue-300 font-mono">NCJ #8942-B • 8 Yrs Critical Care</p>
                        <p className="text-[10px] text-amber-300 font-bold">★ 4.95 (84 visits in Kingston)</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-white/10 text-slate-300">
                      <span>ETA to your door: <strong>22 Mins</strong></span>
                      <span className="text-emerald-400 font-bold">Available Now</span>
                    </div>
                  </div>
                </div>
              )}

              {/* SCREEN 4: Client Escrow Payment */}
              {currentStep.screenType === 'client_escrow_payment' && (
                <div className="w-full max-w-md bg-[#13183d] border border-blue-500/30 rounded-2xl p-5 shadow-2xl space-y-3.5 animate-fadeIn">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="text-xs font-black text-white flex items-center gap-1.5">
                      <Lock className="w-4 h-4 text-amber-400" />
                      <span>Secure Escrow Checkout</span>
                    </span>
                    <span className="text-[10px] text-amber-400 font-mono">Step 4/5</span>
                  </div>

                  <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span>Clinical Visit &amp; Procedure:</span>
                      <span className="font-mono text-white font-bold">JMD $6,500</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Sterile Dressing Pack:</span>
                      <span className="font-mono text-white">Included</span>
                    </div>
                    <div className="flex justify-between text-slate-300 border-t border-white/10 pt-1 font-bold">
                      <span className="text-amber-300">Total Held in Escrow:</span>
                      <span className="font-mono text-emerald-400 text-sm">JMD $6,500</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-200 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>Payment is locked safely in escrow and is NOT paid to the nurse until you complete doorstep QR check-in.</span>
                  </div>

                  <button
                    type="button"
                    className="w-full py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs shadow-lg flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Confirm &amp; Secure Booking →</span>
                  </button>
                </div>
              )}

              {/* SCREEN 5: Client Booking Secured */}
              {currentStep.screenType === 'client_booking_secured' && (
                <div className="w-full max-w-md bg-[#13183d] border border-emerald-500/40 rounded-2xl p-5 shadow-2xl space-y-3.5 animate-fadeIn text-center">
                  <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-950/60">
                    <Check className="w-7 h-7 stroke-[3]" />
                  </div>

                  <div className="space-y-1">
                    <h5 className="font-black text-white text-base">Booking Confirmed &amp; Dispatched!</h5>
                    <p className="text-xs text-emerald-300">Nurse Althea Sterling is en route to your home.</p>
                  </div>

                  <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-xs space-y-1 text-slate-300 text-left">
                    <div className="flex justify-between">
                      <span>Booking ID:</span>
                      <span className="font-mono text-white font-bold">BK-JAM-8842</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Estimated Arrival:</span>
                      <span className="font-mono text-amber-300 font-bold">22 Mins</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400">
                    Ready your phone for the Doorstep Arrival QR check-in when the nurse knocks.
                  </div>
                </div>
              )}

              {/* NURSE SCREEN 1: Nurse Dispatch Alert */}
              {currentStep.screenType === 'nurse_dispatch_alert' && (
                <div className="w-full max-w-md bg-[#13183d] border border-amber-500/40 rounded-2xl p-5 shadow-2xl space-y-3.5 animate-fadeIn">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                      <Bell className="w-4 h-4 text-amber-400 animate-bounce" />
                      <span>Incoming Visit Dispatch Alert</span>
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded">
                      New Request
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-extrabold text-white text-xs">Patient: Mrs. Marjorie Campbell</h5>
                        <p className="text-[11px] text-slate-300">14 Hope Road, Kingston 10</p>
                      </div>
                      <span className="text-xs font-mono font-black text-emerald-400">JMD $5,525 (85%)</span>
                    </div>
                    <p className="text-[11px] text-amber-200">
                      Procedure: Sterile Wound Dressing (Post-Hip Surgery)
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Distance: 3.2 km</span>
                    <span>Response Window: <strong>5 Mins</strong></span>
                  </div>
                </div>
              )}

              {/* NURSE SCREEN 2: Review Notes */}
              {currentStep.screenType === 'nurse_review_notes' && (
                <div className="w-full max-w-md bg-[#13183d] border border-blue-500/30 rounded-2xl p-5 shadow-2xl space-y-3.5 animate-fadeIn">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="text-xs font-black text-white flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-blue-400" />
                      <span>Review Clinical Notes &amp; Supplies</span>
                    </span>
                    <span className="text-[10px] text-blue-300 font-mono">Clinical Pre-Check</span>
                  </div>

                  <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-2 text-xs text-slate-300">
                    <div>
                      <strong className="text-white block">Medical History:</strong>
                      <span>Type 2 Diabetes, Penicillin Allergy, Hypertensive.</span>
                    </div>
                    <div>
                      <strong className="text-white block">Required PPE &amp; Pack:</strong>
                      <span>Nitrile sterile gloves, saline wash, hydrocolloid dressing.</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Supplies confirmed in practitioner medical bag</span>
                  </div>
                </div>
              )}

              {/* NURSE SCREEN 3: Confirm & Accept */}
              {currentStep.screenType === 'nurse_confirm_accept' && (
                <div className="w-full max-w-md bg-[#13183d] border border-emerald-500/40 rounded-2xl p-5 shadow-2xl space-y-3.5 animate-fadeIn text-center">
                  <div className="space-y-1">
                    <h5 className="font-black text-white text-sm">Lock Booking &amp; Begin Route</h5>
                    <p className="text-xs text-slate-300">Confirming reserves your 85% visit fee in Jamaican escrow.</p>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1.5">
                    <div className="text-xs text-slate-300">Your Net Earnings:</div>
                    <div className="text-xl font-mono font-black text-emerald-400">JMD $5,525.00</div>
                    <div className="text-[10px] text-slate-400">Paid directly to your Jamaican bank or NCB account</div>
                  </div>

                  <button
                    type="button"
                    className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg transition flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>ACCEPT &amp; CONFIRM BOOKING</span>
                  </button>
                </div>
              )}

              {/* NURSE SCREEN 4: Route Navigation */}
              {currentStep.screenType === 'nurse_route_navigation' && (
                <div className="w-full max-w-md bg-[#13183d] border border-blue-500/30 rounded-2xl p-5 shadow-2xl space-y-3.5 animate-fadeIn">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="text-xs font-black text-white flex items-center gap-1.5">
                      <Navigation className="w-4 h-4 text-blue-400 animate-pulse" />
                      <span>Live GPS Route Navigation</span>
                    </span>
                    <span className="text-[10px] font-mono text-amber-300">In Transit</span>
                  </div>

                  <div className="h-28 rounded-xl bg-slate-950 border border-white/10 flex flex-col items-center justify-center relative overflow-hidden text-center p-3">
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:12px_12px]" />
                    <MapPin className="w-6 h-6 text-rose-500 animate-bounce" />
                    <span className="text-xs font-bold text-white relative z-10 mt-1">14 Hope Road, Kingston 10</span>
                    <span className="text-[10px] font-mono text-emerald-400 relative z-10">ETA: 18 Minutes (Light Traffic on Waterloo Rd)</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-[11px] text-slate-300 flex justify-between">
                    <span>Patient Telemetry:</span>
                    <span className="text-emerald-400 font-bold">Connected • Real-time Location Active</span>
                  </div>
                </div>
              )}

              {/* NURSE SCREEN 5: Doorstep QR Presentation */}
              {currentStep.screenType === 'nurse_doorstep_qr' && (
                <div className="w-full max-w-md bg-[#13183d] border border-amber-500/40 rounded-2xl p-5 shadow-2xl space-y-3 animate-fadeIn text-center">
                  <div className="space-y-0.5">
                    <h5 className="font-black text-white text-sm">Present Doorstep Arrival QR</h5>
                    <p className="text-[11px] text-slate-300">Client scans code with their smartphone camera</p>
                  </div>

                  <div className="w-32 h-32 mx-auto p-2 bg-white rounded-xl shadow-lg flex items-center justify-center">
                    <QrCode className="w-full h-full text-slate-950" />
                  </div>

                  <div className="p-2 rounded-xl bg-black/40 border border-white/10 text-[11px] font-mono text-amber-300">
                    BK-JAM-8842 • PIN: 7491
                  </div>

                  <div className="text-[11px] text-emerald-300 font-bold flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mutual scan verifies visit &amp; starts clinical timer</span>
                  </div>
                </div>
              )}
            </div>

            {/* Narration Subtitle Bar at Bottom of Video */}
            <div className="relative z-20 px-4 py-2.5 bg-black/90 border-t border-white/15 flex items-center gap-2">
              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold shrink-0">
                AUDIO / NARRATOR
              </span>
              <p className="text-xs text-slate-200 line-clamp-1 italic">
                "{currentStep.narrationText}"
              </p>
            </div>
          </div>

          {/* Video Scrubbing & Playback Controls Bar */}
          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col gap-2.5">
            {/* Timeline Step Indicators */}
            <div className="grid grid-cols-5 gap-1.5">
              {activeSteps.map((step, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleStepSelect(idx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    idx === currentStepIdx
                      ? 'bg-amber-400 shadow-sm shadow-amber-400/80 ring-2 ring-amber-400/30'
                      : idx < currentStepIdx
                      ? 'bg-emerald-400'
                      : 'bg-white/15 hover:bg-white/30'
                  }`}
                  title={`Step ${step.stepNumber}: ${step.title}`}
                />
              ))}
            </div>

            {/* Play/Pause & Step Buttons */}
            <div className="flex items-center justify-between text-xs text-slate-300 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTogglePlay}
                  className="px-3.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white transition cursor-pointer flex items-center gap-1.5 font-bold"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-emerald-400" />}
                  <span>{isPlaying ? 'Pause' : 'Play Walkthrough'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleStepSelect(Math.max(0, currentStepIdx - 1))}
                  disabled={currentStepIdx === 0}
                  className="p-1.5 rounded-xl hover:bg-white/10 text-slate-300 disabled:opacity-30 cursor-pointer"
                  title="Previous Step"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleStepSelect(Math.min(activeSteps.length - 1, currentStepIdx + 1))}
                  disabled={currentStepIdx === activeSteps.length - 1}
                  className="p-1.5 rounded-xl hover:bg-white/10 text-slate-300 disabled:opacity-30 cursor-pointer"
                  title="Next Step"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleStepSelect(0)}
                  className="p-1.5 rounded-xl hover:bg-white/10 text-slate-300 cursor-pointer"
                  title="Restart Walkthrough"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Direct feature jump links */}
              <div className="flex items-center gap-2">
                {onOpenQRGuide && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenQRGuide();
                    }}
                    className="px-2.5 py-1 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 border border-blue-400/30 text-[11px] font-bold transition flex items-center gap-1"
                  >
                    <QrCode className="w-3 h-3 text-blue-400" />
                    <span>QR Guide</span>
                  </button>
                )}

                {onOpenBooking && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenBooking();
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition flex items-center gap-1"
                  >
                    <span>Book a Nurse Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
