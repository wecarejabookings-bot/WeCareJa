import React from 'react';
import { 
  Clock, 
  MapPin, 
  Navigation, 
  AlertTriangle, 
  Phone, 
  MessageSquare, 
  ShieldCheck, 
  Sparkles,
  Radio,
  BellRing
} from 'lucide-react';
import { Booking } from '../../types';

export interface ClientArrivalEtaBannerProps {
  booking: Booking;
  onCallCaregiver?: (booking: Booking) => void;
  onOpenChat?: (booking: Booking) => void;
  className?: string;
}

export const ClientArrivalEtaBanner: React.FC<ClientArrivalEtaBannerProps> = ({
  booking,
  onCallCaregiver,
  onOpenChat,
  className = ''
}) => {
  const etaMinutes = booking.arrivalEtaMinutes ?? booking.liveEtaMinutes;
  const message = booking.arrivalNotificationMessage;
  const isVicinityAlert = Boolean(booking.arrivalEtaThresholdAlert || (typeof etaMinutes === 'number' && etaMinutes < 2));
  const distanceKm = booking.arrivalEtaDistanceKm ?? booking.distanceKm ?? 3.2;

  // Only render if a notification has been sent or an ETA is actively tracked on this booking
  if (!message && typeof etaMinutes !== 'number') {
    return null;
  }

  const formattedTime = booking.arrivalNotificationSentAt
    ? new Date(booking.arrivalNotificationSentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  const displayMessage = message || (etaMinutes !== undefined 
    ? (etaMinutes <= 1 ? `${booking.nurseName || 'Nurse'} is 1 minute away` : `${booking.nurseName || 'Nurse'} is ${etaMinutes} minutes away`)
    : 'Nurse is en route to your location');

  return (
    <div
      className={`rounded-2xl border transition-all p-4 shadow-xl relative overflow-hidden ${
        isVicinityAlert
          ? 'bg-gradient-to-r from-red-950/95 via-rose-950/90 to-slate-900 border-2 border-red-500/80 shadow-red-950/50 ring-2 ring-red-400/40 animate-pulse'
          : 'bg-gradient-to-r from-purple-950/80 via-indigo-950/70 to-slate-900/90 border border-purple-400/50 shadow-purple-950/40'
      } ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className={`p-2.5 rounded-2xl shrink-0 ${
              isVicinityAlert
                ? 'bg-red-500/25 text-red-200 border border-red-400/50 animate-bounce'
                : 'bg-purple-500/25 text-purple-200 border border-purple-400/40'
            }`}
          >
            {isVicinityAlert ? (
              <BellRing className="w-5 h-5 text-red-300" />
            ) : (
              <Radio className="w-5 h-5 text-[#C77DFF] animate-pulse" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  isVicinityAlert
                    ? 'bg-red-500/30 text-red-100 border border-red-400/60'
                    : 'bg-purple-500/30 text-purple-200 border border-purple-400/40'
                }`}
              >
                {isVicinityAlert ? '🚨 In Vicinity Alert (< 2 Mins)' : '📡 Live Arrival Update'}
              </span>
              {formattedTime && (
                <span className="text-[10px] text-slate-300 font-mono">
                  {formattedTime}
                </span>
              )}
            </div>

            <h4 className="text-sm font-extrabold text-white flex items-center gap-1.5 truncate">
              <span>{displayMessage}</span>
            </h4>

            <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#F59E0B] shrink-0" />
              <span>
                Distance: <strong className="text-white">{distanceKm} km</strong> to {booking.clientAddress || booking.zone}
              </span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {onOpenChat && (
            <button
              type="button"
              onClick={() => onOpenChat(booking)}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/15 transition flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5 text-purple-300" />
              <span>Message</span>
            </button>
          )}

          {onCallCaregiver && (
            <button
              type="button"
              onClick={() => onCallCaregiver(booking)}
              className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
