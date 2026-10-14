import React, { useState } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  PhoneCall, 
  Send,
  BellRing,
  Check
} from 'lucide-react';
import { Booking, ActivityNotificationType } from '../../types';
import { soundFX } from '../../utils/soundEffects';
import { ADMIN_PROFILE } from '../../data/mockData';

export interface QuickSOSButtonProps {
  booking: Booking;
  userRole?: 'nurse' | 'client' | 'admin';
  onUpdateBookingStatus?: (
    bookingId: string,
    status: Booking['status'],
    clinicalNotes?: any,
    additionalData?: Partial<Booking>
  ) => void;
  onTriggerNotification?: (
    type: ActivityNotificationType,
    title: string,
    description: string,
    bookingId?: string
  ) => void;
  size?: 'sm' | 'md';
  className?: string;
  showArrivalAutoNotifyBadge?: boolean;
}

/**
 * Quick-SOS button designed specifically for active booking headers.
 * Bypasses the full panic modal to instantly dispatch silent high-priority emergency alerts
 * to the patient's designated emergency contacts, 119 dispatch queue, and We Care Admin monitoring.
 *
 * Also includes instant arrival auto-notification dispatch if nurse has arrived on-site
 * or needs immediate safety assistance at the client doorstep.
 */
export const QuickSOSButton: React.FC<QuickSOSButtonProps> = ({
  booking,
  userRole = 'nurse',
  onUpdateBookingStatus,
  onTriggerNotification,
  size = 'md',
  className = '',
  showArrivalAutoNotifyBadge = true
}) => {
  const [isActivating, setIsActivating] = useState<boolean>(false);
  const [isTriggered, setIsTriggered] = useState<boolean>(Boolean(booking.quickSosTriggered));
  const [showConfirmationToast, setShowConfirmationToast] = useState<boolean>(false);

  const emergencyContactName = booking.clientEmergencyContact?.name || 'Designated Contact';
  const emergencyContactPhone = booking.clientEmergencyContact?.phone || '+1 (876) 926-CARE';
  const emergencyRelation = booking.clientEmergencyContact?.relation || 'Emergency Contact';
  const location = `${booking.clientAddress}, ${booking.zone}`;
  const nurseName = booking.nurseName || 'Assigned Nurse';
  const clientName = booking.clientName;

  const handleInstantQuickSOS = (e: React.MouseEvent) => {
    e.stopPropagation();

    // 1. Play immediate high-priority audio SOS pulse
    soundFX.playQuickSOSTone();
    setIsActivating(true);
    setIsTriggered(true);
    setShowConfirmationToast(true);

    setTimeout(() => setIsActivating(false), 800);
    setTimeout(() => setShowConfirmationToast(false), 6000);

    const nowIso = new Date().toISOString();
    const alertOrigin = userRole === 'client' ? `Patient ${clientName}` : `Nurse ${nurseName}`;

    // 2. High-priority broadcast payload
    const sosTitle = `🚨 QUICK-SOS: ${alertOrigin} Triggered Urgent Safety Alert!`;
    const sosDescription = `URGENT: Immediate safety alert dispatched at ${location} for booking #${booking.id} (${booking.serviceName}). Alerting ${emergencyContactName} (${emergencyContactPhone}), 119 Emergency Services, and Admin ${ADMIN_PROFILE.name}.`;

    // Dispatch global full-screen takeover event for both client and nurse screens
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('wecare_trigger_sos', {
        detail: { booking, userRole }
      }));
    }

    // 3. Dispatch activity notification (auto-notifies both caregiver and client channels)
    if (onTriggerNotification) {
      onTriggerNotification('sos_emergency', sosTitle, sosDescription, booking.id);
    } else {
      soundFX.triggerNotification(sosTitle, sosDescription, 'sos_emergency');
    }

    // 4. If arrival is not yet auto-notified, arrival auto-notify triggers to confirm doorstep coordinates
    const arrivalAutoAlert = !booking.arrivalAlertSent ? {
      arrivalAlertSent: true,
      arrivalAlertSentAt: nowIso,
      arrivalAlertCount: (booking.arrivalAlertCount || 0) + 1
    } : {};

    // 5. Update booking state with quick-SOS details
    if (onUpdateBookingStatus) {
      onUpdateBookingStatus(booking.id, booking.status, undefined, {
        quickSosTriggered: true,
        quickSosTriggeredAt: nowIso,
        quickSosTriggeredBy: userRole,
        quickSosAlertDetails: {
          location,
          contactNotifiedName: emergencyContactName,
          contactNotifiedPhone: emergencyContactPhone,
          message: `Quick-SOS bypass alert triggered by ${alertOrigin}. Emergency contact ${emergencyContactName} and 119 dispatch alerted with live GPS coordinates.`
        },
        ...arrivalAutoAlert
      });
    }
  };

  const handleDismissAlert = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsTriggered(false);
    soundFX.playStepComplete();
    if (onUpdateBookingStatus) {
      onUpdateBookingStatus(booking.id, booking.status, undefined, {
        quickSosAcknowledged: true
      });
    }
  };

  const buttonPadding = size === 'sm' ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-xs';

  return (
    <div className={`relative inline-flex items-center gap-1.5 ${className}`}>
      {/* Quick-SOS Instant Button */}
      <button
        type="button"
        id={`btn-quick-sos-${booking.id}`}
        onClick={handleInstantQuickSOS}
        className={`group font-black rounded-xl border flex items-center gap-1.5 transition-all shadow-md cursor-pointer select-none ${buttonPadding} ${
          isTriggered
            ? 'bg-red-600 text-white border-red-400 shadow-red-950/60 ring-2 ring-red-400/50'
            : isActivating
            ? 'bg-red-500 text-white scale-95 border-red-300'
            : 'bg-gradient-to-r from-red-600/90 via-rose-600/90 to-red-700/90 hover:from-red-500 hover:to-rose-600 text-white border-red-400/50 shadow-red-950/40 hover:shadow-red-900/60 hover:scale-102'
        }`}
        title={`Instant Quick-SOS: Dispatches urgent alert to ${emergencyContactName} (${emergencyContactPhone}) & 119, bypassing modal`}
      >
        <ShieldAlert className={`w-4 h-4 shrink-0 ${isTriggered ? 'animate-bounce text-amber-200' : 'text-white group-hover:scale-110 transition-transform'}`} />
        <span className="tracking-tight whitespace-nowrap">
          {isTriggered ? 'SOS Active' : 'SOS'}
        </span>
        {showArrivalAutoNotifyBadge && !isTriggered && (
          <span className="hidden sm:inline-block px-1.5 py-0.2 rounded-full bg-black/30 border border-white/20 text-[9px] font-bold text-red-200">
            Auto-Notify
          </span>
        )}
      </button>

      {/* Dismiss / Stand Down if previously triggered */}
      {isTriggered && (
        <button
          type="button"
          onClick={handleDismissAlert}
          className="p-1 rounded-lg bg-black/40 hover:bg-black/60 text-slate-300 hover:text-white text-[10px] transition border border-white/10"
          title="Dismiss / Stand-down active alert indicator"
        >
          ✕
        </button>
      )}

      {/* Confirmation Toast Notification */}
      {showConfirmationToast && (
        <div className="absolute top-full right-0 mt-2 z-40 w-72 sm:w-80 p-3 rounded-2xl bg-slate-900/95 border border-red-500/60 text-white shadow-2xl backdrop-blur-xl animate-fadeIn text-left">
          <div className="flex items-start gap-2.5">
            <div className="p-1.5 rounded-xl bg-red-500/30 border border-red-400/40 shrink-0 text-red-300 animate-pulse">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] uppercase font-black tracking-wider text-red-400">
                  Quick-SOS Dispatched
                </span>
                <span className="text-[9px] text-slate-400">Bypassed Modal ✓</span>
              </div>
              <p className="text-xs font-bold text-white mt-0.5">
                Alert sent to {emergencyContactName} ({emergencyRelation})
              </p>
              <div className="mt-1 text-[11px] text-slate-300 space-y-0.5">
                <div className="flex items-center gap-1">
                  <PhoneCall className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span className="font-mono text-emerald-300">{emergencyContactPhone}</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                  <Send className="w-2.5 h-2.5 text-purple-300 shrink-0" />
                  <span>GPS location &amp; arrival auto-notify broadcasted</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
