import React, { useState } from 'react';
import { 
  BellRing, 
  DoorOpen, 
  Check, 
  QrCode, 
  Phone, 
  ShieldCheck, 
  Volume2,
  Clock,
  Sparkles
} from 'lucide-react';
import { Booking, ActivityNotificationType } from '../../types';
import { soundFX } from '../../utils/soundEffects';
import { QuickSOSButton } from './QuickSOSButton';

export interface ClientDoorstepArrivalBannerProps {
  booking: Booking;
  onUpdateBookingStatus?: (
    bookingId: string,
    status: Booking['status'],
    clinicalNotes?: any,
    additionalData?: Partial<Booking>
  ) => void;
  onOpenQRPass?: (booking: Booking) => void;
  onCallCaregiver?: (booking: Booking) => void;
  onTriggerNotification?: (type: ActivityNotificationType, title: string, description: string, bookingId?: string) => void;
  className?: string;
}

/**
 * High-visibility doorstep arrival banner shown on the Client Portal
 * when the nurse or caregiver has clicked "Alert Client: I've Arrived!".
 */
export const ClientDoorstepArrivalBanner: React.FC<ClientDoorstepArrivalBannerProps> = ({
  booking,
  onUpdateBookingStatus,
  onOpenQRPass,
  onCallCaregiver,
  onTriggerNotification,
  className = ''
}) => {
  const [hasAcknowledgedLocally, setHasAcknowledgedLocally] = useState(false);

  if (booking.status === 'requested' || !booking.arrivalAlertSent || booking.status === 'completed' || booking.status === 'cancelled') {
    return null;
  }

  const isAcknowledged = Boolean(booking.arrivalAlertAcknowledged || hasAcknowledgedLocally);
  const nurseName = booking.nurseName || 'Your Caregiver';
  const alertTime = booking.arrivalAlertSentAt
    ? new Date(booking.arrivalAlertSentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  const handleAcknowledgeOpenDoor = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHasAcknowledgedLocally(true);
    soundFX.playStepComplete();

    const nowIso = new Date().toISOString();

    if (onTriggerNotification) {
      onTriggerNotification(
        'system_alert',
        '🚪 Client Opening Door!',
        `${booking.clientName} confirmed they received your arrival alert and are opening the door now.`,
        booking.id
      );
    }

    if (onUpdateBookingStatus) {
      onUpdateBookingStatus(booking.id, booking.status, undefined, {
        arrivalAlertAcknowledged: true,
        arrivalAlertAcknowledgedAt: nowIso
      });
    }
  };

  const handleReplayChime = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundFX.playDoorbellAlert();
  };

  return (
    <div
      id={`client-doorstep-banner-${booking.id}`}
      className={`rounded-2xl border transition-all p-4 sm:p-5 shadow-2xl relative overflow-hidden ${
        isAcknowledged
          ? 'bg-gradient-to-r from-emerald-950/80 via-teal-950/70 to-slate-900 border-emerald-400/50 shadow-emerald-950/40'
          : 'bg-gradient-to-r from-amber-950/90 via-orange-950/80 to-slate-900 border-amber-400/70 shadow-amber-950/50 ring-2 ring-amber-400/30 animate-pulse'
      } ${className}`}
    >
      <div className="flex flex-wrap items-start sm:items-center justify-between gap-4">
        {/* Graphic & Content */}
        <div className="flex items-start gap-3.5 flex-1 min-w-0">
          <div
            className={`p-3 rounded-2xl shrink-0 transition-transform ${
              isAcknowledged
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                : 'bg-amber-500/25 text-amber-300 border border-amber-400/60 shadow-lg shadow-amber-950/60'
            }`}
          >
            {isAcknowledged ? (
              <DoorOpen className="w-7 h-7 text-emerald-400" />
            ) : (
              <BellRing className="w-7 h-7 text-amber-300 animate-bounce" />
            )}
          </div>

          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                  isAcknowledged
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                    : 'bg-amber-500/25 text-amber-200 border-amber-400/60 animate-pulse'
                }`}
              >
                {isAcknowledged ? 'Door Opening in Progress' : 'Caregiver at Your Doorstep'}
              </span>

              {alertTime && (
                <span className="text-[11px] text-amber-200/80 flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3 text-amber-300" />
                  <span>Alerted at {alertTime}</span>
                </span>
              )}
            </div>

            <h3 className="text-base sm:text-lg font-black text-white leading-tight">
              {isAcknowledged
                ? `Opening Door for ${nurseName} 🚪`
                : `Ding-Dong! ${nurseName} Has Arrived Outside! 🔔`}
            </h3>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              {isAcknowledged ? (
                <span className="text-emerald-200 font-medium">
                  {nurseName} has been notified that you are opening the door. Please put on your PPE face mask and prepare your arrival QR pass.
                </span>
              ) : (
                <span>
                  {nurseName} is waiting at your doorstep for your <strong>{booking.serviceName}</strong> visit. Please put on your PPE face mask and answer the door.
                </span>
              )}
            </p>

            {/* Quick Safety Check Reminder */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-300">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/40 border border-white/10 text-emerald-300 font-medium">
                <ShieldCheck className="w-3 h-3" /> PPE Mask Required
              </span>
              <button
                type="button"
                onClick={handleReplayChime}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/40 hover:bg-black/60 border border-white/10 text-amber-300 transition text-[11px] cursor-pointer"
                title="Replay doorbell chime"
              >
                <Volume2 className="w-3 h-3" /> Replay Doorbell Chime
              </button>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 sm:self-center shrink-0">
          {!isAcknowledged ? (
            <button
              type="button"
              id={`btn-open-door-${booking.id}`}
              onClick={handleAcknowledgeOpenDoor}
              className="px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:opacity-95 text-slate-950 border border-emerald-300 shadow-lg shadow-emerald-950/60 flex items-center gap-2 cursor-pointer transition transform active:scale-95"
            >
              <DoorOpen className="w-4 h-4 stroke-[2.5]" />
              <span>I’m Opening the Door 🚪</span>
            </button>
          ) : (
            <div className="px-3.5 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-xs font-bold flex items-center gap-1.5">
              <Check className="w-4 h-4 stroke-[3] text-emerald-400" />
              <span>Door Opening Confirmed</span>
            </div>
          )}

          {onOpenQRPass && (
            <button
              type="button"
              onClick={() => onOpenQRPass(booking)}
              className="px-3.5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs border border-purple-400/40 transition flex items-center gap-1.5 shadow-md cursor-pointer"
              title="Open QR pass for caregiver to scan"
            >
              <QrCode className="w-4 h-4" />
              <span>Show Doorstep QR Pass</span>
            </button>
          )}

          {onCallCaregiver && (
            <button
              type="button"
              onClick={() => onCallCaregiver(booking)}
              className="px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/20 transition flex items-center gap-1.5 cursor-pointer"
              title="Call caregiver"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call</span>
            </button>
          )}

          {/* Direct Quick-SOS instant trigger if patient feels unsafe at door */}
          <QuickSOSButton
            booking={booking}
            userRole="client"
            onUpdateBookingStatus={onUpdateBookingStatus}
            onTriggerNotification={onTriggerNotification}
            size="sm"
            showArrivalAutoNotifyBadge={false}
          />
        </div>
      </div>
    </div>
  );
};
