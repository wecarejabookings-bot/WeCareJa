import React from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Shield, 
  Check, 
  Sparkles, 
  UserCheck, 
  Stethoscope, 
  CheckCircle2,
  Clock
} from 'lucide-react';
import { Booking } from '../../types';
import { soundFX } from '../../utils/soundEffects';
import confetti from 'canvas-confetti';

export interface PPEReadyBadgeProps {
  booking: Booking;
  className?: string;
  size?: 'sm' | 'md';
  onClick?: () => void;
}

/**
 * 'PPE Ready' visual badge indicator on active booking cards:
 * Displays a green shield icon once BOTH nurse and client have acknowledged
 * their protection responsibility.
 */
export const PPEReadyBadge: React.FC<PPEReadyBadgeProps> = ({
  booking,
  className = '',
  size = 'md',
  onClick
}) => {
  const isBothReady = Boolean(booking.clientPPEAcknowledged && booking.nursePPEAcknowledged);
  const acknowledgedCount = (booking.clientPPEAcknowledged ? 1 : 0) + (booking.nursePPEAcknowledged ? 1 : 0);

  if (isBothReady) {
    return (
      <span
        id={`ppe-badge-${booking.id}`}
        onClick={onClick}
        className={`inline-flex items-center gap-1.5 rounded-full font-black uppercase tracking-wider border transition-all duration-300 ${
          size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-[11px]'
        } bg-gradient-to-r from-emerald-500/25 via-emerald-500/20 to-teal-500/25 text-emerald-300 border-emerald-400/60 shadow-md shadow-emerald-950/40 ring-1 ring-emerald-400/30 animate-fadeIn ${
          onClick ? 'cursor-pointer hover:bg-emerald-500/30' : ''
        } ${className}`}
        title={`PPE Ready: Both ${booking.nurseName || 'Nurse'} and ${booking.clientName || 'Client'} have acknowledged PPE protection responsibility`}
      >
        <ShieldCheck className={`${size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-emerald-400 fill-emerald-500/30 shrink-0`} />
        <span>PPE Ready</span>
      </span>
    );
  }

  return (
    <span
      id={`ppe-badge-${booking.id}`}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full font-bold border transition-colors ${
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-[11px]'
      } ${
        acknowledgedCount === 1
          ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
          : 'bg-white/5 text-slate-400 border-white/10'
      } ${onClick ? 'cursor-pointer hover:bg-white/10' : ''} ${className}`}
      title={`PPE Pending: Caregiver ${booking.nursePPEAcknowledged ? '✓ Ready' : 'Pending'}, Client ${booking.clientPPEAcknowledged ? '✓ Ready' : 'Pending'}`}
    >
      <ShieldAlert className={`${size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} ${acknowledgedCount === 1 ? 'text-amber-400' : 'text-slate-400'} shrink-0`} />
      <span>PPE Pending ({acknowledgedCount}/2)</span>
    </span>
  );
};

export interface PPEToggleProps {
  booking: Booking;
  userRole: 'nurse' | 'client' | 'admin';
  onUpdateBookingStatus?: (
    bookingId: string,
    status: Booking['status'],
    clinicalNotes?: any,
    additionalData?: Partial<Booking>
  ) => void;
  className?: string;
  compact?: boolean;
}

/**
 * Interactive PPE toggle control on active booking card.
 * Allows client or caregiver to toggle their protection readiness,
 * with live reciprocal status and audio-visual confirmation.
 */
export const PPEToggle: React.FC<PPEToggleProps> = ({
  booking,
  userRole,
  onUpdateBookingStatus,
  className = '',
  compact = false
}) => {
  const isClientRole = userRole === 'client';
  const isNurseRole = userRole === 'nurse';

  const isClientReady = Boolean(booking.clientPPEAcknowledged);
  const isNurseReady = Boolean(booking.nursePPEAcknowledged);
  const isBothReady = isClientReady && isNurseReady;

  const currentRoleAcknowledged = isClientRole ? isClientReady : isNurseReady;

  const handleToggleCurrentRole = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!onUpdateBookingStatus) return;

    const newAck = !currentRoleAcknowledged;
    const updateData: Partial<Booking> = isClientRole
      ? {
          clientPPEAcknowledged: newAck,
          clientPPEAcknowledgedAt: newAck ? new Date().toISOString() : undefined
        }
      : {
          nursePPEAcknowledged: newAck,
          nursePPEAcknowledgedAt: newAck ? new Date().toISOString() : undefined
        };

    const willBothBeReady = isClientRole
      ? newAck && isNurseReady
      : newAck && isClientReady;

    if (willBothBeReady) {
      soundFX.playBookingConfirmed();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10B981', '#34D399', '#059669', '#6EE7B7', '#C77DFF']
      });
      soundFX.triggerNotification(
        '🛡️ PPE Ready: Full Protocol Active!',
        `Both ${booking.nurseName || 'Caregiver'} and ${booking.clientName || 'Client'} have acknowledged PPE protection for visit #${(booking?.id || '').slice(0, 8)}.`,
        'booking_confirmed'
      );
    } else if (newAck) {
      soundFX.playTabSwitch();
      soundFX.triggerNotification(
        '🛡️ PPE Acknowledged',
        `You have confirmed your PPE protection readiness for visit #${(booking?.id || '').slice(0, 8)}. Awaiting counterpart confirmation.`,
        'booking_confirmed'
      );
    } else {
      soundFX.playTabSwitch();
    }

    onUpdateBookingStatus(booking.id, booking.status, undefined, updateData);
  };

  const handleToggleCounterpartRole = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onUpdateBookingStatus) return;

    // Toggle the other role for demo/testing flexibility
    const targetRoleIsClient = !isClientRole;
    const currentTargetAck = targetRoleIsClient ? isClientReady : isNurseReady;
    const newTargetAck = !currentTargetAck;

    const updateData: Partial<Booking> = targetRoleIsClient
      ? {
          clientPPEAcknowledged: newTargetAck,
          clientPPEAcknowledgedAt: newTargetAck ? new Date().toISOString() : undefined
        }
      : {
          nursePPEAcknowledged: newTargetAck,
          nursePPEAcknowledgedAt: newTargetAck ? new Date().toISOString() : undefined
        };

    const willBothBeReady = targetRoleIsClient
      ? newTargetAck && isNurseReady
      : newTargetAck && isClientReady;

    if (willBothBeReady) {
      soundFX.playBookingConfirmed();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10B981', '#34D399', '#059669', '#6EE7B7']
      });
      soundFX.triggerNotification(
        '🛡️ PPE Ready: Both Parties Verified!',
        `Both caregiver and client PPE protection responsibilities acknowledged for visit #${(booking?.id || '').slice(0, 8)}.`,
        'booking_confirmed'
      );
    } else {
      soundFX.playTabSwitch();
    }

    onUpdateBookingStatus(booking.id, booking.status, undefined, updateData);
  };

  return (
    <div
      id={`ppe-toggle-card-${booking.id}`}
      className={`rounded-2xl border transition-all ${
        isBothReady
          ? 'bg-gradient-to-r from-emerald-950/60 via-teal-950/40 to-slate-900/80 border-emerald-500/50 shadow-lg shadow-emerald-950/30'
          : 'bg-white/[0.03] border-white/10 hover:border-white/20'
      } ${compact ? 'p-3 space-y-2.5' : 'p-4 space-y-3'} ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div
            className={`p-1.5 rounded-lg shrink-0 ${
              isBothReady
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/40'
                : 'bg-slate-800 text-slate-300 border border-white/10'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-white">
                PPE Responsibility & Readiness
              </span>
              <PPEReadyBadge booking={booking} size="sm" />
            </div>
            <p className="text-[11px] text-slate-300">
              Personal protection is mandatory: face masks, clean hands & gloves.
            </p>
          </div>
        </div>

        {/* Primary Interactive PPE Toggle Switch */}
        <button
          type="button"
          id={`ppe-toggle-btn-${booking.id}`}
          onClick={handleToggleCurrentRole}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-bold text-xs transition-all shadow-sm ${
            currentRoleAcknowledged
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400 shadow-emerald-900/40'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-white/20'
          }`}
          title="Click to toggle your personal PPE protection readiness"
        >
          {/* Visual Switch Pill */}
          <div
            className={`w-9 h-5 rounded-full transition-colors relative flex items-center p-0.5 ${
              currentRoleAcknowledged ? 'bg-emerald-400' : 'bg-slate-600'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-200 flex items-center justify-center text-[9px] font-black ${
                currentRoleAcknowledged ? 'translate-x-4 text-emerald-700' : 'translate-x-0 text-slate-600'
              }`}
            >
              {currentRoleAcknowledged && <Check className="w-2.5 h-2.5 stroke-[3]" />}
            </div>
          </div>
          <span className="whitespace-nowrap">
            {currentRoleAcknowledged
              ? (isClientRole ? 'My PPE Ready ✓' : 'My Clinical PPE Ready ✓')
              : (isClientRole ? 'Toggle My PPE Ready' : 'Toggle Clinical PPE Ready')}
          </span>
        </button>
      </div>

      {/* Reciprocal Readiness Status Bars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-white/10 text-xs">
        {/* Client Readiness Status */}
        <div
          className={`p-2 rounded-xl border flex items-center justify-between gap-2 transition ${
            isClientReady
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
              : 'bg-black/30 border-white/5 text-slate-300'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <UserCheck className={`w-3.5 h-3.5 shrink-0 ${isClientReady ? 'text-emerald-400' : 'text-slate-400'}`} />
            <div className="truncate">
              <span className="font-semibold block truncate text-[11px]">
                Client: {booking.clientName.split(' ')[0]}
              </span>
              <span className="text-[10px] text-slate-400 block">
                {isClientReady
                  ? `Acknowledged at ${booking.clientPPEAcknowledgedAt ? new Date(booking.clientPPEAcknowledgedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Confirmed'}`
                  : 'Pending confirmation'}
              </span>
            </div>
          </div>
          <div className="shrink-0 flex items-center gap-1.5">
            {isClientReady ? (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/40">
                <Check className="w-2.5 h-2.5 stroke-[3]" /> Ready
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/5 text-slate-400 text-[10px] border border-white/10">
                <Clock className="w-2.5 h-2.5" /> Pending
              </span>
            )}
            {/* Simulation/Quick Toggle for Testing */}
            {!isClientRole && (
              <button
                type="button"
                onClick={handleToggleCounterpartRole}
                className="text-[10px] text-purple-300 hover:text-white underline decoration-dotted ml-1"
                title="Simulate client acknowledgment for testing"
              >
                {isClientReady ? 'Undo' : 'Confirm'}
              </button>
            )}
          </div>
        </div>

        {/* Caregiver/Nurse Readiness Status */}
        <div
          className={`p-2 rounded-xl border flex items-center justify-between gap-2 transition ${
            isNurseReady
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
              : 'bg-black/30 border-white/5 text-slate-300'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Stethoscope className={`w-3.5 h-3.5 shrink-0 ${isNurseReady ? 'text-emerald-400' : 'text-slate-400'}`} />
            <div className="truncate">
              <span className="font-semibold block truncate text-[11px]">
                Caregiver: {booking.nurseName?.split(' ')[0] || 'Nurse'}
              </span>
              <span className="text-[10px] text-slate-400 block">
                {isNurseReady
                  ? `Acknowledged at ${booking.nursePPEAcknowledgedAt ? new Date(booking.nursePPEAcknowledgedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Confirmed'}`
                  : 'Pending confirmation'}
              </span>
            </div>
          </div>
          <div className="shrink-0 flex items-center gap-1.5">
            {isNurseReady ? (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/40">
                <Check className="w-2.5 h-2.5 stroke-[3]" /> Ready
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/5 text-slate-400 text-[10px] border border-white/10">
                <Clock className="w-2.5 h-2.5" /> Pending
              </span>
            )}
            {/* Simulation/Quick Toggle for Testing */}
            {!isNurseRole && (
              <button
                type="button"
                onClick={handleToggleCounterpartRole}
                className="text-[10px] text-purple-300 hover:text-white underline decoration-dotted ml-1"
                title="Simulate nurse acknowledgment for testing"
              >
                {isNurseReady ? 'Undo' : 'Confirm'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* When both are ready confirmation note */}
      {isBothReady && (
        <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-between gap-2 text-xs text-emerald-200 animate-fadeIn">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-bold">PPE Protection Verified: Both practitioner and client are PPE Ready.</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-black shrink-0">
            SAFE VISIT ACTIVE
          </span>
        </div>
      )}
    </div>
  );
};

export interface PPESafetyNoticeProps {
  variant?: 'booking_confirmed' | 'on_arrival' | 'compact';
  className?: string;
  userRole?: 'nurse' | 'client' | 'admin';
  booking?: Booking;
  onUpdateBookingStatus?: (
    bookingId: string,
    status: Booking['status'],
    clinicalNotes?: any,
    additionalData?: Partial<Booking>
  ) => void;
  showToggle?: boolean;
}

export const PPESafetyNotice: React.FC<PPESafetyNoticeProps> = ({
  variant = 'booking_confirmed',
  className = '',
  userRole,
  booking,
  onUpdateBookingStatus,
  showToggle = false
}) => {
  const isArrival = variant === 'on_arrival';

  return (
    <div
      className={`rounded-2xl border transition shadow-lg text-left ${
        isArrival
          ? 'bg-gradient-to-r from-blue-950/80 via-[#0d1b3e] to-purple-950/80 border-blue-400/50 shadow-blue-950/40'
          : 'bg-gradient-to-r from-emerald-950/70 via-teal-950/70 to-slate-900/80 border-emerald-400/40 shadow-emerald-950/30'
      } ${variant === 'compact' ? 'p-3' : 'p-4'} ${className}`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`p-2 rounded-xl shrink-0 ${
            isArrival
              ? 'bg-blue-500/20 text-blue-300 border border-blue-400/40'
              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
          }`}
        >
          <ShieldCheck className="w-5 h-5" />
        </div>

        <div className="space-y-1.5 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  isArrival
                    ? 'bg-blue-500/20 text-blue-200 border-blue-400/40'
                    : 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40'
                }`}
              >
                {isArrival ? 'Doorstep Arrival Safety Protocol' : 'Confirmed Booking Safety Policy'}
              </span>
              {booking && <PPEReadyBadge booking={booking} size="sm" />}
            </div>
            <span className="text-[10px] text-slate-400 font-semibold">
              Mandatory Protocol
            </span>
          </div>

          <h4 className="text-xs sm:text-sm font-black text-white leading-tight">
            Personal Protection is Your Responsibility
          </h4>

          <p className="text-xs text-slate-200 leading-relaxed">
            Each nurse, caregiver, and client must take the necessary steps to protect themselves by wearing appropriate Personal Protective Equipment (PPE) throughout the visit.
          </p>

          {variant !== 'compact' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-white/10 text-[11px] text-slate-300">
              <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-black/30 border border-white/5">
                <span className="text-base">😷</span>
                <span>Protective Face Mask</span>
              </div>
              <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-black/30 border border-white/5">
                <span className="text-base">🧤</span>
                <span>Sterile / Exam Gloves</span>
              </div>
              <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-black/30 border border-white/5">
                <span className="text-base">🧴</span>
                <span>Hand Sanitizer / Wash</span>
              </div>
            </div>
          )}

          {/* Optional Embedded Toggle */}
          {showToggle && booking && userRole && (
            <div className="pt-2">
              <PPEToggle
                booking={booking}
                userRole={userRole}
                onUpdateBookingStatus={onUpdateBookingStatus}
                compact={true}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
