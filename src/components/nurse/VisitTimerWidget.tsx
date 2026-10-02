import React, { useState, useEffect, useRef } from 'react';
import { Booking } from '../../types';
import { soundFX } from '../../utils/soundEffects';
import confetti from 'canvas-confetti';
import { 
  Play, 
  Pause, 
  Square, 
  Clock, 
  DollarSign, 
  ShieldCheck, 
  Zap, 
  AlertCircle, 
  CheckCircle2, 
  Timer, 
  Sparkles,
  ChevronRight,
  RotateCcw,
  Volume2,
  BellRing,
  Lock,
  QrCode,
  KeyRound,
  PhoneCall,
  Check,
  AlertTriangle
} from 'lucide-react';
import { verifyScannedVisitData, getArrivalPassCode } from '../../utils/arrivalVerification';

interface VisitTimerWidgetProps {
  booking: Booking;
  userRole?: 'nurse' | 'client';
  onStartTimer: (bookingId: string) => void;
  onPauseTimer?: (bookingId: string, elapsedSeconds: number) => void;
  onEndTimer?: (bookingId: string, totalElapsedMinutes: number, startedAt: string, endedAt: string) => void;
  onOpenArrivalScanner?: (booking: Booking) => void;
  onVerifyArrivalSuccess?: (bookingId: string, arrivalData: any) => void;
}

export const VisitTimerWidget: React.FC<VisitTimerWidgetProps> = ({
  booking,
  userRole = 'nurse',
  onStartTimer,
  onEndTimer,
  onOpenArrivalScanner,
  onVerifyArrivalSuccess
}) => {
  const baseMinutes = booking.baseDurationMinutes || 45;
  const basePrice = booking.basePriceJMD || booking.priceJMD;
  const nurseRatePerHour = booking.hourlyRateJMD || 7500;
  const overtimeRatePerMin = nurseRatePerHour / 60;

  // Doorstep arrival code verification check
  const isArrivalVerified = Boolean(booking.arrivalVerified || booking.status === 'in_progress');
  const [manualCodeInput, setManualCodeInput] = useState<string>('');
  const [codeError, setCodeError] = useState<string | null>(null);
  const [showCodeInput, setShowCodeInput] = useState<boolean>(false);

  // Track timer state
  const isStarted = !!booking.visitStartedAt;
  const [isRunning, setIsRunning] = useState<boolean>(isStarted && booking.status === 'in_progress');
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(() => {
    if (booking.visitStartedAt) {
      const diff = Math.max(0, Math.floor((Date.now() - new Date(booking.visitStartedAt).getTime()) / 1000));
      return diff;
    }
    return 0;
  });

  // Reactive synchronization when booking status or visitStartedAt updates
  useEffect(() => {
    if (booking.visitStartedAt) {
      const diff = Math.max(0, Math.floor((Date.now() - new Date(booking.visitStartedAt).getTime()) / 1000));
      setElapsedSeconds(diff);
      if (booking.status === 'in_progress') {
        setIsRunning(true);
      } else {
        setIsRunning(false);
      }
    } else if (booking.status === 'in_progress') {
      const now = new Date().toISOString();
      booking.visitStartedAt = now;
      setIsRunning(true);
      setElapsedSeconds(0);
    } else {
      setIsRunning(false);
    }
  }, [booking.status, booking.visitStartedAt]);

  const playedTimeUpRef = useRef<boolean>(false);
  const played5MinRef = useRef<boolean>(false);

  // Keep ticking when running & check sound milestones
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && booking.visitStartedAt) {
      interval = setInterval(() => {
        const diff = Math.max(0, Math.floor((Date.now() - new Date(booking.visitStartedAt!).getTime()) / 1000));
        setElapsedSeconds(diff);

        const currentMins = Math.floor(diff / 60);

        // 5-min warning chime
        if (baseMinutes > 5 && currentMins === baseMinutes - 5 && !played5MinRef.current) {
          played5MinRef.current = true;
          soundFX.play5MinWarning();
        }

        // Time up / Departure chime (when base duration has elapsed)
        if (currentMins >= baseMinutes && !playedTimeUpRef.current) {
          playedTimeUpRef.current = true;
          soundFX.playNurseTimeUp();
        }
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, booking.visitStartedAt, baseMinutes]);

  // Calculations
  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  const overtimeMinutes = Math.max(0, elapsedMinutes - baseMinutes);
  const calculatedOvertimeFee = Math.round(overtimeMinutes * overtimeRatePerMin);
  const currentTotalFee = basePrice + calculatedOvertimeFee;
  const currentNurseEarnings = Math.round(currentTotalFee * 0.85);
  const currentPlatformFee = currentTotalFee - currentNurseEarnings;

  // Progress percentage relative to base scheduled duration
  const progressPercent = Math.min(100, Math.round((elapsedMinutes / baseMinutes) * 100));

  // Format time display HH:MM:SS
  const formatTime = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatJMD = (amount: number) => `JMD $${amount.toLocaleString()}`;

  // Quick simulation helper for instant testing
  const handleSimulateMinutes = (additionalMins: number) => {
    const newTotalSeconds = (elapsedMinutes + additionalMins) * 60;
    setElapsedSeconds(newTotalSeconds);
    const simulatedMins = Math.floor(newTotalSeconds / 60);

    // If simulating past base minutes, trigger time up sound
    if (simulatedMins >= baseMinutes) {
      soundFX.playNurseTimeUp();
      playedTimeUpRef.current = true;
    } else {
      soundFX.playCountdownTick(true);
    }

    // If not started yet, trigger start with backdated timestamp
    if (!booking.visitStartedAt) {
      const simulatedStartTime = new Date(Date.now() - newTotalSeconds * 1000).toISOString();
      booking.visitStartedAt = simulatedStartTime;
      setIsRunning(true);
      onStartTimer(booking.id);
    }
  };

  const handleVerifyCodeAndStart = (codeToVerify?: string) => {
    const code = (codeToVerify || manualCodeInput).trim();
    if (!code) {
      setCodeError('Please enter the 4-digit doorstep code provided by the client or family member.');
      soundFX.playCancellation();
      return;
    }

    const verification = verifyScannedVisitData(code, booking, 'check_in');
    if (verification.success) {
      setCodeError(null);
      soundFX.playSuccessPing();
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10B981', '#FFD166', '#7209B7', '#4CC9F0']
      });

      const now = new Date().toISOString();
      const arrivalPayload = {
        arrivalVerified: true,
        arrivalVerifiedAt: now,
        arrivalVerificationMethod: 'passcode_entry' as const,
        arrivalGpsLocation: booking.zone,
        visitStartedAt: now
      };

      if (onVerifyArrivalSuccess) {
        onVerifyArrivalSuccess(booking.id, arrivalPayload);
      }

      booking.arrivalVerified = true;
      booking.arrivalVerifiedAt = now;
      booking.visitStartedAt = now;
      booking.status = 'in_progress';
      setIsRunning(true);
      onStartTimer(booking.id);
    } else {
      setCodeError(verification.reason || 'Invalid arrival code. Please ask the client or their remote family member for the correct 4-digit PIN.');
      soundFX.playCancellation();
    }
  };

  const handleStart = () => {
    // Strictly enforce requirement: without the nurse scanning or putting in the doorstep arrival code, they can't start a visit!
    if (!isArrivalVerified) {
      setShowCodeInput(true);
      setCodeError('Doorstep Arrival Code Required: You cannot start this visit without scanning the client QR pass or entering the 4-digit arrival code.');
      soundFX.playCancellation();
      if (onOpenArrivalScanner) {
        onOpenArrivalScanner(booking);
      }
      return;
    }

    const now = new Date().toISOString();
    booking.visitStartedAt = now;
    setIsRunning(true);
    soundFX.playSuccessPing();
    onStartTimer(booking.id);
  };

  const handleTogglePause = () => {
    const nextState = !isRunning;
    setIsRunning(nextState);
    if (nextState) {
      soundFX.playSuccessPing();
    } else {
      soundFX.playCountdownTick();
    }
  };

  const handleEnd = () => {
    if (!onEndTimer) return;
    const finalElapsedMins = Math.max(1, Math.ceil(elapsedSeconds / 60));
    const startIso = booking.visitStartedAt || new Date(Date.now() - elapsedSeconds * 1000).toISOString();
    const endIso = new Date().toISOString();
    setIsRunning(false);
    soundFX.playVisitCompleted();
    confetti({
      particleCount: 75,
      spread: 65,
      origin: { y: 0.6 },
      colors: ['#7209B7', '#E63946', '#10B981', '#FFD166']
    });
    onEndTimer(booking.id, finalElapsedMins, startIso, endIso);
  };

  return (
    <div className="rounded-2xl bg-gradient-to-br from-[#1b0a2a] via-[#150622] to-[#250933] border border-purple-500/30 p-4 sm:p-5 shadow-2xl text-white space-y-4">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-xl border ${
            isRunning 
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 animate-pulse' 
              : isStarted 
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              : 'bg-purple-500/20 text-[#C77DFF] border-purple-500/30'
          }`}>
            <Timer className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 block">
              {userRole === 'client' ? 'Client Care Session Clock & Transparent Billing' : 'Clinical Visit Care Timer & Auto-Invoice'}
            </span>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              {booking.serviceName}
              {isRunning && (
                <span className="flex items-center gap-1 text-[10px] font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Clock Ticking
                </span>
              )}
            </h4>
          </div>
        </div>

        {isStarted && (
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block">Clock-In Time:</span>
            <span className="text-xs font-mono font-bold text-white">
              {new Date(booking.visitStartedAt!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
        )}
      </div>

      {/* Main Stopwatch & Live Invoice Metric Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        {/* Left: Big Stopwatch Display */}
        <div className="bg-black/30 rounded-2xl p-4 border border-white/10 flex flex-col items-center justify-center text-center">
          <div className="flex items-center justify-between w-full mb-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-300 tracking-wider flex items-center gap-1">
              <Timer className="w-3.5 h-3.5 text-purple-400" />
              {userRole === 'client' ? 'Active Home Visit Time' : 'Care Visit In-Progress'}
            </span>
            {isRunning ? (
              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live Elapsed Timer
              </span>
            ) : isStarted ? (
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Timer Paused
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                Ready to Start
              </span>
            )}
          </div>

          <div className="text-3xl sm:text-4xl font-mono font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-100 to-[#C77DFF] drop-shadow-sm">
            {formatTime(elapsedSeconds)}
          </div>

          <div className="text-[11px] font-medium text-slate-300 mt-1 flex flex-wrap items-center justify-center gap-1.5">
            <span>Elapsed: <strong className="text-white font-mono">{elapsedMinutes}m {elapsedSeconds % 60}s</strong></span>
            <span className="text-slate-500">•</span>
            <span>Scheduled: <strong className="text-purple-300 font-mono">{baseMinutes}m</strong></span>
            {overtimeMinutes === 0 ? (
              <>
                <span className="text-slate-500">•</span>
                <span className="text-emerald-400 font-mono text-[10px] bg-emerald-500/15 px-1.5 py-0.2 rounded border border-emerald-500/30">
                  {Math.max(0, baseMinutes - elapsedMinutes)}m remaining
                </span>
              </>
            ) : (
              <>
                <span className="text-slate-500">•</span>
                <span className="text-amber-300 font-mono font-bold text-[10px] bg-red-500/20 px-1.5 py-0.2 rounded border border-red-500/30">
                  +{overtimeMinutes}m overtime
                </span>
              </>
            )}
          </div>
          
          <div className="w-full mt-3 space-y-1.5">
            <div className="flex justify-between text-[11px] font-semibold text-slate-300">
              <span>Duration Progress</span>
              <span className="font-mono text-xs">{progressPercent}%</span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${
                  overtimeMinutes > 0 ? 'bg-gradient-to-r from-emerald-400 via-purple-400 to-[#E63946]' : 'bg-gradient-to-r from-[#7209B7] to-emerald-400'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {overtimeMinutes > 0 ? (
              <div className="p-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-xs text-red-200 space-y-1.5 animate-pulse">
                <div className="flex items-center justify-between font-bold text-red-300">
                  <span className="flex items-center gap-1.5">
                    <BellRing className="w-4 h-4 text-red-400" />
                    Scheduled Time Up • Location Departure Notice
                  </span>
                  <button
                    type="button"
                    onClick={() => soundFX.playNurseTimeUp()}
                    className="px-2 py-0.5 rounded bg-red-500/30 hover:bg-red-500/50 text-[10px] text-white font-bold flex items-center gap-1 transition"
                    title="Play departure alert chime"
                  >
                    <Volume2 className="w-3 h-3" /> Chime
                  </button>
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-200">
                  <span>Base window ({baseMinutes}m) complete:</span>
                  <span className="font-bold text-amber-300">+{overtimeMinutes} mins OT ({formatJMD(calculatedOvertimeFee)})</span>
                </div>
              </div>
            ) : elapsedMinutes >= baseMinutes - 5 && isRunning ? (
              <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-[11px] text-amber-300 flex items-center justify-between">
                <span className="flex items-center gap-1 font-semibold">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  Approaching Scheduled Departure ({baseMinutes - elapsedMinutes}m remaining)
                </span>
                <button
                  type="button"
                  onClick={() => soundFX.play5MinWarning()}
                  className="px-2 py-0.5 rounded bg-amber-500/30 text-[10px] text-white font-bold flex items-center gap-1"
                >
                  <Volume2 className="w-3 h-3" /> Preview
                </button>
              </div>
            ) : null}
          </div>
        </div>

        {/* Right: Dynamic Auto-Invoice & Split Meter */}
        <div className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-2.5 text-xs">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="font-bold text-slate-300 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-[#C77DFF]" />
              {userRole === 'client' ? 'Transparent Fee Meter' : 'Auto-Calculated Invoice Summary'}
            </span>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/15 px-2 py-0.5 rounded-full">
              Live Billing
            </span>
          </div>

          <div className="space-y-1.5 text-[11px]">
            <div className="flex justify-between text-slate-300">
              <span>Base Care Service ({baseMinutes} mins):</span>
              <span className="font-mono text-white font-bold">{formatJMD(basePrice)}</span>
            </div>

            <div className="flex justify-between text-slate-300">
              <span>Additional Time ({overtimeMinutes} mins):</span>
              <span className="font-mono text-amber-300 font-bold">+{formatJMD(calculatedOvertimeFee)}</span>
            </div>

            {userRole === 'nurse' ? (
              <div className="flex justify-between text-emerald-200 bg-emerald-500/15 p-2 rounded-xl border border-emerald-500/30 text-[11px] font-bold">
                <span>Your Guaranteed Net Payout:</span>
                <span className="text-emerald-400 font-mono text-xs">{formatJMD(currentNurseEarnings)}</span>
              </div>
            ) : (
              <>
                <div className="flex justify-between text-slate-300 pt-1 border-t border-white/5 font-semibold">
                  <span className="text-white">Current Total Amount:</span>
                  <span className="font-mono text-emerald-400 font-black text-xs">{formatJMD(currentTotalFee)}</span>
                </div>
                <div className="flex justify-between text-emerald-200 bg-emerald-500/15 p-2 rounded-xl border border-emerald-500/30 text-[11px] font-medium">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    We Care Escrow Guarantee
                  </span>
                  <span className="text-emerald-300 font-bold">Protected</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Timer Controls & Doorstep Verification Gate */}
      <div className="pt-1 space-y-3">
        {!isStarted && !isArrivalVerified ? (
          <div className="w-full p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-[#2a1306]/70 to-purple-950/40 border-2 border-amber-400/50 text-white space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-500/25 text-amber-300 border border-amber-400/50 shrink-0">
                <Lock className="w-5 h-5 text-amber-300" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full">
                    Doorstep Code Required
                  </span>
                  <span className="text-xs font-bold text-amber-200">
                    Visit Start Locked Until Code Verified
                  </span>
                </div>
                <p className="text-xs text-slate-200">
                  {userRole === 'nurse'
                    ? "Without scanning or putting in the doorstep arrival code, you cannot start this visit. The client must show the QR scan or tell you the code. If the client is unable to use a device, their relative or family member elsewhere can use their device and tell you the code."
                    : "Please present your Doorstep QR scan or tell your caregiver the 4-digit security code. If you are resting or unable to use your device, your family member elsewhere can view the code and relay it to the nurse."}
                </p>
              </div>
            </div>

            {userRole === 'nurse' ? (
              <div className="space-y-2 pt-2 border-t border-white/10">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="relative flex-1">
                    <KeyRound className="w-4 h-4 text-purple-300 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Enter 4-digit code (e.g. 4829)..."
                      value={manualCodeInput}
                      onChange={(e) => {
                        setManualCodeInput(e.target.value);
                        setCodeError(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleVerifyCodeAndStart();
                        }
                      }}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/60 border border-white/20 text-xs font-mono font-bold text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
                      maxLength={12}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleVerifyCodeAndStart()}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white font-black text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/40 cursor-pointer shrink-0"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Verify PIN &amp; Start Visit</span>
                  </button>

                  {onOpenArrivalScanner && (
                    <button
                      type="button"
                      onClick={() => onOpenArrivalScanner(booking)}
                      className="px-3.5 py-2 rounded-xl bg-purple-600/40 hover:bg-purple-600/60 border border-purple-400/40 text-purple-200 hover:text-white font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <QrCode className="w-3.5 h-3.5 text-purple-300" />
                      <span>Scan QR Pass</span>
                    </button>
                  )}
                </div>

                {codeError && (
                  <p className="text-[11px] text-red-300 font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <span>{codeError}</span>
                  </p>
                )}

                <div className="p-2 rounded-xl bg-black/40 border border-white/5 text-[11px] text-slate-300 flex flex-wrap items-center justify-between gap-2">
                  <span>
                    💡 Family member elsewhere? They can dictate the code to you via phone or WhatsApp.
                  </span>
                  <span className="font-mono text-amber-300 font-bold">
                    Doorstep Arrival Rule Active
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between text-xs">
                <span className="text-slate-300">Your Doorstep Arrival PIN:</span>
                <span className="font-mono font-black text-emerald-400 text-sm bg-emerald-500/10 px-2.5 py-0.5 rounded-lg border border-emerald-400/30">
                  {getArrivalPassCode(booking)}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {!isStarted ? (
                <button
                  onClick={handleStart}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-emerald-950/50 flex items-center gap-1.5 transition active:scale-95"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>{userRole === 'client' ? 'Start Visit Session Clock ⏱️ (Caregiver Has Arrived)' : 'Start Visit Timer ⏱️'}</span>
                </button>
              ) : userRole === 'nurse' ? (
            <>
              <button
                onClick={handleTogglePause}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                  isRunning 
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30' 
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Resume</span>
                  </>
                )}
              </button>

              <button
                onClick={handleEnd}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7209B7] to-[#E63946] hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-purple-950/50 flex items-center gap-1.5 transition active:scale-95"
              >
                <Square className="w-3.5 h-3.5 fill-white" />
                <span>End Visit &amp; Finalize Invoice ⏹️</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2 text-xs text-emerald-300 font-semibold bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Caregiver session clock active • Automatically synced with caregiver portal</span>
            </div>
          )}
        </div>
      </div>
    )}
  </div>

      {/* Demo Fast-Forward Helper Pill */}
      <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2.5 py-1.5 rounded-xl text-[10px] text-slate-300">
        <Sparkles className="w-3 h-3 text-[#C77DFF]" />
        <span>Quick Demo Timer:</span>
        <button
          type="button"
          onClick={() => handleSimulateMinutes(15)}
          className="px-2 py-0.5 rounded-md bg-purple-500/30 hover:bg-purple-500/50 text-white font-bold transition"
          title="Fast forward 15 minutes"
        >
          +15m
        </button>
        <button
          type="button"
          onClick={() => handleSimulateMinutes(30)}
          className="px-2 py-0.5 rounded-md bg-purple-500/30 hover:bg-purple-500/50 text-white font-bold transition"
          title="Fast forward 30 minutes"
        >
          +30m
        </button>
        <button
          type="button"
          onClick={() => handleSimulateMinutes(50)}
          className="px-2 py-0.5 rounded-md bg-[#E63946]/40 hover:bg-[#E63946]/60 text-white font-bold transition"
          title="Fast forward into overtime"
        >
          +50m (OT)
        </button>
      </div>
    </div>
  );
};
