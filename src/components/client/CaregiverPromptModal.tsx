import React, { useState, useEffect } from 'react';
import { Booking, NurseProfile, ActivityNotificationType } from '../../types';
import { soundFX } from '../../utils/soundEffects';
import { QRCodeSVG } from 'qrcode.react';
import { generateVisitQRPayload, getArrivalPassCode } from '../../utils/arrivalVerification';
import { 
  CheckCircle2, 
  Clock, 
  RefreshCw, 
  QrCode, 
  ShieldCheck, 
  X, 
  Sparkles, 
  Star, 
  MapPin, 
  Phone, 
  ArrowRight, 
  MessageSquare,
  Copy,
  Check,
  Lock,
  UserCheck,
  AlertCircle,
  Calendar,
  CreditCard,
  PhoneCall,
  Navigation,
  FileCheck2,
  Minimize2
} from 'lucide-react';
import confetti from 'canvas-confetti';

export type PromptModalType = 'dispatched' | 'rerouted' | 'accepted';

interface CaregiverPromptModalProps {
  isOpen: boolean;
  type: PromptModalType;
  booking: Booking;
  nurse?: NurseProfile | null;
  nurses?: NurseProfile[];
  onClose: () => void;
  onViewArrivalQR?: () => void;
  onOpenChat?: () => void;
  onRerouteBooking?: (bookingId: string, reason?: string, preferredNurseId?: string) => void;
  onUpdateBookingStatus?: (bookingId: string, status: Booking['status'], clinicalNotes?: any, additionalData?: Partial<Booking>) => void;
  onTriggerNotification?: (type: ActivityNotificationType, title: string, description: string, bookingId?: string) => void;
}

export const CaregiverPromptModal: React.FC<CaregiverPromptModalProps> = ({
  isOpen,
  type,
  booking,
  nurse,
  nurses = [],
  onClose,
  onViewArrivalQR,
  onOpenChat,
  onRerouteBooking,
  onUpdateBookingStatus,
  onTriggerNotification
}) => {
  const [currentViewType, setCurrentViewType] = useState<PromptModalType>(type);
  const [copiedPin, setCopiedPin] = useState(false);
  const [isRerouting, setIsRerouting] = useState(false);

  // Sync current view type with external type prop
  useEffect(() => {
    setCurrentViewType(type);
  }, [type]);

  const timeoutLimit = booking.acceptanceTimeoutSeconds || 120;

  // Real-time countdown calculation
  const calculateRemaining = () => {
    const sentTime = booking.requestSentAt || booking.createdAt;
    if (!sentTime) return timeoutLimit;
    const elapsed = Math.floor((Date.now() - new Date(sentTime).getTime()) / 1000);
    return Math.max(0, timeoutLimit - (elapsed >= 0 ? elapsed : 0));
  };

  const [remainingSeconds, setRemainingSeconds] = useState<number>(calculateRemaining);

  // Reset ticker on booking or view type change
  useEffect(() => {
    setRemainingSeconds(calculateRemaining());
    setIsRerouting(false);
  }, [booking.id, booking.requestSentAt, booking.nurseId, currentViewType]);

  // Live interval ticker for dispatched/rerouted states
  useEffect(() => {
    if (!isOpen || currentViewType === 'accepted' || booking.nurseAccepted) return;

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          return 0;
        }
        if (prev <= 5) {
          soundFX.playCountdownTick(false);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, currentViewType, booking.nurseAccepted]);

  // Handle timeout expiration cleanly in an effect without updating parent during render
  useEffect(() => {
    if (
      isOpen &&
      remainingSeconds === 0 &&
      currentViewType !== 'accepted' &&
      !booking.nurseAccepted &&
      !isRerouting
    ) {
      setIsRerouting(true);
      if (onRerouteBooking) {
        onRerouteBooking(
          booking.id,
          'Acceptance window expired (2m) - auto-cascaded to next practitioner'
        );
      }
      setCurrentViewType('rerouted');
    }
  }, [remainingSeconds, isOpen, currentViewType, booking.nurseAccepted, isRerouting, onRerouteBooking, booking.id]);

  if (!isOpen || !booking) return null;

  const assignedNurse = nurse || nurses.find(n => n.id === booking.nurseId) || {
    id: booking.nurseId,
    name: booking.nurseName || 'Assigned Caregiver',
    photoUrl: booking.nursePhoto || 'https://images.unsplash.com/photo-1594824813533-91c1ddab680c?auto=format&fit=crop&q=80&w=300',
    phone: booking.nursePhone || '+1 (876) 555-0100',
    careLevel: 'registered_nurse',
    rating: 4.95,
    reviewsCount: 142,
    nursingCouncilLicense: 'NCJ-RN-8849',
    zones: [booking.zone || 'Kingston 6'],
    yearsExperience: 8
  };

  const isUrgent = remainingSeconds <= 12;
  const progressPercent = Math.min(100, Math.max(0, (remainingSeconds / timeoutLimit) * 100));
  const passCode = getArrivalPassCode(booking);
  const qrPayload = generateVisitQRPayload(booking, 'check_in');

  // Handle direct demo acceptance right inside takeover
  const handleSimulateAccept = () => {
    soundFX.playBookingConfirmed();
    confetti({
      particleCount: 120,
      spread: 85,
      origin: { y: 0.5 },
      colors: ['#1E1B4B', '#10B981', '#FFD166', '#4CC9F0']
    });

    if (onUpdateBookingStatus) {
      onUpdateBookingStatus(booking.id, 'accepted', undefined, {
        nurseAccepted: true,
        nurseAcceptedAt: new Date().toISOString()
      });
    }

    if (onTriggerNotification) {
      onTriggerNotification(
        'booking_confirmed',
        'Caregiver Accepted & Visit Activated!',
        `${assignedNurse.name} confirmed your visit request #${(booking?.id || '').slice(0, 8)}. Doorstep arrival QR pass is active!`,
        booking.id
      );
    }

    setCurrentViewType('accepted');
  };

  // Handle direct manual reroute
  const handleManualReroute = () => {
    soundFX.playToggleClick();
    if (onRerouteBooking) {
      setIsRerouting(true);
      onRerouteBooking(booking.id, 'Client initiated manual caregiver transfer');
      setCurrentViewType('rerouted');
    }
  };

  const handleCopyPin = () => {
    navigator.clipboard?.writeText(passCode);
    setCopiedPin(true);
    soundFX.playSuccessPing();
    setTimeout(() => setCopiedPin(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] w-full h-full bg-slate-950/98 backdrop-blur-2xl text-white overflow-y-auto flex flex-col justify-between animate-fadeIn">
      {/* Dynamic Background Ambient Lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute -top-40 -right-40 w-96 h-96 rounded-full blur-[140px] opacity-40 transition-colors duration-1000 ${
          currentViewType === 'accepted' ? 'bg-emerald-500' : 'bg-purple-600'
        }`} />
        <div className={`absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-[140px] opacity-30 transition-colors duration-1000 ${
          currentViewType === 'accepted' ? 'bg-teal-500' : 'bg-amber-500'
        }`} />
      </div>

      {/* TOP FULLSCREEN HUD HEADER */}
      <header className="relative z-20 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-[11px] font-bold text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Jamaica Clinical Dispatch</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
            <span>•</span>
            <span className="text-slate-300 font-mono font-bold">Visit #{(booking?.id || '').slice(0, 8)}</span>
            <span>•</span>
            <span className="text-purple-300 font-semibold">{booking?.serviceName}</span>
          </div>
        </div>

        {/* Status Pill & Minimize Control */}
        <div className="flex items-center gap-3">
          {currentViewType === 'accepted' ? (
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Visit Activated &amp; Locked</span>
            </span>
          ) : (
            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border shadow-sm ${
              isUrgent 
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse' 
                : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
            }`}>
              <Clock className="w-3.5 h-3.5 animate-spin-slow" />
              <span>{remainingSeconds}s Acceptance Window</span>
            </span>
          )}

          <button
            type="button"
            onClick={onClose}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-white/10"
            title="Minimize to dashboard (caregiver dispatch continues in background)"
          >
            <Minimize2 className="w-4 h-4" />
            <span className="hidden sm:inline">Minimize View</span>
          </button>
        </div>
      </header>

      {/* MAIN FULLSCREEN TAKE-OVER BODY */}
      <main className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-10 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
          
          {/* LEFT COLUMN: HERO, STATUS & ACTIONS (lg:col-span-7) */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            
            {/* HERO BLOCK */}
            <div className="space-y-3">
              {currentViewType === 'accepted' ? (
                <>
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>Caregiver Confirmed &bull; Doorstep Pass Unlocked</span>
                  </div>
                  <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight">
                    Visit Formally Activated with {assignedNurse.name}!
                  </h1>
                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                    Your practitioner has reviewed patient requirements, accepted the assignment, and is en route to <strong>{booking.clientAddress || booking.zone}</strong>.
                  </p>
                </>
              ) : currentViewType === 'rerouted' ? (
                <>
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-black uppercase tracking-wider">
                    <RefreshCw className="w-4 h-4 text-purple-400 animate-spin-slow" />
                    <span>Auto-Cascaded to Next Caregiver</span>
                  </div>
                  <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight">
                    Visit Request Transferred to {assignedNurse.name}
                  </h1>
                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                    The previous practitioner was engaged on emergency duty. Your request has zero wait delay and automatically transferred to this vetted practitioner in <strong>{booking.zone}</strong>.
                  </p>
                </>
              ) : (
                <>
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black uppercase tracking-wider">
                    <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                    <span>Request Dispatched &bull; Awaiting Acceptance</span>
                  </div>
                  <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight">
                    Request Dispatched to {assignedNurse.name}
                  </h1>
                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                    Under Jamaican clinical standards, visiting practitioners must review clinical details and confirm arrival readiness before activation.
                  </p>
                </>
              )}
            </div>

            {/* COUNTDOWN OR ACCEPTANCE TIMELINE HUD */}
            {currentViewType !== 'accepted' ? (
              <div className="p-5 sm:p-6 rounded-3xl bg-white/[0.04] border border-amber-500/30 backdrop-blur-xl space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-14 h-12 rounded-2xl flex items-center justify-center font-mono font-black text-sm border shadow-lg ${
                      isUrgent 
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse' 
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}>
                      {Math.floor(remainingSeconds / 60)}:{remainingSeconds % 60 < 10 ? '0' : ''}{remainingSeconds % 60}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white">
                        Automatic Caregiver Cascade
                      </h4>
                      <p className="text-xs text-slate-300">
                        Transfers to next available practitioner if unconfirmed in {Math.floor(remainingSeconds / 60)}:{remainingSeconds % 60 < 10 ? '0' : ''}{remainingSeconds % 60}.
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full bg-black/40 border border-white/10 text-[10px] font-mono font-bold text-amber-300">
                    2m Protocol
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-black/60 h-2.5 rounded-full overflow-hidden border border-white/10 p-0.5">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ease-linear ${
                      isUrgent 
                        ? 'bg-gradient-to-r from-rose-500 to-amber-500 animate-pulse' 
                        : 'bg-gradient-to-r from-emerald-400 via-amber-400 to-purple-500'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {/* Reassurance Guarantee Note */}
                <div className="p-3 rounded-2xl bg-black/30 border border-white/5 text-xs text-slate-300 flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed text-[11px]">
                    <strong>Patient Safety Guarantee:</strong> Escrow payment is held secure. Your card or Lynk wallet is only charged upon verified visit completion.
                  </p>
                </div>
              </div>
            ) : (
              /* LIVE 5-STAGE TRANSIT TIMELINE FOR ACCEPTED */
              <div className="p-5 sm:p-6 rounded-3xl bg-white/[0.04] border border-emerald-500/30 backdrop-blur-xl space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <h4 className="text-sm font-black text-white">Live Care Session Progress</h4>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    Step 2 of 5 Completed
                  </span>
                </div>

                {/* Stages */}
                <div className="grid grid-cols-4 gap-2 pt-1 text-center">
                  <div className="p-2.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/40">
                    <Check className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                    <span className="text-[10px] font-bold text-emerald-200 block">1. Booked</span>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/40">
                    <Check className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                    <span className="text-[10px] font-bold text-emerald-200 block">2. Accepted</span>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-purple-950/60 border border-purple-500/40 animate-pulse">
                    <Navigation className="w-4 h-4 text-purple-300 mx-auto mb-1" />
                    <span className="text-[10px] font-bold text-purple-200 block">3. En Route</span>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-black/40 border border-white/10 opacity-70">
                    <QrCode className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                    <span className="text-[10px] font-bold text-slate-400 block">4. Doorstep Pass</span>
                  </div>
                </div>
              </div>
            )}

            {/* INTERACTIVE ACTION BUTTONS */}
            <div className="space-y-3 pt-2">
              {currentViewType === 'accepted' ? (
                <div className="flex flex-col sm:flex-row gap-3">
                  {onOpenChat && (
                    <button
                      type="button"
                      onClick={() => {
                        soundFX.playToggleClick();
                        onClose();
                        onOpenChat();
                      }}
                      className="flex-1 py-3.5 px-5 rounded-2xl bg-gradient-to-r from-purple-600 to-[#1E1B4B] hover:opacity-95 text-white font-black text-xs transition shadow-lg shadow-purple-950/60 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Chat with {assignedNurse.name.split(' ')[0]}</span>
                    </button>
                  )}

                  <a
                    href={`tel:${assignedNurse.phone}`}
                    className="flex-1 py-3.5 px-5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs transition flex items-center justify-center gap-2 text-center"
                  >
                    <PhoneCall className="w-4 h-4 text-emerald-400" />
                    <span>Call Caregiver</span>
                  </a>

                  <button
                    type="button"
                    onClick={onClose}
                    className="py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition shadow-lg shadow-emerald-950/50 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Done &bull; View Dashboard</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Manual Re-route Button */}
                  <button
                    type="button"
                    onClick={handleManualReroute}
                    disabled={isRerouting}
                    className="flex-1 py-3.5 px-5 rounded-2xl bg-purple-900/60 hover:bg-purple-800 border border-purple-400/40 text-purple-200 hover:text-white font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    title="Skip countdown and transfer to next caregiver now"
                  >
                    <RefreshCw className={`w-4 h-4 ${isRerouting ? 'animate-spin' : ''}`} />
                    <span>Re-route to Next Caregiver</span>
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="py-3.5 px-4 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-bold text-xs transition cursor-pointer"
                  >
                    <span>Minimize</span>
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* RIGHT COLUMN: CAREGIVER CARD, DOORSTEP QR & VISIT DETAILS (lg:col-span-5) */}
          <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
            
            {/* CAREGIVER PROFILE CARD */}
            <div className="p-5 rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-xl space-y-3.5">
              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  <img
                    src={assignedNurse.photoUrl}
                    alt={assignedNurse.name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-purple-400/50 shadow-md"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-950" title="Online & On-Call" />
                </div>

                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-white text-base truncate">
                      {assignedNurse.name}
                    </h3>
                    <span title="NCJ Verified">
                      <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    </span>
                  </div>
                  <p className="text-xs text-purple-300 font-semibold truncate">
                    {assignedNurse.careLevel === 'registered_nurse' ? 'Registered Nurse (RN)' : 'Certified Geriatric Caregiver'}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <span className="flex items-center gap-1 text-amber-400 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{assignedNurse.rating || 4.9}</span>
                    </span>
                    <span>&bull;</span>
                    <span className="text-slate-400">{((assignedNurse as any).reviewCount || (assignedNurse as any).reviewsCount || 120)}+ visits</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 grid grid-cols-2 gap-2 text-xs text-slate-300">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">{booking.zone}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span className="truncate">NCJ Licensed</span>
                </div>
              </div>
            </div>

            {/* DOORSTEP VERIFICATION PASS (ACTIVE OR PREVIEW) */}
            <div className={`p-5 rounded-3xl border backdrop-blur-xl text-center space-y-3 transition-all ${
              currentViewType === 'accepted' 
                ? 'bg-emerald-950/30 border-emerald-500/50 shadow-emerald-950/40 shadow-xl' 
                : 'bg-white/[0.02] border-white/10 opacity-80'
            }`}>
              {currentViewType === 'accepted' ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                      <QrCode className="w-4 h-4 text-emerald-400" />
                      <span>Doorstep Arrival Pass Active</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold">
                      Anti-Fraud Secure
                    </span>
                  </div>

                  {/* QR SVG Display */}
                  <div className="bg-white p-3.5 rounded-2xl inline-block shadow-lg mx-auto">
                    <QRCodeSVG
                      value={qrPayload}
                      size={150}
                      level="H"
                      includeMargin={false}
                    />
                  </div>

                  {/* 4-Digit Security PIN */}
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Doorstep Security Verification Code
                    </span>
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-black/60 border border-emerald-500/40">
                      <span className="font-mono font-black text-lg text-emerald-300 tracking-widest">
                        {passCode}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyPin}
                        className="p-1 rounded-md text-slate-400 hover:text-white transition"
                        title="Copy PIN"
                      >
                        {copiedPin ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Show this QR code to {assignedNurse.name} at your door to authenticate identity and initiate synchronized clinical visit timing.
                  </p>
                </>
              ) : (
                <div className="py-6 space-y-2.5">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 text-amber-400 flex items-center justify-center mx-auto">
                    <Lock className="w-6 h-6 animate-pulse" />
                  </div>
                  <h5 className="font-black text-white text-sm">
                    Doorstep Pass Locked
                  </h5>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    Unlocks automatically the moment the caregiver confirms acceptance. Contains your encrypted arrival verification PIN.
                  </p>
                </div>
              )}
            </div>

            {/* VISIT SUMMARY STRIP */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-xs space-y-2">
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-purple-400" />
                  <span>Scheduled:</span>
                </span>
                <span className="font-bold text-white">
                  {new Date(booking.scheduledDateTime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Total Escrow Amount:</span>
                </span>
                <span className="font-black text-emerald-400 font-mono">
                  JMD ${(booking.priceJMD || 7500).toLocaleString()}
                </span>
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* FOOTER BAR WITH JAMAICA TRUST BADGES */}
      <footer className="relative z-20 w-full border-t border-white/10 bg-slate-950/80 backdrop-blur-md px-4 sm:px-8 py-3 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>We Care Jamaica Certified Protocol &bull; 100% Identity Verified &bull; Escrow Protection</span>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span>Need urgent assistance? Call 24/7 Support: <strong>+1 (876) 555-CARE</strong></span>
        </div>
      </footer>
    </div>
  );
};
