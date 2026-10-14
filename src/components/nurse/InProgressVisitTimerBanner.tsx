import React, { useState, useEffect } from 'react';
import { Booking } from '../../types';
import { soundFX } from '../../utils/soundEffects';
import { 
  Timer, 
  MapPin, 
  User, 
  CheckCircle2, 
  FileText, 
  ChevronRight, 
  Sparkles, 
  AlertCircle,
  Clock,
  ExternalLink
} from 'lucide-react';

interface InProgressVisitTimerBannerProps {
  booking: Booking;
  onNavigateToActiveTab: () => void;
  onOpenCloseoutModal: (booking: Booking, calculatedMins?: number, startedIso?: string, endedIso?: string) => void;
  onUpdateBookingStatus: (
    bookingId: string, 
    status: Booking['status'], 
    clinicalNotes?: any,
    additionalData?: Partial<Booking>
  ) => void;
}

export const InProgressVisitTimerBanner: React.FC<InProgressVisitTimerBannerProps> = ({
  booking,
  onNavigateToActiveTab,
  onOpenCloseoutModal,
  onUpdateBookingStatus
}) => {
  const baseMinutes = booking.baseDurationMinutes || 45;
  const basePrice = booking.basePriceJMD || booking.priceJMD;
  const hourlyRate = booking.hourlyRateJMD || 7500;
  const overtimeRatePerMin = hourlyRate / 60;

  // Calculate live elapsed seconds
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(() => {
    if (booking.visitStartedAt) {
      return Math.max(0, Math.floor((Date.now() - new Date(booking.visitStartedAt).getTime()) / 1000));
    }
    return 0;
  });

  useEffect(() => {
    // If visitStartedAt is missing, initialize it
    if (!booking.visitStartedAt) {
      const now = new Date().toISOString();
      booking.visitStartedAt = now;
      onUpdateBookingStatus(booking.id, 'in_progress', undefined, { visitStartedAt: now });
    }

    const interval = setInterval(() => {
      if (booking.visitStartedAt) {
        const diff = Math.max(0, Math.floor((Date.now() - new Date(booking.visitStartedAt).getTime()) / 1000));
        setElapsedSeconds(diff);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [booking.id, booking.visitStartedAt, onUpdateBookingStatus]);

  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  const overtimeMinutes = Math.max(0, elapsedMinutes - baseMinutes);
  const overtimeFee = Math.round(overtimeMinutes * overtimeRatePerMin);
  const currentTotalFee = basePrice + overtimeFee;
  const nurseEarnings = Math.round(currentTotalFee * 0.85);
  const progressPercent = Math.min(100, Math.round((elapsedMinutes / baseMinutes) * 100));

  const formatTime = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatJMD = (amount: number) => `JMD $${amount.toLocaleString()}`;

  const handleSimulateTime = (extraMins: number) => {
    const newSeconds = elapsedSeconds + extraMins * 60;
    const simulatedStart = new Date(Date.now() - newSeconds * 1000).toISOString();
    booking.visitStartedAt = simulatedStart;
    setElapsedSeconds(newSeconds);
    soundFX.playCountdownTick(true);
    onUpdateBookingStatus(booking.id, 'in_progress', undefined, { visitStartedAt: simulatedStart });
  };

  return (
    <aside 
      aria-label="Active in-progress clinical visit HUD"
      className="rounded-2xl bg-gradient-to-r from-emerald-950/90 via-[#190827] to-[#12041d] border border-emerald-500/40 p-3.5 sm:p-4 shadow-xl shadow-emerald-950/30 text-white animate-fadeIn"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
        {/* Left info cluster */}
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-inner flex items-center justify-center shrink-0">
            <Timer className="w-5 h-5 animate-pulse" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/25 text-emerald-300 border border-emerald-400/50 flex items-center gap-1.5 shadow-xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Active Care Visit In-Progress</span>
              </span>

              <span className="text-[11px] font-mono text-slate-300">#{booking.id}</span>
            </div>

            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1">
              <h4 className="text-sm font-extrabold text-white">
                {booking.serviceName}
              </h4>
              <span className="text-slate-400 text-xs">•</span>
              <span className="text-xs font-semibold text-purple-200 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-purple-400" />
                {booking.clientName}
              </span>
              <span className="text-slate-400 text-xs">•</span>
              <span className="text-xs text-slate-300 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-red-400" />
                {booking.zone}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Live Timer & Progress Display */}
        <div className="flex flex-wrap items-center gap-4 bg-black/40 px-4 py-2.5 rounded-xl border border-white/10 shrink-0">
          <div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">
              Elapsed Duration
            </span>
            <span className="text-2xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-white to-purple-200 tracking-wider">
              {formatTime(elapsedSeconds)}
            </span>
          </div>

          <div className="h-8 w-px bg-white/10 hidden sm:block" />

          <div className="space-y-1 min-w-[140px]">
            <div className="flex justify-between text-[10px] font-semibold">
              <span className="text-slate-300">{elapsedMinutes}m of {baseMinutes}m base</span>
              <span className="font-mono text-emerald-400 font-bold">{progressPercent}%</span>
            </div>
            
            <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${
                  overtimeMinutes > 0 ? 'bg-gradient-to-r from-emerald-400 via-amber-400 to-red-500' : 'bg-gradient-to-r from-emerald-400 to-teal-300'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="text-[10px]">
              {overtimeMinutes > 0 ? (
                <span className="text-red-300 font-bold flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-red-400" />
                  +{overtimeMinutes}m OT ({formatJMD(overtimeFee)})
                </span>
              ) : (
                <span className="text-emerald-400 font-medium">
                  {Math.max(0, baseMinutes - elapsedMinutes)}m remaining on schedule
                </span>
              )}
            </div>
          </div>

          <div className="h-8 w-px bg-white/10 hidden md:block" />

          <div className="hidden md:block text-right">
            <span className="text-[9px] font-bold uppercase text-slate-400 block">
              Your Net Payout
            </span>
            <span className="text-xs font-mono font-black text-emerald-400">
              {formatJMD(nurseEarnings)}
            </span>
          </div>
        </div>

        {/* Right quick actions */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onNavigateToActiveTab}
            className="px-3.5 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-400/40 text-xs font-bold transition flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Visit Details</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenCloseoutModal(booking, Math.max(1, Math.ceil(elapsedSeconds / 60)))}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#7209B7] to-[#E63946] hover:opacity-95 text-white font-bold text-xs shadow-md shadow-purple-950/40 transition flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Complete &amp; Invoice</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
