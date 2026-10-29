import React, { useState } from 'react';
import { 
  Bell, 
  BellRing, 
  Check, 
  DoorOpen, 
  Clock, 
  Sparkles, 
  Phone, 
  MessageSquare,
  Volume2,
  CheckCircle2
} from 'lucide-react';
import { Booking, ActivityNotificationType } from '../../types';
import { soundFX } from '../../utils/soundEffects';
import { QuickSOSButton } from './QuickSOSButton';
import { sendStartCodeWhatsApp, getBookingStartCode } from '../../utils/whatsappRemoteCare';

export interface ArrivalDoorbellAlertButtonProps {
  booking: Booking;
  currentNurseName?: string;
  onUpdateBookingStatus?: (
    bookingId: string,
    status: Booking['status'],
    clinicalNotes?: any,
    additionalData?: Partial<Booking>
  ) => void;
  onTriggerNotification?: (type: ActivityNotificationType, title: string, description: string, bookingId?: string) => void;
  variant?: 'primary' | 'compact' | 'scanner_banner';
  className?: string;
}

/**
 * One-Click Doorbell Alert Button:
 * Instantly notifies the client that the nurse or caregiver has arrived at their doorstep
 * if they don't already know (or didn't hear a knock/doorbell).
 * 
 * Features:
 * - 1-Click action with realistic 2-tone Westminster Doorbell chime
 * - Sound push + in-app notification to the client
 * - Visual timestamp & repetition counter (e.g. "Rung 1x at 10:45 AM • Ring Again")
 * - Door-opening acknowledgment detection from client
 */
export const ArrivalDoorbellAlertButton: React.FC<ArrivalDoorbellAlertButtonProps> = ({
  booking,
  currentNurseName,
  onUpdateBookingStatus,
  onTriggerNotification,
  variant = 'primary',
  className = ''
}) => {
  const [isRingingAnimation, setIsRingingAnimation] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const nurseName = currentNurseName || booking.nurseName || 'Your Caregiver';
  const alertSent = Boolean(booking.arrivalAlertSent);
  const alertCount = booking.arrivalAlertCount || 0;
  const isAcknowledged = Boolean(booking.arrivalAlertAcknowledged);

  const handleRingDoorbell = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Trigger Doorbell sound effect
    soundFX.playDoorbellAlert();

    // Trigger visual ring animation
    setIsRingingAnimation(true);
    setShowSuccessToast(true);
    setTimeout(() => setIsRingingAnimation(false), 1200);
    setTimeout(() => setShowSuccessToast(false), 4500);

    const nowIso = new Date().toISOString();
    const newCount = alertCount + 1;

    // Send system activity notification to the client
    const alertTitle = `🔔 Ding-Dong! ${nurseName} Has Arrived Outside!`;
    const alertBody = `${nurseName} is at your doorstep at ${booking.clientAddress} for your ${booking.serviceName} visit. Please wear your PPE face mask and open the door.`;

    if (onTriggerNotification) {
      onTriggerNotification('nurse_arrived', alertTitle, alertBody, booking.id);
    } else {
      soundFX.triggerNotification(alertTitle, alertBody, 'nurse_arrived');
    }

    // Trigger WhatsApp Cloud API: wecare_start_code to Family Helper & Elderly Client
    const startCode = getBookingStartCode(booking);
    const whatsAppResult = sendStartCodeWhatsApp(booking);

    // Persist arrival alert and WhatsApp codes to booking state
    if (onUpdateBookingStatus) {
      onUpdateBookingStatus(booking.id, booking.status, undefined, {
        arrivalAlertSent: true,
        arrivalAlertSentAt: nowIso,
        arrivalAlertCount: newCount,
        arrivalAlertAcknowledged: false, // reset until client confirms opening door
        startCode,
        whatsappStartCodeSent: true,
        whatsappStartCodeSentAt: nowIso
      });
    }
  };

  const formattedTime = booking.arrivalAlertSentAt
    ? new Date(booking.arrivalAlertSentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  // 1. Scanner Banner variant (Embedded inside QR Scanner viewfinder)
  if (variant === 'scanner_banner') {
    return (
      <div className={`p-3 rounded-2xl bg-slate-900/90 border border-amber-400/40 backdrop-blur-md shadow-xl flex flex-wrap items-center justify-between gap-2.5 ${className}`}>
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/30 shrink-0">
            <BellRing className={`w-4 h-4 ${isRingingAnimation ? 'animate-bounce text-amber-200' : 'text-amber-400'}`} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-black text-white truncate">
              {isAcknowledged ? '🚪 Client Opening Door!' : alertSent ? `Doorbell Rung (${formattedTime})` : 'Waiting outside at the door?'}
            </p>
            <p className="text-[10px] text-slate-300">
              {isAcknowledged
                ? 'Client acknowledged alert and is coming to the door.'
                : '1-click to alert the client that you have arrived.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRingDoorbell}
          className={`px-3.5 py-1.5 rounded-xl font-black text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer ${
            isRingingAnimation
              ? 'bg-amber-400 text-slate-950 scale-105'
              : alertSent
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 border border-amber-300/60'
              : 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:opacity-95 text-slate-950 border border-amber-200 shadow-amber-900/40'
          }`}
        >
          <Bell className="w-3.5 h-3.5 fill-slate-950 shrink-0" />
          <span>{alertSent ? 'Ring Doorbell Again 🔔' : 'Ring Client Doorbell 🔔'}</span>
        </button>
      </div>
    );
  }

  // 2. Compact variant (Header bars or tight layouts)
  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-1.5 ${className}`}>
        <button
          type="button"
          onClick={handleRingDoorbell}
          className={`px-2.5 py-1.5 rounded-xl font-bold text-[11px] transition-all shadow-xs flex items-center gap-1.5 border cursor-pointer select-none ${
            isAcknowledged
              ? 'bg-emerald-600/30 text-emerald-200 border-emerald-400/50 hover:bg-emerald-600/40'
              : alertSent
              ? 'bg-amber-500/20 text-amber-200 border-amber-400/50 hover:bg-amber-500/30'
              : 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 hover:brightness-110 border-amber-300/60 font-black'
          }`}
          title="Alert client that you are waiting outside at their doorstep"
        >
          <BellRing className={`w-4 h-4 shrink-0 ${isRingingAnimation ? 'animate-bounce' : ''}`} />
          <span>
            {isAcknowledged
              ? 'Door Opening'
              : alertSent
              ? `Chimed (${formattedTime})`
              : 'Door Chime'}
          </span>
        </button>
      </div>
    );
  }

  // 3. Primary Card Variant (Default for Active Booking Card)
  return (
    <div
      id={`arrival-doorbell-card-${booking.id}`}
      className={`relative rounded-2xl border transition-all ${
        isAcknowledged
          ? 'bg-gradient-to-r from-emerald-950/70 via-teal-950/50 to-slate-900/80 border-emerald-400/60 shadow-lg shadow-emerald-950/30'
          : alertSent
          ? 'bg-gradient-to-r from-amber-950/60 via-slate-900/90 to-purple-950/60 border-amber-400/50 shadow-lg shadow-amber-950/30'
          : 'bg-gradient-to-r from-purple-950/50 via-slate-900/90 to-slate-900/80 border-white/15 hover:border-amber-400/40 shadow-md'
      } p-3.5 sm:p-4 ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Info & Status */}
        <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
          <div
            className={`p-2.5 rounded-xl shrink-0 transition-transform ${
              isRingingAnimation ? 'scale-110 rotate-12' : ''
            } ${
              isAcknowledged
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                : alertSent
                ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40 shadow-sm shadow-amber-950/50'
                : 'bg-purple-500/20 text-purple-300 border border-purple-400/30'
            }`}
          >
            {isAcknowledged ? (
              <DoorOpen className="w-5 h-5 text-emerald-400" />
            ) : alertSent ? (
              <BellRing className={`w-5 h-5 ${isRingingAnimation ? 'animate-bounce text-amber-200' : 'text-amber-400'}`} />
            ) : (
              <Bell className="w-5 h-5 text-purple-300" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-0.5">
              <span className="text-xs sm:text-sm font-black text-white">
                {isAcknowledged
                  ? '🚪 Client is Opening the Door!'
                  : alertSent
                  ? '🔔 Doorstep Arrival Alert Active'
                  : 'At Client Doorstep?'}
              </span>

              {alertSent && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/40 flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  <span>Rung {alertCount > 1 ? `${alertCount}x` : '1x'} at {formattedTime}</span>
                </span>
              )}

              {isAcknowledged && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 flex items-center gap-1 animate-pulse">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                  <span>Client Acknowledged</span>
                </span>
              )}
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {isAcknowledged ? (
                <span className="text-emerald-300 font-medium">
                  {booking.clientName} confirmed they received your alert and are heading to the door with their PPE mask.
                </span>
              ) : alertSent ? (
                <span>
                  Chime and doorstep arrival notice delivered to <strong>{booking.clientName}</strong>. If they haven’t answered the door yet, you can ring again.
                </span>
              ) : (
                <span>
                  If {booking.clientName} didn’t hear you knock or is in another room, send a high-attention doorstep chime to their phone.
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Action Button: One-Click Instant Doorbell Alert & Doorstep Quick-SOS */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <QuickSOSButton
            booking={booking}
            userRole="nurse"
            onUpdateBookingStatus={onUpdateBookingStatus}
            onTriggerNotification={onTriggerNotification}
            size="md"
            showArrivalAutoNotifyBadge={false}
          />

          <button
            type="button"
            id={`btn-ring-doorbell-${booking.id}`}
            onClick={handleRingDoorbell}
            className={`px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all shadow-lg flex items-center gap-2 cursor-pointer ${
              isRingingAnimation
                ? 'bg-amber-300 text-slate-950 scale-105 ring-4 ring-amber-400/40'
                : isAcknowledged
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400/50 shadow-emerald-950/50'
                : alertSent
                ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:opacity-95 text-slate-950 border border-amber-200 shadow-amber-950/50'
                : 'bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:opacity-95 text-slate-950 border border-amber-200 shadow-amber-950/50 animate-pulse'
            }`}
            title="Send immediate doorbell chime and arrival notification to patient's device"
          >
            <BellRing className={`w-4 h-4 shrink-0 ${isRingingAnimation ? 'animate-bounce' : ''}`} />
            <span>
              {isAcknowledged
                ? 'Ring Doorbell Again 🔔'
                : alertSent
                ? 'Ring Doorbell Again 🔔'
                : 'Alert Client: I’ve Arrived! 🔔'}
            </span>
          </button>
        </div>
      </div>

      {/* Floating Instant Toast on Ring */}
      {showSuccessToast && (
        <div className="mt-2.5 p-2 px-3 rounded-xl bg-amber-500/20 border border-amber-400/50 text-amber-200 text-xs flex items-center justify-between gap-2 animate-fadeIn">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-amber-300 shrink-0" />
            <span className="font-semibold">
              Doorbell chime played! High-priority doorstep alert delivered to {booking.clientName}’s device.
            </span>
          </div>
          <span className="text-[10px] uppercase font-bold text-amber-400 shrink-0">
            Delivered ✓
          </span>
        </div>
      )}

      {/* WhatsApp Cloud API Remote Care Start Code Notice */}
      {(alertSent || booking.whatsappStartCodeSent || booking.startCode) && (
        <div className="mt-2.5 p-2 px-3 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-200 text-xs flex flex-wrap items-center justify-between gap-2 animate-fadeIn">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#25D366] shrink-0" />
            <span className="text-[11px] leading-tight text-slate-200">
              <strong className="text-emerald-300">WhatsApp Start Code #{getBookingStartCode(booking)}</strong> sent to {booking.trustedFamilyMember ? `${booking.trustedFamilyMember.name} & ` : ''}{booking.clientName}. Tell nurse code or reply <code className="text-emerald-300 font-bold bg-black/50 px-1 py-0.5 rounded border border-emerald-500/30">START {getBookingStartCode(booking)}</code> to start remotely.
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold shrink-0">
            WhatsApp Live ✓
          </span>
        </div>
      )}
    </div>
  );
};
