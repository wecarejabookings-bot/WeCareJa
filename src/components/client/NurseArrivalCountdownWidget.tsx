import React, { useState, useEffect, useRef } from 'react';
import { Booking } from '../../types';
import { soundFX } from '../../utils/soundEffects';
import { PPESafetyNotice } from '../common/PPESafetyNotice';
import { QuickSOSButton } from '../common/QuickSOSButton';
import { 
  Clock, 
  Navigation, 
  AlertTriangle, 
  CheckCircle2, 
  Volume2, 
  ShieldAlert, 
  PhoneCall, 
  Car, 
  Timer, 
  Sparkles,
  MapPin,
  RefreshCw
} from 'lucide-react';

interface NurseArrivalCountdownWidgetProps {
  booking: Booking;
  onOpenChat: (booking: Booking) => void;
  onOpenPanic: (booking?: Booking) => void;
  onUpdateBookingStatus?: (
    bookingId: string,
    status: Booking['status'],
    clinicalNotes?: any,
    additionalData?: Partial<Booking>
  ) => void;
  onTriggerNotification?: (type: any, title: string, description: string, bookingId?: string) => void;
}

export const NurseArrivalCountdownWidget: React.FC<NurseArrivalCountdownWidgetProps> = ({
  booking,
  onOpenChat,
  onOpenPanic,
  onUpdateBookingStatus,
  onTriggerNotification
}) => {
  // Initial transit duration in seconds (from liveEtaMinutes or default 12 minutes for Kingston dispatch)
  const initialSeconds = (booking.liveEtaMinutes || 12) * 60;
  const [secondsRemaining, setSecondsRemaining] = useState<number>(initialSeconds);
  const [isDelayed, setIsDelayed] = useState<boolean>(false);
  const [delayReason, setDelayReason] = useState<string>('Heavy traffic along Hope Road / Half-Way Tree');
  const [isSimulatedArrived, setIsSimulatedArrived] = useState<boolean>(false);

  const playedLateAlertRef = useRef<boolean>(false);

  // Live countdown ticker
  useEffect(() => {
    if (booking.status !== 'en_route' && booking.status !== 'accepted' && booking.status !== 'requested') {
      return;
    }

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          // If countdown runs down to zero without being marked arrived, trigger Late alert
          if (!playedLateAlertRef.current && !isSimulatedArrived) {
            playedLateAlertRef.current = true;
            setIsDelayed(true);
            soundFX.playNurseLateAlert();
          }
          return 0;
        }

        // Tick on last 5 seconds
        if (prev <= 5 && prev > 1) {
          soundFX.playCountdownTick(false);
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [booking.status, isSimulatedArrived]);

  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  const formattedCountdown = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  const handleSimulateLate = () => {
    setIsDelayed(true);
    setSecondsRemaining(0);
    soundFX.playNurseLateAlert();
    playedLateAlertRef.current = true;
  };

  const handleSimulateNormal = () => {
    setIsDelayed(false);
    setIsSimulatedArrived(false);
    setSecondsRemaining(600); // 10 mins
    soundFX.playSuccessPing();
    playedLateAlertRef.current = false;
  };

  const handleSimulateArrived = () => {
    setIsSimulatedArrived(true);
    setIsDelayed(false);
    setSecondsRemaining(0);
    soundFX.playBookingConfirmed();
  };

  return (
    <div className={`p-4 rounded-2xl border transition shadow-xl space-y-3 ${
      isDelayed 
        ? 'bg-gradient-to-br from-red-950/70 via-[#1b0509] to-red-900/50 border-red-500/50 shadow-red-950/40' 
        : isSimulatedArrived
        ? 'bg-gradient-to-br from-emerald-950/70 via-[#061c14] to-teal-950/50 border-emerald-500/40 shadow-emerald-950/30'
        : 'bg-gradient-to-br from-[#160626] via-[#10041d] to-[#200730] border-purple-500/30 shadow-purple-950/30'
    } text-white`}>
      
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-xl border ${
            isDelayed 
              ? 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse' 
              : isSimulatedArrived
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
          }`}>
            <Car className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 block">
              Nurse Dispatch &amp; Live Arrival Status
            </span>
            <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
              <span>{booking.nurseName || 'Assigned Nurse'} en route to {booking.zone}</span>
              {isDelayed && (
                <span className="px-2 py-0.5 rounded-full bg-red-500 text-white font-extrabold text-[10px] flex items-center gap-1 animate-bounce">
                  <AlertTriangle className="w-3 h-3" /> LATE / DELAYED
                </span>
              )}
            </h4>
          </div>
        </div>

        {/* Safety PIN & Audio Chime */}
        <div className="flex items-center gap-2">
          {booking.safetyPin && (
            <div className="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-400/40 text-amber-200 text-center">
              <span className="text-[9px] uppercase tracking-wider block font-bold text-amber-300">Doorstep PIN</span>
              <span className="text-xs font-mono font-black tracking-widest">{booking.safetyPin}</span>
            </div>
          )}
          <button
            type="button"
            onClick={() => soundFX.playNurseLateAlert()}
            className="px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/30 text-[10px] font-bold flex items-center gap-1 transition"
            title="Preview Nurse Late warning chime"
          >
            <Volume2 className="w-3 h-3 text-red-400" />
            <span>Late Chime</span>
          </button>
        </div>
      </div>

      {/* Main Countdown Meter */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
        {/* Big Countdown Box */}
        <div className="bg-black/30 rounded-xl p-3.5 border border-white/10 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            {isDelayed ? 'Overdue Delay Time' : isSimulatedArrived ? 'Arrived On-Site' : 'Estimated Arrival In'}
          </span>
          
          <div className={`text-2xl sm:text-3xl font-mono font-black tracking-wider mt-0.5 ${
            isDelayed ? 'text-red-400 animate-pulse' : isSimulatedArrived ? 'text-emerald-400' : 'text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-white to-purple-200'
          }`}>
            {isSimulatedArrived ? 'NURSE ON SITE' : formattedCountdown}
          </div>

          <p className="text-[11px] text-slate-300 mt-1">
            {isDelayed ? (
              <span className="text-red-300 font-semibold flex items-center gap-1 justify-center">
                <AlertTriangle className="w-3 h-3 text-red-400" />
                Past scheduled arrival time
              </span>
            ) : isSimulatedArrived ? (
              <span className="text-emerald-300 font-semibold flex items-center gap-1 justify-center">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Sterile kit unpack in progress
              </span>
            ) : (
              <span className="text-slate-300">Live GPS tracking active in Kingston</span>
            )}
          </p>
        </div>

        {/* Status Explanation / Actions */}
        <div className="space-y-2 text-xs">
          {isDelayed ? (
            <div className="p-2.5 rounded-xl bg-red-500/20 border border-red-500/30 text-red-200 text-xs space-y-1">
              <span className="font-bold flex items-center gap-1.5 text-white">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                Kingston Road Transit Delay Notice:
              </span>
              <p className="text-[11px] text-slate-200 leading-relaxed">
                {delayReason}. The nurse is actively en route. Call directly or alert We Care dispatch if you need urgent rescheduling.
              </p>
            </div>
          ) : (
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-xs space-y-1">
              <div className="flex items-center justify-between text-purple-200 font-semibold">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  Destination: {booking.clientAddress}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Nurse is travelling with sealed PPE, medical vitals kit, and dressing pack.
              </p>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              onClick={() => onOpenChat(booking)}
              className="px-3 py-1.5 rounded-xl bg-[#1E1B4B] hover:bg-[#5A0694] text-white font-bold text-xs transition flex items-center gap-1 shadow-sm"
            >
              <PhoneCall className="w-3 h-3" />
              <span>Contact Nurse</span>
            </button>

            <QuickSOSButton
              booking={booking}
              userRole="client"
              onUpdateBookingStatus={onUpdateBookingStatus}
              onTriggerNotification={onTriggerNotification}
              size="sm"
            />

            <button
              onClick={() => onOpenPanic(booking)}
              className="px-3 py-1.5 rounded-xl bg-red-600/30 hover:bg-red-600/50 text-red-200 border border-red-500/40 font-bold text-xs transition flex items-center gap-1"
            >
              <ShieldAlert className="w-3 h-3 text-red-400" />
              <span>119 Safety Alert</span>
            </button>
          </div>
        </div>
      </div>

      {/* On-Arrival Personal Protection & PPE Reminder */}
      <PPESafetyNotice variant="on_arrival" userRole="client" className="my-1" />

      {/* Simulation Controls for testing Late Alerts & Sounds */}
      <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-[#C77DFF]" />
          <span>Interactive ETA &amp; Late Chime Simulator:</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleSimulateNormal}
            className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-slate-200 font-bold transition"
            title="Reset to 10 min normal transit"
          >
            Reset (10m)
          </button>
          <button
            type="button"
            onClick={handleSimulateLate}
            className="px-2 py-1 rounded bg-red-500/30 hover:bg-red-500/50 text-white font-bold transition"
            title="Trigger Late Nurse alert and chime"
          >
            ⚠️ Simulate Late Alert
          </button>
          <button
            type="button"
            onClick={handleSimulateArrived}
            className="px-2 py-1 rounded bg-emerald-500/30 hover:bg-emerald-500/50 text-emerald-200 font-bold transition"
            title="Simulate nurse arrived on site"
          >
            ✅ Simulate Arrived
          </button>
        </div>
      </div>
    </div>
  );
};
