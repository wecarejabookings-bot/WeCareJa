import React, { useState, useEffect } from 'react';
import { Booking, NurseProfile, ActivityNotificationType } from '../../types';
import { soundFX } from '../../utils/soundEffects';
import { 
  Clock, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  UserCheck, 
  AlertCircle,
  ArrowRight,
  Sparkles,
  Lock,
  Maximize2
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CaregiverAcceptanceTimerCardProps {
  booking: Booking;
  nurses: NurseProfile[];
  onRerouteBooking?: (bookingId: string, reason?: string, preferredNurseId?: string) => void;
  onUpdateBookingStatus?: (bookingId: string, status: Booking['status'], clinicalNotes?: any, additionalData?: Partial<Booking>) => void;
  onTriggerNotification?: (type: ActivityNotificationType, title: string, message: string, bookingId?: string) => void;
  onOpenPrompt?: (type: 'dispatched' | 'rerouted' | 'accepted', booking: Booking) => void;
}

export const CaregiverAcceptanceTimerCard: React.FC<CaregiverAcceptanceTimerCardProps> = ({
  booking,
  nurses,
  onRerouteBooking,
  onUpdateBookingStatus,
  onTriggerNotification,
  onOpenPrompt
}) => {
  const timeoutSeconds = booking.acceptanceTimeoutSeconds || 120;
  
  // Calculate initial remaining seconds
  const calculateRemaining = () => {
    const sentTime = booking.requestSentAt || booking.createdAt;
    if (!sentTime) return timeoutSeconds;
    const elapsed = Math.floor((Date.now() - new Date(sentTime).getTime()) / 1000);
    return Math.max(0, timeoutSeconds - (elapsed >= 0 ? elapsed : 0));
  };

  const [remainingSeconds, setRemainingSeconds] = useState<number>(calculateRemaining);
  const [isRerouting, setIsRerouting] = useState(false);

  // Sync remaining seconds on requestSentAt change
  useEffect(() => {
    setRemainingSeconds(calculateRemaining());
    setIsRerouting(false);
  }, [booking.requestSentAt, booking.nurseId]);

  // Live 1-second interval
  useEffect(() => {
    if (booking.status !== 'requested' || booking.nurseAccepted) return;

    const timer = setInterval(() => {
      setRemainingSeconds(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [booking.status, booking.nurseAccepted]);

  // Respond to timer expiring without triggering setState during render
  useEffect(() => {
    if (remainingSeconds === 0 && booking.status === 'requested' && !booking.nurseAccepted && !isRerouting) {
      setIsRerouting(true);
      if (onRerouteBooking) {
        onRerouteBooking(
          booking.id, 
          `Caregiver response window expired (${timeoutSeconds}s)`
        );
      }
      if (onOpenPrompt) {
        onOpenPrompt('rerouted', booking);
      }
    }
  }, [remainingSeconds, booking.status, booking.nurseAccepted, isRerouting, onRerouteBooking, onOpenPrompt, booking.id, timeoutSeconds]);

  if (booking.status !== 'requested' || booking.nurseAccepted) {
    return null;
  }

  const progressPercent = Math.min(100, Math.max(0, (remainingSeconds / timeoutSeconds) * 100));
  const isUrgent = remainingSeconds <= 12;

  // Manual Trigger Re-route Now
  const handleManualReroute = () => {
    soundFX.playToggleClick();
    if (onRerouteBooking) {
      setIsRerouting(true);
      onRerouteBooking(
        booking.id, 
        'Client requested manual caregiver re-routing'
      );
      if (onOpenPrompt) {
        onOpenPrompt('rerouted', booking);
      }
    }
  };

  // Demo: Accept by nurse
  const handleSimulateAccept = () => {
    soundFX.playBookingConfirmed();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
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
        'Caregiver Accepted Booking!',
        `${booking.nurseName || 'Your caregiver'} has confirmed your visit. Doorstep QR verification is now unlocked.`,
        booking.id
      );
    }

    if (onOpenPrompt) {
      onOpenPrompt('accepted', booking);
    }
  };

  // Demo: Decline by nurse
  const handleSimulateDecline = () => {
    soundFX.playCancellation();
    if (onRerouteBooking) {
      setIsRerouting(true);
      onRerouteBooking(
        booking.id,
        'Caregiver was engaged on emergency clinical shift'
      );
      if (onOpenPrompt) {
        onOpenPrompt('rerouted', booking);
      }
    }
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-950/40 via-purple-950/30 to-slate-900/60 border-2 border-amber-500/40 shadow-xl space-y-4">
      {/* Top Banner Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="relative shrink-0">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-mono font-black text-sm border shadow-lg ${
              isUrgent 
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse' 
                : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
            }`}>
              <Clock className="w-5 h-5 animate-spin-slow" />
            </div>
            <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-black text-[9px] font-mono font-bold text-amber-300 border border-amber-500/40">
              {Math.floor(remainingSeconds / 60)}:{remainingSeconds % 60 < 10 ? '0' : ''}{remainingSeconds % 60}
            </span>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h5 className="text-sm font-black text-white">
                Awaiting Caregiver Acceptance
              </h5>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                isUrgent
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}>
                Auto-Cascade in {Math.floor(remainingSeconds / 60)}:{remainingSeconds % 60 < 10 ? '0' : ''}{remainingSeconds % 60}
              </span>
              {booking.rerouteCount && booking.rerouteCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-bold">
                  Transfer #{booking.rerouteCount}
                </span>
              )}
            </div>

            <p className="text-xs text-amber-200/90 mt-1 leading-relaxed">
              Request dispatched to <strong>{booking.nurseName || 'Assigned Practitioner'}</strong> in <strong>{booking.zone}</strong>. Practitioners confirm within 1 minute 30 seconds before auto-cascading.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="shrink-0 flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (onOpenPrompt) {
                onOpenPrompt('dispatched', booking);
              }
            }}
            className="px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-200 hover:text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer"
            title="Open immersive full-screen interactive view with all details"
          >
            <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Fullscreen View</span>
          </button>
          <button
            type="button"
            onClick={handleManualReroute}
            disabled={isRerouting}
            className="px-3 py-2 rounded-xl bg-purple-900/60 hover:bg-purple-800/80 border border-purple-400/30 text-purple-200 hover:text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer disabled:opacity-50"
            title="Skip remaining seconds and auto-reassign to the next available practitioner immediately"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRerouting ? 'animate-spin' : ''}`} />
            <span>Re-route Now</span>
          </button>
        </div>
      </div>

      {/* Countdown Progress Bar */}
      <div className="space-y-1.5">
        <div className="w-full bg-black/60 h-2 rounded-full overflow-hidden border border-white/10 p-0.5">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ease-linear ${
              isUrgent 
                ? 'bg-gradient-to-r from-rose-500 to-amber-500 animate-pulse' 
                : 'bg-gradient-to-r from-emerald-500 via-amber-400 to-amber-500'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-400 px-0.5">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>NCJ Rapid Dispatch Guarantee</span>
          </span>
          <span className="font-mono text-amber-300 font-bold">
            {remainingSeconds}s remaining before next candidate
          </span>
        </div>
      </div>

      {/* Reassurance Info Callout */}
      <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
        <div className="flex items-center gap-2 text-slate-300 text-[11px]">
          <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>
            Doorstep QR passes &amp; live transit radar remain locked until caregiver acceptance is logged.
          </span>
        </div>

        {/* Demo Fast-Testing Buttons */}
        <div className="flex items-center gap-2 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-white/10">
          <span className="text-[10px] uppercase font-bold text-slate-400">Demo Testing:</span>
          <button
            type="button"
            onClick={handleSimulateAccept}
            className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black flex items-center gap-1 transition shadow-sm cursor-pointer"
            title="Simulate caregiver accepting this request"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Accept ✓</span>
          </button>
          <button
            type="button"
            onClick={handleSimulateDecline}
            className="px-2.5 py-1.5 rounded-lg bg-rose-900/60 hover:bg-rose-800 text-rose-200 hover:text-white border border-rose-500/40 text-[11px] font-black flex items-center gap-1 transition shadow-sm cursor-pointer"
            title="Simulate caregiver decline and trigger auto-reroute to next practitioner"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Decline &amp; Reroute ✕</span>
          </button>
        </div>
      </div>
    </div>
  );
};
