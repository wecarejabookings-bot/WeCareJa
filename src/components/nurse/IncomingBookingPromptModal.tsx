import React, { useState, useEffect } from 'react';
import { Booking, NurseProfile } from '../../types';
import { soundFX } from '../../utils/soundEffects';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Phone, 
  Lock, 
  ShieldCheck, 
  AlertCircle,
  FileText,
  User,
  X,
  Minimize2,
  RefreshCw,
  Star,
  Sparkles,
  Stethoscope,
  Check
} from 'lucide-react';
import { PPESafetyNotice } from '../common/PPESafetyNotice';
import confetti from 'canvas-confetti';
import { getProcedureVisual, getClientReputation, formatCountdownTimer } from '../../utils/procedureVisuals';

interface IncomingBookingPromptModalProps {
  booking: Booking | null;
  nurse?: NurseProfile;
  isOpen: boolean;
  activeOverlappingBooking?: Booking | null;
  onAttemptOverlapConflict?: (activeBooking: Booking) => void;
  onClose: () => void;
  onAccept: (bookingId: string) => void;
  onDecline: (bookingId: string, reason?: string) => void;
  onRerouteBooking?: (bookingId: string, reason?: string) => void;
}

export const IncomingBookingPromptModal: React.FC<IncomingBookingPromptModalProps> = ({
  booking,
  isOpen,
  activeOverlappingBooking,
  onAttemptOverlapConflict,
  onClose,
  onAccept,
  onDecline,
  onRerouteBooking
}) => {
  const [showDeclineReason, setShowDeclineReason] = useState(false);
  const [declineReason, setDeclineReason] = useState('Schedule overlap with hospital shift');

  // Timer per Master Document: RN = 3 mins (180s), Aide = 1m30s (90s)
  const isRN = Boolean(
    booking?.serviceId === 'srv-1' ||
    booking?.serviceId === 'srv-3' ||
    booking?.serviceId === 'srv-4' ||
    booking?.serviceId === 'srv-5' ||
    booking?.serviceId === 'srv-6' ||
    (booking?.serviceName || '').toLowerCase().includes('wound') ||
    (booking?.serviceName || '').toLowerCase().includes('iv') ||
    (booking?.serviceName || '').toLowerCase().includes('catheter') ||
    (booking?.serviceName || '').toLowerCase().includes('palliative') ||
    (booking?.serviceName || '').toLowerCase().includes('clinical') ||
    (booking?.serviceName || '').toLowerCase().includes('postnatal')
  );

  const timeoutLimit = booking?.acceptanceTimeoutSeconds || (isRN ? 180 : 90);

  // Supplies checklist before accepting
  const initialSupplies = isRN
    ? ['Sterile Dressing Pack', 'Saline Wash (0.9% NaCl)', 'Antiseptic Solution', 'Medical Gloves', 'Digital Sphygmomanometer']
    : ['Clean Gloves', 'Digital Thermometer', 'Hydration Assist Tumbler', 'Sanitizing Wipes', 'Transfer Safety Belt'];

  const [checkedSupplies, setCheckedSupplies] = useState<Record<string, boolean>>({
    [initialSupplies[0]]: true,
    [initialSupplies[1]]: true
  });

  const toggleSupply = (supply: string) => {
    setCheckedSupplies(prev => ({
      ...prev,
      [supply]: !prev[supply]
    }));
  };

  // Real-time calculation based on requestSentAt
  const calculateRemaining = () => {
    if (!booking?.requestSentAt) return timeoutLimit;
    const elapsed = Math.floor((Date.now() - new Date(booking.requestSentAt).getTime()) / 1000);
    return Math.max(0, timeoutLimit - (elapsed >= 0 ? elapsed : 0));
  };

  const [countdownSeconds, setCountdownSeconds] = useState<number>(calculateRemaining);
  const [hasExpired, setHasExpired] = useState(false);

  useEffect(() => {
    if (booking) {
      setCountdownSeconds(calculateRemaining());
      setShowDeclineReason(false);
      setHasExpired(false);
    }
  }, [booking?.id, booking?.requestSentAt]);

  // Live countdown ticker: pure state updates only
  useEffect(() => {
    if (!isOpen || !booking || hasExpired) return;

    const timer = setInterval(() => {
      setCountdownSeconds((prev) => {
        if (prev <= 1) {
          return 0;
        }

        // Tick audio for urgent final seconds
        if (prev <= 10) {
          soundFX.playCountdownTick(false);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, booking?.id, hasExpired]);

  // Cleanly handle countdown expiration in an effect, avoiding parent setState during render
  useEffect(() => {
    if (!isOpen || !booking || countdownSeconds > 0 || hasExpired) return;

    setHasExpired(true);
    soundFX.playCancellation();
    if (onRerouteBooking) {
      onRerouteBooking(booking.id, 'Caregiver acceptance window expired (2m) - auto-cascaded');
    } else {
      onDecline(booking.id, 'Acceptance window expired (2m)');
    }
    onClose();
  }, [countdownSeconds, isOpen, booking?.id, hasExpired, onRerouteBooking, onDecline, onClose]);

  if (!isOpen || !booking) return null;

  const practitionerPayout = booking.nurseEarningsJMD || Math.round((booking.priceJMD || 0) * 0.85);
  const progressPercent = Math.min(100, Math.max(0, (countdownSeconds / timeoutLimit) * 100));
  const isUrgent = countdownSeconds <= 15;

  const procedureVisual = getProcedureVisual(booking.serviceId, booking.serviceName);
  const clientReputation = getClientReputation(booking.clientName, booking.clientId);

  const handleAcceptClick = () => {
    // If the nurse already has an active or in-progress visit, prevent overlapping acceptance
    if (activeOverlappingBooking) {
      soundFX.playAlert();
      if (onAttemptOverlapConflict) {
        onAttemptOverlapConflict(activeOverlappingBooking);
      }
      return;
    }

    setHasExpired(true);
    soundFX.playBookingConfirmed();
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 }
    });
    onAccept(booking.id);
    onClose();
  };

  const handleDeclineClick = () => {
    setHasExpired(true);
    soundFX.playCancellation();
    if (onRerouteBooking) {
      onRerouteBooking(booking.id, declineReason);
    } else {
      onDecline(booking.id, declineReason);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] w-full h-full bg-slate-950/98 backdrop-blur-2xl text-white overflow-y-auto flex flex-col justify-between animate-fadeIn">
      {/* Dynamic Background Ambient Lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-amber-500/20 blur-[150px] animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-purple-600/30 blur-[150px]" />
      </div>

      {/* TOP FULLSCREEN HUD HEADER */}
      <header className="relative z-20 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-950/70 border border-amber-500/50 text-[11px] font-bold text-amber-300 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>Jamaica Live Dispatch • Urgent Priority</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
            <span>•</span>
            <span className="text-slate-300 font-mono font-bold">Request #{booking.id.slice(0, 8)}</span>
            <span>•</span>
            <span className="text-purple-300 font-semibold">{booking.serviceName}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-mono font-bold text-white">{formatCountdownTimer(countdownSeconds)}</span>
            <span className="text-[11px] text-slate-400">remaining</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
            title="Minimize prompt"
          >
            <Minimize2 className="w-4 h-4" />
            <span className="hidden sm:inline">Minimize</span>
          </button>
        </div>
      </header>

      {/* MAIN FULLSCREEN TAKE-OVER CONTENT */}
      <main className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-8 py-5 sm:py-8 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* LEFT COLUMN: HERO, PROCEDURE IMAGE & CLIENT REPUTATION (lg:col-span-7) */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
            
            {/* Hero text */}
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>2-Minute Dispatch Window &bull; Kingston &amp; St. Andrew</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                New Home Care Visit Request
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Patient <strong>{booking.clientName}</strong> in <strong>{booking.zone}</strong> has requested you. Review procedure details below and confirm acceptance.
              </p>
            </div>

            {/* Countdown HUD (1m 30s timer) */}
            <div className="p-4 sm:p-5 rounded-3xl bg-white/[0.04] border border-amber-500/30 backdrop-blur-xl space-y-3 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-mono border shadow-lg ${
                    isUrgent 
                      ? 'bg-rose-500/25 text-rose-200 border-rose-500/60 animate-pulse' 
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  }`}>
                    <span className="text-base font-black leading-none">{formatCountdownTimer(countdownSeconds)}</span>
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 mt-0.5">timer</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                      <span>Automatic Re-Dispatch Cascade (1 min 30s)</span>
                    </h4>
                    <p className="text-xs text-slate-300">
                      If unconfirmed within {formatCountdownTimer(countdownSeconds)}, the request auto-cascades to the next available nurse in {booking.zone}.
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
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
            </div>

            {/* PROCEDURE REQUIRED VISUAL SHOWCASE (Bigger Picture of the Type of Procedure) */}
            <div className="rounded-3xl bg-white/[0.04] border border-purple-500/30 overflow-hidden shadow-xl">
              <div className="relative h-40 sm:h-44 w-full overflow-hidden bg-slate-900">
                <img
                  src={procedureVisual.imageUrl}
                  alt={booking.serviceName}
                  className="w-full h-full object-cover object-center filter brightness-90 hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                
                {/* Procedure Badges Overlay */}
                <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-purple-600/90 text-white font-black text-[11px] uppercase tracking-wider backdrop-blur-md shadow-lg border border-purple-300/40 flex items-center gap-1">
                    <Stethoscope className="w-3.5 h-3.5 text-purple-200" />
                    <span>{procedureVisual.categoryBadge}</span>
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-black/70 text-slate-200 text-[11px] font-semibold backdrop-blur-md border border-white/20">
                    Est. {booking.baseDurationMinutes || 60} mins
                  </span>
                </div>

                <div className="absolute bottom-3 left-4 right-4">
                  <span className="text-[10px] uppercase font-bold text-purple-300 tracking-wider block">
                    Clinical Procedure Required
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-white drop-shadow-md">
                    {booking.serviceName}
                  </h3>
                </div>
              </div>

              {/* Clinical Equipment & Prep Highlights */}
              <div className="p-3.5 sm:p-4 bg-slate-900/60 border-t border-white/10 space-y-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">Supplies Provided:</span>
                  {procedureVisual.clinicalEquipment.map((eq, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-[11px] text-slate-300 flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>{eq}</span>
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-purple-200/90 italic flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span><strong>Prep tip:</strong> {procedureVisual.preparationTip}</span>
                </p>
              </div>
            </div>

            {/* CLIENT CARD (Small Display Picture + Rating by Nurses + Regular/First-Time Status) */}
            <div className="p-4 rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-xl space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {/* Small Display Picture of the Client */}
                  <div className="relative shrink-0">
                    <img
                      src={booking.clientPhotoUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200'}
                      alt={booking.clientName}
                      className="w-12 h-12 rounded-full object-cover border-2 border-[#7209B7] shadow-md ring-2 ring-purple-400/40"
                    />
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-950" title="Verified active patient" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-black text-white text-base truncate">{booking.clientName}</h4>
                      {/* Regular or First-time badge */}
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                        clientReputation.isFirstTime
                          ? 'bg-purple-500/20 text-purple-300 border-purple-400/40'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                      }`}>
                        {clientReputation.userTypeLabel}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 flex items-center gap-1.5 truncate mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-[#E63946] shrink-0" />
                      <span>{booking.clientAddress || booking.zone}</span>
                    </p>
                  </div>
                </div>

                {/* Stars rating by nurses */}
                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1 justify-end">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="font-black text-white text-sm">{clientReputation.rating.toFixed(1)}</span>
                  </div>
                  <span className="text-[10px] text-amber-300/80 block font-semibold">
                    Rated by Nurses ({clientReputation.reviewCount} reviews)
                  </span>
                </div>
              </div>

              {/* Nurse Feedback Quote & Safety Badge */}
              <div className="p-2.5 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between gap-2 text-[11px]">
                <p className="text-slate-300 truncate">
                  <strong className="text-white font-semibold">Nurse Review:</strong> "{clientReputation.recentNurseFeedback}"
                </p>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-[10px] text-emerald-300 font-bold shrink-0">
                  {clientReputation.safetyRating}
                </span>
              </div>

              {/* Patient Notes */}
              {booking.notes && (
                <div className="p-2.5 rounded-2xl bg-purple-950/30 border border-purple-500/20 text-xs text-purple-200 flex items-start gap-2">
                  <FileText className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed text-[11px] line-clamp-2">
                    <strong>Patient Note:</strong> "{booking.notes}"
                  </p>
                </div>
              )}
            </div>

          </div>

          {/* RIGHT COLUMN: NURSE NET EARNINGS (CLIENT PRICE REMOVED), SCHEDULE & ACCEPT/DECLINE (lg:col-span-5) */}
          <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
            
            {/* PRACTITIONER GUARANTEED NET PAYOUT CARD (NO CLIENT PRICE, NO 85% SPLIT DISPLAYED) */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-950/60 via-[#19062b] to-emerald-900/40 border-2 border-emerald-400/60 backdrop-blur-xl space-y-2.5 text-center shadow-2xl">
              <span className="text-xs uppercase font-black text-emerald-300 block tracking-wider flex items-center justify-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>Your Guaranteed Net Payout</span>
              </span>
              <div className="font-mono font-black text-3xl sm:text-4xl text-emerald-400 drop-shadow">
                JMD ${practitionerPayout.toLocaleString()}
              </div>
              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-300 font-bold">100% Guaranteed Payout</span>
                <span>&bull;</span>
                <span className="text-slate-300">Paid Direct Upon Completion</span>
              </div>
            </div>

            {/* SCHEDULE & LOCATION CARD */}
            <div className="p-4 sm:p-5 rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-xl space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5 font-semibold text-slate-400">
                  <Calendar className="w-3.5 h-3.5 text-purple-400" />
                  <span>Scheduled Time:</span>
                </span>
                <span className="font-bold text-white">
                  {new Date(booking.scheduledDateTime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5 font-semibold text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Base Duration:</span>
                </span>
                <span className="font-bold text-white">
                  {booking.baseDurationMinutes || 60} minutes
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5 font-semibold text-slate-400">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Doorstep Security Check:</span>
                </span>
                <span className="font-bold text-emerald-400">
                  PIN Verified on Arrival
                </span>
              </div>
            </div>

            {/* PPE SAFETY MANDATE */}
            <PPESafetyNotice variant="booking_confirmed" userRole="nurse" />

            {/* DECLINE REASON ACCORDION */}
            {showDeclineReason && (
              <div className="p-4 rounded-3xl bg-rose-950/30 border border-rose-500/30 space-y-3 animate-fadeIn text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-300 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    <span>Select Reason for Declining:</span>
                  </span>
                  <button 
                    type="button" 
                    onClick={() => setShowDeclineReason(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1.5">
                  {[
                    'Schedule overlap with hospital shift',
                    'Outside my current travel radius',
                    'Requires equipment not currently in vehicle',
                    'Currently attending to emergency client'
                  ].map((reason) => (
                    <button
                      key={reason}
                      type="button"
                      onClick={() => setDeclineReason(reason)}
                      className={`w-full p-2.5 rounded-xl text-left text-xs transition border cursor-pointer ${
                        declineReason === reason
                          ? 'bg-rose-500/20 border-rose-500/50 text-white font-bold'
                          : 'bg-black/20 border-white/5 text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      {reason}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleDeclineClick}
                    className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Confirm Decline &amp; Reroute</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeclineReason(false)}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 font-bold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* ACTION BUTTONS (ACCEPT & DECLINE) */}
            {!showDeclineReason && (
              <div className="space-y-3 pt-2">
                {/* Supplies Checklist Mandate */}
                <div className="p-3.5 rounded-2xl bg-[#1E1B4B]/80 border border-blue-400/30 text-xs space-y-2">
                  <div className="flex items-center justify-between text-blue-300 font-bold">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Required Supplies Checklist (Verify Before Accept)</span>
                    </span>
                    <span className="text-[10px] text-amber-300 uppercase tracking-wide">
                      {isRN ? 'Clinical RN Pack' : 'Care Aide Pack'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                    {initialSupplies.map((supply) => {
                      const isChecked = Boolean(checkedSupplies[supply]);
                      return (
                        <button
                          key={supply}
                          type="button"
                          onClick={() => toggleSupply(supply)}
                          className={`p-2 rounded-xl text-[11px] font-medium border text-left flex items-center gap-2 transition cursor-pointer ${
                            isChecked
                              ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40'
                              : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/20'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 border ${
                            isChecked ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'border-slate-500'
                          }`}>
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span className="truncate">{supply}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAcceptClick}
                  className="w-full py-4 px-6 rounded-2xl bg-[#3B82F6] hover:bg-blue-600 active:scale-[0.98] text-white font-black text-base drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] shadow-xl shadow-blue-950/70 border border-blue-300 transition cursor-pointer flex items-center justify-center gap-2.5"
                >
                  <CheckCircle2 className="w-6 h-6 text-emerald-300" />
                  <span>Accept Visit &bull; Claim JMD ${practitionerPayout.toLocaleString()}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowDeclineReason(true)}
                  className="w-full py-3 px-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <XCircle className="w-4 h-4 text-rose-400" />
                  <span>Decline Offer &bull; Cascade to Peer Nurse</span>
                </button>
              </div>
            )}

          </div>

        </div>
      </main>
    </div>
  );
};
