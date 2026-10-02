import React, { useState } from 'react';
import { 
  Radio, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Navigation, 
  Compass, 
  Sparkles,
  RefreshCw,
  BellRing,
  ChevronDown
} from 'lucide-react';
import { Booking, ActivityNotificationType } from '../../types';
import { calculateDistanceKm, estimateTransitMinutes, ALL_ZONES_GEO } from '../../data/geoData';
import { soundFX } from '../../utils/soundEffects';

export interface NotifyArrivalButtonProps {
  booking: Booking;
  currentNurseName?: string;
  onUpdateBookingStatus?: (
    bookingId: string,
    status: Booking['status'],
    clinicalNotes?: any,
    additionalData?: Partial<Booking>
  ) => void;
  onTriggerNotification?: (type: ActivityNotificationType, title: string, description: string, bookingId?: string) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const NotifyArrivalButton: React.FC<NotifyArrivalButtonProps> = ({
  booking,
  currentNurseName,
  onUpdateBookingStatus,
  onTriggerNotification,
  className = '',
  size = 'md'
}) => {
  const [isCalculating, setIsCalculating] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showOptionsDropdown, setShowOptionsDropdown] = useState(false);

  const nurseName = currentNurseName || booking.nurseName || 'Nurse';
  const hasNotified = Boolean(booking.arrivalNotificationMessage || booking.arrivalEtaMinutes !== undefined);
  const currentEtaMins = booking.arrivalEtaMinutes ?? booking.liveEtaMinutes;
  const currentDistanceKm = booking.arrivalEtaDistanceKm ?? booking.distanceKm ?? 3.5;

  // Threshold: under 2 minutes is vicinity alert
  const isUnderTwoMinutes = typeof currentEtaMins === 'number' && currentEtaMins < 2;

  /**
   * Performs distance and transit ETA calculation
   * Supports both GPS/zone coordinate calculation and simulated vicinity testing
   */
  const handleCalculateAndNotify = async (forceMinutes?: number) => {
    if (isCalculating) return;

    setIsCalculating(true);
    soundFX.playRadarPing();

    // Visual radar animation duration (1.6s for high-fidelity scanning experience)
    const calculationPromise = new Promise<{ distanceKm: number; etaMinutes: number }>((resolve) => {
      setTimeout(() => {
        if (typeof forceMinutes === 'number') {
          const simulatedDist = Number((forceMinutes * 0.45).toFixed(1));
          resolve({
            distanceKm: Math.max(0.2, simulatedDist),
            etaMinutes: forceMinutes
          });
          return;
        }

        // Calculate based on zone coordinates or device GPS
        let clientLat = 18.0074;
        let clientLng = -76.7836;

        if (booking.zone && ALL_ZONES_GEO[booking.zone]) {
          clientLat = ALL_ZONES_GEO[booking.zone].lat;
          clientLng = ALL_ZONES_GEO[booking.zone].lng;
        }

        // Nurse live coordinates or offset
        const nurseLat = booking.nurseLiveLat || (clientLat + 0.024);
        const nurseLng = booking.nurseLiveLng || (clientLng - 0.018);

        const dist = calculateDistanceKm(nurseLat, nurseLng, clientLat, clientLng);
        const eta = estimateTransitMinutes(dist);

        resolve({
          distanceKm: Math.max(0.3, dist),
          etaMinutes: Math.max(1, eta)
        });
      }, 1600);
    });

    const result = await calculationPromise;
    const finalEta = result.etaMinutes;
    const finalDistance = result.distanceKm;

    // Message to client as requested: e.g., 'Nurse is 10 minutes away'
    const etaMessage = finalEta <= 1 
      ? `${nurseName} is 1 minute away`
      : `${nurseName} is ${finalEta} minutes away`;

    setIsCalculating(false);

    // Audio feedback depending on threshold
    if (finalEta < 2) {
      soundFX.playProximityAlert();
    } else {
      soundFX.playSuccessPing();
    }

    const nowIso = new Date().toISOString();
    const isVicinityAlert = finalEta < 2;

    // Persist to Booking state
    if (onUpdateBookingStatus) {
      onUpdateBookingStatus(booking.id, booking.status, undefined, {
        liveEtaMinutes: finalEta,
        distanceKm: finalDistance,
        arrivalEtaMinutes: finalEta,
        arrivalEtaDistanceKm: finalDistance,
        arrivalNotificationSentAt: nowIso,
        arrivalNotificationMessage: etaMessage,
        arrivalEtaThresholdAlert: isVicinityAlert
      });
    }

    // Trigger in-app notification to client
    const notifTitle = isVicinityAlert
      ? `🚨 Vicinity Alert: ${nurseName} is ${finalEta <= 1 ? '1 minute' : `${finalEta} minutes`} away!`
      : `🚗 Arrival Update: ${nurseName} is ${finalEta} minutes away`;

    const notifBody = `${etaMessage} (approx ${finalDistance} km from ${booking.clientAddress || booking.zone}). Please be prepared.`;

    if (onTriggerNotification) {
      onTriggerNotification('nurse_arrived', notifTitle, notifBody, booking.id);
    } else {
      soundFX.triggerNotification(notifTitle, notifBody, 'nurse_arrived');
    }

    setToastMessage(etaMessage);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4500);
  };

  const formattedSentTime = booking.arrivalNotificationSentAt
    ? new Date(booking.arrivalNotificationSentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div className={`relative inline-flex flex-col gap-1.5 ${className}`}>
      <div className="relative inline-flex items-center">
        {/* Main 'Notify Arrival' Button */}
        <button
          type="button"
          disabled={isCalculating}
          onClick={() => handleCalculateAndNotify()}
          className={`relative overflow-hidden group transition-all duration-200 font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-sm select-none ${
            size === 'sm' ? 'px-2.5 py-1.5 text-[11px]' : size === 'lg' ? 'px-4 py-2.5 text-xs' : 'px-3 py-1.5 text-[11px]'
          } ${
            // Urgent, pulsing alert status if calculated arrival time is under 2 minutes
            isUnderTwoMinutes
              ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white animate-pulse border border-red-300 shadow-md shadow-red-950/60 ring-2 ring-red-500/50 hover:from-red-500 hover:to-rose-500'
              : hasNotified
              ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white border border-emerald-400/40 shadow-sm hover:from-emerald-500 hover:to-teal-500'
              : 'bg-gradient-to-r from-[#7209B7] via-purple-600 to-indigo-600 text-white border border-purple-400/30 shadow-sm hover:from-purple-600 hover:to-indigo-500'
          }`}
          title="Calculate live distance and notify client of estimated arrival time"
        >
          {/* Default Content (Hidden while calculating radar overlay is active) */}
          <div className={`flex items-center gap-1.5 ${isCalculating ? 'opacity-0' : 'opacity-100'}`}>
            {isUnderTwoMinutes ? (
              <>
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-200 opacity-90"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
                </span>
                <AlertTriangle className="w-4 h-4 text-white animate-bounce shrink-0" />
                <span className="tracking-wide">
                  Vicinity ({currentEtaMins}m)
                </span>
              </>
            ) : hasNotified ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
                <span>
                  {currentEtaMins}m away ({currentDistanceKm} km)
                </span>
                <RefreshCw className="w-3 h-3 text-emerald-200/80 group-hover:rotate-180 transition-transform duration-500" />
              </>
            ) : (
              <>
                <Radio className="w-4 h-4 text-[#C77DFF] group-hover:scale-110 transition-transform shrink-0" />
                <span className="tracking-wide">Notify Arrival</span>
              </>
            )}
          </div>

          {/* Visual Radar-like Animation Overlay (Pinging Radar Status) */}
          {isCalculating && (
            <div className="absolute inset-0 z-20 bg-slate-950/95 flex items-center justify-center px-2 overflow-hidden">
              {/* Concentric Radar Sonar Waves */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="absolute w-20 h-20 rounded-full border border-emerald-400/30 animate-ping"></span>
                <span className="absolute w-12 h-12 rounded-full border border-cyan-400/50 animate-ping delay-100"></span>
                <span className="absolute w-6 h-6 rounded-full border border-emerald-300/70 animate-ping delay-200"></span>
                {/* Radar Grid Crosshairs */}
                <div className="absolute w-full h-[1px] bg-emerald-500/20"></div>
                <div className="absolute h-full w-[1px] bg-emerald-500/20"></div>
                {/* Sweeping Radar Beam */}
                <div 
                  className="absolute w-16 h-16 rounded-full border border-emerald-500/40 animate-spin"
                  style={{
                    background: 'conic-gradient(from 0deg, rgba(16, 185, 129, 0.4) 0deg, rgba(16, 185, 129, 0) 90deg)',
                    animationDuration: '1.2s'
                  }}
                />
              </div>

              {/* Radar Status Badge & Central Ping Blip */}
              <div className="relative z-10 flex items-center gap-1.5 text-emerald-300 font-bold text-[11px] tracking-wide">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-90"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                </span>
                <span className="animate-pulse">Pinging Radar...</span>
              </div>
            </div>
          )}
        </button>

        {/* Quick Simulation Preset Dropdown Button (Allows testing both normal and <2 min threshold) */}
        <div className="relative inline-block ml-1">
          <button
            type="button"
            onClick={() => setShowOptionsDropdown(prev => !prev)}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white border border-white/15 transition cursor-pointer"
            title="Options: auto GPS or test <2 min threshold"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {showOptionsDropdown && (
            <div className="absolute right-0 top-full mt-1.5 w-56 p-1.5 rounded-2xl bg-[#140622]/98 border border-white/15 shadow-2xl backdrop-blur-2xl z-50 text-xs space-y-0.5">
              <div className="px-2 py-1 text-[9px] font-black text-purple-300/70 uppercase tracking-wider border-b border-white/10 mb-1">
                GPS &amp; Vicinity Radar
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowOptionsDropdown(false);
                  handleCalculateAndNotify();
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-white/10 text-white font-medium text-[11px] transition flex items-center gap-2 cursor-pointer"
              >
                <Compass className="w-4 h-4 text-purple-300 shrink-0" />
                <span>Auto GPS Distance</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowOptionsDropdown(false);
                  handleCalculateAndNotify(1);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-red-500/20 text-red-300 font-bold text-[11px] transition flex items-center gap-2 cursor-pointer"
              >
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>Test Vicinity (&lt; 2m Alert)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowOptionsDropdown(false);
                  handleCalculateAndNotify(5);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-white/10 text-slate-200 font-medium text-[11px] transition flex items-center gap-2 cursor-pointer"
              >
                <Clock className="w-4 h-4 text-amber-300 shrink-0" />
                <span>Simulate 5m ETA</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowOptionsDropdown(false);
                  handleCalculateAndNotify(10);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-white/10 text-slate-200 font-medium text-[11px] transition flex items-center gap-2 cursor-pointer"
              >
                <Clock className="w-4 h-4 text-emerald-300 shrink-0" />
                <span>Simulate 10m ETA</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Visual Threshold Warning Banner: If calculated arrival time is under 2 minutes */}
      {isUnderTwoMinutes && (
        <div className="p-2.5 rounded-xl bg-red-950/80 border-2 border-red-500/70 text-red-100 text-[11px] font-semibold flex items-center gap-2 shadow-lg animate-fadeIn max-w-sm">
          <BellRing className="w-4 h-4 text-red-300 shrink-0 animate-bounce" />
          <div>
            <strong className="text-white block font-black">
              ⚠️ Vicinity Threshold Warning (&lt; 2 Minutes)
            </strong>
            <span>
              You have reached the immediate vicinity of {booking.clientAddress || booking.zone}. Prepare PPE and knock/ring doorbell.
            </span>
          </div>
        </div>
      )}

      {/* Confirmation feedback status */}
      {hasNotified && !isUnderTwoMinutes && (
        <div className="text-[10px] text-emerald-300/90 font-medium flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
          <span>
            Client informed: <strong>{booking.arrivalNotificationMessage || `Nurse is ${currentEtaMins} minutes away`}</strong>
            {formattedSentTime ? ` (${formattedSentTime})` : ''}
          </span>
        </div>
      )}

      {/* Pop-up toast confirmation */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 border-2 border-emerald-400 text-white p-3.5 rounded-2xl shadow-2xl backdrop-blur-xl animate-fadeIn flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300">
            <Radio className="w-4 h-4 animate-ping" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-400 block tracking-wider">
              Client Notified of Arrival
            </span>
            <strong className="text-xs text-white block">{toastMessage}</strong>
          </div>
        </div>
      )}
    </div>
  );
};
