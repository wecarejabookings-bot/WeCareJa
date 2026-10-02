import React, { useState, useEffect } from 'react';
import { Booking, UserRole } from '../../types';
import { soundFX } from '../../utils/soundEffects';
import { 
  Clock, 
  MapPin, 
  Phone, 
  MessageSquare, 
  CheckCircle2, 
  X, 
  ShieldCheck, 
  Volume2, 
  User, 
  Stethoscope, 
  AlertCircle,
  BellRing,
  Radio,
  Sparkles,
  Car
} from 'lucide-react';

interface VisitReminder30MinAlertModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole;
  onOpenChat?: (booking: Booking) => void;
  onOpenPanic?: (booking: Booking) => void;
}

export const VisitReminder30MinAlertModal: React.FC<VisitReminder30MinAlertModalProps> = ({
  booking,
  isOpen,
  onClose,
  currentRole,
  onOpenChat,
  onOpenPanic
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(30 * 60);
  const [hasPermission, setHasPermission] = useState<boolean>(() => {
    return typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted';
  });

  useEffect(() => {
    if (!isOpen || !booking) return;

    // Calculate initial countdown
    const updateCountdown = () => {
      const scheduledTime = new Date(booking.scheduledDateTime).getTime();
      const now = Date.now();
      const diffSeconds = Math.max(0, Math.floor((scheduledTime - now) / 1000));
      setSecondsRemaining(diffSeconds > 0 ? diffSeconds : 0);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [isOpen, booking]);

  if (!isOpen || !booking) return null;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedCountdown = `${minutes}m ${seconds < 10 ? '0' : ''}${seconds}s`;

  const isNurse = currentRole === 'nurse';

  const handleRequestPermission = async () => {
    const granted = await soundFX.requestNotificationPermission();
    setHasPermission(granted);
    if (granted) {
      soundFX.triggerNotification(
        'Browser Alerts Enabled 🔔',
        'You will receive native browser reminders 30 minutes before every home visit.',
        'visit_reminder_30min'
      );
    }
  };

  const handleReplayChime = () => {
    soundFX.play30MinReminder();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fadeIn">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#240838] via-[#140422] to-[#0d0217] border-2 border-amber-400/60 rounded-3xl shadow-2xl shadow-amber-950/50 overflow-hidden text-white animate-scaleUp">
        
        {/* Glow ambient */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#7209B7]/25 rounded-full blur-3xl pointer-events-none" />

        {/* Top Highlight Banner */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 px-6 py-2.5 flex items-center justify-between text-slate-950 font-black text-xs">
          <div className="flex items-center gap-2">
            <BellRing className="w-4 h-4 animate-bounce" />
            <span className="uppercase tracking-wider">30-Minute Scheduled Visit Alert</span>
          </div>
          <span className="bg-black/20 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold text-white">
            Live Reminder
          </span>
        </div>

        {/* Modal Header */}
        <div className="p-6 pb-3 flex items-start justify-between gap-4 border-b border-white/10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-inner">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">
                {isNurse ? 'Upcoming Client Visit Starting in 30 Min' : 'Practitioner Arriving in 30 Minutes!'}
              </h3>
              <p className="text-xs text-amber-200/90 font-medium">
                {isNurse 
                  ? `Please ensure you are en-route or prepared to arrive in ${booking.zone}.`
                  : `Nurse ${booking.nurseName} is scheduled to arrive at your home shortly.`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Countdown & Status Block */}
        <div className="p-6 space-y-4">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-purple-950/40 to-black/50 border border-amber-400/30 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">
                Time Remaining to Scheduled Arrival
              </span>
              <div className="text-2xl sm:text-3xl font-black font-mono text-white flex items-center gap-2">
                <span className="text-amber-400">{formattedCountdown}</span>
                <span className="text-xs text-slate-400 font-sans font-normal">
                  ({new Date(booking.scheduledDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                </span>
              </div>
            </div>

            <button
              onClick={handleReplayChime}
              className="p-2.5 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/40 text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              title="Re-play reminder audio chime"
            >
              <Volume2 className="w-4 h-4" />
              <span className="hidden sm:inline">Chime</span>
            </button>
          </div>

          {/* Details Card */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                {isNurse ? (
                  <>
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Patient</span>
                      <strong className="text-xs text-white">{booking.clientName}</strong>
                    </div>
                  </>
                ) : (
                  <>
                    <img 
                      src={booking.nursePhoto} 
                      alt={booking.nurseName} 
                      className="w-8 h-8 rounded-full object-cover border border-purple-400/40"
                    />
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Assigned Nurse</span>
                      <strong className="text-xs text-white">{booking.nurseName}</strong>
                    </div>
                  </>
                )}
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Service</span>
                <span className="text-xs font-bold text-purple-200">{booking.serviceName}</span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate"><strong>Location:</strong> {booking.clientAddress}, {booking.zone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>
                  <strong>{isNurse ? 'Patient Phone:' : 'Nurse Phone:'}</strong>{' '}
                  <a 
                    href={`tel:${isNurse ? booking.clientPhone : booking.nursePhone}`} 
                    className="text-emerald-300 underline font-mono font-bold"
                  >
                    {isNurse ? booking.clientPhone : booking.nursePhone}
                  </a>
                </span>
              </div>
              {booking.notes && (
                <div className="p-2 rounded-xl bg-black/40 border border-white/10 text-[11px] text-purple-200/90 italic">
                  &ldquo;{booking.notes}&rdquo;
                </div>
              )}
            </div>
          </div>

          {/* Browser Permission Prompt if not granted */}
          {!hasPermission && (
            <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-400/30 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-purple-200">
                <Radio className="w-4 h-4 text-purple-300 shrink-0 animate-pulse" />
                <span className="text-[11px]">Enable browser popups to receive alerts when switching tabs</span>
              </div>
              <button
                onClick={handleRequestPermission}
                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] transition shrink-0"
              >
                Allow Popups
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {onOpenChat && (
              <button
                onClick={() => {
                  onClose();
                  onOpenChat(booking);
                }}
                className="py-2.5 px-4 rounded-xl bg-purple-600/30 hover:bg-purple-600/40 text-purple-200 text-xs font-bold border border-purple-400/30 transition flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4 text-purple-300" />
                <span>Open Direct Chat</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-95 text-slate-950 text-xs font-black transition flex items-center justify-center gap-1.5 shadow-md shadow-amber-900/30"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Acknowledged (Dismiss)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
